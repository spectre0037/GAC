import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { users } from '../db/schema/index.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { signToken } from '../utils/jwt.js';
import { AppError } from '../middleware/errorHandler.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendWelcomeEmail } from '../services/emailService.js';
import { uploadBufferToCloudinary } from '../services/cloudinaryService.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const signupSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters'),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .regex(EMAIL_REGEX, 'Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  regNo: z.string().trim().optional(),
  whatsappNumber: z.string().trim().optional(),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().regex(EMAIL_REGEX, 'Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

function sanitizeUser(user) {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

export const signup = asyncHandler(async (req, res) => {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0].message, 400);
  }
  const { fullName, email, password, regNo, whatsappNumber } = parsed.data;

  const [existing] = await db.select().from(users).where(eq(users.email, email));
  if (existing) {
    throw new AppError('An account with this email already exists.', 409);
  }

  const passwordHash = await hashPassword(password);

  const [newUser] = await db
    .insert(users)
    .values({
      fullName,
      email,
      passwordHash,
      regNo: regNo || null,
      whatsappNumber: whatsappNumber || null,
      role: 'student', // every signup defaults to student; roles are appointed by super_admin only
    })
    .returning();

  sendWelcomeEmail(newUser).catch(() => { }); // fire-and-forget, never blocks signup

  const token = signToken({ userId: newUser.id, role: newUser.role });

  res.status(201).json({
    success: true,
    message: 'Account created successfully.',
    token,
    user: sanitizeUser(newUser),
  });
});

export const login = asyncHandler(async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0].message, 400);
  }
  const { email, password } = parsed.data;

  const [user] = await db.select().from(users).where(eq(users.email, email));
  if (!user) {
    throw new AppError('Invalid email or password.', 401);
  }

  const isMatch = await comparePassword(password, user.passwordHash);
  if (!isMatch) {
    throw new AppError('Invalid email or password.', 401);
  }

  const token = signToken({ userId: user.id, role: user.role });

  res.json({
    success: true,
    message: 'Logged in successfully.',
    token,
    user: sanitizeUser(user),
  });
});

export const getMe = asyncHandler(async (req, res) => {
  // req.user is already attached and sanitized by requireAuth middleware
  res.json({ success: true, user: req.user });
});

const updateProfileSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters').optional(),
  regNo: z.string().trim().optional(),
  whatsappNumber: z.string().trim().optional(),
});

export const updateProfile = asyncHandler(async (req, res) => {
  const parsed = updateProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0].message, 400);
  }

  const updates = { updatedAt: new Date() };
  if (parsed.data.fullName !== undefined) updates.fullName = parsed.data.fullName;
  if (parsed.data.regNo !== undefined) updates.regNo = parsed.data.regNo;
  if (parsed.data.whatsappNumber !== undefined) updates.whatsappNumber = parsed.data.whatsappNumber;

  const [updated] = await db
    .update(users)
    .set(updates)
    .where(eq(users.id, req.user.id))
    .returning({
      id: users.id,
      fullName: users.fullName,
      email: users.email,
      role: users.role,
      regNo: users.regNo,
      whatsappNumber: users.whatsappNumber,
      avatarUrl: users.avatarUrl,
    });

  res.json({ success: true, user: updated });
});

export const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError('No image file provided.', 400);

  const result = await uploadBufferToCloudinary(req.file.buffer, 'avatars');

  const [updated] = await db
    .update(users)
    .set({ avatarUrl: result.secure_url, updatedAt: new Date() })
    .where(eq(users.id, req.user.id))
    .returning({
      id: users.id,
      fullName: users.fullName,
      email: users.email,
      role: users.role,
      regNo: users.regNo,
      whatsappNumber: users.whatsappNumber,
      avatarUrl: users.avatarUrl,
    });

  res.json({ success: true, user: updated });
});