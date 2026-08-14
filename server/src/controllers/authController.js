import { z } from 'zod';
import { eq, inArray } from 'drizzle-orm';
import { db } from '../db/index.js';
import { users } from '../db/schema/index.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { signToken } from '../utils/jwt.js';
import { generateOtp, OTP_EXPIRY_MINUTES } from '../utils/otp.js';
import { AppError } from '../middleware/errorHandler.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { uploadBufferToCloudinary } from '../services/cloudinaryService.js';
import { sendOtpEmail, sendWelcomeEmail, sendAdminNewUserEmail } from '../services/emailService.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const signupSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters'),
  email: z.string().trim().toLowerCase().regex(EMAIL_REGEX, 'Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  regNo: z.string().trim().optional(),
  whatsappNumber: z.string().trim().optional(),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().regex(EMAIL_REGEX, 'Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

const otpSchema = z.object({
  email: z.string().trim().toLowerCase().regex(EMAIL_REGEX, 'Please enter a valid email address'),
  otp: z.string().trim().length(6, 'Enter the 6-digit code'),
});

const resendSchema = z.object({
  email: z.string().trim().toLowerCase().regex(EMAIL_REGEX, 'Please enter a valid email address'),
});

function sanitizeUser(user) {
  const { passwordHash, otpCodeHash, otpExpiresAt, ...safeUser } = user;
  return safeUser;
}

async function issueOtp(userId, email, fullName) {
  const otp = generateOtp();
  const otpCodeHash = await hashPassword(otp);
  const otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await db.update(users).set({ otpCodeHash, otpExpiresAt }).where(eq(users.id, userId));
  sendOtpEmail({ email, fullName }, otp).catch(() => {});
}

export const signup = asyncHandler(async (req, res) => {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) throw new AppError(parsed.error.issues[0].message, 400);
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
      role: 'student',
      emailVerified: false,
    })
    .returning();

  await issueOtp(newUser.id, newUser.email, newUser.fullName);

  res.status(201).json({
    success: true,
    message: 'Account created. Check your email for a verification code.',
    email: newUser.email,
  });
});

export const verifyOtp = asyncHandler(async (req, res) => {
  const parsed = otpSchema.safeParse(req.body);
  if (!parsed.success) throw new AppError(parsed.error.issues[0].message, 400);
  const { email, otp } = parsed.data;

  const [user] = await db.select().from(users).where(eq(users.email, email));
  if (!user) throw new AppError('No account found with this email.', 404);
  if (user.emailVerified) throw new AppError('This account is already verified.', 400);
  if (!user.otpCodeHash || !user.otpExpiresAt || new Date() > new Date(user.otpExpiresAt)) {
    throw new AppError('This code has expired. Request a new one.', 400);
  }

  const isMatch = await comparePassword(otp, user.otpCodeHash);
  if (!isMatch) throw new AppError('Incorrect code. Please try again.', 400);

  const [verifiedUser] = await db
    .update(users)
    .set({ emailVerified: true, otpCodeHash: null, otpExpiresAt: null, updatedAt: new Date() })
    .where(eq(users.id, user.id))
    .returning();

  sendWelcomeEmail(verifiedUser).catch(() => {});

  db.select().from(users).where(eq(users.role, 'super_admin')).then((admins) => {
    admins.forEach((admin) => sendAdminNewUserEmail(admin, verifiedUser).catch(() => {}));
  });

  const token = signToken({ userId: verifiedUser.id, role: verifiedUser.role });

  res.json({
    success: true,
    message: 'Email verified.',
    token,
    user: sanitizeUser(verifiedUser),
  });
});

export const resendOtp = asyncHandler(async (req, res) => {
  const parsed = resendSchema.safeParse(req.body);
  if (!parsed.success) throw new AppError(parsed.error.issues[0].message, 400);

  const [user] = await db.select().from(users).where(eq(users.email, parsed.data.email));
  if (!user) throw new AppError('No account found with this email.', 404);
  if (user.emailVerified) throw new AppError('This account is already verified.', 400);

  await issueOtp(user.id, user.email, user.fullName);
  res.json({ success: true, message: 'A new code has been sent.' });
});

export const login = asyncHandler(async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) throw new AppError(parsed.error.issues[0].message, 400);
  const { email, password } = parsed.data;

  const [user] = await db.select().from(users).where(eq(users.email, email));
  if (!user) throw new AppError('Invalid email or password.', 401);

  const isMatch = await comparePassword(password, user.passwordHash);
  if (!isMatch) throw new AppError('Invalid email or password.', 401);

  if (!user.emailVerified) {
    return res.status(403).json({
      success: false,
      message: 'Please verify your email before logging in.',
      needsVerification: true,
      email: user.email,
    });
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
  res.json({ success: true, user: req.user });
});

const updateProfileSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters').optional(),
  regNo: z.string().trim().optional(),
  whatsappNumber: z.string().trim().optional(),
});

export const updateProfile = asyncHandler(async (req, res) => {
  const parsed = updateProfileSchema.safeParse(req.body);
  if (!parsed.success) throw new AppError(parsed.error.issues[0].message, 400);

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