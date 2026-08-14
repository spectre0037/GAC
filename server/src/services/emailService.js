import { Resend } from 'resend';
import dotenv from 'dotenv';
import { db } from '../db/index.js';
import { emailLogs } from '../db/schema/index.js';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = `${process.env.FROM_NAME || 'GAC'} <${process.env.FROM_EMAIL || 'noreply@gikadventureclub.me'}>`;
const INSTAGRAM_URL = process.env.INSTAGRAM_URL || 'https://instagram.com';

async function sendEmail({ to, subject, html, type, relatedEventId = null, relatedUserId = null }) {
  try {
    await resend.emails.send({ from: FROM, to, subject, html });
    await db.insert(emailLogs).values({
      recipientEmail: to,
      subject,
      type,
      status: 'sent',
      relatedEventId,
      relatedUserId,
    });
  } catch (err) {
    console.error(`[email] Failed to send "${type}" to ${to}:`, err.message);
    await db.insert(emailLogs).values({
      recipientEmail: to,
      subject,
      type,
      status: 'failed',
      relatedEventId,
      relatedUserId,
      errorMessage: err.message,
    });
  }
}

function wrapper(bodyHtml) {
  return `
    <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      ${bodyHtml}
      <p style="margin-top: 32px; font-size: 12px; color: #888;">— GAC, GIKI Adventure Club</p>
    </div>
  `;
}

export function sendOtpEmail(user, otp) {
  return sendEmail({
    to: user.email,
    subject: 'Verify your GAC account',
    type: 'welcome',
    relatedUserId: user.id,
    html: wrapper(`
      <h2>Verify your email</h2>
      <p>Hi ${user.fullName}, use this code to verify your account:</p>
      <p style="font-size: 28px; font-weight: 600; letter-spacing: 4px;">${otp}</p>
      <p>This code expires in 10 minutes.</p>
    `),
  });
}

export function sendWelcomeEmail(user) {
  return sendEmail({
    to: user.email,
    subject: 'Welcome to GAC',
    type: 'welcome',
    relatedUserId: user.id,
    html: wrapper(`
      <h2>Welcome to GAC, ${user.fullName}!</h2>
      <p>The GIKI Adventure Club plans and runs hiking and trekking trips across northern Pakistan for GIKI students. Every trip starts with a small core team scouting the route and planning logistics before opening registration to everyone.</p>
      <p>Your account is ready — browse upcoming trips, register, and track your spot right from the portal.</p>
      <p>Follow us on Instagram for announcements and photos: <a href="${INSTAGRAM_URL}">${INSTAGRAM_URL}</a></p>
    `),
  });
}

export function sendAdminNewUserEmail(adminUser, newUser) {
  return sendEmail({
    to: adminUser.email,
    subject: 'New user registered on GAC',
    type: 'welcome',
    relatedUserId: newUser.id,
    html: wrapper(`
      <h2>New account created</h2>
      <p><strong>${newUser.fullName}</strong> just verified their email and joined the platform.</p>
      <p>Email: ${newUser.email}</p>
    `),
  });
}

export function sendRegistrationReceivedEmail(user, event) {
  return sendEmail({
    to: user.email,
    subject: `Registration received: ${event.title}`,
    type: 'registration_received',
    relatedEventId: event.id,
    relatedUserId: user.id,
    html: wrapper(`
      <h2>We've got your submission</h2>
      <p>Your registration for <strong>${event.title}</strong> has been received. You'll be notified by email or WhatsApp once your seat is confirmed.</p>
    `),
  });
}

export function sendAdminNewRegistrationEmail(adminUser, registrantName, event) {
  return sendEmail({
    to: adminUser.email,
    subject: `New registration: ${event.title}`,
    type: 'registration_received',
    relatedEventId: event.id,
    html: wrapper(`
      <h2>New registration submission</h2>
      <p><strong>${registrantName}</strong> just submitted a registration for <strong>${event.title}</strong>.</p>
      <p>Go to the portal to review and update their status.</p>
    `),
  });
}

export function sendApprovedEmail(user, event) {
  const dateStr = event.startDate
    ? new Date(event.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : 'the event date';
  return sendEmail({
    to: user.email,
    subject: `You're confirmed: ${event.title}`,
    type: 'approved',
    relatedEventId: event.id,
    relatedUserId: user.id,
    html: wrapper(`
      <h2>Your seat is confirmed! 🏔️</h2>
      <p>See you on <strong>${dateStr}</strong> for ${event.title}.</p>
      ${
        event.whatsappGroupLink
          ? `<p>Join the trip's WhatsApp group here: <a href="${event.whatsappGroupLink}">${event.whatsappGroupLink}</a></p>`
          : ''
      }
    `),
  });
}

export function sendRejectedEmail(user, event, reason) {
  return sendEmail({
    to: user.email,
    subject: `Update on your registration: ${event.title}`,
    type: 'rejected',
    relatedEventId: event.id,
    relatedUserId: user.id,
    html: wrapper(`
      <h2>Registration not approved</h2>
      <p>Your registration for <strong>${event.title}</strong> was not approved.</p>
      ${reason ? `<p><em>Reason: ${reason}</em></p>` : ''}
    `),
  });
}

export function sendWaitlistPromotedEmail(user, event) {
  return sendEmail({
    to: user.email,
    subject: `A spot opened up: ${event.title}`,
    type: 'waitlist_promoted',
    relatedEventId: event.id,
    relatedUserId: user.id,
    html: wrapper(`
      <h2>You're off the waitlist!</h2>
      <p>A spot opened up for <strong>${event.title}</strong>. Log in and upload your payment screenshot to secure it.</p>
    `),
  });
}

export function sendReckyInviteEmail(email, event) {
  return sendEmail({
    to: email,
    subject: `Recky planner invite: ${event.title}`,
    type: 'recky_invite',
    relatedEventId: event.id,
    html: wrapper(`
      <h2>You've been asked to plan recon for ${event.title}</h2>
      <p>Log in to GAC to log expenses and help plan this trip. If you don't have an account yet, sign up with this same email address.</p>
    `),
  });
}

export function sendEventReminderEmail(user, event) {
  return sendEmail({
    to: user.email,
    subject: `Reminder: ${event.title} is coming up`,
    type: 'event_reminder',
    relatedEventId: event.id,
    relatedUserId: user.id,
    html: wrapper(`
      <h2>${event.title} is coming up soon</h2>
      <p>Just a reminder — this trip starts on ${new Date(event.startDate).toLocaleDateString()}. Check the event page for the full itinerary.</p>
    `),
  });
}

export function sendAnnouncementEmail(toEmail, message, url) {
  return sendEmail({
    to: toEmail,
    subject: 'Announcement from GAC',
    type: 'event_reminder',
    html: wrapper(`
      <h2>Announcement</h2>
      <p>${message}</p>
      ${url ? `<p><a href="${url}">${url}</a></p>` : ''}
    `),
  });
}