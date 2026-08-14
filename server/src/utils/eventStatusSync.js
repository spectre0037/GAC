import { and, eq, lt, isNull, isNotNull } from 'drizzle-orm';
import { db } from '../db/index.js';
import { events } from '../db/schema/index.js';

// Lazily promotes any 'confirmed' event whose date has already passed into
// 'passed' status. Called at the top of every event-listing endpoint instead
// of a cron job — Render's free tier has no reliable background scheduler,
// so "check and fix on read" is the simplest correct approach at this scale.
export async function syncPassedEvents() {
  const now = new Date();

  // Case 1: event has an end date, and it's already passed
  await db
    .update(events)
    .set({ status: 'passed', updatedAt: now })
    .where(and(eq(events.status, 'confirmed'), isNotNull(events.endDate), lt(events.endDate, now)));

  // Case 2: no end date set — fall back to checking the start date instead
  await db
    .update(events)
    .set({ status: 'passed', updatedAt: now })
    .where(
      and(
        eq(events.status, 'confirmed'),
        isNull(events.endDate),
        isNotNull(events.startDate),
        lt(events.startDate, now)
      )
    );
}