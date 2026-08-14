import { pgTable, serial, varchar, text, integer, timestamp } from 'drizzle-orm/pg-core';

// Flat table, grouped by termLabel on the frontend (e.g. "2024–25") rather than
// a separate terms table — keeps the admin CRUD simple for what's fundamentally
// just an archival list.
export const execCouncilMembers = pgTable('exec_council_members', {
  id: serial('id').primaryKey(),
  termLabel: varchar('term_label', { length: 50 }).notNull(),
  name: varchar('name', { length: 150 }).notNull(),
  role: varchar('role', { length: 100 }).notNull(),
  photoUrl: text('photo_url'),
  displayOrder: integer('display_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});