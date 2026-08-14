import { eq, and } from 'drizzle-orm';
import { db } from '../db/index.js';
import { events, registrations, users, emailLogs } from '../db/schema/index.js';
import { AppError } from '../middleware/errorHandler.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendEventReminderEmail } from '../services/emailService.js';

export const sendEventReminders = asyncHandler(async (req, res) => {
  const eventId = Number(req.params.eventId);
  if (Number.isNaN(eventId)) throw new AppError('Invalid event id.', 400);

  const [event] = await db.select().from(events).where(eq(events.id, eventId));
  if (!event) throw new AppError('Event not found.', 404);

  // Guard against accidentally re-sending — check if reminders already went out
  const [alreadySent] = await db
    .select()
    .from(emailLogs)
    .where(and(eq(emailLogs.relatedEventId, eventId), eq(emailLogs.type, 'event_reminder')))
    .limit(1);

  if (alreadySent) {
    throw new AppError('Reminders have already been sent for this event.', 400);
  }

  const approvedRegs = await db
    .select()
    .from(registrations)
    .where(and(eq(registrations.eventId, eventId), eq(registrations.status, 'approved')));

  let sentCount = 0;
  for (const reg of approvedRegs) {
    if (!reg.userId) continue; // manually added people with no account skip email
    const [regUser] = await db.select().from(users).where(eq(users.id, reg.userId));
    if (regUser) {
      await sendEventReminderEmail(regUser, event);
      sentCount++;
    }
  }

  res.json({ success: true, message: `Reminders sent to ${sentCount} confirmed attendee(s).` });
});