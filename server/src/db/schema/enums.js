import { pgEnum } from 'drizzle-orm/pg-core';

export const roleEnum = pgEnum('role', [
  'super_admin',
  'president',
  'vp_ops',
  'event_coordinator',
  'finance_master',
  'master_logistics',
  'general_secretary',
  'student',
]);

export const femaleListStatusEnum = pgEnum('female_list_status', ['pending', 'verified', 'rejected']);

export const genderEnum = pgEnum('gender', ['male', 'female']);
export const eventStatusEnum = pgEnum('event_status', [
  'draft',
  'coming_soon',
  'confirmed',
  'passed',
  'cancelled',
]);

export const reckyAssignmentStatusEnum = pgEnum('recky_assignment_status', [
  'invited',
  'active',
  'completed',
]);

export const expenseCategoryEnum = pgEnum('expense_category', [
  'logistics',
  'operations',
  'transport',
  'food',
  'water',
  'misc',
]);

export const registrationStatusEnum = pgEnum('registration_status', [
  'pending',
  'waitlisted',
  'approved',
  'rejected',
  'cancelled',
]);

export const verificationStatusEnum = pgEnum('verification_status', [
  'pending',
  'verified',
  'rejected',
]);

export const budgetPhaseEnum = pgEnum('budget_phase', [
  'pre_event',
  'post_event',
]);

export const inventoryPhaseEnum = pgEnum('inventory_phase', [
  'pre_event',
  'on_event',
  'post_event',
]);

export const inventoryStatusEnum = pgEnum('inventory_status', [
  'packed',
  'in_use',
  'returned',
  'lost',
  'damaged',
]);


export const emailTypeEnum = pgEnum('email_type', [
  'registration_received',
  'approved',
  'rejected',
  'waitlist_promoted',
  'event_reminder',
  'recky_invite',
  'welcome',
]);