import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import { db } from '../db/index.js';
import { logisticsInventory, events } from '../db/schema/index.js';
import { AppError } from '../middleware/errorHandler.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const PHASES = ['pre_event', 'on_event', 'post_event'];
const STATUSES = ['packed', 'in_use', 'returned', 'lost', 'damaged'];

const itemSchema = z.object({
  itemName: z.string().trim().min(2, 'Item name is required'),
  quantity: z.coerce.number().int().positive().default(1),
  phase: z.enum(PHASES),
  status: z.enum(STATUSES).default('packed'),
  notes: z.string().trim().optional(),
});

export const createInventoryItem = asyncHandler(async (req, res) => {
  const eventId = Number(req.params.eventId);
  if (Number.isNaN(eventId)) throw new AppError('Invalid event id.', 400);

  const parsed = itemSchema.safeParse(req.body);
  if (!parsed.success) throw new AppError(parsed.error.issues[0].message, 400);

  const [event] = await db.select().from(events).where(eq(events.id, eventId));
  if (!event) throw new AppError('Event not found.', 404);

  const [item] = await db
    .insert(logisticsInventory)
    .values({
      eventId,
      itemName: parsed.data.itemName,
      quantity: parsed.data.quantity,
      phase: parsed.data.phase,
      status: parsed.data.status,
      notes: parsed.data.notes || null,
      managedBy: req.user.id,
    })
    .returning();

  res.status(201).json({ success: true, item });
});

export const listInventoryItems = asyncHandler(async (req, res) => {
  const eventId = Number(req.params.eventId);
  if (Number.isNaN(eventId)) throw new AppError('Invalid event id.', 400);

  const conditions = [eq(logisticsInventory.eventId, eventId)];
  if (req.query.phase && PHASES.includes(req.query.phase)) {
    conditions.push(eq(logisticsInventory.phase, req.query.phase));
  }

  const items = await db.select().from(logisticsInventory).where(and(...conditions));
  res.json({ success: true, items });
});

export const updateInventoryItem = asyncHandler(async (req, res) => {
  const itemId = Number(req.params.id);
  if (Number.isNaN(itemId)) throw new AppError('Invalid item id.', 400);

  const parsed = itemSchema.partial().safeParse(req.body);
  if (!parsed.success) throw new AppError(parsed.error.issues[0].message, 400);

  const [existing] = await db
    .select()
    .from(logisticsInventory)
    .where(eq(logisticsInventory.id, itemId));
  if (!existing) throw new AppError('Inventory item not found.', 404);

  const updates = { updatedAt: new Date() };
  if (parsed.data.itemName !== undefined) updates.itemName = parsed.data.itemName;
  if (parsed.data.quantity !== undefined) updates.quantity = parsed.data.quantity;
  if (parsed.data.phase !== undefined) updates.phase = parsed.data.phase;
  if (parsed.data.status !== undefined) updates.status = parsed.data.status;
  if (parsed.data.notes !== undefined) updates.notes = parsed.data.notes;

  const [updated] = await db
    .update(logisticsInventory)
    .set(updates)
    .where(eq(logisticsInventory.id, itemId))
    .returning();

  res.json({ success: true, item: updated });
});

export const deleteInventoryItem = asyncHandler(async (req, res) => {
  const itemId = Number(req.params.id);
  if (Number.isNaN(itemId)) throw new AppError('Invalid item id.', 400);

  const [existing] = await db
    .select()
    .from(logisticsInventory)
    .where(eq(logisticsInventory.id, itemId));
  if (!existing) throw new AppError('Inventory item not found.', 404);

  await db.delete(logisticsInventory).where(eq(logisticsInventory.id, itemId));
  res.json({ success: true, message: 'Inventory item deleted.' });
});