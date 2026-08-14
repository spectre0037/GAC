import { verifyToken } from '../utils/jwt.js';
import { db } from '../db/index.js';
import { users } from '../db/schema/index.js';
import { eq } from 'drizzle-orm';
import { AppError } from './errorHandler.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Verifies the JWT and attaches the full user record (minus password) to req.user
export const requireAuth = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('Not authenticated. Please log in.', 401);
  }

  const token = authHeader.split(' ')[1];

  let decoded;
  try {
    decoded = verifyToken(token);
  } catch {
    throw new AppError('Invalid or expired token. Please log in again.', 401);
  }

  const [user] = await db
    .select({
      id: users.id,
      fullName: users.fullName,
      email: users.email,
      role: users.role,
      regNo: users.regNo,
      whatsappNumber: users.whatsappNumber,
      avatarUrl: users.avatarUrl,
    })
    .from(users)
    .where(eq(users.id, decoded.userId));

  if (!user) {
    throw new AppError('User no longer exists.', 401);
  }

  req.user = user;
  next();
});

// Usage: requireRole('event_coordinator', 'super_admin')
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      throw new AppError('Not authenticated.', 401);
    }
    if (!allowedRoles.includes(req.user.role)) {
      throw new AppError(
        `Access denied. This action requires one of these roles: ${allowedRoles.join(', ')}.`,
        403
      );
    }
    next();
  };
}