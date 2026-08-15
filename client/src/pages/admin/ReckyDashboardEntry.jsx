import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "@/lib/axios";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import AdminLayout from "@/components/admin/AdminLayout";
import EventPicker from "./EventPicker";

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("en-PK");
}

function StatCard({ label, value, description, dark = false, danger = false }) {
  return (
    <div
      className={`rounded-[22px] border p-5 shadow-sm ${
        dark
          ? "border-[#1A2B48] bg-[#1A2B48] text-white"
          : "border-white/70 bg-white/80"
      }`}
    >
      <p
        className={`text-[10px] font-semibold uppercase tracking-[0.16em] sm:text-xs ${
          dark ? "text-[#88B3D8]" : "text-[#688BB0]"
        }`}
      >
        {label}
      </p>

      <p
        className={`mt-2 text-2xl font-semibold tracking-tight sm:text-3xl ${
          dark
            ? "text-white"
            : danger
              ? "text-[#A34F4F]"
              : "text-[#1A2B48]"
        }`}
      >
        Rs. {formatCurrency(value)}
      </p>

      {description && (
        <p
          className={`mt-1 text-xs ${
            dark ? "text-[#B9CDE0]" : "text-[#688BB0]"
          }`}
        >
          {description}
        </p>
      )}
    </div>
  );
}

export default function ReckyDashboardEntry() {
  const [eventId, setEventId] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchBudget = useCallback(async () => {
    if (!eventId) {
      setSummary(null);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data } = await api.get(`/budget/events/${eventId}/summary`);

      setSummary(data.summary);
    } catch (err) {
      setSummary(null);
      setError(
        err.response?.data?.message ||
          "Unable to load the Recky budget for this event.",
      );
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchBudget();
  }, [fetchBudget]);

  const plannedBudget = Number(summary?.reckyPlannedBudget || 0);
  const spentBudget = Number(summary?.reckyTotal || 0);
  const remainingBudget = plannedBudget - spentBudget;

  const budgetPercentage =
    plannedBudget > 0
      ? Math.min((spentBudget / plannedBudget) * 100, 100)
      : 0;

  return (
    <AdminLayout>
      <div className="min-h-screen bg-[#EBF2F2]">
        <div
          className="
            mx-auto w-full max-w-7xl
            px-4 pb-10 pt-20
            sm:px-6 sm:pt-20
            md:px-8 md:pt-10
            lg:px-10
            xl:px-12
          "
        >
          {/* HEADER */}
          <div className="mb-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#5F97DF]" />

                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#688BB0]">
                    GAC / Recky Planning
                  </p>
                </div>

                <h1 className="text-3xl font-semibold tracking-tight text-[#1A2B48] sm:text-4xl md:text-5xl">
                  Plan before the adventure begins.
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-[#688BB0] sm:text-base">
                  Review the allocated Recky budget and open the planning
                  workspace for your selected event.
                </p>
              </div>

              <div className="w-full lg:w-[320px]">
                <EventPicker
                  selectedEventId={eventId}
                  onSelect={(id) => {
                    setEventId(id);
                    setSummary(null);
                    setError("");
                  }}
                />
              </div>
            </div>
          </div>

          {/* NO EVENT */}
          {!eventId ? (
            <div className="rounded-[30px] bg-[#1A2B48] px-6 py-14 text-center text-white shadow-xl sm:px-10 sm:py-20">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#88B3D8]/15">
                <span className="text-2xl">⌁</span>
              </div>

              <h2 className="text-2xl font-semibold sm:text-3xl">
                Select an adventure
              </h2>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#B9CDE0]">
                Choose an event above to view its Recky budget and open the
                planning workspace.
              </p>
            </div>
          ) : (
            <>
              {/* ERROR */}
              {error && (
                <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-700 shadow-sm">
                  <div className="flex gap-3">
                    <span>!</span>
                    <p>{error}</p>
                  </div>
                </div>
              )}

              {/* BUDGET HERO */}
              <div className="mb-8 overflow-hidden rounded-[30px] bg-[#1A2B48] shadow-xl">
                <div className="p-6 sm:p-8 lg:p-10">
                  <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <div className="mb-3 flex items-center gap-2">
                        <span className="rounded-full bg-[#88B3D8]/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#B9CDE0]">
                          Recky Budget
                        </span>
                      </div>

                      <h2 className="text-2xl font-semibold text-white sm:text-3xl">
                        Your allocated planning budget
                      </h2>

                      <p className="mt-2 max-w-xl text-sm leading-6 text-[#B9CDE0]">
                        This amount is assigned by the Finance team for Recky
                        activities for the selected event.
                      </p>
                    </div>

                    <div className="lg:text-right">
                      <p className="text-xs font-medium uppercase tracking-wider text-[#88B3D8]">
                        Allocated
                      </p>

                      <p className="mt-1 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                        Rs. {formatCurrency(plannedBudget)}
                      </p>
                    </div>
                  </div>

                  {/* PROGRESS */}
                  <div className="mt-8">
                    <div className="mb-2 flex items-center justify-between text-xs">
                      <span className="text-[#B9CDE0]">Budget utilized</span>

                      <span className="font-semibold text-white">
                        {budgetPercentage.toFixed(0)}%
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-[#88B3D8] transition-all duration-500"
                        style={{ width: `${budgetPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* BUDGET STATS */}
              <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <StatCard
                  label="Allocated Budget"
                  value={plannedBudget}
                  description="Set by Finance"
                />

                <StatCard
                  label="Recky Spent"
                  value={spentBudget}
                  description="Recorded expenses"
                />

                <StatCard
                  label="Remaining"
                  value={remainingBudget}
                  description={
                    remainingBudget < 0
                      ? "Budget exceeded"
                      : "Available for planning"
                  }
                  dark={remainingBudget >= 0}
                  danger={remainingBudget < 0}
                />
              </div>

              {/* LOADING */}
              {loading ? (
                <div className="rounded-[28px] border border-white/70 bg-white/70 px-6 py-14 text-center shadow-sm">
                  <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-[#D8E4EC] border-t-[#3D6BB4]" />

                  <p className="text-sm font-medium text-[#1A2B48]">
                    Loading Recky budget...
                  </p>
                </div>
              ) : (
                <>
                  {/* MAIN ACTION */}
                  <Card className="overflow-hidden rounded-[28px] border-0 bg-white shadow-sm">
                    <CardHeader className="border-b border-[#E9EFF2] px-5 py-6 sm:px-7">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#EBF2F2] text-xl text-[#3D6BB4]">
                          ⛰
                        </div>

                        <div>
                          <CardTitle className="text-xl text-[#1A2B48]">
                            Recky Planner
                          </CardTitle>

                          <CardDescription className="mt-1 max-w-xl text-[#688BB0]">
                            Plan routes, locations, requirements, and other
                            details for the selected adventure.
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="px-5 py-6 sm:px-7">
                      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm font-semibold text-[#1A2B48]">
                            Ready to start planning?
                          </p>

                          <p className="mt-1 text-xs leading-5 text-[#688BB0]">
                            Keep your planning within the allocated{" "}
                            <span className="font-semibold text-[#3D6BB4]">
                              Rs. {formatCurrency(plannedBudget)}
                            </span>{" "}
                            Recky budget.
                          </p>
                        </div>

                        <Link
                          to={`/admin/events/${eventId}/recky`}
                          className="w-full sm:w-auto"
                        >
                          <Button
                            className="
                              h-11 w-full rounded-xl
                              bg-[#1A2B48]
                              px-6
                              font-semibold text-white
                              hover:bg-[#294263]
                              sm:w-auto
                            "
                          >
                            Open Recky Planner ↗
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>

                  {/* BUDGET WARNING */}
                  {plannedBudget === 0 && (
                    <div className="mt-6 rounded-[24px] border border-[#E8D49D] bg-[#FFF9E9] px-5 py-4 shadow-sm">
                      <div className="flex gap-3">
                        <span className="mt-0.5">⚠</span>

                        <div>
                          <p className="text-sm font-semibold text-[#775A21]">
                            No Recky budget assigned
                          </p>

                          <p className="mt-1 text-xs leading-5 text-[#967A3E]">
                            Finance has not assigned a Recky budget for this
                            event yet. You can still open the planner, but
                            budget planning should be coordinated with Finance.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {remainingBudget < 0 && (
                    <div className="mt-6 rounded-[24px] border border-red-200 bg-red-50 px-5 py-4 shadow-sm">
                      <div className="flex gap-3">
                        <span className="mt-0.5">!</span>

                        <div>
                          <p className="text-sm font-semibold text-red-700">
                            Recky budget exceeded
                          </p>

                          <p className="mt-1 text-xs leading-5 text-red-600">
                            Recky expenses have exceeded the allocated budget by{" "}
                            <span className="font-semibold">
                              Rs. {formatCurrency(Math.abs(remainingBudget))}
                            </span>
                            .
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* FOOTER */}
              <div className="mt-10 flex flex-col gap-3 border-t border-[#D6E1E6] pt-6 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-[#688BB0]">
                  GIKI Adventure Club · Recky Operations
                </p>

                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#88B3D8]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-[#5F97DF]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-[#3D6BB4]" />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}