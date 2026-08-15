import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Card, CardContent } from "@/components/ui/card";
import EventPicker from "./EventPicker";
import AdminLayout from "@/components/admin/AdminLayout";

const STATUS_LABELS = {
  draft: "Draft",
  coming_soon: "Coming Soon",
  confirmed: "Confirmed",
  passed: "Passed",
  cancelled: "Cancelled",
};

const STATUS_STYLES = {
  draft: "bg-slate-100 text-slate-600",
  coming_soon: "bg-blue-50 text-blue-700",
  confirmed: "bg-emerald-50 text-emerald-700",
  passed: "bg-slate-100 text-slate-600",
  cancelled: "bg-red-50 text-red-700",
};

const STAT_STYLES = {
  default: {
    value: "text-[#1A2B48]",
    icon: "bg-[#EBF2F2] text-[#3D6BB4]",
  },
  success: {
    value: "text-emerald-700",
    icon: "bg-emerald-50 text-emerald-600",
  },
  warning: {
    value: "text-amber-700",
    icon: "bg-amber-50 text-amber-600",
  },
};

function formatLabel(key) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/^./, (str) => str.toUpperCase());
}

function getRegistrationStyle(key) {
  const normalized = key.toLowerCase();

  if (
    normalized.includes("approved") ||
    normalized.includes("confirmed") ||
    normalized.includes("checked")
  ) {
    return STAT_STYLES.success;
  }

  if (normalized.includes("pending") || normalized.includes("waitlist")) {
    return STAT_STYLES.warning;
  }

  return STAT_STYLES.default;
}

function getLogisticsStatusStyle(status) {
  switch (status) {
    case "returned":
      return "bg-emerald-50 text-emerald-700";

    case "in_use":
      return "bg-blue-50 text-blue-700";

    case "packed":
      return "bg-amber-50 text-amber-700";

    case "lost":
    case "damaged":
      return "bg-red-50 text-red-700";

    default:
      return "bg-slate-100 text-slate-600";
  }
}

export default function OrgOverview() {
  const [eventId, setEventId] = useState(null);
  const [event, setEvent] = useState(null);
  const [regSummary, setRegSummary] = useState(null);
  const [budgetSummary, setBudgetSummary] = useState(null);
  const [logisticsItems, setLogisticsItems] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (eventId) fetchAll();
  }, [eventId]);

  async function fetchAll() {
    setError("");

    try {
      const [eventsRes, regRes, budgetRes, logisticsRes] = await Promise.all([
        api.get("/events/admin/all"),
        api.get(`/registrations/events/${eventId}/analytics`),
        api.get(`/budget/events/${eventId}/summary`),
        api.get(`/logistics/events/${eventId}`),
      ]);

      const matchedEvent = eventsRes.data.events.find((e) => e.id === eventId);

      setEvent(matchedEvent || null);
      setRegSummary(regRes.data.summary);
      setBudgetSummary(budgetRes.data.summary);
      setLogisticsItems(logisticsRes.data.items);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load overview.");
    }
  }

  return (
    <AdminLayout>
      <div className="min-h-screen px-5 py-8 md:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          {/* -------------------------------------------------
              HEADER
          ------------------------------------------------- */}
          <div className="mb-8">
            <div className="mb-5 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#3D6BB4]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#3D6BB4]" />
              Organization Overview
            </div>

            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <h1 className="text-3xl font-semibold tracking-[-0.04em] text-[#1A2B48] md:text-4xl">
                  Organization Overview
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  Read-only visibility across events, registrations, budget, and
                  logistics.
                </p>
              </div>

              <div className="w-full md:w-auto">
                <EventPicker selectedEventId={eventId} onSelect={setEventId} />
              </div>
            </div>
          </div>

          {/* -------------------------------------------------
              ERROR
          ------------------------------------------------- */}
          {error && (
            <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-semibold text-red-600">
                !
              </div>

              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* -------------------------------------------------
              EMPTY STATE
          ------------------------------------------------- */}
          {!eventId ? (
            <div className="rounded-[24px] bg-white px-6 py-16 text-center shadow-sm ring-1 ring-slate-200/70 md:px-10">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EBF2F2] text-[#3D6BB4]">
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>

              <h2 className="mt-4 text-base font-semibold text-[#1A2B48]">
                Select an event
              </h2>

              <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-400">
                Choose an event from the selector above to view its
                organization-wide overview.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {/* -------------------------------------------------
                  EVENT INFORMATION
              ------------------------------------------------- */}
              {event && (
                <section className="overflow-hidden rounded-[24px] bg-white shadow-sm ring-1 ring-slate-200/70">
                  <div className="flex flex-col justify-between gap-5 px-5 py-5 md:flex-row md:items-center md:px-7">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#EBF2F2] text-sm font-semibold text-[#3D6BB4]">
                        {event.title?.charAt(0)?.toUpperCase()}
                      </div>

                      <div>
                        <div className="mb-1 text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                          Selected Event
                        </div>

                        <h2 className="text-lg font-semibold tracking-tight text-[#1A2B48]">
                          {event.title}
                        </h2>

                        <div className="mt-1 flex flex-wrap gap-x-2 gap-y-1 text-xs text-slate-400">
                          <span>{event.location}</span>
                          <span>·</span>
                          <span>Capacity: {event.capacity}</span>
                          <span>·</span>
                          <span>Rs. {event.ticketPrice}</span>
                        </div>
                      </div>
                    </div>

                    <span
                      className={`inline-flex w-fit rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] ${
                        STATUS_STYLES[event.status] ||
                        "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {STATUS_LABELS[event.status]}
                    </span>
                  </div>
                </section>
              )}

              {/* -------------------------------------------------
                  REGISTRATIONS
              ------------------------------------------------- */}
              {regSummary && (
                <section>
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <div className="text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                        Event Activity
                      </div>

                      <h3 className="mt-1 text-base font-semibold text-[#1A2B48]">
                        Registrations
                      </h3>
                    </div>

                    <span className="rounded-full bg-[#EBF2F2] px-3 py-1.5 text-[10px] font-medium text-slate-500">
                      {Object.values(regSummary).reduce(
                        (total, value) =>
                          typeof value === "number" ? total + value : total,
                        0,
                      )}{" "}
                      records
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                    {Object.entries(regSummary).map(([key, value]) => {
                      const style = getRegistrationStyle(key);

                      return (
                        <>
                          <Card
                            key={key}
                            className="rounded-2xl border-0 bg-white shadow-sm ring-1 ring-slate-200/70"
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p
                                    className={`text-2xl font-semibold tracking-tight ${style.value}`}
                                  >
                                    {value}
                                  </p>

                                  <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                                    {formatLabel(key)}
                                  </p>
                                </div>

                                <div
                                  className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] ${style.icon}`}
                                >
                                  •
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="p-3 text-center">
                              <p className="text-xl font-semibold">
                                Rs. {summary.onEventTotal}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                On-Event
                              </p>
                            </CardContent>
                          </Card>
                        </>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* -------------------------------------------------
                  BUDGET
              ------------------------------------------------- */}
              {budgetSummary && (
                <section>
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <div className="text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                        Financial Overview
                      </div>

                      <h3 className="mt-1 text-base font-semibold text-[#1A2B48]">
                        Event Budget
                      </h3>
                    </div>

                    <span className="rounded-full bg-[#EBF2F2] px-3 py-1.5 text-[10px] font-medium text-slate-500">
                      Read Only
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    <Card className="rounded-2xl border-0 bg-white shadow-sm ring-1 ring-slate-200/70">
                      <CardContent className="p-5">
                        <div className="mb-4 flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-[#3D6BB4]">
                          01
                        </div>

                        <p className="text-xl font-semibold tracking-tight text-[#1A2B48]">
                          Rs. {budgetSummary.preEventTotal}
                        </p>

                        <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                          Pre-Event
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="rounded-2xl border-0 bg-white shadow-sm ring-1 ring-slate-200/70">
                      <CardContent className="p-5">
                        <div className="mb-4 flex h-8 w-8 items-center justify-center rounded-full bg-amber-50 text-xs font-semibold text-amber-600">
                          02
                        </div>

                        <p className="text-xl font-semibold tracking-tight text-[#1A2B48]">
                          Rs. {budgetSummary.postEventTotal}
                        </p>

                        <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                          Post-Event
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="rounded-2xl border-0 bg-white shadow-sm ring-1 ring-slate-200/70">
                      <CardContent className="p-5">
                        <div className="mb-4 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-500">
                          03
                        </div>

                        <p className="text-xl font-semibold tracking-tight text-[#1A2B48]">
                          Rs. {budgetSummary.reckyTotal}
                        </p>

                        <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                          Recky
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="rounded-2xl border-0 bg-white shadow-sm ring-1 ring-slate-200/70">
                      <CardContent className="p-5">
                        <div className="mb-4 flex h-8 w-8 items-center justify-center rounded-full bg-[#1A2B48] text-[9px] font-semibold text-white">
                          04
                        </div>

                        <p className="text-xl font-semibold tracking-tight text-[#1A2B48]">
                          Rs. {budgetSummary.grandTotal}
                        </p>

                        <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                          Grand Total
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </section>
              )}

              {/* -------------------------------------------------
                  LOGISTICS
              ------------------------------------------------- */}
              <section>
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <div className="text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                      Operations
                    </div>

                    <h3 className="mt-1 text-base font-semibold text-[#1A2B48]">
                      Logistics Checklist
                    </h3>
                  </div>

                  <span className="rounded-full bg-[#EBF2F2] px-3 py-1.5 text-[10px] font-medium text-slate-500">
                    {logisticsItems.length} items
                  </span>
                </div>

                {logisticsItems.length === 0 ? (
                  <div className="rounded-[24px] bg-white px-6 py-12 text-center shadow-sm ring-1 ring-slate-200/70">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#EBF2F2] text-[#3D6BB4]">
                      —
                    </div>

                    <p className="mt-3 text-sm font-medium text-[#1A2B48]">
                      No inventory items
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      No logistics items have been logged for this event yet.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-[24px] bg-white shadow-sm ring-1 ring-slate-200/70">
                    {/* Table Header */}
                    <div className="hidden border-b border-slate-100 bg-slate-50/50 px-5 py-3 md:grid md:grid-cols-[1fr_160px_120px] md:px-7">
                      <span className="text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                        Inventory Item
                      </span>

                      <span className="text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                        Phase
                      </span>

                      <span className="text-right text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                        Status
                      </span>
                    </div>

                    <div>
                      {logisticsItems.map((item) => (
                        <div
                          key={item.id}
                          className="border-b border-slate-100 px-5 py-4 last:border-0 hover:bg-[#F7FAFA] md:px-7"
                        >
                          <div className="grid gap-3 md:grid-cols-[1fr_160px_120px] md:items-center">
                            <div>
                              <p className="text-sm font-medium text-[#1A2B48]">
                                {item.itemName}
                                <span className="ml-2 text-xs font-normal text-slate-400">
                                  × {item.quantity}
                                </span>
                              </p>
                            </div>

                            <div>
                              <span className="text-[10px] font-medium uppercase tracking-[0.08em] text-slate-400">
                                {item.phase.replace("_", "-")}
                              </span>
                            </div>

                            <div className="md:text-right">
                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.08em] ${getLogisticsStatusStyle(
                                  item.status,
                                )}`}
                              >
                                {item.status.replace("_", " ")}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>

              {/* -------------------------------------------------
                  FOOTER NOTE
              ------------------------------------------------- */}
              <div className="flex flex-col gap-1 px-2 pb-4 text-[9px] text-slate-400 sm:flex-row sm:items-center sm:justify-between">
                <span>
                  Organization data is provided for read-only visibility.
                </span>

                <span>GIKI Adventure Club · Admin Portal</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
