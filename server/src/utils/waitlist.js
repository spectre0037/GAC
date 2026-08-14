import { eq, and, inArray, asc } from 'drizzle-orm';
import { db } from '../db/index.js';
import { registrations, events, users } from '../db/schema/index.js';
import { sendWaitlistPromotedEmail } from '../services/emailService.js';

// Sums actual headcount (1 person + however many group members they listed)
// across all active registrations — capacity is a headcount limit
// ("60 to 80 people"), not a limit on the number of registration rows.
export async function countActiveHeadcount(eventId) {
  const active = await db
    .select({ groupMemberCount: registrations.groupMemberCount })
    .from(registrations)
    .where(and(eq(registrations.eventId, eventId), inArray(registrations.status, ['pending', 'approved'])));

  return active.reduce((sum, r) => sum + 1 + (r.groupMemberCount || 0), 0);
}

export async function promoteFromWaitlistIfSlotOpen(eventId) {
  const [event] = await db.select().from(events).where(eq(events.id, eventId));
  if (!event) return;

  const [nextInLine] = await db
    .select()
    .from(registrations)
    .where(and(eq(registrations.eventId, eventId), eq(registrations.status, 'waitlisted')))
    .orderBy(asc(registrations.waitlistPosition))
    .limit(1);

  if (!nextInLine) return;

  const currentHeadcount = await countActiveHeadcount(eventId);
  const incomingHeadcount = 1 + (nextInLine.groupMemberCount || 0);
  if (currentHeadcount + incomingHeadcount > event.capacity) return; // not enough room for this whole group yet

  await db
    .update(registrations)
    .set({ status: 'pending', waitlistPosition: null, updatedAt: new Date() })
    .where(eq(registrations.id, nextInLine.id));

  if (nextInLine.userId) {
    const [promotedUser] = await db.select().from(users).where(eq(users.id, nextInLine.userId));
    if (promotedUser) sendWaitlistPromotedEmail(promotedUser, event).catch(() => {});
  }
}