import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import AdminLayout from '@/components/admin/AdminLayout';
import EventPicker from './EventPicker';

const STATUS_STYLES = {
  pending: {
    label: 'Pending',
    className: 'bg-amber-50 text-amber-700 ring-amber-200/70',
    dot: 'bg-amber-500',
  },
  verified: {
    label: 'Verified',
    className: 'bg-emerald-50 text-emerald-700 ring-emerald-200/70',
    dot: 'bg-emerald-500',
  },
  rejected: {
    label: 'Rejected',
    className: 'bg-red-50 text-red-700 ring-red-200/70',
    dot: 'bg-red-500',
  },
  approved: {
    label: 'Approved',
    className: 'bg-emerald-50 text-emerald-700 ring-emerald-200/70',
    dot: 'bg-emerald-500',
  },
  waitlisted: {
    label: 'Waitlisted',
    className: 'bg-blue-50 text-blue-700 ring-blue-200/70',
    dot: 'bg-blue-500',
  },
};

const emptyForm = {
  fullName: '',
  regNo: '',
  contactNumber: '',
  emergencyContactName: '',
  emergencyContactNumber: '',
};

/* ===============================================================
   STATUS BADGE
================================================================ */

function StatusBadge({ label, value }) {
  if (!value) {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-[#F4F7F7] px-3 py-2 text-xs text-slate-400 ring-1 ring-slate-200/70">
        <span className="font-medium text-slate-500">{label}</span>
        <span>—</span>
      </div>
    );
  }

  const status = STATUS_STYLES[value] || {
    label: value,
    className: 'bg-slate-50 text-slate-600 ring-slate-200/70',
    dot: 'bg-slate-400',
  };

  return (
    <div
      className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium capitalize ring-1 ${status.className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
      <span className="text-slate-500">{label}</span>
      <span>{status.label}</span>
    </div>
  );
}

/* ===============================================================
   MAIN
================================================================ */

export default function FemaleListManager() {
  const user = useAuthStore((state) => state.user);

  const canEdit = ['general_secretary', 'super_admin'].includes(
    user?.role
  );

  const canSetStatus = user?.role === 'super_admin';

  const [eventId, setEventId] = useState(null);
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (eventId) fetchEntries();
  }, [eventId]);

  async function fetchEntries() {
    setError('');

    try {
      const { data } = await api.get(`/female-list/events/${eventId}`);
      setEntries(data.entries);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to load list.'
      );
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    try {
      if (editingId) {
        await api.patch(`/female-list/${editingId}`, form);
      } else {
        await api.post(`/female-list/events/${eventId}`, form);
      }

      setForm(emptyForm);
      setEditingId(null);
      fetchEntries();
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to save entry.'
      );
    }
  }

  function handleEdit(entry) {
    setForm({
      fullName: entry.fullName,
      regNo: entry.regNo || '',
      contactNumber: entry.contactNumber,
      emergencyContactName: entry.emergencyContactName,
      emergencyContactNumber: entry.emergencyContactNumber,
    });

    setEditingId(entry.id);

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  async function handleDelete(id) {
    if (!window.confirm('Remove this entry from the list?')) return;

    try {
      await api.delete(`/female-list/${id}`);
      fetchEntries();
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to delete.'
      );
    }
  }

  async function handleStatusChange(id, status) {
    setError('');

    try {
      await api.patch(`/female-list/${id}/status`, { status });
      fetchEntries();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to update status.'
      );
    }
  }

  function downloadCsv() {
    const headers = [
      'Name',
      'Reg No',
      'Contact',
      'Emergency Contact Name',
      'Emergency Contact Number',
      'Status',
      'Registered',
      'Payment Status',
      'Confirmation Status',
    ];

    const rows = entries.map((e) => [
      e.fullName,
      e.regNo || '',
      e.contactNumber,
      e.emergencyContactName,
      e.emergencyContactNumber,
      e.status,
      e.isRegistered ? 'Yes' : 'No',
      e.paymentStatus || '',
      e.registrationStatus || '',
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map(
            (cell) =>
              `"${String(cell).replace(/"/g, '""')}"`
          )
          .join(',')
      )
      .join('\n');

    const blob = new Blob([csv], {
      type: 'text/csv',
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `female-students-event-${eventId}.csv`;
    a.click();

    URL.revokeObjectURL(url);
  }

  function openPrintView() {
    window.open(
      `/admin/female-list/print/${eventId}`,
      '_blank'
    );
  }

  return (
    <AdminLayout>
      <main className="min-h-screen bg-[#EBF2F2]">
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-12 lg:py-12">

          {/* =====================================================
              PAGE HEADER
          ====================================================== */}

          <section className="relative mb-8 overflow-hidden rounded-[24px] bg-[#1A2B48] shadow-sm">
            {/* Decorative circles */}
            <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full border border-[#88B3D8]/10" />
            <div className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full border border-[#88B3D8]/10" />

            {/* Decorative mountain */}
            <div className="pointer-events-none absolute bottom-0 right-0 h-[45%] w-[55%] bg-[#3D6BB4]/25 [clip-path:polygon(0_100%,20%_45%,36%_70%,54%_20%,70%_60%,85%_35%,100%_65%,100%_100%)]" />

            <div className="relative flex flex-col gap-6 p-7 sm:p-9 lg:flex-row lg:items-end lg:justify-between lg:p-10">
              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#88B3D8]">
                  Management
                </p>

                <h1 className="text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
                  Female Students
                </h1>

                <p className="mt-3 max-w-xl text-sm leading-6 text-white/50">
                  Manage female student entries and monitor
                  registration, payment and confirmation status.
                </p>
              </div>

              <div className="relative z-10">
                <p className="text-right text-[10px] font-semibold uppercase tracking-[0.2em] text-white/30">
                  GAC
                </p>

                <p className="mt-2 text-right text-sm text-white/50">
                  Beyond the ordinary.
                </p>
              </div>
            </div>
          </section>

          {/* =====================================================
              EVENT SELECTOR + ACTIONS
          ====================================================== */}

          <section className="mb-6 rounded-[24px] bg-white p-5 shadow-sm ring-1 ring-slate-200/70 sm:p-6">
            <div className="mb-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#688BB0]">
                Event
              </p>

              <h2 className="mt-1 text-xl font-semibold tracking-[-0.03em] text-[#1A2B48]">
                Select Adventure
              </h2>
            </div>

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <EventPicker
                selectedEventId={eventId}
                onSelect={setEventId}
              />

              {eventId && (
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadCsv}
                    className="rounded-xl border-slate-200/70 bg-white text-[#1A2B48] shadow-sm hover:bg-[#F4F7F7]"
                  >
                    Download CSV
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={openPrintView}
                    className="rounded-xl border-slate-200/70 bg-white text-[#1A2B48] shadow-sm hover:bg-[#F4F7F7]"
                  >
                    Download PDF
                  </Button>
                </div>
              )}
            </div>
          </section>

          {/* =====================================================
              ERROR
          ====================================================== */}

          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl bg-red-50 p-4 text-sm text-red-700 ring-1 ring-red-200/70">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-[11px] font-bold">
                !
              </span>

              <div>
                <p className="font-semibold">Something went wrong</p>
                <p className="mt-0.5 text-red-600/80">
                  {error}
                </p>
              </div>
            </div>
          )}

          {/* =====================================================
              NO EVENT
          ====================================================== */}

          {!eventId ? (
            <section className="rounded-[24px] bg-white px-6 py-16 text-center shadow-sm ring-1 ring-slate-200/70">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EBF2F2] text-[#3D6BB4]">
                <span className="text-xl">↗</span>
              </div>

              <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#688BB0]">
                No event selected
              </p>

              <h2 className="mt-2 text-xl font-semibold text-[#1A2B48]">
                Select an event to continue
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Choose an adventure from the selector above
                to view its female student list.
              </p>
            </section>
          ) : (
            <>
              {/* =================================================
                  ADD / EDIT FORM
              ================================================== */}

              {canEdit && (
                <section className="mb-8 rounded-[24px] bg-white p-6 shadow-sm ring-1 ring-slate-200/70 sm:p-8">
                  <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#688BB0]">
                        Student Entry
                      </p>

                      <h2 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-[#1A2B48]">
                        {editingId
                          ? 'Edit Entry'
                          : 'Add Female Student'}
                      </h2>
                    </div>

                    {editingId && (
                      <span className="w-fit rounded-xl bg-amber-50 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-amber-700 ring-1 ring-amber-200/70">
                        Editing
                      </span>
                    )}
                  </div>

                  <form
                    onSubmit={handleSubmit}
                    className="grid grid-cols-1 gap-5 md:grid-cols-2"
                  >
                    <FormField label="Full Name" required>
                      <Input
                        placeholder="Enter full name"
                        value={form.fullName}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            fullName: e.target.value,
                          }))
                        }
                        required
                        className="h-12 rounded-xl border-slate-200/70 bg-[#F4F7F7] shadow-none focus:bg-white focus:ring-4 focus:ring-[#3D6BB4]/10"
                      />
                    </FormField>

                    <FormField label="Registration Number">
                      <Input
                        placeholder="Optional · used to match registration"
                        value={form.regNo}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            regNo: e.target.value,
                          }))
                        }
                        className="h-12 rounded-xl border-slate-200/70 bg-[#F4F7F7] shadow-none focus:bg-white focus:ring-4 focus:ring-[#3D6BB4]/10"
                      />
                    </FormField>

                    <FormField label="Contact Number" required>
                      <Input
                        placeholder="Enter contact number"
                        value={form.contactNumber}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            contactNumber: e.target.value,
                          }))
                        }
                        required
                        className="h-12 rounded-xl border-slate-200/70 bg-[#F4F7F7] shadow-none focus:bg-white focus:ring-4 focus:ring-[#3D6BB4]/10"
                      />
                    </FormField>

                    <div />

                    <FormField
                      label="Emergency Contact Name"
                      required
                    >
                      <Input
                        placeholder="Enter emergency contact name"
                        value={form.emergencyContactName}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            emergencyContactName:
                              e.target.value,
                          }))
                        }
                        required
                        className="h-12 rounded-xl border-slate-200/70 bg-[#F4F7F7] shadow-none focus:bg-white focus:ring-4 focus:ring-[#3D6BB4]/10"
                      />
                    </FormField>

                    <FormField
                      label="Emergency Contact Number"
                      required
                    >
                      <Input
                        placeholder="Enter emergency contact number"
                        value={form.emergencyContactNumber}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            emergencyContactNumber:
                              e.target.value,
                          }))
                        }
                        required
                        className="h-12 rounded-xl border-slate-200/70 bg-[#F4F7F7] shadow-none focus:bg-white focus:ring-4 focus:ring-[#3D6BB4]/10"
                      />
                    </FormField>

                    <div className="flex flex-wrap gap-2 md:col-span-2">
                      <Button
                        type="submit"
                        className="rounded-xl bg-[#1A2B48] px-6 text-white shadow-sm hover:bg-[#3D6BB4]"
                      >
                        {editingId ? 'Update Entry' : 'Add Student'}
                      </Button>

                      {editingId && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setEditingId(null);
                            setForm(emptyForm);
                          }}
                          className="rounded-xl border-slate-200/70 bg-white text-slate-600 hover:bg-[#F4F7F7]"
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </form>
                </section>
              )}

              {/* =================================================
                  LIST HEADER
              ================================================== */}

              <div className="mb-4 flex items-end justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#688BB0]">
                    Student Directory
                  </p>

                  <h2 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-[#1A2B48]">
                    {entries.length} Student
                    {entries.length !== 1 ? 's' : ''}
                  </h2>
                </div>

                {entries.length > 0 && (
                  <span className="hidden rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-500 ring-1 ring-slate-200/70 sm:block">
                    {canSetStatus
                      ? 'Status management enabled'
                      : 'Read only'}
                  </span>
                )}
              </div>

              {/* =================================================
                  ENTRIES
              ================================================== */}

              <div className="flex flex-col gap-4">
                {entries.length === 0 ? (
                  <section className="rounded-[24px] bg-white px-6 py-16 text-center shadow-sm ring-1 ring-slate-200/70">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EBF2F2] text-[#3D6BB4]">
                      <span className="text-xl">+</span>
                    </div>

                    <h3 className="mt-5 text-lg font-semibold text-[#1A2B48]">
                      No entries yet
                    </h3>

                    <p className="mt-2 text-sm text-slate-500">
                      {canEdit
                        ? 'Add the first female student using the form above.'
                        : 'There are currently no students in this list.'}
                    </p>
                  </section>
                ) : (
                  entries.map((entry, index) => {
                    const status =
                      STATUS_STYLES[entry.status] ||
                      STATUS_STYLES.pending;

                    return (
                      <Card
                        key={entry.id}
                        className="group overflow-hidden rounded-2xl border-0 bg-white shadow-sm ring-1 ring-slate-200/70 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                      >
                        <CardContent className="p-5 sm:p-6">
                          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

                            {/* Student information */}
                            <div className="flex min-w-0 gap-4">
                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EBF2F2] text-sm font-semibold text-[#1A2B48]">
                                {entry.fullName
                                  ?.charAt(0)
                                  ?.toUpperCase()}
                              </div>

                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h3 className="text-base font-semibold text-[#1A2B48]">
                                    {entry.fullName}
                                  </h3>

                                  <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-300">
                                    #{String(index + 1).padStart(2, '0')}
                                  </span>
                                </div>

                                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                                  <span>
                                    {entry.regNo ||
                                      'No registration number'}
                                  </span>

                                  <span>
                                    {entry.contactNumber}
                                  </span>
                                </div>

                                <div className="mt-3 rounded-xl bg-[#F4F7F7] px-3 py-2.5">
                                  <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                                    Emergency Contact
                                  </p>

                                  <p className="mt-1 text-xs text-slate-600">
                                    {entry.emergencyContactName}
                                    <span className="mx-2 text-slate-300">
                                      ·
                                    </span>
                                    {entry.emergencyContactNumber}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Main status */}
                            <div className="shrink-0">
                              {canSetStatus ? (
                                <select
                                  className="h-10 rounded-xl border-0 bg-[#F4F7F7] px-3 text-xs font-semibold capitalize text-[#1A2B48] shadow-none ring-1 ring-slate-200/70 outline-none transition focus:ring-4 focus:ring-[#3D6BB4]/10"
                                  value={entry.status}
                                  onChange={(e) =>
                                    handleStatusChange(
                                      entry.id,
                                      e.target.value
                                    )
                                  }
                                >
                                  <option value="pending">
                                    Pending
                                  </option>
                                  <option value="verified">
                                    Verified
                                  </option>
                                  <option value="rejected">
                                    Rejected
                                  </option>
                                </select>
                              ) : (
                                <div
                                  className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold capitalize ring-1 ${status.className}`}
                                >
                                  <span
                                    className={`h-1.5 w-1.5 rounded-full ${status.dot}`}
                                  />
                                  {status.label}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Metadata */}
                          <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-5">
                            <StatusBadge
                              label="Registered"
                              value={
                                entry.isRegistered
                                  ? 'Yes'
                                  : 'No'
                              }
                            />

                            <StatusBadge
                              label="Payment"
                              value={entry.paymentStatus}
                            />

                            <StatusBadge
                              label="Confirmation"
                              value={entry.registrationStatus}
                            />
                          </div>

                          {/* Actions */}
                          {canEdit && (
                            <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleEdit(entry)
                                }
                                className="rounded-xl border-slate-200/70 bg-white text-[#1A2B48] hover:bg-[#F4F7F7]"
                              >
                                Edit Entry
                              </Button>

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleDelete(entry.id)
                                }
                                className="rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600"
                              >
                                Delete
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </>
          )}

          {/* =====================================================
              FOOTER
          ====================================================== */}

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

/* ===============================================================
   FORM FIELD
================================================================ */

function FormField({ label, required = false, children }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
        {required && (
          <span className="ml-1 text-red-500">*</span>
        )}
      </label>

      {children}
    </div>
  );
}