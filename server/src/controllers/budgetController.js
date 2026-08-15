import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import { db } from '../db/index.js';
import { budgetLineItems, reckyExpenses, events } from '../db/schema/index.js';
import { AppError } from '../middleware/errorHandler.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { uploadBufferToCloudinary } from '../services/cloudinaryService.js';

const CATEGORIES = ['logistics', 'operations', 'transport', 'food', 'water', 'misc'];
const PHASES = ['pre_event', 'on_event', 'post_event'];

const lineItemSchema = z.object({
  phase: z.enum(PHASES),
  category: z.enum(CATEGORIES),
  description: z.string().trim().min(2, 'Description is required'),
  amount: z.coerce.number().positive('Amount must be greater than 0'),
});

function assertCategoryAllowed(role, category) {
  if (role === 'finance_master' || role === 'super_admin') return;
  if (role === 'master_logistics' && category === 'logistics') return;
  throw new AppError(
    role === 'master_logistics'
      ? 'Master Logistics can only submit expenses in the "logistics" category.'
      : 'You are not authorized to submit budget entries.',
    403
  );
}

export const createLineItem = asyncHandler(async (req, res) => {
  const eventId = Number(req.params.eventId);
  if (Number.isNaN(eventId)) throw new AppError('Invalid event id.', 400);

  const parsed = lineItemSchema.safeParse(req.body);
  if (!parsed.success) throw new AppError(parsed.error.issues[0].message, 400);

  assertCategoryAllowed(req.user.role, parsed.data.category);

  const [event] = await db.select().from(events).where(eq(events.id, eventId));
  if (!event) throw new AppError('Event not found.', 404);

  let receiptImageUrl = null;
  if (req.file) {
    const result = await uploadBufferToCloudinary(req.file.buffer, 'budget-receipts');
    receiptImageUrl = result.secure_url;
  }

  const [item] = await db
    .insert(budgetLineItems)
    .values({
      eventId,
      phase: parsed.data.phase,
      category: parsed.data.category,
      description: parsed.data.description,
      amount: String(parsed.data.amount),
      submittedBy: req.user.id,
      submittedByRole: req.user.role,
      receiptImageUrl,
    })
    .returning();

  res.status(201).json({ success: true, item });
});

export const listLineItems = asyncHandler(async (req, res) => {
  const eventId = Number(req.params.eventId);
  if (Number.isNaN(eventId)) throw new AppError('Invalid event id.', 400);

  const conditions = [eq(budgetLineItems.eventId, eventId)];
  if (req.query.phase && PHASES.includes(req.query.phase)) {
    conditions.push(eq(budgetLineItems.phase, req.query.phase));
  }
  if (req.query.category && CATEGORIES.includes(req.query.category)) {
    conditions.push(eq(budgetLineItems.category, req.query.category));
  }

  const items = await db.select().from(budgetLineItems).where(and(...conditions));
  res.json({ success: true, items });
});

export const updateLineItem = asyncHandler(async (req, res) => {
  if (!['finance_master', 'super_admin'].includes(req.user.role)) {
    throw new AppError('Only Finance Master can edit budget entries.', 403);
  }

  const itemId = Number(req.params.id);
  if (Number.isNaN(itemId)) throw new AppError('Invalid item id.', 400);

  const parsed = lineItemSchema.partial().safeParse(req.body);
  if (!parsed.success) throw new AppError(parsed.error.issues[0].message, 400);

  const [existing] = await db.select().from(budgetLineItems).where(eq(budgetLineItems.id, itemId));
  if (!existing) throw new AppError('Budget item not found.', 404);

  const updates = { updatedAt: new Date() };
  if (parsed.data.phase !== undefined) updates.phase = parsed.data.phase;
  if (parsed.data.category !== undefined) updates.category = parsed.data.category;
  if (parsed.data.description !== undefined) updates.description = parsed.data.description;
  if (parsed.data.amount !== undefined) updates.amount = String(parsed.data.amount);

  const [updated] = await db
    .update(budgetLineItems)
    .set(updates)
    .where(eq(budgetLineItems.id, itemId))
    .returning();

  res.json({ success: true, item: updated });
});

export const deleteLineItem = asyncHandler(async (req, res) => {
  if (!['finance_master', 'super_admin'].includes(req.user.role)) {
    throw new AppError('Only Finance Master can delete budget entries.', 403);
  }

  const itemId = Number(req.params.id);
  if (Number.isNaN(itemId)) throw new AppError('Invalid item id.', 400);

  const [existing] = await db.select().from(budgetLineItems).where(eq(budgetLineItems.id, itemId));
  if (!existing) throw new AppError('Budget item not found.', 404);

  await db.delete(budgetLineItems).where(eq(budgetLineItems.id, itemId));
  res.json({ success: true, message: 'Budget item deleted.' });
});

export const attachLineItemReceipt = asyncHandler(async (req, res) => {
  const itemId = Number(req.params.id);
  if (Number.isNaN(itemId)) throw new AppError('Invalid item id.', 400);
  if (!req.file) throw new AppError('No image file provided.', 400);

  const [existing] = await db.select().from(budgetLineItems).where(eq(budgetLineItems.id, itemId));
  if (!existing) throw new AppError('Budget item not found.', 404);

  const result = await uploadBufferToCloudinary(req.file.buffer, 'budget-receipts');

  const [updated] = await db
    .update(budgetLineItems)
    .set({ receiptImageUrl: result.secure_url, updatedAt: new Date() })
    .where(eq(budgetLineItems.id, itemId))
    .returning();

  res.json({ success: true, item: updated });
});

// Pre/On/Post/Recky breakdown, plus planned-vs-actual against the event's
// budget targets (set separately by Finance Master, adjustable anytime).
export const getBudgetSummary = asyncHandler(async (req, res) => {
  const eventId = Number(req.params.eventId);
  if (Number.isNaN(eventId)) throw new AppError('Invalid event id.', 400);

  const [event] = await db.select().from(events).where(eq(events.id, eventId));
  if (!event) throw new AppError('Event not found.', 404);

  const items = await db.select().from(budgetLineItems).where(eq(budgetLineItems.eventId, eventId));
  const recky = await db.select().from(reckyExpenses).where(eq(reckyExpenses.eventId, eventId));

  const summary = {
    preEventTotal: 0,
    onEventTotal: 0,
    postEventTotal: 0,
    reckyTotal: 0,
    grandTotal: 0,
    plannedBudget: Number(event.plannedBudget),
    reckyPlannedBudget: Number(event.reckyPlannedBudget),
    byCategory: {},
  };

  for (const cat of CATEGORIES) {
    summary.byCategory[cat] = { preEvent: 0, onEvent: 0, postEvent: 0, recky: 0 };
  }

  for (const item of items) {
    const amt = Number(item.amount);
    if (item.phase === 'pre_event') {
      summary.preEventTotal += amt;
      summary.byCategory[item.category].preEvent += amt;
    } else if (item.phase === 'on_event') {
      summary.onEventTotal += amt;
      summary.byCategory[item.category].onEvent += amt;
    } else {
      summary.postEventTotal += amt;
      summary.byCategory[item.category].postEvent += amt;
    }
  }

  for (const exp of recky) {
    const amt = Number(exp.amount);
    summary.reckyTotal += amt;
    summary.byCategory[exp.category].recky += amt;
  }

  summary.grandTotal = summary.preEventTotal + summary.onEventTotal + summary.postEventTotal + summary.reckyTotal;
  summary.plannedRemaining = summary.plannedBudget - (summary.grandTotal - summary.reckyTotal);
  summary.reckyPlannedRemaining = summary.reckyPlannedBudget - summary.reckyTotal;

  res.json({ success: true, summary });
});