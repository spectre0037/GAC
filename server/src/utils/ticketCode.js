import crypto from 'crypto';

// 10-character hex code — ~40 bits of randomness, more than enough
// collision resistance for a club's event scale.
export function generateTicketCode() {
  return crypto.randomBytes(5).toString('hex').toUpperCase();
}