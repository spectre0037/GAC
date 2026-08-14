import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '@/lib/axios';
import QRCode from 'react-qr-code';
import AdminLayout from '@/components/admin/AdminLayout';

const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    className: 'bg-[#FFF4D6] text-[#9A6A00]',
    dot: 'bg-[#D89B00]',
  },
  waitlisted: {
    label: 'Waitlisted',
    className: 'bg-[#E4EFFA] text-[#3D6BB4]',
    dot: 'bg-[#3D6BB4]',
  },
  approved: {
    label: 'Confirmed',
    className: 'bg-[#E2F1EA] text-[#28704B]',
    dot: 'bg-[#28704B]',
  },
  rejected: {
    label: 'Rejected',
    className: 'bg-[#FBE7E7] text-[#A33A3A]',
    dot: 'bg-[#A33A3A]',
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-[#E9ECEF] text-[#68727E]',
    dot: 'bg-[#68727E]',
  },
};

export default function MyTickets() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRegs();
  }, []);

  async function fetchRegs() {
    setLoading(true);

    try {
      const { data } = await api.get('/registrations/my');
      setRegistrations(data.registrations);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to load your tickets.'
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel(regId) {
    const confirmed = window.confirm(
      'Cancel this registration?'
    );

    if (!confirmed) return;

    try {
      await api.patch(`/registrations/${regId}/cancel`);
      fetchRegs();
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to cancel.'
      );
    }
  }

  /* ============================================================
     LOADING
  ============================================================ */

  if (loading) {
    return (
      <AdminLayout>
        <main className="min-h-screen bg-[#EBF2F2]">
          <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12">

            <div className="mb-10">
              <div className="h-3 w-28 animate-pulse rounded bg-[#88B3D8]/20" />
              <div className="mt-4 h-12 w-64 animate-pulse rounded-xl bg-[#88B3D8]/20" />
            </div>

            <div className="space-y-6">
              <TicketSkeleton />
              <TicketSkeleton />
            </div>

          </div>
        </main>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <main className="min-h-screen bg-[#EBF2F2]">

        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-12 lg:py-12">

          {/* ======================================================
              PAGE HEADER
          ======================================================= */}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-10 grid gap-8 lg:grid-cols-[1fr_320px] lg:items-end"
          >

            <div>

              <div className="mb-5 flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-[#3D6BB4]" />

                <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#688BB0]">
                  GAC Expedition Passes
                </span>
              </div>

              <h1 className="text-5xl font-semibold leading-[0.9] tracking-[-0.055em] text-[#1A2B48] sm:text-6xl lg:text-7xl">
                My
                <br />
                <span className="text-[#3D6BB4]">
                  Tickets.
                </span>
              </h1>

            </div>

            <div className="lg:justify-self-end">

              <p className="max-w-sm text-sm leading-7 text-[#688BB0]">
                Your GAC adventures, all in one place. Keep your
                confirmed passes ready for the next expedition.
              </p>

              <Link
                to="/events"
                className="mt-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#3D6BB4] transition-colors hover:text-[#1A2B48]"
              >
                Explore upcoming trips
                <span>↗</span>
              </Link>

            </div>

          </motion.div>

          {/* ======================================================
              ERROR
          ======================================================= */}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700"
            >
              {error}
            </motion.div>
          )}

          {/* ======================================================
              EMPTY STATE
          ======================================================= */}

          {registrations.length === 0 ? (
            <EmptyTickets />
          ) : (

            /* ====================================================
               TICKET LIST
            ===================================================== */

            <div className="space-y-7">

              {registrations.map((reg, index) => (
                <Ticket
                  key={reg.id}
                  reg={reg}
                  index={index}
                  onCancel={handleCancel}
                />
              ))}

            </div>
          )}

          {/* ======================================================
              FOOTER
          ======================================================= */}

          <div className="mt-12 flex items-center justify-between border-t border-[#88B3D8]/20 pt-6">

            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#688BB0]">
              GIKI Adventure Club
            </p>

            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#88B3D8]" />
              <span className="h-1.5 w-1.5 rounded-full bg-[#5F97DF]" />
              <span className="h-1.5 w-1.5 rounded-full bg-[#3D6BB4]" />
            </div>

          </div>

        </div>
      </main>
    </AdminLayout>
  );
}


/* ================================================================
   TICKET
================================================================ */

function Ticket({ reg, index, onCancel }) {
  const status = STATUS_CONFIG[reg.status] || STATUS_CONFIG.pending;

  const isApproved =
    reg.status === 'approved' && reg.ticketCode;

  const ticketUrl = isApproved
    ? `${window.location.origin}/checkin/${reg.ticketCode}`
    : '';

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.55,
        delay: index * 0.08,
      }}
      className="group overflow-hidden rounded-[2rem] bg-white shadow-[0_15px_50px_rgba(26,43,72,0.06)] transition-all duration-500 hover:shadow-[0_25px_70px_rgba(26,43,72,0.1)]"
    >

      {/* ==========================================================
          TOP TICKET HEADER
      =========================================================== */}

      <div className="relative overflow-hidden bg-[#1A2B48] px-6 py-6 sm:px-8">

        {/* Decorative circles */}

        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full border border-[#88B3D8]/10" />

        <div className="pointer-events-none absolute -right-8 -top-12 h-40 w-40 rounded-full border border-[#88B3D8]/10" />

        <div className="relative flex items-start justify-between gap-5">

          <div>

            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#88B3D8]">
              GAC Expedition
            </p>

            <h2 className="max-w-2xl text-2xl font-semibold leading-tight tracking-[-0.035em] text-white sm:text-3xl">
              {reg.event.title}
            </h2>

          </div>

          <div className="shrink-0 text-right">

            <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-white/30">
              Pass
            </p>

            <p className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-[#88B3D8]">
              {String(index + 1).padStart(2, '0')}
            </p>

          </div>

        </div>

        {/* Location */}

        <div className="relative mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-white/50">

          <span className="flex items-center gap-2">
            <span className="text-[#88B3D8]">●</span>
            {reg.event.location}
          </span>

          {reg.event.startDate && (
            <span className="flex items-center gap-2">
              <span className="text-[#88B3D8]">◷</span>

              {new Date(
                reg.event.startDate
              ).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          )}

        </div>

      </div>

      {/* ==========================================================
          TICKET BODY
      =========================================================== */}

      <div className="relative">

        {/* Dashed ticket divider */}

        <div className="relative flex items-center">

          <div className="h-6 w-6 shrink-0 -translate-x-1/2 rounded-full bg-[#EBF2F2]" />

          <div className="flex-1 border-t border-dashed border-[#88B3D8]/30" />

          <div className="h-6 w-6 shrink-0 translate-x-1/2 rounded-full bg-[#EBF2F2]" />

        </div>

        <div className="p-6 sm:p-8">

          <div className="grid gap-8 lg:grid-cols-[1fr_auto]">

            {/* ====================================================
                INFORMATION
            ===================================================== */}

            <div>

              <div className="flex flex-wrap items-center gap-3">

                <span
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${status.className}`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${status.dot}`}
                  />

                  {status.label}

                  {reg.status === 'waitlisted' &&
                    ` #${reg.waitlistPosition}`}
                </span>

              </div>

              {/* Metadata */}

              <div className="mt-7 grid grid-cols-2 gap-6 sm:grid-cols-3">

                <TicketMeta
                  label="Destination"
                  value={reg.event.location}
                />

                <TicketMeta
                  label="Registration"
                  value={reg.status}
                />

                {reg.latestPaymentStatus && (
                  <TicketMeta
                    label="Payment"
                    value={reg.latestPaymentStatus}
                  />
                )}

              </div>

              {/* Check-in status */}

              {isApproved && (
                <div
                  className={`mt-7 rounded-2xl p-4 ${
                    reg.checkedInAt
                      ? 'bg-[#E2F1EA]'
                      : 'bg-[#EBF2F2]'
                  }`}
                >

                  <div className="flex items-center gap-3">

                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-full ${
                        reg.checkedInAt
                          ? 'bg-[#28704B] text-white'
                          : 'bg-[#1A2B48] text-white'
                      }`}
                    >
                      {reg.checkedInAt ? '✓' : '→'}
                    </div>

                    <div>

                      <p
                        className={`text-sm font-medium ${
                          reg.checkedInAt
                            ? 'text-[#28704B]'
                            : 'text-[#1A2B48]'
                        }`}
                      >
                        {reg.checkedInAt
                          ? 'Checked in successfully'
                          : 'Ready for your adventure'}
                      </p>

                      <p className="mt-0.5 text-xs text-[#688BB0]">
                        {reg.checkedInAt
                          ? `Checked in at ${new Date(
                              reg.checkedInAt
                            ).toLocaleString()}`
                          : 'Show your QR pass at the event entrance.'}
                      </p>

                    </div>

                  </div>

                </div>
              )}

              {/* Actions */}

              <div className="mt-7 flex flex-wrap items-center gap-4">

                <Link
                  to={`/events/${reg.event.slug}`}
                  className="inline-flex items-center gap-2 rounded-full bg-[#1A2B48] px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-white transition-all duration-300 hover:bg-[#3D6BB4]"
                >
                  View Event
                  <span>↗</span>
                </Link>

                {['pending', 'waitlisted'].includes(
                  reg.status
                ) && (
                  <button
                    type="button"
                    onClick={() => onCancel(reg.id)}
                    className="text-xs font-semibold uppercase tracking-[0.12em] text-[#A33A3A] transition-colors hover:text-red-900"
                  >
                    Cancel Registration
                  </button>
                )}

              </div>

            </div>

            {/* ====================================================
                QR CODE
            ===================================================== */}

            {isApproved && (
              <div className="flex justify-center lg:justify-end">

                <div className="relative">

                  {/* QR Card */}

                  <div className="rounded-[1.5rem] bg-[#EBF2F2] p-4">

                    <div className="rounded-xl bg-white p-4 shadow-sm">

                      <QRCode
                        value={ticketUrl}
                        size={150}
                        bgColor="#ffffff"
                        fgColor="#1A2B48"
                      />

                    </div>

                  </div>

                  <p className="mt-3 text-center text-[9px] font-semibold uppercase tracking-[0.16em] text-[#688BB0]">
                    Scan at entrance
                  </p>

                </div>

              </div>
            )}

          </div>

          {/* ======================================================
              TICKET CODE
          ======================================================= */}

          {isApproved && (
            <div className="mt-7 flex flex-col gap-2 border-t border-[#88B3D8]/15 pt-5 sm:flex-row sm:items-center sm:justify-between">

              <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#688BB0]">
                Ticket Code
              </span>

              <span className="rounded-lg bg-[#EBF2F2] px-3 py-2 font-mono text-xs font-medium tracking-wider text-[#1A2B48]">
                {reg.ticketCode}
              </span>

            </div>
          )}

        </div>

      </div>

    </motion.article>
  );
}


/* ================================================================
   TICKET META
================================================================ */

function TicketMeta({ label, value }) {
  return (
    <div>

      <p className="text-[9px] font-semibold uppercase tracking-[0.17em] text-[#688BB0]">
        {label}
      </p>

      <p className="mt-2 truncate text-sm font-medium capitalize text-[#1A2B48]">
        {value}
      </p>

    </div>
  );
}


/* ================================================================
   EMPTY TICKETS
================================================================ */

function EmptyTickets() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-[2rem] bg-[#1A2B48] p-10 sm:p-16"
    >

      {/* Decoration */}

      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full border border-[#88B3D8]/10" />

      <div className="relative max-w-xl">

        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-xl text-[#1A2B48]">
          ↗
        </span>

        <p className="mt-7 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#88B3D8]">
          Your adventure starts here
        </p>

        <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
          No tickets yet.
        </h2>

        <p className="mt-4 max-w-md text-sm leading-7 text-white/50">
          You haven't registered for any events yet.
          Discover the next GAC adventure and reserve your spot.
        </p>

        <Link
          to="/events"
          className="mt-8 inline-flex items-center gap-3 rounded-full bg-white px-6 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#1A2B48] transition-all duration-300 hover:bg-[#88B3D8]"
        >
          Browse Events
          <span>↗</span>
        </Link>

      </div>

    </motion.div>
  );
}


/* ================================================================
   LOADING SKELETON
================================================================ */

function TicketSkeleton() {
  return (
    <div className="overflow-hidden rounded-[2rem] bg-white shadow-[0_15px_50px_rgba(26,43,72,0.05)]">

      <div className="h-36 animate-pulse bg-[#1A2B48]" />

      <div className="space-y-5 p-8">

        <div className="h-5 w-32 animate-pulse rounded bg-[#88B3D8]/15" />

        <div className="h-7 w-64 animate-pulse rounded bg-[#88B3D8]/15" />

        <div className="h-20 animate-pulse rounded-2xl bg-[#EBF2F2]" />

      </div>

    </div>
  );
}