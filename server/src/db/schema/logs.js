import { pgTable, serial, varchar, text, integer, jsonb, timestamp } from 'drizzle-orm/pg-core';
import { emailTypeEnum } from './enums.js';
import { events } from './events.js';
import { users } from './users.js';

export const emailLogs = pgTable('email_logs', {
  id: serial('id').primaryKey(),
  recipientEmail: varchar('recipient_email', { length: 255 }).notNull(),
  subject: varchar('subject', { length: 255 }).notNull(),
  type: emailTypeEnum('type').notNull(),
  status: varchar('status', { length: 20 }).notNull().default('sent'), // 'sent' | 'failed'
  relatedEventId: integer('related_event_id').references(() => events.id),
  relatedUserId: integer('related_user_id').references(() => users.id),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// Reserved now, populated starting Phase 13 — who changed what, when
export const auditLogs = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  actorId: integer('actor_id').references(() => users.id),
  action: varchar('action', { length: 100 }).notNull(),
  entityType: varchar('entity_type', { length: 50 }).notNull(),
  entityId: integer('entity_id'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});