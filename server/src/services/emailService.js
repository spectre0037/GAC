import emailjs from '@emailjs/nodejs';
import dotenv from 'dotenv';
import { db } from '../db/index.js';
import { emailLogs } from '../db/schema/index.js';

dotenv.config();

emailjs.init({
  publicKey: process.env.EMAILJS_PUBLIC_KEY,
  privateKey: process.env.EMAILJS_PRIVATE_KEY,
});

const SERVICE_ID = process.env.EMAILJS_SERVICE_ID;
const TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ID;

// Single generic template covers all 7 email types (EmailJS free tier caps
// at 2 templates) — subject/heading/message are passed as dynamic params
// per send, same idea as the old wrapper() approach with Resend.
async function sendEmail({ to, subject, heading, message, type, relatedEventId = null, relatedUserId = null }) {
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

export function sendWelcomeEmail(user) {
  return sendEmail({
    to: user.email,
    subject: 'Welcome to GAC',
    heading: `Welcome, ${user.fullName}!`,
    message: 'Your account is ready. Browse upcoming trips and hikes and register whenever you\'re ready.',
    type: 'welcome',
    relatedUserId: user.id,
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
  });
}

export function sendApprovedEmail(user, event) {
  return sendEmail({
    to: user.email,
    subject: `You're confirmed: ${event.title}`,
    heading: 'You\'re in!',
    message: `Your spot for ${event.title} is confirmed. See you there!`,
    type: 'approved',
    relatedEventId: event.id,
    relatedUserId: user.id,
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