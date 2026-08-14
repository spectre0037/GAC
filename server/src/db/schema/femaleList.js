import { pgTable, serial, varchar, integer, timestamp } from 'drizzle-orm/pg-core';
import { femaleListStatusEnum } from './enums.js';
import { events } from './events.js';
import { users } from './users.js';

// A GS-maintained pre-tally of female students, separate from actual
// registrations. isRegistered/paymentStatus/registrationStatus are computed
// at read-time by cross-referencing regNo against the registrations table —
// not stored here, since this list is meant to track intent/coordination,
// not duplicate the source of truth.
export const femaleStudentEntries = pgTable('female_student_entries', {
  id: serial('id').primaryKey(),
  eventId: integer('event_id').notNull().references(() => events.id),
  fullName: varchar('full_name', { length: 150 }).notNull(),
  regNo: varchar('reg_no', { length: 50 }),
  contactNumber: varchar('contact_number', { length: 20 }).notNull(),
  emergencyContactName: varchar('emergency_contact_name', { length: 150 }).notNull(),
  emergencyContactNumber: varchar('emergency_contact_number', { length: 20 }).notNull(),
  status: femaleListStatusEnum('status').notNull().default('pending'),
  addedBy: integer('added_by').references(() => users.id),
  verifiedBy: integer('verified_by').references(() => users.id),
  verifiedAt: timestamp('verified_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});