import emailjs from '@emailjs/nodejs';
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
    await emailjs.send(SERVICE_ID, TEMPLATE_ID, {
      to_email: to,
      subject,
      heading,
      message,
    });
    await db.insert(emailLogs).values({
      recipientEmail: to,
      subject,
      type,
      status: 'sent',
      relatedEventId,
      relatedUserId,
    });
  } catch (err) {
    console.error(`[email] Failed to send "${type}" to ${to}:`, err?.text || err?.message || err);
    await db.insert(emailLogs).values({
      recipientEmail: to,
      subject,
      type,
      status: 'failed',
      relatedEventId,
      relatedUserId,
      errorMessage: err?.text || err?.message || String(err),
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
    heading: `Welcome, ${user.fullName}!`,
    message: 'Your account is ready. Browse upcoming trips and hikes and register whenever you\'re ready.',
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
    heading: 'We\'ve got your registration',
    message: `Your registration for ${event.title} is pending. Upload your payment screenshot on the event page to complete it.`,
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
  const dateStr = event.startDate
    ? new Date(event.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : 'the event date';
  return sendEmail({
    to: user.email,
    subject: `You're confirmed: ${event.title}`,
    heading: 'You\'re in!',
    message: `Your spot for ${event.title} is confirmed. See you there!`,
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
    heading: 'Registration not approved',
    message: `Your registration for ${event.title} was not approved.${reason ? ` Reason: ${reason}` : ''}`,
    type: 'rejected',
    relatedEventId: event.id,
    relatedUserId: user.id,
  });
}

export function sendWaitlistPromotedEmail(user, event) {
  return sendEmail({
    to: user.email,
    subject: `A spot opened up: ${event.title}`,
    heading: 'You\'re off the waitlist!',
    message: `A spot opened up for ${event.title}. Log in and upload your payment screenshot to secure it.`,
    type: 'waitlist_promoted',
    relatedEventId: event.id,
    relatedUserId: user.id,
  });
}

export function sendReckyInviteEmail(email, event) {
  return sendEmail({
    to: email,
    subject: `Recky planner invite: ${event.title}`,
    heading: `You've been asked to plan recon for ${event.title}`,
    message: 'Log in to GAC to log expenses and help plan this trip. If you don\'t have an account yet, sign up with this same email address.',
    type: 'recky_invite',
    relatedEventId: event.id,
  });
}

export function sendEventReminderEmail(user, event) {
  return sendEmail({
    to: user.email,
    subject: `Reminder: ${event.title} is coming up`,
    heading: `${event.title} is coming up soon`,
    message: `Just a reminder — this trip starts on ${new Date(event.startDate).toLocaleDateString()}. Check the event page for the full itinerary.`,
    type: 'event_reminder',
    relatedEventId: event.id,
    relatedUserId: user.id,
  });
}

export function sendAdminNewRegistrationEmail(adminUser, registrantName, event) {
  return sendEmail({
    to: adminUser.email,
    subject: `New registration: ${event.title}`,
    heading: 'New registration received',
    message: `${registrantName} just registered for ${event.title}. Check the Ticketing dashboard to review their payment.`,
    type: 'registration_received',
    relatedEventId: event.id,
  });
}

export function sendAnnouncementEmail(toEmail, message, url) {
  return sendEmail({
    to: toEmail,
    subject: 'Announcement from GAC',
    heading: 'Announcement from GAC',
    message: url ? `${message}\n\n${url}` : message,
    type: 'event_reminder', // reuses an existing enum value — see note below
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