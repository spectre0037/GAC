import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { registrations, events } from '../db/schema/index.js';
import { AppError } from '../middleware/errorHandler.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getTicketByCode = asyncHandler(async (req, res) => {
  const { code } = req.params;

  const [reg] = await db.select().from(registrations).where(eq(registrations.ticketCode, code));
  if (!reg) throw new AppError('Ticket not found.', 404);

  const [event] = await db.select().from(events).where(eq(events.id, reg.eventId));

  res.json({ success: true, registration: reg, event });
});

export const confirmCheckIn = asyncHandler(async (req, res) => {
  const { code } = req.params;

  const [reg] = await db.select().from(registrations).where(eq(registrations.ticketCode, code));
  if (!reg) throw new AppError('Ticket not found.', 404);
  if (reg.status !== 'approved') {
    throw new AppError('This ticket is not approved and cannot be checked in.', 400);
  }
  if (reg.checkedInAt) {
    throw new AppError(`Already checked in at ${new Date(reg.checkedInAt).toLocaleString()}.`, 400);
  }

  const [updated] = await db
    .update(registrations)
    .set({ checkedInAt: new Date(), updatedAt: new Date() })
    .where(eq(registrations.id, reg.id))
    .returning();

  res.json({ success: true, registration: updated });
});