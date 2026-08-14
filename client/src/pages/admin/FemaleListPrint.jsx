import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '@/lib/axios';

const STATUS_STYLES = {
  pending: 'bg-amber-50 text-amber-700 ring-amber-200/70',
  verified: 'bg-emerald-50 text-emerald-700 ring-emerald-200/70',
  rejected: 'bg-red-50 text-red-700 ring-red-200/70',
};

function StatusBadge({ value }) {
  if (!value) {
    return (
      <span className="text-xs text-slate-400">
        —
      </span>
    );
  }

  const style =
    STATUS_STYLES[value] ||
    'bg-slate-100 text-slate-600 ring-slate-200/70';

  return (
    <span
      className={`inline-flex items-center rounded-xl px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] ring-1 ${style}`}
    >
      {value}
    </span>
  );
}

function BooleanBadge({ value }) {
  return value ? (
    <span className="inline-flex items-center rounded-xl bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-emerald-700 ring-1 ring-emerald-200/70">
      Yes
    </span>
  ) : (
    <span className="inline-flex items-center rounded-xl bg-slate-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500 ring-1 ring-slate-200/70">
      No
    </span>
  );
}

export default function FemaleListPrint() {
  const { eventId } = useParams();

  const [entries, setEntries] = useState([]);
  const [eventTitle, setEventTitle] = useState('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    load();
  }, [eventId]);

  async function load() {
    try {
      const [entriesRes, eventRes] = await Promise.all([
        api.get(`/female-list/events/${eventId}`),
        api.get(`/events/${eventId}`),
      ]);

      setEntries(entriesRes.data.entries);
      setEventTitle(eventRes.data.event.title);
    } finally {
      setLoaded(true);
    }
  }

  useEffect(() => {
    if (loaded) {
      setTimeout(() => window.print(), 300);
    }
  }, [loaded]);

  return (
    <div className="min-h-screen bg-[#EBF2F2] p-6 text-[#1A2B48] sm:p-8 print:min-h-0 print:bg-white print:p-0">
      <div className="mx-auto max-w-7xl">
        {/* =====================================================
            HEADER
        ====================================================== */}
        <header className="mb-6 overflow-hidden rounded-[24px] bg-[#1A2B48] shadow-sm print:rounded-none print:shadow-none">
          <div className="relative px-6 py-7 sm:px-8 sm:py-8">
            {/* Decorative circles */}
            <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full border border-[#88B3D8]/10" />
            <div className="pointer-events-none absolute -right-4 -top-8 h-28 w-28 rounded-full border border-[#88B3D8]/10" />

            <div className="relative">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#88B3D8]">
                GIKI Adventure Club
              </p>

              <h1 className="text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl">
                Female Students List
              </h1>

              <p className="mt-2 text-sm text-white/50">
                {eventTitle || 'Event'}
              </p>
            </div>
          </div>
        </header>

        {/* =====================================================
            SUMMARY
        ====================================================== */}
        <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <SummaryCard
            label="Total Entries"
            value={entries.length}
          />

          <SummaryCard
            label="Verified"
            value={entries.filter((e) => e.status === 'verified').length}
            semantic="emerald"
          />

          <SummaryCard
            label="Pending"
            value={entries.filter((e) => e.status === 'pending').length}
            semantic="amber"
          />

          <SummaryCard
            label="Registered"
            value={entries.filter((e) => e.isRegistered).length}
            semantic="blue"
          />
        </div>

        {/* =====================================================
            TABLE PANEL
        ====================================================== */}
        <section className="overflow-hidden rounded-[24px] bg-white shadow-sm ring-1 ring-slate-200/70 print:rounded-none print:shadow-none print:ring-0">
          {/* Panel header */}
          <div className="flex items-center justify-between border-b border-slate-200/70 px-5 py-4 sm:px-6">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#688BB0]">
                Registration Records
              </p>

              <h2 className="mt-1 text-base font-semibold text-[#1A2B48]">
                Student Information
              </h2>
            </div>

            <div className="rounded-xl bg-[#EBF2F2] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#3D6BB4]">
              {entries.length} {entries.length === 1 ? 'Entry' : 'Entries'}
            </div>
          </div>

          {/* Empty state */}
          {entries.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-sm font-medium text-slate-600">
                No entries found.
              </p>

              <p className="mt-1 text-xs text-slate-400">
                There are currently no female students in this list.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px] border-collapse text-sm">
                <thead>
                  <tr className="bg-[#F4F7F7] text-left">
                    <TableHeader>Name</TableHeader>
                    <TableHeader>Reg No</TableHeader>
                    <TableHeader>Contact</TableHeader>
                    <TableHeader>Emergency Contact</TableHeader>
                    <TableHeader>Status</TableHeader>
                    <TableHeader>Registered</TableHeader>
                    <TableHeader>Payment</TableHeader>
                    <TableHeader>Confirmation</TableHeader>
                  </tr>
                </thead>

                <tbody>
                  {entries.map((entry, index) => (
                    <tr
                      key={entry.id}
                      className={`border-t border-slate-200/70 transition-colors ${
                        index % 2 === 0
                          ? 'bg-white'
                          : 'bg-slate-50/40'
                      }`}
                    >
                      {/* Name */}
                      <TableCell>
                        <div>
                          <p className="font-semibold text-[#1A2B48]">
                            {entry.fullName}
                          </p>

                          <p className="mt-0.5 text-[10px] uppercase tracking-[0.08em] text-slate-400">
                            Female Student
                          </p>
                        </div>
                      </TableCell>

                      {/* Reg No */}
                      <TableCell>
                        <span className="text-slate-600">
                          {entry.regNo || '—'}
                        </span>
                      </TableCell>

                      {/* Contact */}
                      <TableCell>
                        <span className="text-slate-600">
                          {entry.contactNumber}
                        </span>
                      </TableCell>

                      {/* Emergency */}
                      <TableCell>
                        <div>
                          <p className="font-medium text-slate-700">
                            {entry.emergencyContactName}
                          </p>

                          <p className="mt-0.5 text-xs text-slate-400">
                            {entry.emergencyContactNumber}
                          </p>
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <StatusBadge value={entry.status} />
                      </TableCell>

                      {/* Registered */}
                      <TableCell>
                        <BooleanBadge value={entry.isRegistered} />
                      </TableCell>

                      {/* Payment */}
                      <TableCell>
                        <StatusBadge value={entry.paymentStatus} />
                      </TableCell>

                      {/* Confirmation */}
                      <TableCell>
                        <StatusBadge value={entry.registrationStatus} />
                      </TableCell>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer */}
          <div className="border-t border-slate-200/70 bg-[#F4F7F7] px-5 py-3 sm:px-6">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                GIKI Adventure Club
              </p>

              <p className="text-[10px] text-slate-400">
                Official Event Record
              </p>
            </div>
          </div>
        </section>

        {/* Bottom label */}
        <div className="mt-5 flex items-center justify-between px-1 print:hidden">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#688BB0]">
            Beyond the ordinary.
          </p>

          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#88B3D8]" />
            <span className="h-1.5 w-1.5 rounded-full bg-[#5F97DF]" />
            <span className="h-1.5 w-1.5 rounded-full bg-[#3D6BB4]" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===============================================================
   SUMMARY CARD
================================================================ */

function SummaryCard({ label, value, semantic }) {
  const semanticStyles = {
    emerald: 'text-emerald-600',
    amber: 'text-amber-600',
    blue: 'text-[#3D6BB4]',
  };

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/70">
      <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-400">
        {label}
      </p>

      <p
        className={`mt-2 text-2xl font-semibold tracking-[-0.04em] ${
          semanticStyles[semantic] || 'text-[#1A2B48]'
        }`}
      >
        {value}
      </p>
    </div>
  );
}

/* ===============================================================
   TABLE COMPONENTS
================================================================ */

function TableHeader({ children }) {
  return (
    <th className="px-4 py-3 text-[9px] font-semibold uppercase tracking-[0.13em] text-[#688BB0]">
      {children}
    </th>
  );
}

function TableCell({ children }) {
  return (
    <td className="px-4 py-4 align-middle text-xs">
      {children}
    </td>
  );
}