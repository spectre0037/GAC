import { Resend } from 'resend';
import dotenv from 'dotenv';
import { db } from '../db/index.js';
import { emailLogs } from '../db/schema/index.js';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = `${process.env.FROM_NAME || 'GAC'} <${process.env.FROM_EMAIL || 'onboarding@resend.dev'}>`;

// Every send goes through here so every attempt (success or failure) is
// logged to email_logs — gives us an audit trail without needing a separate
// monitoring tool. Failures never throw upward: a broken email send should
// never block the actual registration/approval/etc. action that triggered it.
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

export function sendWelcomeEmail(user) {
  return sendEmail({
    to: user.email,
    subject: 'Welcome to GAC',
    type: 'welcome',
    relatedUserId: user.id,
    html: wrapper(`
      <h2>Welcome, ${user.fullName}!</h2>
      <p>Your account is ready. Browse upcoming trips and hikes and register whenever you're ready.</p>
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
      <h2>We've got your registration</h2>
      <p>Your registration for <strong>${event.title}</strong> is pending. Upload your payment screenshot on the event page to complete it.</p>
    `),
  });
}

export function sendApprovedEmail(user, event) {
  return sendEmail({
    to: user.email,
    subject: `You're confirmed: ${event.title}`,
    type: 'approved',
    relatedEventId: event.id,
    relatedUserId: user.id,
    html: wrapper(`
      <h2>You're in! 🏔️</h2>
      <p>Your spot for <strong>${event.title}</strong> is confirmed. See you there!</p>
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