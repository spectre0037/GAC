import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import { db } from '../db/index.js';
import { reckyAssignments, reckyExpenses, events, users } from '../db/schema/index.js';
import { AppError } from '../middleware/errorHandler.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { uploadBufferToCloudinary } from '../services/cloudinaryService.js';
import { sendReckyInviteEmail } from '../services/emailService.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const assignSchema = z.object({
  email: z.string().trim().toLowerCase().regex(EMAIL_REGEX, 'Please enter a valid email address'),
});

const expenseSchema = z.object({
  category: z.enum(['logistics', 'operations', 'transport', 'food', 'water', 'misc']),
  description: z.string().trim().min(2, 'Description is required'),
  amount: z.coerce.number().positive('Amount must be greater than 0'),
});

// Assign a recky planner to an event by email — links to an existing account
// if one exists with that email, otherwise stores the invite for when they sign up.
export const assignReckyPlanner = asyncHandler(async (req, res) => {
  const eventId = Number(req.params.eventId);
  if (Number.isNaN(eventId)) throw new AppError('Invalid event id.', 400);

  const parsed = assignSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0].message, 400);
  }

  const [event] = await db.select().from(events).where(eq(events.id, eventId));
  if (!event) throw new AppError('Event not found.', 404);

  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, parsed.data.email));

  const [assignment] = await db
    .insert(reckyAssignments)
    .values({
      eventId,
      invitedEmail: parsed.data.email,
      userId: existingUser ? existingUser.id : null,
      assignedBy: req.user.id,
      status: existingUser ? 'active' : 'invited',
    })
    .returning();

  sendReckyInviteEmail(parsed.data.email, event).catch(() => { });

  res.status(201).json({ success: true, assignment });
});

export const listReckyAssignmentsForEvent = asyncHandler(async (req, res) => {
  const eventId = Number(req.params.eventId);
  if (Number.isNaN(eventId)) throw new AppError('Invalid event id.', 400);

  const assignments = await db
    .select()
    .from(reckyAssignments)
    .where(eq(reckyAssignments.eventId, eventId));

  res.json({ success: true, assignments });
});

// A logged-in user checking which events they're assigned as recky planner for
export const listMyReckyAssignments = asyncHandler(async (req, res) => {
  const assignments = await db
    .select({
      id: reckyAssignments.id,
      status: reckyAssignments.status,
      event: {
        id: events.id,
        title: events.title,
        slug: events.slug,
        status: events.status,
      },
    })
    .from(reckyAssignments)
    .innerJoin(events, eq(reckyAssignments.eventId, events.id))
    .where(eq(reckyAssignments.userId, req.user.id));

  res.json({ success: true, assignments });
});

// Guard: only a coordinator/super_admin OR the actively-assigned recky planner
// for this specific event can log expenses against it.
async function assertCanLogExpense(userId, userRole, eventId) {
  if (userRole === 'event_coordinator' || userRole === 'super_admin') return true;

  const [assignment] = await db
    .select()
    .from(reckyAssignments)
    .where(
      and(
        eq(reckyAssignments.eventId, eventId),
        eq(reckyAssignments.userId, userId),
        eq(reckyAssignments.status, 'active')
      )
    );

  return Boolean(assignment);
}

export const logReckyExpense = asyncHandler(async (req, res) => {
  const eventId = Number(req.params.eventId);
  if (Number.isNaN(eventId)) throw new AppError('Invalid event id.', 400);

  const canLog = await assertCanLogExpense(req.user.id, req.user.role, eventId);
  if (!canLog) {
    throw new AppError('You are not an assigned recky planner for this event.', 403);
  }

  const parsed = expenseSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0].message, 400);
  }

  let receiptImageUrl = null;
  if (req.file) {
    const result = await uploadBufferToCloudinary(req.file.buffer, 'recky-receipts');
    receiptImageUrl = result.secure_url;
  }

  const [expense] = await db
    .insert(reckyExpenses)
    .values({
      eventId,
      recordedBy: req.user.id,
      category: parsed.data.category,
      description: parsed.data.description,
      amount: String(parsed.data.amount),
      receiptImageUrl,
    })
    .returning();

  res.status(201).json({ success: true, expense });
});

export const listReckyExpenses = asyncHandler(async (req, res) => {
  const eventId = Number(req.params.eventId);
  if (Number.isNaN(eventId)) throw new AppError('Invalid event id.', 400);

  const canView = await assertCanLogExpense(req.user.id, req.user.role, eventId);
  if (!canView) {
    throw new AppError('You are not an assigned recky planner for this event.', 403);
  }

  const expenses = await db
    .select()
    .from(reckyExpenses)
    .where(eq(reckyExpenses.eventId, eventId));

  res.json({ success: true, expenses });
});