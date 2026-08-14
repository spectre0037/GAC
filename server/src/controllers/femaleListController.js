import { z } from 'zod';
import { eq, and, ilike } from 'drizzle-orm';
import { db } from '../db/index.js';
import { femaleStudentEntries, registrations, paymentScreenshots, events } from '../db/schema/index.js';
import { AppError } from '../middleware/errorHandler.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const entrySchema = z.object({
  fullName: z.string().trim().min(2, 'Full name is required'),
  regNo: z.string().trim().optional(),
  contactNumber: z.string().trim().min(6, 'Enter a valid contact number'),
  emergencyContactName: z.string().trim().min(2, 'Emergency contact name is required'),
  emergencyContactNumber: z.string().trim().min(6, 'Enter a valid emergency contact number'),
});

export const createEntry = asyncHandler(async (req, res) => {
  const eventId = Number(req.params.eventId);
  if (Number.isNaN(eventId)) throw new AppError('Invalid event id.', 400);

  const parsed = entrySchema.safeParse(req.body);
  if (!parsed.success) throw new AppError(parsed.error.issues[0].message, 400);

  const [event] = await db.select().from(events).where(eq(events.id, eventId));
  if (!event) throw new AppError('Event not found.', 404);

  const [entry] = await db
    .insert(femaleStudentEntries)
    .values({
      eventId,
      fullName: parsed.data.fullName,
      regNo: parsed.data.regNo || null,
      contactNumber: parsed.data.contactNumber,
      emergencyContactName: parsed.data.emergencyContactName,
      emergencyContactNumber: parsed.data.emergencyContactNumber,
      status: 'pending',
      addedBy: req.user.id,
    })
    .returning();

  res.status(201).json({ success: true, entry });
});

export const listEntriesForEvent = asyncHandler(async (req, res) => {
  const eventId = Number(req.params.eventId);
  if (Number.isNaN(eventId)) throw new AppError('Invalid event id.', 400);

  const entries = await db
    .select()
    .from(femaleStudentEntries)
    .where(eq(femaleStudentEntries.eventId, eventId));

  const enriched = await Promise.all(
    entries.map(async (entry) => {
      if (!entry.regNo) {
        return { ...entry, isRegistered: false, registrationStatus: null, paymentStatus: null };
      }
      const [reg] = await db
        .select()
        .from(registrations)
        .where(and(eq(registrations.eventId, eventId), ilike(registrations.regNo, entry.regNo)));

      if (!reg) {
        return { ...entry, isRegistered: false, registrationStatus: null, paymentStatus: null };
      }

      const [latestScreenshot] = await db
        .select()
        .from(paymentScreenshots)
        .where(eq(paymentScreenshots.registrationId, reg.id))
        .orderBy(paymentScreenshots.createdAt)
        .limit(1);

      return {
        ...entry,
        isRegistered: true,
        registrationStatus: reg.status,
        paymentStatus: latestScreenshot ? latestScreenshot.verificationStatus : null,
      };
    })
  );

  res.json({ success: true, entries: enriched });
});

export const updateEntry = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) throw new AppError('Invalid id.', 400);

  const parsed = entrySchema.partial().safeParse(req.body);
  if (!parsed.success) throw new AppError(parsed.error.issues[0].message, 400);

  const [existing] = await db.select().from(femaleStudentEntries).where(eq(femaleStudentEntries.id, id));
  if (!existing) throw new AppError('Entry not found.', 404);

  const updates = { updatedAt: new Date() };
  if (parsed.data.fullName !== undefined) updates.fullName = parsed.data.fullName;
  if (parsed.data.regNo !== undefined) updates.regNo = parsed.data.regNo || null;
  if (parsed.data.contactNumber !== undefined) updates.contactNumber = parsed.data.contactNumber;
  if (parsed.data.emergencyContactName !== undefined) updates.emergencyContactName = parsed.data.emergencyContactName;
  if (parsed.data.emergencyContactNumber !== undefined) updates.emergencyContactNumber = parsed.data.emergencyContactNumber;

  const [updated] = await db
    .update(femaleStudentEntries)
    .set(updates)
    .where(eq(femaleStudentEntries.id, id))
    .returning();

  res.json({ success: true, entry: updated });
});

export const updateEntryStatus = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) throw new AppError('Invalid id.', 400);

  const statusSchema = z.object({ status: z.enum(['pending', 'verified', 'rejected']) });
  const parsed = statusSchema.safeParse(req.body);
  if (!parsed.success) throw new AppError(parsed.error.issues[0].message, 400);

  const [existing] = await db.select().from(femaleStudentEntries).where(eq(femaleStudentEntries.id, id));
  if (!existing) throw new AppError('Entry not found.', 404);

  const [updated] = await db
    .update(femaleStudentEntries)
    .set({ status: parsed.data.status, verifiedBy: req.user.id, verifiedAt: new Date(), updatedAt: new Date() })
    .where(eq(femaleStudentEntries.id, id))
    .returning();

  res.json({ success: true, entry: updated });
});

export const deleteEntry = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) throw new AppError('Invalid id.', 400);

  await db.delete(femaleStudentEntries).where(eq(femaleStudentEntries.id, id));
  res.json({ success: true, message: 'Entry removed.' });
});