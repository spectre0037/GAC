import { relations } from 'drizzle-orm';
import { users } from './users.js';
import { events } from './events.js';
import { reckyAssignments, reckyExpenses } from './recky.js';
import { eventForms } from './forms.js';
import { registrations, paymentScreenshots } from './registrations.js';
import { budgetLineItems } from './budget.js';
import { logisticsInventory } from './logistics.js';
import { emailLogs, auditLogs } from './logs.js';

export const usersRelations = relations(users, ({ many }) => ({
  createdEvents: many(events),
  registrations: many(registrations),
  reckyAssignments: many(reckyAssignments),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  creator: one(users, { fields: [events.createdBy], references: [users.id] }),
  form: one(eventForms, { fields: [events.id], references: [eventForms.eventId] }),
  registrations: many(registrations),
  reckyAssignments: many(reckyAssignments),
  reckyExpenses: many(reckyExpenses),
  budgetLineItems: many(budgetLineItems),
  logisticsInventory: many(logisticsInventory),
}));

export const reckyAssignmentsRelations = relations(reckyAssignments, ({ one }) => ({
  event: one(events, { fields: [reckyAssignments.eventId], references: [events.id] }),
  user: one(users, { fields: [reckyAssignments.userId], references: [users.id] }),
  assignedByUser: one(users, { fields: [reckyAssignments.assignedBy], references: [users.id] }),
}));

export const reckyExpensesRelations = relations(reckyExpenses, ({ one }) => ({
  event: one(events, { fields: [reckyExpenses.eventId], references: [events.id] }),
  recorder: one(users, { fields: [reckyExpenses.recordedBy], references: [users.id] }),
}));

export const eventFormsRelations = relations(eventForms, ({ one }) => ({
  event: one(events, { fields: [eventForms.eventId], references: [events.id] }),
}));

export const registrationsRelations = relations(registrations, ({ one, many }) => ({
  event: one(events, { fields: [registrations.eventId], references: [events.id] }),
  user: one(users, { fields: [registrations.userId], references: [users.id] }),
  addedByUser: one(users, { fields: [registrations.addedBy], references: [users.id] }),
  paymentScreenshots: many(paymentScreenshots),
}));

export const paymentScreenshotsRelations = relations(paymentScreenshots, ({ one }) => ({
  registration: one(registrations, {
    fields: [paymentScreenshots.registrationId],
    references: [registrations.id],
  }),
  verifier: one(users, { fields: [paymentScreenshots.verifiedBy], references: [users.id] }),
}));

export const budgetLineItemsRelations = relations(budgetLineItems, ({ one }) => ({
  event: one(events, { fields: [budgetLineItems.eventId], references: [events.id] }),
  submitter: one(users, { fields: [budgetLineItems.submittedBy], references: [users.id] }),
}));

export const logisticsInventoryRelations = relations(logisticsInventory, ({ one }) => ({
  event: one(events, { fields: [logisticsInventory.eventId], references: [events.id] }),
  manager: one(users, { fields: [logisticsInventory.managedBy], references: [users.id] }),
}));