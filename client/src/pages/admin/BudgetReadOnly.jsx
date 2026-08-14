import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Card, CardContent } from "@/components/ui/card";
import EventPicker from "./EventPicker";
import AdminLayout from "@/components/admin/AdminLayout";

export default function BudgetReadOnly() {
  const [eventId, setEventId] = useState(null);
  const [summary, setSummary] = useState(null);
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (eventId) fetchAll();
  }, [eventId]);

  async function fetchAll() {
    setError("");
    try {
      const [summaryRes, itemsRes] = await Promise.all([
        api.get(`/budget/events/${eventId}/summary`),
        api.get(`/budget/events/${eventId}`),
      ]);
      setSummary(summaryRes.data.summary);
      setItems(itemsRes.data.items);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load budget.");
    }
  }

  return (
    <AdminLayout>
      <div className="min-h-screen px-5 py-8 md:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">

          {/* Header */}
          <div className="mb-8">
            <div className="mb-4 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#3D6BB4]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#3D6BB4]" />
              Financial Overview
            </div>

            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <h1 className="text-3xl font-semibold tracking-[-0.04em] text-[#1A2B48] md:text-4xl">
                  Budget Overview
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  Review event expenses, budget allocation, and financial
                  activity across each phase of the event.
                </p>
              </div>

              <div className="flex items-center gap-2 rounded-full bg-[#EBF2F2] px-3 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#3D6BB4]" />
                <span className="text-[10px] font-medium text-slate-500">
                  READ-ONLY ACCESS
                </span>
              </div>
            </div>
          </div>

          {/* Event Selector */}
          <div className="mb-6 rounded-[24px] bg-white p-5 shadow-sm ring-1 ring-slate-200/70 md:p-6">
            <div className="mb-3">
              <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                Event Selection
              </p>

              <p className="mt-1 text-sm font-medium text-[#1A2B48]">
                Select an event to view financial activity
              </p>
            </div>

            <EventPicker
              selectedEventId={eventId}
              onSelect={setEventId}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 flex items-center gap-3 rounded-[24px] border border-red-100 bg-red-50 px-4 py-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-100">
                <span className="text-xs font-semibold text-red-700">!</span>
              </div>

              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Empty State */}
          {!eventId ? (
            <div className="rounded-[24px] bg-white px-6 py-14 text-center shadow-sm ring-1 ring-slate-200/70">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#EBF2F2]">
                <svg
                  className="h-5 w-5 text-[#3D6BB4]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v12m6-9H9.5a2.5 2.5 0 0 0 0 5H14a2.5 2.5 0 0 1 0 5H6"
                  />
                </svg>
              </div>

              <p className="text-sm font-semibold text-[#1A2B48]">
                No event selected
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Select an event above to view its budget and expenses.
              </p>
            </div>
          ) : (
            <>
              {/* Financial Summary */}
              {summary && (
                <div className="mb-8">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                        Financial Summary
                      </p>

                      <p className="mt-1 text-sm font-semibold text-[#1A2B48]">
                        Event budget breakdown
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">

                    {/* Pre Event */}
                    <Card className="rounded-[24px] border-0 bg-white shadow-sm ring-1 ring-slate-200/70">
                      <CardContent className="p-5">
                        <div className="mb-4 flex items-center justify-between">
                          <span className="text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                            Pre-Event
                          </span>

                          <span className="h-2 w-2 rounded-full bg-[#3D6BB4]" />
                        </div>

                        <p className="text-2xl font-semibold tracking-tight text-[#1A2B48]">
                          Rs. {summary.preEventTotal}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          Planned expenses
                        </p>
                      </CardContent>
                    </Card>

                    {/* Post Event */}
                    <Card className="rounded-[24px] border-0 bg-white shadow-sm ring-1 ring-slate-200/70">
                      <CardContent className="p-5">
                        <div className="mb-4 flex items-center justify-between">
                          <span className="text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                            Post-Event
                          </span>

                          <span className="h-2 w-2 rounded-full bg-amber-400" />
                        </div>

                        <p className="text-2xl font-semibold tracking-tight text-[#1A2B48]">
                          Rs. {summary.postEventTotal}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          Post-event expenses
                        </p>
                      </CardContent>
                    </Card>

                    {/* Recky */}
                    <Card className="rounded-[24px] border-0 bg-white shadow-sm ring-1 ring-slate-200/70">
                      <CardContent className="p-5">
                        <div className="mb-4 flex items-center justify-between">
                          <span className="text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                            Recky
                          </span>

                          <span className="h-2 w-2 rounded-full bg-slate-400" />
                        </div>

                        <p className="text-2xl font-semibold tracking-tight text-[#1A2B48]">
                          Rs. {summary.reckyTotal}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          Reconnaissance costs
                        </p>
                      </CardContent>
                    </Card>

                    {/* Grand Total */}
                    <Card className="rounded-[24px] border-0 bg-[#1A2B48] shadow-sm">
                      <CardContent className="p-5">
                        <div className="mb-4 flex items-center justify-between">
                          <span className="text-[9px] font-semibold uppercase tracking-[0.15em] text-white/60">
                            Grand Total
                          </span>

                          <span className="h-2 w-2 rounded-full bg-emerald-400" />
                        </div>

                        <p className="text-2xl font-semibold tracking-tight text-white">
                          Rs. {summary.grandTotal}
                        </p>

                        <p className="mt-1 text-xs text-white/50">
                          Total recorded budget
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* Expense List */}
              <div className="overflow-hidden rounded-[24px] bg-white shadow-sm ring-1 ring-slate-200/70">

                {/* Section Header */}
                <div className="flex flex-col justify-between gap-3 border-b border-slate-100 px-5 py-5 md:flex-row md:items-center md:px-7">
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                      Budget Activity
                    </p>

                    <h2 className="mt-1 text-base font-semibold text-[#1A2B48]">
                      Expense Entries
                    </h2>

                    <p className="mt-1 text-xs text-slate-400">
                      All recorded expenses for the selected event.
                    </p>
                  </div>

                  <div className="w-fit rounded-full bg-[#EBF2F2] px-3 py-1.5">
                    <span className="text-[10px] font-medium text-slate-500">
                      {items.length} {items.length === 1 ? "ENTRY" : "ENTRIES"}
                    </span>
                  </div>
                </div>

                {/* Table Header */}
                {items.length > 0 && (
                  <div className="hidden grid-cols-[1fr_180px_150px] gap-4 border-b border-slate-100 bg-slate-50/50 px-5 py-3 md:grid md:px-7">
                    <span className="text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                      Description
                    </span>

                    <span className="text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                      Category / Phase
                    </span>

                    <span className="text-right text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                      Amount
                    </span>
                  </div>
                )}

                {/* Empty Entries */}
                {items.length === 0 ? (
                  <div className="px-6 py-14 text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#EBF2F2]">
                      <svg
                        className="h-5 w-5 text-[#3D6BB4]"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 6v12m6-9H9.5a2.5 2.5 0 0 0 0 5H14a2.5 2.5 0 0 1 0 5H6"
                        />
                      </svg>
                    </div>

                    <p className="text-sm font-semibold text-[#1A2B48]">
                      No budget entries
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      There are no recorded expenses for this event yet.
                    </p>
                  </div>
                ) : (
                  <div>
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="grid grid-cols-1 gap-3 border-b border-slate-100 px-5 py-4 transition-colors last:border-0 hover:bg-[#F7FAFA] md:grid-cols-[1fr_180px_150px] md:items-center md:gap-4 md:px-7"
                      >
                        {/* Description */}
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[#1A2B48]">
                            {item.description}
                          </p>

                          <p className="mt-1 text-[10px] text-slate-400 md:hidden">
                            {item.category} ·{" "}
                            {item.phase.replace("_", "-")}
                          </p>
                        </div>

                        {/* Category / Phase */}
                        <div className="hidden md:block">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-[#EBF2F2] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                              {item.category}
                            </span>

                            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.08em] text-amber-700">
                              {item.phase.replace("_", "-")}
                            </span>
                          </div>
                        </div>

                        {/* Amount */}
                        <div className="flex items-center justify-between md:justify-end">
                          <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400 md:hidden">
                            Amount
                          </span>

                          <span className="text-sm font-semibold text-[#1A2B48]">
                            Rs. {item.amount}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer Note */}
              <div className="mt-5 px-2">
                <p className="text-[9px] text-slate-400">
                  Budget information is displayed in read-only mode. All
                  financial entries are maintained by authorized finance
                  personnel.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}