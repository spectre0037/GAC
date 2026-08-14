import { z } from 'zod';
import { eq, and, inArray, desc, sql } from 'drizzle-orm';
import { db } from '../db/index.js';
import { registrations, paymentScreenshots, events, users } from '../db/schema/index.js';
import { AppError } from '../middleware/errorHandler.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { uploadBufferToCloudinary } from '../services/cloudinaryService.js';
import { countActiveHeadcount, promoteFromWaitlistIfSlotOpen } from '../utils/waitlist.js';
import { sendRegistrationReceivedEmail, sendApprovedEmail, sendRejectedEmail } from '../services/emailService.js';
import { generateTicketCode } from '../utils/ticketCode.js';
import { eventForms } from '../db/schema/index.js';

const submitRegistrationSchema = z.object({
    fullName: z.string().trim().min(2, 'Full name is required'),
    gender: z.enum(['male', 'female'], { message: 'Please select a gender.' }),
    regNo: z.string().trim().optional(),
    groupName: z.string().trim().optional(),
    groupMemberNames: z.array(z.string().trim().min(1)).optional(),
    whatsappNumber: z.string().trim().min(6, 'Enter a valid WhatsApp number'),
    emergencyContactName: z.string().trim().min(2, 'Emergency contact name is required'),
    emergencyContactNumber: z.string().trim().min(6, 'Emergency contact number is required'),
    medicalInfo: z.string().trim().optional(),
    waiverAccepted: z
        .boolean()
        .refine((val) => val === true, { message: 'You must accept the safety waiver to register.' }),
    formResponses: z.record(z.string(), z.any()).optional().default({}),
});

const manualAddSchema = submitRegistrationSchema.extend({
    waiverAccepted: z.boolean().optional().default(true),
});

const rejectSchema = z.object({
    reason: z.string().trim().min(2, 'A reason is required'),
});

// --- Student-facing ---

export const submitRegistration = asyncHandler(async (req, res) => {
    const eventId = Number(req.params.eventId);
    if (Number.isNaN(eventId)) throw new AppError('Invalid event id.', 400);

    const [event] = await db.select().from(events).where(eq(events.id, eventId));
    if (!event) throw new AppError('Event not found.', 404);
    if (!['coming_soon', 'confirmed'].includes(event.status)) {
        throw new AppError('This event is not currently open for registration.', 400);
    }

    const parsed = submitRegistrationSchema.safeParse(req.body);
    if (!parsed.success) {
        throw new AppError(parsed.error.issues[0].message, 400);
    }
    const data = parsed.data;

    const [existing] = await db
        .select()
        .from(registrations)
        .where(
            and(
                eq(registrations.eventId, eventId),
                eq(registrations.userId, req.user.id),
                inArray(registrations.status, ['pending', 'waitlisted', 'approved'])
            )
        );
    if (existing) {
        throw new AppError('You already have an active registration for this event.', 409);
    }

    const groupMemberNames = data.groupMemberNames || [];
    const headcount = 1 + groupMemberNames.length;

    const currentHeadcount = await countActiveHeadcount(eventId);
    const isFull = currentHeadcount + headcount > event.capacity;

    let status = 'pending';
    let waitlistPosition = null;

    if (isFull) {
        status = 'waitlisted';
        const [{ maxPos }] = await db
            .select({ maxPos: sql`coalesce(max(${registrations.waitlistPosition}), 0)` })
            .from(registrations)
            .where(and(eq(registrations.eventId, eventId), eq(registrations.status, 'waitlisted')));
        waitlistPosition = Number(maxPos) + 1;
    }
    const [form] = await db.select().from(eventForms).where(eq(eventForms.eventId, eventId));
    if (form?.isClosed) {
        throw new AppError('Registration is closed for this event.', 400);
    }
    const [registration] = await db
        .insert(registrations)
        .values({
            eventId,
            userId: req.user.id,
            formResponses: data.formResponses,
            fullName: data.fullName,
            gender: data.gender,
            regNo: data.regNo || null,
            groupName: data.groupName || null,
            groupMemberCount: groupMemberNames.length || null,
            groupMemberNames: groupMemberNames.length ? groupMemberNames : null,
            whatsappNumber: data.whatsappNumber,
            emergencyContactName: data.emergencyContactName,
            emergencyContactNumber: data.emergencyContactNumber,
            medicalInfo: data.medicalInfo || null,
            waiverAccepted: data.waiverAccepted,
            status,
            waitlistPosition,
        })
        .returning();

    sendRegistrationReceivedEmail(req.user, event).catch(() => { });
    res.status(201).json({ success: true, registration });
});

export const getMyRegistrations = asyncHandler(async (req, res) => {
    const myRegs = await db
        .select({
            id: registrations.id,
            status: registrations.status,
            waitlistPosition: registrations.waitlistPosition,
            ticketCode: registrations.ticketCode,
            checkedInAt: registrations.checkedInAt,
            createdAt: registrations.createdAt,
            event: {
                id: events.id,
                title: events.title,
                slug: events.slug,
                startDate: events.startDate,
                coverImageUrl: events.coverImageUrl,
            },
        })
        .from(registrations)
        .innerJoin(events, eq(registrations.eventId, events.id))
        .where(eq(registrations.userId, req.user.id))
        .orderBy(desc(registrations.createdAt));

    const withPaymentStatus = await Promise.all(
        myRegs.map(async (reg) => {
            const [latestScreenshot] = await db
                .select()
                .from(paymentScreenshots)
                .where(eq(paymentScreenshots.registrationId, reg.id))
                .orderBy(desc(paymentScreenshots.createdAt))
                .limit(1);
            return {
                ...reg,
                latestPaymentStatus: latestScreenshot ? latestScreenshot.verificationStatus : null,
                latestPaymentRejectionReason: latestScreenshot?.rejectionReason || null,
            };
        })
    );

    res.json({ success: true, registrations: withPaymentStatus });
});

export const cancelMyRegistration = asyncHandler(async (req, res) => {
    const regId = Number(req.params.id);
    if (Number.isNaN(regId)) throw new AppError('Invalid registration id.', 400);

    const [reg] = await db.select().from(registrations).where(eq(registrations.id, regId));
    if (!reg) throw new AppError('Registration not found.', 404);
    if (reg.userId !== req.user.id) throw new AppError('You can only cancel your own registration.', 403);

    await db
        .update(registrations)
        .set({ status: 'cancelled', updatedAt: new Date() })
        .where(eq(registrations.id, regId));

    await promoteFromWaitlistIfSlotOpen(reg.eventId);

    res.json({ success: true, message: 'Registration cancelled.' });
});

// Upload/replace payment screenshot — owner of the registration only
export const uploadPaymentScreenshot = asyncHandler(async (req, res) => {
    const regId = Number(req.params.id);
    if (Number.isNaN(regId)) throw new AppError('Invalid registration id.', 400);
    if (!req.file) throw new AppError('No image file provided.', 400);

    const [reg] = await db.select().from(registrations).where(eq(registrations.id, regId));
    if (!reg) throw new AppError('Registration not found.', 404);

    const isOwner = reg.userId === req.user.id;
    const isCoordinator = ['event_coordinator', 'super_admin'].includes(req.user.role);
    if (!isOwner && !isCoordinator) {
        throw new AppError('You are not authorized to upload a payment for this registration.', 403);
    }

    const result = await uploadBufferToCloudinary(req.file.buffer, 'payment-screenshots');

    const [screenshot] = await db
        .insert(paymentScreenshots)
        .values({
            registrationId: regId,
            imageUrl: result.secure_url,
            amount: req.body.amount ? String(req.body.amount) : null,
            verificationStatus: 'pending',
        })
        .returning();

    res.status(201).json({ success: true, screenshot });
});

// --- Coordinator-facing ---

export const listRegistrationsForEvent = asyncHandler(async (req, res) => {
    const eventId = Number(req.params.eventId);
    if (Number.isNaN(eventId)) throw new AppError('Invalid event id.', 400);

    const statusFilter = req.query.status;

    const conditions = [eq(registrations.eventId, eventId)];
    if (statusFilter && statusFilter !== 'all') {
        conditions.push(eq(registrations.status, statusFilter));
    }

    const regs = await db
        .select()
        .from(registrations)
        .where(and(...conditions))
        .orderBy(desc(registrations.createdAt));

    // Attach payment screenshots per registration (small event scale — fine as N+1)
    const regsWithScreenshots = await Promise.all(
        regs.map(async (reg) => {
            const screenshots = await db
                .select()
                .from(paymentScreenshots)
                .where(eq(paymentScreenshots.registrationId, reg.id))
                .orderBy(desc(paymentScreenshots.createdAt));
            return { ...reg, paymentScreenshots: screenshots };
        })
    );

    res.json({ success: true, registrations: regsWithScreenshots });
});

// Approves the most recent pending screenshot AND flips the registration to approved
export const approveRegistration = asyncHandler(async (req, res) => {
    const regId = Number(req.params.id);
    if (Number.isNaN(regId)) throw new AppError('Invalid registration id.', 400);

    const [reg] = await db.select().from(registrations).where(eq(registrations.id, regId));
    if (!reg) throw new AppError('Registration not found.', 404);

    const [latestScreenshot] = await db
        .select()
        .from(paymentScreenshots)
        .where(eq(paymentScreenshots.registrationId, regId))
        .orderBy(desc(paymentScreenshots.createdAt))
        .limit(1);

    if (!latestScreenshot) {
        throw new AppError('No payment screenshot has been uploaded for this registration.', 400);
    }

    await db
        .update(paymentScreenshots)
        .set({ verificationStatus: 'verified', verifiedBy: req.user.id, verifiedAt: new Date() })
        .where(eq(paymentScreenshots.id, latestScreenshot.id));

    const ticketCode = reg.ticketCode || generateTicketCode();

    const [updated] = await db
        .update(registrations)
        .set({ status: 'approved', ticketCode, updatedAt: new Date() })
        .where(eq(registrations.id, regId))
        .returning();

    if (updated.userId) {
        const [regUser] = await db.select().from(users).where(eq(users.id, updated.userId));
        const [event] = await db.select().from(events).where(eq(events.id, updated.eventId));
        if (regUser && event) sendApprovedEmail(regUser, event).catch(() => { });
    }

    res.json({ success: true, registration: updated });
});

// Rejects just the payment screenshot — registration stays 'pending' so the
// person can upload a new one, per your resubmission requirement.
export const rejectPaymentScreenshot = asyncHandler(async (req, res) => {
    const regId = Number(req.params.id);
    if (Number.isNaN(regId)) throw new AppError('Invalid registration id.', 400);

    const parsed = rejectSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError(parsed.error.issues[0].message, 400);

    const [latestScreenshot] = await db
        .select()
        .from(paymentScreenshots)
        .where(eq(paymentScreenshots.registrationId, regId))
        .orderBy(desc(paymentScreenshots.createdAt))
        .limit(1);

    if (!latestScreenshot) {
        throw new AppError('No payment screenshot found to reject.', 400);
    }

    await db
        .update(paymentScreenshots)
        .set({
            verificationStatus: 'rejected',
            verifiedBy: req.user.id,
            verifiedAt: new Date(),
            rejectionReason: parsed.data.reason,
        })
        .where(eq(paymentScreenshots.id, latestScreenshot.id));

    res.json({ success: true, message: 'Payment screenshot rejected. The person can resubmit.' });
});

// Rejects the whole registration outright — frees the capacity slot
export const rejectRegistration = asyncHandler(async (req, res) => {
    const regId = Number(req.params.id);
    if (Number.isNaN(regId)) throw new AppError('Invalid registration id.', 400);

    const parsed = rejectSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError(parsed.error.issues[0].message, 400);

    const [reg] = await db.select().from(registrations).where(eq(registrations.id, regId));
    if (!reg) throw new AppError('Registration not found.', 404);

    await db
        .update(registrations)
        .set({ status: 'rejected', updatedAt: new Date() })
        .where(eq(registrations.id, regId));

    if (reg.userId) {
        const [regUser] = await db.select().from(users).where(eq(users.id, reg.userId));
        const [event] = await db.select().from(events).where(eq(events.id, reg.eventId));
        if (regUser && event) sendRejectedEmail(regUser, event, parsed.data.reason).catch(() => { });
    }
    await promoteFromWaitlistIfSlotOpen(reg.eventId);

    res.json({ success: true, message: 'Registration rejected.' });
});

export const manuallyAddRegistration = asyncHandler(async (req, res) => {
    const eventId = Number(req.params.eventId);
    if (Number.isNaN(eventId)) throw new AppError('Invalid event id.', 400);

    const [event] = await db.select().from(events).where(eq(events.id, eventId));
    if (!event) throw new AppError('Event not found.', 404);

    const parsed = manualAddSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError(parsed.error.issues[0].message, 400);

    const data = parsed.data;
    const groupMemberNames = data.groupMemberNames || [];
    const [registration] = await db
        .insert(registrations)
        .values({
            eventId,
            userId: null,
            formResponses: data.formResponses,
            fullName: data.fullName,
            gender: data.gender,
            regNo: data.regNo || null,
            groupName: data.groupName || null,
            groupMemberCount: groupMemberNames.length || null,
            groupMemberNames: groupMemberNames.length ? groupMemberNames : null,
            whatsappNumber: data.whatsappNumber,
            emergencyContactName: data.emergencyContactName,
            emergencyContactNumber: data.emergencyContactNumber,
            medicalInfo: data.medicalInfo || null,
            waiverAccepted: data.waiverAccepted,
            status: 'approved',
            ticketCode: generateTicketCode(),
            addedManually: true,
            addedBy: req.user.id,
        })
        .returning();

    res.status(201).json({ success: true, registration });
});

export const getEventAnalytics = asyncHandler(async (req, res) => {
    const eventId = Number(req.params.eventId);
    if (Number.isNaN(eventId)) throw new AppError('Invalid event id.', 400);

    const regs = await db.select().from(registrations).where(eq(registrations.eventId, eventId));

    const summary = {
        total: regs.length,
        pending: regs.filter((r) => r.status === 'pending').length,
        approved: regs.filter((r) => r.status === 'approved').length,
        waitlisted: regs.filter((r) => r.status === 'waitlisted').length,
        rejected: regs.filter((r) => r.status === 'rejected').length,
        cancelled: regs.filter((r) => r.status === 'cancelled').length,
        manuallyAdded: regs.filter((r) => r.addedManually).length,
    };

    res.json({ success: true, summary });
});