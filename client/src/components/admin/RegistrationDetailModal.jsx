import { useState } from "react";
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
    <div className="rounded-xl bg-slate-50 px-4 py-3">
      <div className="mb-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </div>

      <div className="flex items-start justify-between gap-3">
        <span className="break-words text-sm font-medium text-[#1A2B48]">
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
    <section>
      <div className="mb-3">
        <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400">
          {eyebrow}
        </p>

        <h3 className="mt-1 text-sm font-semibold text-[#1A2B48]">
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
      className={`inline-flex rounded-full px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.08em] ring-1 ${
        styles[normalized] ||
        "bg-slate-100 text-slate-600 ring-slate-200"
      }`}
    >
      {status || "Unknown"}
    </span>
  );
}

function formatDate(value) {
  if (!value) return "—";

  try {
    return new Date(value).toLocaleString();
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
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      {/* Screenshot header */}
      <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            Payment Screenshot #{index + 1}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Uploaded {formatDate(screenshot?.createdAt)}
          </p>
        </div>

        <StatusBadge status={verificationStatus} />
      </div>

      {/* Image */}
      {screenshot?.imageUrl && !imageError ? (
        <div className="bg-slate-50 p-3">
          <a
            href={screenshot.imageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group block"
          >
            <img
              src={screenshot.imageUrl}
              alt={`Payment screenshot ${index + 1}`}
              onError={() => setImageError(true)}
              className="max-h-[500px] w-full rounded-xl object-contain transition-opacity group-hover:opacity-90"
            />

            <p className="mt-2 text-center text-[9px] font-medium uppercase tracking-[0.08em] text-[#3D6BB4]">
              Click to open full size
            </p>
          </a>
        </div>
      ) : (
        <div className="flex min-h-[180px] items-center justify-center bg-slate-50 px-5 text-center">
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
      <div className="grid grid-cols-1 gap-3 border-t border-slate-100 p-4 sm:grid-cols-2">
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
          <div className="rounded-xl bg-red-50 px-4 py-3 sm:col-span-2">
            <div className="mb-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-red-500">
              Rejection Reason
            </div>

            <p className="whitespace-pre-wrap text-sm text-red-700">
              {screenshot.rejectionReason}
            </p>
          </div>
        )}

        <div className="rounded-xl bg-slate-50 px-4 py-3 sm:col-span-2">
          <div className="mb-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            Image URL
          </div>

          <a
            href={screenshot?.imageUrl || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="break-all text-xs font-medium text-[#3D6BB4] hover:underline"
          >
            {screenshot?.imageUrl || "—"}
          </a>
        </div>
      </div>
    </div>
  );
}

export default function RegistrationDetailModal({
  registration,
  onClose,
}) {
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-[26px] bg-white shadow-2xl ring-1 ring-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* =====================================================
            HEADER
        ===================================================== */}
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5 md:px-8">
          <div className="flex min-w-0 items-center gap-4">
            {/* Avatar */}
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#EBF2F2] text-base font-semibold text-[#3D6BB4]">
              {registration.fullName
                ?.charAt(0)
                ?.toUpperCase() || "?"}
            </div>

            <div className="min-w-0">
              <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                Registration Details
              </p>

              <h2 className="mt-1 truncate text-xl font-semibold tracking-tight text-[#1A2B48]">
                {registration.fullName || "Unnamed Participant"}
              </h2>

              <div className="mt-2 flex flex-wrap items-center gap-2">
                <StatusBadge status={registration.status} />

                {registration.regNo && (
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-medium text-slate-500">
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
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-lg text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-700"
          >
            ×
          </button>
        </div>

        {/* =====================================================
            SCROLLABLE CONTENT
        ===================================================== */}
        <div className="overflow-y-auto px-6 py-7 md:px-8">
          <div className="space-y-8">

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
                <div className="rounded-xl bg-slate-50 p-4">
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {registration.groupMemberNames.map(
                      (member, index) => (
                        <div
                          key={`${member}-${index}`}
                          className="flex items-center gap-3 rounded-lg bg-white px-3 py-2.5 ring-1 ring-slate-100"
                        >
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#EBF2F2] text-[9px] font-semibold text-[#3D6BB4]">
                            {index + 1}
                          </span>

                          <span className="text-sm font-medium text-[#1A2B48]">
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
                <div className="rounded-xl bg-slate-50 px-4 py-4">
                  <div className="mb-2 text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                    Medical Information
                  </div>

                  <p className="whitespace-pre-wrap text-sm leading-6 text-[#1A2B48]">
                    {registration.medicalInfo ||
                      "No medical information provided."}
                  </p>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                      Safety Waiver
                    </p>

                    <p className="mt-1 text-sm font-medium text-[#1A2B48]">
                      Participant accepted the safety waiver
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.08em] ${
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
                          className="rounded-xl bg-slate-50 px-4 py-3"
                        >
                          <div className="mb-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                            {formatKey(key)}
                          </div>

                          <div className="break-words whitespace-pre-wrap text-sm font-medium text-[#1A2B48]">
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
                <div className="rounded-xl bg-slate-50 px-4 py-3">
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
                    This participant has not uploaded a payment
                    screenshot yet.
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
            <details className="overflow-hidden rounded-2xl border border-slate-200">
              <summary className="cursor-pointer bg-slate-50 px-4 py-3 text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-500 hover:bg-slate-100">
                View Raw Registration Data
              </summary>

              <pre className="max-h-[400px] overflow-auto bg-[#111827] p-4 text-[11px] leading-5 text-slate-200">
                {JSON.stringify(registration, null, 2)}
              </pre>
            </details>
          </div>
        </div>

        {/* =====================================================
            FOOTER
        ===================================================== */}
        <div className="border-t border-slate-100 bg-white px-6 py-4 md:px-8">
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
