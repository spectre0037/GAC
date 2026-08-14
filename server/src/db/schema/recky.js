import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  decimal,
  timestamp,
} from 'drizzle-orm/pg-core';
import { reckyAssignmentStatusEnum, expenseCategoryEnum } from './enums.js';
import { events } from './events.js';
import { users } from './users.js';

// Recky planners are assigned per-event by the Event Coordinator, via email invite —
// NOT a fixed Super Admin post. invitedEmail is always set; userId links once that
// person has an account (they may not have signed up yet at invite time).
export const reckyAssignments = pgTable('recky_assignments', {
  id: serial('id').primaryKey(),
  eventId: integer('event_id').notNull().references(() => events.id),
  invitedEmail: varchar('invited_email', { length: 255 }).notNull(),
  userId: integer('user_id').references(() => users.id),
  assignedBy: integer('assigned_by').notNull().references(() => users.id),
  status: reckyAssignmentStatusEnum('status').notNull().default('invited'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const reckyExpenses = pgTable('recky_expenses', {
  id: serial('id').primaryKey(),
  eventId: integer('event_id').notNull().references(() => events.id),
  recordedBy: integer('recorded_by').notNull().references(() => users.id),
  category: expenseCategoryEnum('category').notNull(),
  description: text('description').notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  receiptImageUrl: text('receipt_image_url'), // optional, per your spec
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});