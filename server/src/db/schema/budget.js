import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  decimal,
  timestamp,
} from 'drizzle-orm/pg-core';
import { budgetPhaseEnum, expenseCategoryEnum } from './enums.js';
import { events } from './events.js';
import { users } from './users.js';

// Editable by Finance Master, read-only for President/VP Ops/Master Logistics/
// Event Coordinator sees full pre+post analytics. submittedByRole is a snapshot
// (not a join) so historical reports stay accurate even if someone's role changes later.
export const budgetLineItems = pgTable('budget_line_items', {
  id: serial('id').primaryKey(),
  eventId: integer('event_id').notNull().references(() => events.id),
  phase: budgetPhaseEnum('phase').notNull(),
  category: expenseCategoryEnum('category').notNull(),
  description: text('description').notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  submittedBy: integer('submitted_by').notNull().references(() => users.id),
  submittedByRole: varchar('submitted_by_role', { length: 50 }).notNull(),
  receiptImageUrl: text('receipt_image_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});