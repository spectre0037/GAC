import { pgTable, serial, integer, jsonb, boolean, timestamp } from 'drizzle-orm/pg-core';
import { events } from './events.js';

export const eventForms = pgTable('event_forms', {
  id: serial('id').primaryKey(),
  eventId: integer('event_id').notNull().references(() => events.id).unique(),
  schema: jsonb('schema').notNull(),
  isPublished: boolean('is_published').notNull().default(false),
  isClosed: boolean('is_closed').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});