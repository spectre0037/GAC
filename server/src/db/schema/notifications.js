import { pgTable, serial, text, integer, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users.js';

export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  message: text('message').notNull(),
  url: text('url'),
  createdBy: integer('created_by').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});