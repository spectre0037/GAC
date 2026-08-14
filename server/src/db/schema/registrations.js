import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  boolean,
  decimal,
  jsonb,
  timestamp,
} from 'drizzle-orm/pg-core';
import { events } from './events.js';
import { users } from './users.js';
import { registrationStatusEnum, verificationStatusEnum, genderEnum } from './enums.js';

export const registrations = pgTable('registrations', {
  id: serial('id').primaryKey(),
  eventId: integer('event_id').notNull().references(() => events.id),
  userId: integer('user_id').references(() => users.id),
  formResponses: jsonb('form_responses').notNull(),

  fullName: varchar('full_name', { length: 150 }).notNull(),
  gender: genderEnum('gender'),
  regNo: varchar('reg_no', { length: 50 }),
  groupName: varchar('group_name', { length: 150 }),
  groupMemberCount: integer('group_member_count'),
  groupMemberNames: jsonb('group_member_names'),
  whatsappNumber: varchar('whatsapp_number', { length: 20 }).notNull(),

  emergencyContactName: varchar('emergency_contact_name', { length: 150 }).notNull(),
  emergencyContactNumber: varchar('emergency_contact_number', { length: 20 }).notNull(),
  medicalInfo: text('medical_info'),
  waiverAccepted: boolean('waiver_accepted').notNull().default(false),

  status: registrationStatusEnum('status').notNull().default('pending'),
  waitlistPosition: integer('waitlist_position'),

  ticketCode: varchar('ticket_code', { length: 20 }).unique(),
  checkedInAt: timestamp('checked_in_at', { withTimezone: true }),

  addedManually: boolean('added_manually').notNull().default(false),
  addedBy: integer('added_by').references(() => users.id),

  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const paymentScreenshots = pgTable('payment_screenshots', {
  id: serial('id').primaryKey(),
  registrationId: integer('registration_id').notNull().references(() => registrations.id),
  imageUrl: text('image_url').notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }),
  verificationStatus: verificationStatusEnum('verification_status').notNull().default('pending'),
  verifiedBy: integer('verified_by').references(() => users.id),
  verifiedAt: timestamp('verified_at', { withTimezone: true }),
  rejectionReason: text('rejection_reason'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});