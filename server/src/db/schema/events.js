import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  decimal,
  timestamp,
  jsonb,
} from 'drizzle-orm/pg-core';
import { eventStatusEnum } from './enums.js';
import { users } from './users.js';

export const events = pgTable('events', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 200 }).notNull(),
  slug: varchar('slug', { length: 220 }).notNull().unique(),
  description: text('description'),
  // itinerary is stored as flexible JSON: [{ day: 1, title: "...", activities: ["...", "..."] }, ...]
  itinerary: jsonb('itinerary'),
  location: varchar('location', { length: 200 }),
  startDate: timestamp('start_date', { withTimezone: true }),
  endDate: timestamp('end_date', { withTimezone: true }),
  capacity: integer('capacity').notNull().default(80),
  ticketPrice: decimal('ticket_price', { precision: 10, scale: 2 }).notNull().default('0'),
  status: eventStatusEnum('status').notNull().default('draft'),
  coverImageUrl: text('cover_image_url'),
  whatsappGroupLink: text('whatsapp_group_link'),
  // Only Event Coordinator can create/publish — enforced at API layer, tracked here for audit
  createdBy: integer('created_by').references(() => users.id),
  
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
