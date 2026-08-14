import { z } from 'zod';
import { eq, ne, and, inArray, desc } from 'drizzle-orm';
import { db } from '../db/index.js';
import {
  events,
  registrations,
  paymentScreenshots,
  reckyAssignments,
  reckyExpenses,
  budgetLineItems,
  logisticsInventory,
  eventForms,
  emailLogs,
} from '../db/schema/index.js';
import { AppError } from '../middleware/errorHandler.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { generateSlug } from '../utils/slug.js';
import { uploadBufferToCloudinary } from '../services/cloudinaryService.js';
import { syncPassedEvents } from '../utils/eventStatusSync.js';

const VALID_STATUSES = ['draft', 'coming_soon', 'confirmed', 'passed', 'cancelled'];

const ALLOWED_TRANSITIONS = {
  draft: ['coming_soon', 'cancelled'],
  coming_soon: ['confirmed', 'draft', 'cancelled'],
  confirmed: ['passed', 'cancelled'], // 'passed' can also happen automatically via syncPassedEvents
  passed: [],
  cancelled: [],
};

const createEventSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters'),
  description: z.string().trim().optional(),
  location: z.string().trim().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  capacity: z.coerce.number().int().positive().max(200).optional(),
  ticketPrice: z.coerce.number().nonnegative().optional(),
});

const updateEventSchema = createEventSchema.partial();

const updateStatusSchema = z.object({
  status: z.enum(VALID_STATUSES),
});

export const createEvent = asyncHandler(async (req, res) => {
  const parsed = createEventSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0].message, 400);
  }
  const data = parsed.data;

  const [newEvent] = await db
    .insert(events)
    .values({
      title: data.title,
      slug: generateSlug(data.title),
      description: data.description || null,
      location: data.location || null,
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
      capacity: data.capacity ?? 80,
      ticketPrice: data.ticketPrice !== undefined ? String(data.ticketPrice) : '0',
      status: 'draft',
      createdBy: req.user.id,
    })
    .returning();

  res.status(201).json({ success: true, event: newEvent });
});

// Public "upcoming" list — only coming_soon and confirmed events.
// Drafts, cancelled, and passed events never show up here.
export const listPublicEvents = asyncHandler(async (req, res) => {
  await syncPassedEvents();

  const allEvents = await db
    .select()
    .from(events)
    .where(inArray(events.status, ['coming_soon', 'confirmed']))
    .orderBy(events.startDate);

  res.json({ success: true, events: allEvents });
});

// Public "past events" list — separate page, per your requirement
export const listPastEvents = asyncHandler(async (req, res) => {
  await syncPassedEvents();

  const pastEvents = await db
    .select()
    .from(events)
    .where(eq(events.status, 'passed'))
    .orderBy(desc(events.endDate));

  res.json({ success: true, events: pastEvents });
});

// Admin — Event Coordinator sees everything including drafts and cancelled
export const listAllEvents = asyncHandler(async (req, res) => {
  await syncPassedEvents();

  const allEvents = await db.select().from(events).orderBy(desc(events.createdAt));
  res.json({ success: true, events: allEvents });
});

export const getEventBySlug = asyncHandler(async (req, res) => {
  const [event] = await db.select().from(events).where(eq(events.slug, req.params.slug));
  if (!event) {
    throw new AppError('Event not found.', 404);
  }
  res.json({ success: true, event });
});

export const updateEvent = asyncHandler(async (req, res) => {
  const eventId = Number(req.params.id);
  if (Number.isNaN(eventId)) throw new AppError('Invalid event id.', 400);

  const parsed = updateEventSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0].message, 400);
  }
  const data = parsed.data;

  const [existing] = await db.select().from(events).where(eq(events.id, eventId));
  if (!existing) throw new AppError('Event not found.', 404);

  const updates = { updatedAt: new Date() };
  if (data.title !== undefined) updates.title = data.title;
  if (data.description !== undefined) updates.description = data.description;
  if (data.location !== undefined) updates.location = data.location;
  if (data.startDate !== undefined) updates.startDate = new Date(data.startDate);
  if (data.endDate !== undefined) updates.endDate = new Date(data.endDate);
  if (data.capacity !== undefined) updates.capacity = data.capacity;
  if (data.ticketPrice !== undefined) updates.ticketPrice = String(data.ticketPrice);

  const [updated] = await db
    .update(events)
    .set(updates)
    .where(eq(events.id, eventId))
    .returning();

  res.json({ success: true, event: updated });
});

export const updateEventStatus = asyncHandler(async (req, res) => {
  const eventId = Number(req.params.id);
  if (Number.isNaN(eventId)) throw new AppError('Invalid event id.', 400);

  const parsed = updateStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0].message, 400);
  }

  const [existing] = await db.select().from(events).where(eq(events.id, eventId));
  if (!existing) throw new AppError('Event not found.', 404);

  const allowedNext = ALLOWED_TRANSITIONS[existing.status] || [];
  if (!allowedNext.includes(parsed.data.status)) {
    throw new AppError(
      `Cannot change status from "${existing.status}" to "${parsed.data.status}".`,
      400
    );
  }

  const [updated] = await db
    .update(events)
    .set({ status: parsed.data.status, updatedAt: new Date() })
    .where(eq(events.id, eventId))
    .returning();

  res.json({ success: true, event: updated });
});

// Full cascading delete — permanently removes the event and everything tied
// to it (registrations, payments, budget, recky data, logistics, forms).
// Unlike 'cancelled' status (which keeps the record for history), this is
// irreversible. The frontend must confirm with the user before calling this.
export const deleteEvent = asyncHandler(async (req, res) => {
  const eventId = Number(req.params.id);
  if (Number.isNaN(eventId)) throw new AppError('Invalid event id.', 400);

  const [existing] = await db.select().from(events).where(eq(events.id, eventId));
  if (!existing) throw new AppError('Event not found.', 404);

  const relatedRegs = await db
    .select({ id: registrations.id })
    .from(registrations)
    .where(eq(registrations.eventId, eventId));

  if (relatedRegs.length > 0) {
    const regIds = relatedRegs.map((r) => r.id);
    await db.delete(paymentScreenshots).where(inArray(paymentScreenshots.registrationId, regIds));
  }

  await db.delete(registrations).where(eq(registrations.eventId, eventId));
  await db.delete(reckyExpenses).where(eq(reckyExpenses.eventId, eventId));
  await db.delete(reckyAssignments).where(eq(reckyAssignments.eventId, eventId));
  await db.delete(budgetLineItems).where(eq(budgetLineItems.eventId, eventId));
  await db.delete(logisticsInventory).where(eq(logisticsInventory.eventId, eventId));
  await db.delete(eventForms).where(eq(eventForms.eventId, eventId));
  await db.delete(emailLogs).where(eq(emailLogs.relatedEventId, eventId));
  await db.delete(events).where(eq(events.id, eventId));

  res.json({ success: true, message: 'Event and all related data permanently deleted.' });
});

export const uploadEventCover = asyncHandler(async (req, res) => {
  const eventId = Number(req.params.id);
  if (Number.isNaN(eventId)) throw new AppError('Invalid event id.', 400);
  if (!req.file) throw new AppError('No image file provided.', 400);

  const [existing] = await db.select().from(events).where(eq(events.id, eventId));
  if (!existing) throw new AppError('Event not found.', 404);

  const result = await uploadBufferToCloudinary(req.file.buffer, 'event-covers');

  const [updated] = await db
    .update(events)
    .set({ coverImageUrl: result.secure_url, updatedAt: new Date() })
    .where(eq(events.id, eventId))
    .returning();

  res.json({ success: true, event: updated });
});
export const getEventById = asyncHandler(async (req, res) => {
  const eventId = Number(req.params.id);
  if (Number.isNaN(eventId)) throw new AppError('Invalid event id.', 400);

  const [event] = await db.select().from(events).where(eq(events.id, eventId));
  if (!event) throw new AppError('Event not found.', 404);

  res.json({ success: true, event });
});
export const updateItinerary = asyncHandler(async (req, res) => {
  const eventId = Number(req.params.id);
  if (Number.isNaN(eventId)) throw new AppError('Invalid event id.', 400);

  if (!Array.isArray(req.body.itinerary)) {
    throw new AppError('itinerary must be an array of day objects.', 400);
  }

  const [existing] = await db.select().from(events).where(eq(events.id, eventId));
  if (!existing) throw new AppError('Event not found.', 404);

  const [updated] = await db
    .update(events)
    .set({ itinerary: req.body.itinerary, updatedAt: new Date() })
    .where(eq(events.id, eventId))
    .returning();

  res.json({ success: true, event: updated });
});