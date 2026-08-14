import { z } from 'zod';
import { eq, desc } from 'drizzle-orm';
import { db } from '../db/index.js';
import { notifications, users } from '../db/schema/index.js';
import { AppError } from '../middleware/errorHandler.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendAnnouncementEmail } from '../services/emailService.js';

const createSchema = z.object({
  message: z.string().trim().min(2, 'Message is required'),
  url: z.string().trim().url('Must be a valid URL').optional().or(z.literal('')),
});

const emailSchema = z.object({
  target: z.enum(['all', 'user']),
  userId: z.coerce.number().int().optional(),
});

export const createNotification = asyncHandler(async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) throw new AppError(parsed.error.issues[0].message, 400);

  const [notification] = await db
    .insert(notifications)
    .values({
      message: parsed.data.message,
      url: parsed.data.url || null,
      createdBy: req.user.id,
    })
    .returning();

  res.status(201).json({ success: true, notification });
});

// Visible to every logged-in user — their dashboard notification feed
export const listNotifications = asyncHandler(async (req, res) => {
  const all = await db.select().from(notifications).orderBy(desc(notifications.createdAt)).limit(50);
  res.json({ success: true, notifications: all });
});

export const emailNotification = asyncHandler(async (req, res) => {
  const notificationId = Number(req.params.id);
  if (Number.isNaN(notificationId)) throw new AppError('Invalid notification id.', 400);

  const parsed = emailSchema.safeParse(req.body);
  if (!parsed.success) throw new AppError(parsed.error.issues[0].message, 400);

  const [notification] = await db.select().from(notifications).where(eq(notifications.id, notificationId));
  if (!notification) throw new AppError('Notification not found.', 404);

  if (parsed.data.target === 'user') {
    if (!parsed.data.userId) throw new AppError('userId is required when target is "user".', 400);
    const [targetUser] = await db.select().from(users).where(eq(users.id, parsed.data.userId));
    if (!targetUser) throw new AppError('User not found.', 404);

    await sendAnnouncementEmail(targetUser.email, notification.message, notification.url);
    return res.json({ success: true, message: `Emailed ${targetUser.fullName}.`, sentCount: 1 });
  }

  const allUsers = await db.select().from(users);
  for (const u of allUsers) {
    sendAnnouncementEmail(u.email, notification.message, notification.url).catch(() => {});
  }

  res.json({ success: true, message: `Sending to ${allUsers.length} recipient(s).`, sentCount: allUsers.length });
});