import { z } from 'zod';
import { eq, inArray } from 'drizzle-orm';
import { db } from '../db/index.js';
import { users } from '../db/schema/index.js';
import { AppError } from '../middleware/errorHandler.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  registrations,
  paymentScreenshots,
  events,
  reckyAssignments,
  reckyExpenses,
  budgetLineItems,
  logisticsInventory,
  emailLogs,
  auditLogs,
} from '../db/schema/index.js';
const VALID_ROLES = [
  'super_admin',
  'president',
  'vp_ops',
  'event_coordinator',
  'finance_master',
  'master_logistics',
  'student',
  'general_secretary',
];

const updateRoleSchema = z.object({
  role: z.enum(VALID_ROLES),
});

export const listUsers = asyncHandler(async (req, res) => {
  const allUsers = await db
    .select({
      id: users.id,
      fullName: users.fullName,
      email: users.email,
      role: users.role,
      regNo: users.regNo,
      whatsappNumber: users.whatsappNumber,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(users.createdAt);

  res.json({ success: true, users: allUsers });
});

export const updateUserRole = asyncHandler(async (req, res) => {
  const userId = Number(req.params.id);
  if (Number.isNaN(userId)) {
    throw new AppError('Invalid user id.', 400);
  }

  const parsed = updateRoleSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0].message, 400);
  }

  // Prevent a super_admin from demoting themselves and locking themselves out
  if (userId === req.user.id && parsed.data.role !== 'super_admin') {
    throw new AppError('You cannot change your own role.', 400);
  }

  const [existing] = await db.select().from(users).where(eq(users.id, userId));
  if (!existing) {
    throw new AppError('User not found.', 404);
  }

  const [updated] = await db
    .update(users)
    .set({ role: parsed.data.role, updatedAt: new Date() })
    .where(eq(users.id, userId))
    .returning({
      id: users.id,
      fullName: users.fullName,
      email: users.email,
      role: users.role,
    });

  res.json({ success: true, message: `Role updated to ${updated.role}.`, user: updated });
});

export const deleteUser = asyncHandler(async (req, res) => {
  const userId = Number(req.params.id);
  if (Number.isNaN(userId)) throw new AppError('Invalid user id.', 400);

  if (userId === req.user.id) {
    throw new AppError('You cannot delete your own account.', 400);
  }

  const [existing] = await db.select().from(users).where(eq(users.id, userId));
  if (!existing) throw new AppError('User not found.', 404);

  // True cascade delete. Anything this user personally OWNS with a required
  // (non-nullable) reference — their own registrations, recky expenses,
  // budget entries, logistics items — is deleted outright. Anything they
  // merely TOUCHED with a nullable reference (an event they created, a
  // payment they verified, an email log) is detached rather than cascading
  // destruction into records that belong to other people or the event itself.

  const ownRegs = await db
    .select({ id: registrations.id })
    .from(registrations)
    .where(eq(registrations.userId, userId));
  if (ownRegs.length > 0) {
    const regIds = ownRegs.map((r) => r.id);
    await db.delete(paymentScreenshots).where(inArray(paymentScreenshots.registrationId, regIds));
  }
  await db.delete(registrations).where(eq(registrations.userId, userId));

  await db.update(registrations).set({ addedBy: null }).where(eq(registrations.addedBy, userId));
  await db.update(paymentScreenshots).set({ verifiedBy: null }).where(eq(paymentScreenshots.verifiedBy, userId));

  await db.delete(reckyExpenses).where(eq(reckyExpenses.recordedBy, userId));
  await db.delete(reckyAssignments).where(eq(reckyAssignments.assignedBy, userId));
  await db.update(reckyAssignments).set({ userId: null }).where(eq(reckyAssignments.userId, userId));

  await db.delete(budgetLineItems).where(eq(budgetLineItems.submittedBy, userId));
  await db.delete(logisticsInventory).where(eq(logisticsInventory.managedBy, userId));

  await db.update(events).set({ createdBy: null }).where(eq(events.createdBy, userId));
  await db.update(emailLogs).set({ relatedUserId: null }).where(eq(emailLogs.relatedUserId, userId));
  await db.update(auditLogs).set({ actorId: null }).where(eq(auditLogs.actorId, userId));

  await db.delete(users).where(eq(users.id, userId));

  res.json({ success: true, message: 'User and their personal data permanently deleted.' });
});