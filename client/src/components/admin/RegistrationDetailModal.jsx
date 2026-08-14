import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

function DetailRow({ label, value, copyable = false }) {
  const [copied, setCopied] = useState(false);

  const hasValue =
    value !== undefined &&
    value !== null &&
    value !== "";

  const displayValue = hasValue ? String(value) : "—";

  async function handleCopy() {
    if (!hasValue) return;

    try {
      await navigator.clipboard.writeText(String(value));
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1200);
    } catch {
      // Ignore clipboard errors
    }
  }

  return (
    <div className="min-w-0 rounded-xl bg-slate-50 px-4 py-3 sm:px-4">
      <div className="mb-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </div>

      <div className="flex min-w-0 items-start justify-between gap-3">
        <span className="min-w-0 break-words text-sm font-medium leading-5 text-[#1A2B48]">
          {displayValue}
        </span>

        {copyable && hasValue && (
          <button
            type="button"
            onClick={handleCopy}
            className="shrink-0 text-[9px] font-semibold uppercase tracking-[0.08em] text-[#3D6BB4] hover:underline"
          >
            {copied ? "Copied" : "Copy"}
          </button>
        )}
      </div>
    </div>
  );
}

function Section({ eyebrow, title, children }) {
  return (
    <section className="min-w-0">
      <div className="mb-3">
        <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400">
          {eyebrow}
        </p>

        <h3 className="mt-1 text-sm font-semibold text-[#1A2B48] sm:text-[15px]">
          {title}
        </h3>
      </div>

      {children}
    </section>
  );
}

function StatusBadge({ status }) {
  const normalized = String(status || "").toLowerCase();

  const styles = {
    pending: "bg-amber-50 text-amber-700 ring-amber-100",
    waitlisted: "bg-blue-50 text-blue-700 ring-blue-100",
    approved: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    rejected: "bg-red-50 text-red-700 ring-red-100",
    cancelled: "bg-slate-100 text-slate-600 ring-slate-200",
    verified: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  };

  return (
    <span
      className={`inline-flex max-w-full items-center rounded-full px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.08em] ring-1 ${
        styles[normalized] ||
        "bg-slate-100 text-slate-600 ring-slate-200"
      }`}
    >
      <span className="truncate">{status || "Unknown"}</span>
    </span>
  );
}

function formatDate(value) {
  if (!value) return "—";

  try {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleString();
  } catch {
    return String(value);
  }
}

function formatKey(key) {
  if (!key) return "";

  return String(key)
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatFormValue(value) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (Array.isArray(value)) {
    return value.length ? value.join(", ") : "—";
  }

  if (typeof value === "object") {
    return JSON.stringify(value, null, 2);
  }

  return String(value);
}

function PaymentScreenshotCard({ screenshot, index }) {
  const [imageError, setImageError] = useState(false);

  const verificationStatus =
    screenshot?.verificationStatus || "pending";

  return (
    <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white">
      {/* Screenshot header */}
      <div className="flex flex-col gap-2.5 border-b border-slate-100 px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
        <div className="min-w-0">
          <p className="truncate text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            Payment Screenshot #{index + 1}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Uploaded {formatDate(screenshot?.createdAt)}
          </p>
        </div>

        <div className="shrink-0">
          <StatusBadge status={verificationStatus} />
        </div>
      </div>

      {/* Image */}
      {screenshot?.imageUrl && !imageError ? (
        <div className="bg-slate-50 p-2.5 sm:p-3">
          <a
            href={screenshot.imageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group block"
          >
            <div className="flex max-h-[500px] min-h-[160px] items-center justify-center overflow-hidden rounded-xl bg-white">
              <img
                src={screenshot.imageUrl}
                alt={`Payment screenshot ${index + 1}`}
                onError={() => setImageError(true)}
                className="max-h-[500px] w-full max-w-full object-contain transition-opacity group-hover:opacity-90"
              />
            </div>

            <p className="mt-2 text-center text-[9px] font-medium uppercase tracking-[0.08em] text-[#3D6BB4]">
              Click to open full size
            </p>
          </a>
        </div>
      ) : (
        <div className="flex min-h-[160px] items-center justify-center bg-slate-50 px-5 text-center sm:min-h-[180px]">
          <div>
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-slate-400">
              !
            </div>

            <p className="mt-3 text-xs font-medium text-slate-600">
              Payment image unavailable
            </p>

            <p className="mt-1 text-[10px] text-slate-400">
              The image could not be loaded.
            </p>
          </div>
        </div>
      )}

      {/* Payment details */}
      <div className="grid grid-cols-1 gap-3 border-t border-slate-100 p-3.5 sm:grid-cols-2 sm:p-4">
        <DetailRow
          label="Amount"
          value={
            screenshot?.amount !== null &&
            screenshot?.amount !== undefined
              ? screenshot.amount
              : ""
          }
        />

        <DetailRow
          label="Verification Status"
          value={screenshot?.verificationStatus}
        />

        <DetailRow
          label="Verified By"
          value={screenshot?.verifiedBy}
        />

        <DetailRow
          label="Verified At"
          value={formatDate(screenshot?.verifiedAt)}
        />

        {screenshot?.rejectionReason && (
          <div className="min-w-0 rounded-xl bg-red-50 px-4 py-3 sm:col-span-2">
            <div className="mb-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-red-500">
              Rejection Reason
            </div>

            <p className="break-words whitespace-pre-wrap text-sm leading-5 text-red-700">
              {screenshot.rejectionReason}
            </p>
          </div>
        )}

        <div className="min-w-0 rounded-xl bg-slate-50 px-4 py-3 sm:col-span-2">
          <div className="mb-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            Image URL
          </div>

          {screenshot?.imageUrl ? (
            <a
              href={screenshot.imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block break-all text-xs font-medium leading-5 text-[#3D6BB4] hover:underline"
            >
              {screenshot.imageUrl}
            </a>
          ) : (
            <span className="text-sm font-medium text-[#1A2B48]">
              —
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RegistrationDetailModal({
  registration,
  onClose,
}) {
  useEffect(() => {
    if (!registration) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [registration, onClose]);

  useEffect(() => {
    if (!registration) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [registration]);

  if (!registration) return null;

  const screenshots = Array.isArray(
    registration.paymentScreenshots
  )
    ? registration.paymentScreenshots
    : [];

  const formResponses =
    registration.formResponses &&
    typeof registration.formResponses === "object"
      ? registration.formResponses
      : {};

  const formResponseEntries = Object.entries(formResponses);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-black/60 p-2 backdrop-blur-sm sm:p-4 md:p-6"
      onClick={onClose}
    >
      <div
        className="
          flex h-full max-h-[96vh] w-full
          max-w-4xl
          flex-col overflow-hidden
          rounded-2xl bg-white
          shadow-2xl ring-1 ring-slate-200
          sm:h-auto sm:max-h-[94vh] sm:rounded-[26px]
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* =====================================================
            HEADER
        ===================================================== */}
        <div className="shrink-0 border-b border-slate-100 px-4 py-4 sm:px-6 sm:py-5 md:px-8">
          <div className="flex min-w-0 items-start justify-between gap-3">
            <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
              {/* Avatar */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EBF2F2] text-sm font-semibold text-[#3D6BB4] sm:h-12 sm:w-12 sm:text-base">
                {registration.fullName
                  ?.charAt(0)
                  ?.toUpperCase() || "?"}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[8px] font-semibold uppercase tracking-[0.15em] text-slate-400 sm:text-[9px]">
                  Registration Details
                </p>

                <h2 className="mt-1 truncate text-base font-semibold tracking-tight text-[#1A2B48] sm:text-xl">
                  {registration.fullName ||
                    "Unnamed Participant"}
                </h2>

                <div className="mt-1.5 flex min-w-0 flex-wrap items-center gap-1.5 sm:mt-2 sm:gap-2">
                  <StatusBadge status={registration.status} />

                  {registration.regNo && (
                    <span className="max-w-[180px] truncate rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-medium text-slate-500 sm:max-w-[240px]">
                      {registration.regNo}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-lg leading-none text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-700 sm:h-9 sm:w-9"
            >
              ×
            </button>
          </div>
        </div>

        {/* =====================================================
            SCROLLABLE CONTENT
        ===================================================== */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6 sm:py-7 md:px-8">
          <div className="min-w-0 space-y-7 sm:space-y-8">
            {/* =================================================
                BASIC INFORMATION
            ================================================= */}
            <Section
              eyebrow="Participant"
              title="Basic Information"
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <DetailRow
                  label="Full Name"
                  value={registration.fullName}
                />

                <DetailRow
                  label="Gender"
                  value={
                    registration.gender
                      ? registration.gender
                          .charAt(0)
                          .toUpperCase() +
                        registration.gender.slice(1)
                      : ""
                  }
                />

                <DetailRow
                  label="Registration Number"
                  value={registration.regNo}
                  copyable
                />

                <DetailRow
                  label="WhatsApp Number"
                  value={registration.whatsappNumber}
                  copyable
                />

                <DetailRow
                  label="Group Name"
                  value={registration.groupName}
                />

                <DetailRow
                  label="Group Member Count"
                  value={registration.groupMemberCount}
                />
              </div>
            </Section>

            {/* =================================================
                GROUP MEMBERS
            ================================================= */}
            {registration.groupMemberNames?.length > 0 && (
              <Section
                eyebrow="Group"
                title="Group Members"
              >
                <div className="rounded-xl bg-slate-50 p-3 sm:p-4">
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {registration.groupMemberNames.map(
                      (member, index) => (
                        <div
                          key={`${member}-${index}`}
                          className="flex min-w-0 items-center gap-3 rounded-lg bg-white px-3 py-2.5 ring-1 ring-slate-100"
                        >
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#EBF2F2] text-[9px] font-semibold text-[#3D6BB4]">
                            {index + 1}
                          </span>

                          <span className="min-w-0 break-words text-sm font-medium text-[#1A2B48]">
                            {member}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </Section>
            )}

            {/* =================================================
                EMERGENCY
            ================================================= */}
            <Section
              eyebrow="Emergency"
              title="Emergency Contact"
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <DetailRow
                  label="Emergency Contact Name"
                  value={registration.emergencyContactName}
                />

                <DetailRow
                  label="Emergency Contact Number"
                  value={registration.emergencyContactNumber}
                  copyable
                />
              </div>
            </Section>

            {/* =================================================
                MEDICAL / WAIVER
            ================================================= */}
            <Section
              eyebrow="Safety"
              title="Medical & Waiver Information"
            >
              <div className="space-y-3">
                <div className="min-w-0 rounded-xl bg-slate-50 px-4 py-4">
                  <div className="mb-2 text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                    Medical Information
                  </div>

                  <p className="break-words whitespace-pre-wrap text-sm leading-6 text-[#1A2B48]">
                    {registration.medicalInfo ||
                      "No medical information provided."}
                  </p>
                </div>

                <div className="flex flex-col gap-3 rounded-xl bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                      Safety Waiver
                    </p>

                    <p className="mt-1 text-sm font-medium text-[#1A2B48]">
                      Participant accepted the safety
                      waiver
                    </p>
                  </div>

                  <span
                    className={`w-fit shrink-0 rounded-full px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.08em] ${
                      registration.waiverAccepted
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {registration.waiverAccepted
                      ? "Accepted"
                      : "Not Accepted"}
                  </span>
                </div>
              </div>
            </Section>

            {/* =================================================
                CUSTOM FORM RESPONSES
            ================================================= */}
            {formResponseEntries.length > 0 && (
              <Section
                eyebrow="Registration Form"
                title="Additional Information"
              >
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {formResponseEntries.map(
                    ([key, value]) => {
                      const formattedValue =
                        formatFormValue(value);

                      return (
                        <div
                          key={key}
                          className="min-w-0 rounded-xl bg-slate-50 px-4 py-3"
                        >
                          <div className="mb-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                            {formatKey(key)}
                          </div>

                          <div className="break-words whitespace-pre-wrap text-sm font-medium leading-5 text-[#1A2B48]">
                            {formattedValue}
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </Section>
            )}

            {/* =================================================
                REGISTRATION STATUS / TICKET
            ================================================= */}
            <Section
              eyebrow="Event"
              title="Registration & Ticket Information"
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="min-w-0 rounded-xl bg-slate-50 px-4 py-3">
                  <div className="mb-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                    Registration Status
                  </div>

                  <StatusBadge status={registration.status} />
                </div>

                <DetailRow
                  label="Waitlist Position"
                  value={registration.waitlistPosition}
                />

                <DetailRow
                  label="Ticket Code"
                  value={registration.ticketCode}
                  copyable
                />

                <DetailRow
                  label="Checked In At"
                  value={formatDate(
                    registration.checkedInAt
                  )}
                />

                <DetailRow
                  label="Added Manually"
                  value={
                    registration.addedManually
                      ? "Yes"
                      : "No"
                  }
                />

                <DetailRow
                  label="Added By User ID"
                  value={registration.addedBy}
                />
              </div>
            </Section>

            {/* =================================================
                PAYMENT SCREENSHOTS
            ================================================= */}
            <Section
              eyebrow="Payment"
              title={`Payment Screenshots${
                screenshots.length
                  ? ` (${screenshots.length})`
                  : ""
              }`}
            >
              {screenshots.length === 0 ? (
                <div className="rounded-2xl bg-amber-50 px-5 py-6 text-center ring-1 ring-amber-100">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-sm font-semibold text-amber-600">
                    !
                  </div>

                  <p className="mt-3 text-sm font-medium text-amber-700">
                    No payment screenshot uploaded
                  </p>

                  <p className="mt-1 text-[10px] text-amber-600/80">
                    This participant has not uploaded a
                    payment screenshot yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {screenshots.map(
                    (screenshot, index) => (
                      <PaymentScreenshotCard
                        key={
                          screenshot.id ||
                          `${screenshot.createdAt}-${index}`
                        }
                        screenshot={screenshot}
                        index={index}
                      />
                    )
                  )}
                </div>
              )}
            </Section>

            {/* =================================================
                DATABASE / METADATA
            ================================================= */}
            <Section
              eyebrow="System"
              title="Registration Metadata"
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <DetailRow
                  label="Registration ID"
                  value={registration.id}
                  copyable
                />

                <DetailRow
                  label="Event ID"
                  value={registration.eventId}
                />

                <DetailRow
                  label="User ID"
                  value={registration.userId}
                />

                <DetailRow
                  label="Added By"
                  value={registration.addedBy}
                />

                <DetailRow
                  label="Created At"
                  value={formatDate(
                    registration.createdAt
                  )}
                />

                <DetailRow
                  label="Updated At"
                  value={formatDate(
                    registration.updatedAt
                  )}
                />
              </div>
            </Section>

            {/* =================================================
                RAW DATA
            ================================================= */}
            <details className="min-w-0 overflow-hidden rounded-2xl border border-slate-200">
              <summary className="cursor-pointer bg-slate-50 px-4 py-3 text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-500 hover:bg-slate-100">
                View Raw Registration Data
              </summary>

              <pre className="max-h-[400px] max-w-full overflow-auto bg-[#111827] p-3 text-[10px] leading-5 text-slate-200 sm:p-4 sm:text-[11px]">
                {JSON.stringify(registration, null, 2)}
              </pre>
            </details>
          </div>
        </div>

        {/* =====================================================
            FOOTER
        ===================================================== */}
        <div className="shrink-0 border-t border-slate-100 bg-white px-4 py-3.5 sm:px-6 sm:py-4 md:px-8">
          <Button
            variant="outline"
            className="h-10 w-full rounded-xl border-0 bg-[#F4F7F7] text-xs font-medium text-[#1A2B48] shadow-none ring-1 ring-slate-200 hover:bg-[#EBF2F2]"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}