import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import AdminLayout from "@/components/admin/AdminLayout";
import RegistrationDetailModal from "@/components/admin/RegistrationDetailModal";

const STATUS_STYLES = {
  pending: "bg-amber-50 text-amber-700",
  waitlisted: "bg-blue-50 text-blue-700",
  approved: "bg-emerald-50 text-emerald-700",
  rejected: "bg-red-50 text-red-700",
  cancelled: "bg-slate-100 text-slate-600",
};

const emptyManualForm = {
  fullName: "",
  gender: "",
  regNo: "",
  groupName: "",
  whatsappNumber: "",
  emergencyContactName: "",
  emergencyContactNumber: "",
  medicalInfo: "",
};

function CopyButton({ value }) {
  const [copied, setCopied] = useState(false);

  if (!value) return null;

  async function handleCopy(e) {
    e.stopPropagation();

    try {
      await navigator.clipboard.writeText(String(value));
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // Ignore clipboard errors
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="shrink-0 rounded-lg px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.08em] text-slate-400 transition-colors hover:bg-[#EBF2F2] hover:text-[#3D6BB4]"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function GenderList({
  title,
  registrations,
  onOpen,
  onApprove,
  onRejectPayment,
  onRejectReg,
}) {
  return (
    <div className="min-w-0 flex-1">
      {/* Section Header */}
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400">
            Registrations
          </div>

          <h3 className="mt-1 truncate text-base font-semibold text-[#1A2B48]">
            {title}
          </h3>
        </div>

        <span className="shrink-0 rounded-full bg-[#EBF2F2] px-2.5 py-1.5 text-[10px] font-medium text-slate-500 sm:px-3">
          {registrations.length}{" "}
          {registrations.length === 1 ? "person" : "people"}
        </span>
      </div>

      {/* Registration Container */}
      <div className="overflow-hidden rounded-[20px] bg-white shadow-sm ring-1 ring-slate-200/70 sm:rounded-[24px]">
        {registrations.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#EBF2F2] text-sm text-[#3D6BB4]">
              —
            </div>

            <p className="mt-3 text-xs font-medium text-[#1A2B48]">
              No registrations yet
            </p>

            <p className="mt-1 text-[10px] text-slate-400">
              No participants in this category.
            </p>
          </div>
        ) : (
          <div>
            {registrations.map((reg) => (
              <div
                key={reg.id}
                className="cursor-pointer border-b border-slate-100 px-3.5 py-4 transition-colors last:border-0 hover:bg-[#F7FAFA] sm:px-5"
                onClick={() => onOpen(reg)}
              >
                {/* Name + Status */}
                <div className="flex min-w-0 items-start justify-between gap-2.5 sm:gap-3">
                  <div className="flex min-w-0 flex-1 items-center gap-2.5 sm:gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EBF2F2] text-xs font-semibold text-[#3D6BB4]">
                      {reg.fullName?.charAt(0)?.toUpperCase() || "?"}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[#1A2B48]">
                        {reg.fullName || "Unnamed Participant"}
                      </p>

                      <div className="mt-1 flex min-w-0 flex-wrap items-center gap-1 text-[10px] text-slate-400">
                        <span className="max-w-[130px] truncate sm:max-w-none">
                          {reg.regNo || "No Reg. No."}
                        </span>

                        {reg.regNo && (
                          <CopyButton value={reg.regNo} />
                        )}

                        <span className="text-slate-300">·</span>

                        <span className="max-w-[120px] truncate sm:max-w-none">
                          {reg.whatsappNumber || "No number"}
                        </span>

                        <CopyButton value={reg.whatsappNumber} />
                      </div>
                    </div>
                  </div>

                  <span
                    className={`max-w-[90px] shrink-0 truncate rounded-full px-2 py-1 text-center text-[8px] font-semibold uppercase tracking-[0.08em] sm:max-w-none sm:px-2.5 sm:text-[9px] ${
                      STATUS_STYLES[reg.status] ||
                      "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {reg.status}
                  </span>
                </div>

                {/* Pending Actions */}
                {reg.status === "pending" && (
                  <div
                    className="mt-3 flex flex-wrap gap-2 sm:mt-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      size="sm"
                      onClick={() => onApprove(reg.id)}
                      className="h-8 rounded-xl bg-[#1A2B48] px-3 text-[10px] font-medium text-white shadow-none hover:bg-[#253b5d]"
                    >
                      Approve
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onRejectPayment(reg.id)}
                      className="h-8 rounded-xl border-0 bg-amber-50 px-3 text-[10px] font-medium text-amber-700 shadow-none ring-1 ring-amber-100 hover:bg-amber-100"
                    >
                      Reject Payment
                    </Button>

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onRejectReg(reg.id)}
                      className="h-8 rounded-xl border-0 bg-red-50 px-3 text-[10px] font-medium text-red-700 shadow-none ring-1 ring-red-100 hover:bg-red-100"
                    >
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function TicketingDashboard() {
  const { eventId } = useParams();

  const [registrations, setRegistrations] = useState([]);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualForm, setManualForm] = useState(emptyManualForm);
  const [selectedReg, setSelectedReg] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAll();
  }, [eventId]);

  async function fetchAll() {
    setError("");
    setLoading(true);

    try {
      const [regsRes, summaryRes] = await Promise.all([
        api.get(`/registrations/events/${eventId}`, {
          params: { status: "all" },
        }),
        api.get(`/registrations/events/${eventId}/analytics`),
      ]);

      setRegistrations(regsRes.data.registrations || []);
      setSummary(summaryRes.data.summary || null);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load registrations."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(regId) {
    setError("");

    try {
      await api.patch(`/registrations/${regId}/approve`);
      await fetchAll();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to approve."
      );
    }
  }

  async function handleRejectPayment(regId) {
    const reason = window.prompt(
      "Reason for rejecting this payment screenshot:"
    );

    if (!reason?.trim()) return;

    setError("");

    try {
      await api.patch(
        `/registrations/${regId}/reject-payment`,
        { reason: reason.trim() }
      );

      await fetchAll();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to reject payment."
      );
    }
  }

  async function handleRejectRegistration(regId) {
    const reason = window.prompt(
      "Reason for rejecting this registration entirely:"
    );

    if (!reason?.trim()) return;

    setError("");

    try {
      await api.patch(
        `/registrations/${regId}/reject`,
        { reason: reason.trim() }
      );

      await fetchAll();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to reject."
      );
    }
  }

  async function handleManualAdd(e) {
    e.preventDefault();
    setError("");

    try {
      await api.post(
        `/registrations/events/${eventId}/manual`,
        manualForm
      );

      setManualForm({ ...emptyManualForm });
      setShowManualForm(false);
      await fetchAll();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to add manually."
      );
    }
  }

  const boys = registrations.filter(
    (r) => r.gender === "male"
  );

  const girls = registrations.filter(
    (r) => r.gender === "female"
  );

  const unspecified = registrations.filter(
    (r) => !r.gender
  );

  return (
    <AdminLayout>
      <div className="min-h-screen w-full overflow-x-hidden px-4 py-6 sm:px-5 sm:py-7 md:px-7 md:py-8 lg:px-10 xl:px-12">
        <div className="mx-auto w-full max-w-7xl min-w-0">
          {/* =====================================================
              HEADER
          ===================================================== */}
          <div className="mb-7 sm:mb-8">
            <Link
              to="/admin/events"
              className="mb-4 inline-flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400 transition-colors hover:text-[#3D6BB4] sm:mb-5 sm:text-[10px]"
            >
              ← Back to Events
            </Link>

            <div className="mb-4 flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#3D6BB4] sm:mb-5 sm:text-[10px]">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#3D6BB4]" />
              Event Administration
            </div>

            <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
              <div className="min-w-0">
                <h1 className="text-2xl font-semibold tracking-[-0.04em] text-[#1A2B48] sm:text-3xl md:text-4xl">
                  Ticketing & Registrations
                </h1>

                <p className="mt-2 max-w-2xl text-xs leading-5 text-slate-500 sm:text-sm sm:leading-6">
                  Review participants, manage registration approvals,
                  and handle event ticketing.
                </p>
              </div>

              <Button
                variant="outline"
                onClick={() =>
                  setShowManualForm((p) => !p)
                }
                className="h-10 w-full shrink-0 rounded-xl border-0 bg-white px-4 text-xs font-medium text-[#1A2B48] shadow-sm ring-1 ring-slate-200/70 hover:bg-[#F7FAFA] sm:w-auto"
              >
                {showManualForm
                  ? "Cancel"
                  : "+ Manually Add Person"}
              </Button>
            </div>
          </div>

          {/* =====================================================
              ERROR
          ===================================================== */}
          {error && (
            <div className="mb-6 flex min-w-0 items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-3.5 py-3 sm:px-4">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-semibold text-red-600">
                !
              </div>

              <p className="min-w-0 break-words text-xs leading-5 text-red-700 sm:text-sm">
                {error}
              </p>
            </div>
          )}

          {/* =====================================================
              SUMMARY
          ===================================================== */}
          {summary && (
            <section className="mb-7 sm:mb-8">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                    Event Activity
                  </div>

                  <h2 className="mt-1 text-base font-semibold text-[#1A2B48]">
                    Registration Overview
                  </h2>
                </div>

                <span className="shrink-0 rounded-full bg-[#EBF2F2] px-2.5 py-1.5 text-[10px] font-medium text-slate-500 sm:px-3">
                  {registrations.length} total
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-6">
                {Object.entries(summary).map(
                  ([key, value]) => {
                    const normalized =
                      key.toLowerCase();

                    const isSuccess =
                      normalized.includes("approved");

                    const isWarning =
                      normalized.includes("pending") ||
                      normalized.includes("waitlist");

                    return (
                      <Card
                        key={key}
                        className="min-w-0 rounded-2xl border-0 bg-white shadow-sm ring-1 ring-slate-200/70"
                      >
                        <CardContent className="p-3 sm:p-4">
                          <div
                            className={`mb-3 flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-semibold sm:mb-4 ${
                              isSuccess
                                ? "bg-emerald-50 text-emerald-600"
                                : isWarning
                                ? "bg-amber-50 text-amber-600"
                                : "bg-[#EBF2F2] text-[#3D6BB4]"
                            }`}
                          >
                            •
                          </div>

                          <p className="truncate text-xl font-semibold tracking-tight text-[#1A2B48] sm:text-2xl">
                            {value}
                          </p>

                          <p className="mt-1 break-words text-[8px] font-semibold uppercase leading-4 tracking-[0.1em] text-slate-400 sm:text-[9px] sm:tracking-[0.12em]">
                            {key.replace(/_/g, " ")}
                          </p>
                        </CardContent>
                      </Card>
                    );
                  }
                )}
              </div>
            </section>
          )}

          {/* =====================================================
              MANUAL REGISTRATION FORM
          ===================================================== */}
          {showManualForm && (
            <section className="mb-7 overflow-hidden rounded-[20px] bg-white shadow-sm ring-1 ring-slate-200/70 sm:mb-8 sm:rounded-[24px]">
              <div className="border-b border-slate-100 px-4 py-4 sm:px-5 sm:py-5 md:px-7">
                <div className="text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                  Registration
                </div>

                <h2 className="mt-1 text-base font-semibold text-[#1A2B48]">
                  Manually Add Registration
                </h2>

                <p className="mt-1 text-xs leading-5 text-slate-400">
                  Add and approve a participant directly to this event.
                </p>
              </div>

              <div className="px-4 py-5 sm:px-5 sm:py-6 md:px-7">
                <form
                  onSubmit={handleManualAdd}
                  className="grid grid-cols-1 gap-4 md:grid-cols-2"
                >
                  <div className="min-w-0">
                    <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                      Full Name
                    </label>

                    <Input
                      placeholder="Enter full name"
                      value={manualForm.fullName}
                      onChange={(e) =>
                        setManualForm((p) => ({
                          ...p,
                          fullName: e.target.value,
                        }))
                      }
                      required
                      className="h-11 w-full rounded-xl border-0 bg-[#F4F7F7] text-sm text-[#1A2B48] shadow-none ring-1 ring-slate-200 placeholder:text-slate-400 focus:bg-white focus:ring-[#3D6BB4]"
                    />
                  </div>

                  <div className="min-w-0">
                    <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                      Gender
                    </label>

                    <select
                      className="h-11 w-full min-w-0 rounded-xl border-0 bg-[#F4F7F7] px-3 text-sm text-[#1A2B48] outline-none ring-1 ring-slate-200 focus:bg-white focus:ring-[#3D6BB4]"
                      value={manualForm.gender}
                      onChange={(e) =>
                        setManualForm((p) => ({
                          ...p,
                          gender: e.target.value,
                        }))
                      }
                      required
                    >
                      <option value="">Gender...</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>

                  <div className="min-w-0">
                    <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                      Registration Number
                    </label>

                    <Input
                      placeholder="Optional"
                      value={manualForm.regNo}
                      onChange={(e) =>
                        setManualForm((p) => ({
                          ...p,
                          regNo: e.target.value,
                        }))
                      }
                      className="h-11 w-full rounded-xl border-0 bg-[#F4F7F7] text-sm text-[#1A2B48] shadow-none ring-1 ring-slate-200 placeholder:text-slate-400 focus:bg-white focus:ring-[#3D6BB4]"
                    />
                  </div>

                  <div className="min-w-0">
                    <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                      WhatsApp Number
                    </label>

                    <Input
                      placeholder="03XX XXXXXXX"
                      value={manualForm.whatsappNumber}
                      onChange={(e) =>
                        setManualForm((p) => ({
                          ...p,
                          whatsappNumber: e.target.value,
                        }))
                      }
                      required
                      className="h-11 w-full rounded-xl border-0 bg-[#F4F7F7] text-sm text-[#1A2B48] shadow-none ring-1 ring-slate-200 placeholder:text-slate-400 focus:bg-white focus:ring-[#3D6BB4]"
                    />
                  </div>

                  <div className="min-w-0">
                    <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                      Group Name
                    </label>

                    <Input
                      placeholder="Optional"
                      value={manualForm.groupName}
                      onChange={(e) =>
                        setManualForm((p) => ({
                          ...p,
                          groupName: e.target.value,
                        }))
                      }
                      className="h-11 w-full rounded-xl border-0 bg-[#F4F7F7] text-sm text-[#1A2B48] shadow-none ring-1 ring-slate-200 placeholder:text-slate-400 focus:bg-white focus:ring-[#3D6BB4]"
                    />
                  </div>

                  <div className="min-w-0">
                    <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                      Emergency Contact Name
                    </label>

                    <Input
                      placeholder="Contact name"
                      value={manualForm.emergencyContactName}
                      onChange={(e) =>
                        setManualForm((p) => ({
                          ...p,
                          emergencyContactName:
                            e.target.value,
                        }))
                      }
                      required
                      className="h-11 w-full rounded-xl border-0 bg-[#F4F7F7] text-sm text-[#1A2B48] shadow-none ring-1 ring-slate-200 placeholder:text-slate-400 focus:bg-white focus:ring-[#3D6BB4]"
                    />
                  </div>

                  <div className="min-w-0">
                    <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                      Emergency Contact Number
                    </label>

                    <Input
                      placeholder="Contact number"
                      value={manualForm.emergencyContactNumber}
                      onChange={(e) =>
                        setManualForm((p) => ({
                          ...p,
                          emergencyContactNumber:
                            e.target.value,
                        }))
                      }
                      required
                      className="h-11 w-full rounded-xl border-0 bg-[#F4F7F7] text-sm text-[#1A2B48] shadow-none ring-1 ring-slate-200 placeholder:text-slate-400 focus:bg-white focus:ring-[#3D6BB4]"
                    />
                  </div>

                  <div className="min-w-0 md:col-span-2">
                    <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                      Medical Information
                    </label>

                    <Input
                      placeholder="Optional"
                      value={manualForm.medicalInfo}
                      onChange={(e) =>
                        setManualForm((p) => ({
                          ...p,
                          medicalInfo: e.target.value,
                        }))
                      }
                      className="h-11 w-full rounded-xl border-0 bg-[#F4F7F7] text-sm text-[#1A2B48] shadow-none ring-1 ring-slate-200 placeholder:text-slate-400 focus:bg-white focus:ring-[#3D6BB4]"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Button
                      type="submit"
                      disabled={loading}
                      className="h-10 w-full rounded-xl bg-[#1A2B48] px-5 text-xs font-medium text-white shadow-none hover:bg-[#253b5d] sm:w-auto"
                    >
                      Add & Approve
                    </Button>
                  </div>
                </form>
              </div>
            </section>
          )}

          {/* =====================================================
              REGISTRATION LISTS
          ===================================================== */}
          <div className="flex min-w-0 flex-col gap-7 lg:flex-row lg:gap-6 xl:gap-8">
            <GenderList
              title="Boys"
              registrations={boys}
              onOpen={setSelectedReg}
              onApprove={handleApprove}
              onRejectPayment={handleRejectPayment}
              onRejectReg={handleRejectRegistration}
            />

            <GenderList
              title="Girls"
              registrations={girls}
              onOpen={setSelectedReg}
              onApprove={handleApprove}
              onRejectPayment={handleRejectPayment}
              onRejectReg={handleRejectRegistration}
            />
          </div>

          {/* =====================================================
              UNSPECIFIED
          ===================================================== */}
          {unspecified.length > 0 && (
            <div className="mt-7 sm:mt-8">
              <GenderList
                title="Unspecified (legacy test data)"
                registrations={unspecified}
                onOpen={setSelectedReg}
                onApprove={handleApprove}
                onRejectPayment={handleRejectPayment}
                onRejectReg={handleRejectRegistration}
              />
            </div>
          )}

          {/* =====================================================
              FOOTER
          ===================================================== */}
          <div className="flex flex-col gap-1 px-1 py-6 text-[9px] leading-4 text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-2">
            <span>
              Registration changes take effect immediately.
            </span>

            <span>
              GIKI Adventure Club · Admin Portal
            </span>
          </div>
        </div>
      </div>

      <RegistrationDetailModal
        registration={selectedReg}
        onClose={() => setSelectedReg(null)}
      />
    </AdminLayout>
  );
}