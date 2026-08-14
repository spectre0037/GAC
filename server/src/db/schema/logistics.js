import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  timestamp,
} from 'drizzle-orm/pg-core';
import { inventoryPhaseEnum, inventoryStatusEnum } from './enums.js';
import { events } from './events.js';
import { users } from './users.js';

// Master Logistics' item-tracking dashboard across pre/on/post event phases
export const logisticsInventory = pgTable('logistics_inventory', {
  id: serial('id').primaryKey(),
  eventId: integer('event_id').notNull().references(() => events.id),
  itemName: varchar('item_name', { length: 150 }).notNull(),
  quantity: integer('quantity').notNull().default(1),
  phase: inventoryPhaseEnum('phase').notNull(),
  status: inventoryStatusEnum('status').notNull().default('packed'),
  notes: text('notes'),
  managedBy: integer('managed_by').notNull().references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});