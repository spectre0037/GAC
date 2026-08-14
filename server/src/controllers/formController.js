import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { eventForms, events } from '../db/schema/index.js';
import { AppError } from '../middleware/errorHandler.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { uploadBufferToCloudinary } from '../services/cloudinaryService.js';

const blockSchema = z
  .object({
    id: z.string(),
    type: z.enum([
      'heading',
      'paragraph',
      'image',
      'divider',
      'text',
      'textarea',
      'number',
      'email',
      'tel',
      'select',
      'system_full_name',
      'system_gender',
      'system_reg_no',
      'system_group_name',
      'system_group_members',
      'system_whatsapp',
      'system_emergency_name',
      'system_emergency_number',
      'system_medical_info',
      'system_waiver',
    ]),
  })
  .passthrough(); // per-block extras (content, imageUrl, widthPercent, label, options...) pass through untouched

const pageSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  blocks: z.array(blockSchema),
});

const stylesSchema = z
  .object({
    headingColor: z.string().optional(),
    headingFont: z.string().optional(),
    paragraphColor: z.string().optional(),
    paragraphFont: z.string().optional(),
    inputTextColor: z.string().optional(),
    inputBackgroundColor: z.string().optional(),
    inputBorderColor: z.string().optional(),
    dividerColor: z.string().optional(),
  })
  .optional()
  .default({});

const formSchemaShape = z.object({
  heading: z.string().optional(),
  introText: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
  backgroundColor: z.string().optional(),
  headerImageUrl: z.string().nullable().optional(),
  headerHeightPercent: z.coerce.number().min(10).max(50).optional().default(25),
  styles: stylesSchema,
  pages: z.array(pageSchema).min(1, 'A form needs at least one page'),
});

export const getFormForAdmin = asyncHandler(async (req, res) => {
  const eventId = Number(req.params.eventId);
  if (Number.isNaN(eventId)) throw new AppError('Invalid event id.', 400);

  const [form] = await db.select().from(eventForms).where(eq(eventForms.eventId, eventId));
  res.json({ success: true, form: form || null });
});

// Returns the form as long as it's published — even if closed, so the public
// page can show "registration closed" rather than a bare 404. Only a form
// that was never published is truly hidden.
export const getFormForPublic = asyncHandler(async (req, res) => {
  const eventId = Number(req.params.eventId);
  if (Number.isNaN(eventId)) throw new AppError('Invalid event id.', 400);

  const [event] = await db.select().from(events).where(eq(events.id, eventId));
  if (!event || event.status === 'draft') {
    throw new AppError('Event not found.', 404);
  }

  const [form] = await db.select().from(eventForms).where(eq(eventForms.eventId, eventId));
  if (!form || !form.isPublished) {
    throw new AppError('Registration form is not available yet.', 404);
  }

  res.json({ success: true, form });
});

export const upsertForm = asyncHandler(async (req, res) => {
  const eventId = Number(req.params.eventId);
  if (Number.isNaN(eventId)) throw new AppError('Invalid event id.', 400);

  const parsed = formSchemaShape.safeParse(req.body.schema);
  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0].message, 400);
  }

  const [event] = await db.select().from(events).where(eq(events.id, eventId));
  if (!event) throw new AppError('Event not found.', 404);

  const [existing] = await db.select().from(eventForms).where(eq(eventForms.eventId, eventId));

  let form;
  if (existing) {
    [form] = await db
      .update(eventForms)
      .set({ schema: parsed.data, updatedAt: new Date() })
      .where(eq(eventForms.eventId, eventId))
      .returning();
  } else {
    [form] = await db
      .insert(eventForms)
      .values({ eventId, schema: parsed.data, isPublished: false, isClosed: false })
      .returning();
  }

  res.json({ success: true, form });
});

export const setFormPublishStatus = asyncHandler(async (req, res) => {
  const eventId = Number(req.params.eventId);
  if (Number.isNaN(eventId)) throw new AppError('Invalid event id.', 400);

  const publishSchema = z.object({ isPublished: z.boolean() });
  const parsed = publishSchema.safeParse(req.body);
  if (!parsed.success) throw new AppError(parsed.error.issues[0].message, 400);

  const [existing] = await db.select().from(eventForms).where(eq(eventForms.eventId, eventId));
  if (!existing) throw new AppError('Create and save the form before publishing it.', 400);

  const [updated] = await db
    .update(eventForms)
    .set({ isPublished: parsed.data.isPublished, updatedAt: new Date() })
    .where(eq(eventForms.eventId, eventId))
    .returning();

  res.json({ success: true, form: updated });
});

export const setFormClosedStatus = asyncHandler(async (req, res) => {
  const eventId = Number(req.params.eventId);
  if (Number.isNaN(eventId)) throw new AppError('Invalid event id.', 400);

  const closeSchema = z.object({ isClosed: z.boolean() });
  const parsed = closeSchema.safeParse(req.body);
  if (!parsed.success) throw new AppError(parsed.error.issues[0].message, 400);

  const [existing] = await db.select().from(eventForms).where(eq(eventForms.eventId, eventId));
  if (!existing) throw new AppError('Form not found.', 404);
  if (!existing.isPublished) {
    throw new AppError('Only a published form can be closed or reopened.', 400);
  }

  const [updated] = await db
    .update(eventForms)
    .set({ isClosed: parsed.data.isClosed, updatedAt: new Date() })
    .where(eq(eventForms.eventId, eventId))
    .returning();

  res.json({ success: true, form: updated });
});

export const deleteForm = asyncHandler(async (req, res) => {
  const eventId = Number(req.params.eventId);
  if (Number.isNaN(eventId)) throw new AppError('Invalid event id.', 400);

  await db.delete(eventForms).where(eq(eventForms.eventId, eventId));
  res.json({ success: true, message: 'Form deleted.' });
});

export const uploadFormImage = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError('No image file provided.', 400);
  const result = await uploadBufferToCloudinary(req.file.buffer, 'form-images');
  res.json({ success: true, url: result.secure_url });
});