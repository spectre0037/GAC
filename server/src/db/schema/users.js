import { pgTable, serial, varchar, text, timestamp } from 'drizzle-orm/pg-core';
import { roleEnum } from './enums.js';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  fullName: varchar('full_name', { length: 150 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: roleEnum('role').notNull().default('student'),
  regNo: varchar('reg_no', { length: 50 }),
  whatsappNumber: varchar('whatsapp_number', { length: 20 }),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});