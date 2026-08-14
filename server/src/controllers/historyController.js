import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { execCouncilMembers } from '../db/schema/index.js';
import { AppError } from '../middleware/errorHandler.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { uploadBufferToCloudinary } from '../services/cloudinaryService.js';

const memberSchema = z.object({
  termLabel: z.string().trim().min(2, 'Term label is required (e.g. "2024–25")'),
  name: z.string().trim().min(2, 'Name is required'),
  role: z.string().trim().min(2, 'Role is required'),
  displayOrder: z.coerce.number().int().default(0),
});

export const listHistory = asyncHandler(async (req, res) => {
  const members = await db.select().from(execCouncilMembers).orderBy(execCouncilMembers.termLabel);
  res.json({ success: true, members });
});

export const createHistoryMember = asyncHandler(async (req, res) => {
  const parsed = memberSchema.safeParse(req.body);
  if (!parsed.success) throw new AppError(parsed.error.issues[0].message, 400);

  const [member] = await db.insert(execCouncilMembers).values(parsed.data).returning();
  res.status(201).json({ success: true, member });
});

export const updateHistoryMember = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) throw new AppError('Invalid id.', 400);

  const parsed = memberSchema.partial().safeParse(req.body);
  if (!parsed.success) throw new AppError(parsed.error.issues[0].message, 400);

  const [existing] = await db.select().from(execCouncilMembers).where(eq(execCouncilMembers.id, id));
  if (!existing) throw new AppError('Member not found.', 404);

  const [updated] = await db
    .update(execCouncilMembers)
    .set(parsed.data)
    .where(eq(execCouncilMembers.id, id))
    .returning();

  res.json({ success: true, member: updated });
});

export const deleteHistoryMember = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) throw new AppError('Invalid id.', 400);

  await db.delete(execCouncilMembers).where(eq(execCouncilMembers.id, id));
  res.json({ success: true, message: 'Removed.' });
});

export const uploadHistoryPhoto = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) throw new AppError('Invalid id.', 400);
  if (!req.file) throw new AppError('No image file provided.', 400);

  const [existing] = await db.select().from(execCouncilMembers).where(eq(execCouncilMembers.id, id));
  if (!existing) throw new AppError('Member not found.', 404);

  const result = await uploadBufferToCloudinary(req.file.buffer, 'exec-council');

  const [updated] = await db
    .update(execCouncilMembers)
    .set({ photoUrl: result.secure_url })
    .where(eq(execCouncilMembers.id, id))
    .returning();

  res.json({ success: true, member: updated });
});