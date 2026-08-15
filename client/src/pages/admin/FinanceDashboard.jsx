import { useEffect, useState, useCallback } from "react";
import api from "@/lib/axios";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

import AdminLayout from "@/components/admin/AdminLayout";
import SyncStatusBadge from "@/components/SyncStatusBadge";
import { useOnlineSync } from "@/hooks/useOnlineSync";
import { addToQueue, getQueueForEvent } from "@/lib/offlineQueue";
import EventPicker from "./EventPicker";

const CATEGORIES = [
  "logistics",
  "operations",
  "transport",
  "food",
  "water",
  "misc",
];

const PHASES = [
  { value: "pre_event", label: "Pre-Event" },
  { value: "on_event", label: "On-Event" },
  { value: "post_event", label: "Post-Event" },
];

const emptyForm = {
  phase: "pre_event",
  category: "logistics",
  description: "",
  amount: "",
};

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("en-PK");
}

function BudgetCard({
  title,
  description,
  budget,
  spent,
  remaining,
  accent = "blue",
}) {
  const percentage =
    Number(budget) > 0
      ? Math.min((Number(spent || 0) / Number(budget)) * 100, 100)
      : 0;

  const exceeded = Number(remaining) < 0;

  const styles =
    accent === "dark"
      ? {
          wrapper: "border-[#1A2B48] bg-[#1A2B48]",
          eyebrow: "text-[#88B3D8]",
          title: "text-white",
          description: "text-[#B9CDE0]",
          main: "text-white",
          secondary: "text-[#B9CDE0]",
          track: "bg-white/10",
          progress: "bg-[#88B3D8]",
        }
      : {
          wrapper: "border-white/70 bg-white",
          eyebrow: "text-[#688BB0]",
          title: "text-[#1A2B48]",
          description: "text-[#688BB0]",
          main: "text-[#1A2B48]",
          secondary: "text-[#688BB0]",
          track: "bg-[#EBF2F2]",
          progress: "bg-[#3D6BB4]",
        };

  return (
    <Card
      className={`overflow-hidden rounded-[28px] shadow-sm ${styles.wrapper}`}
    >
      <CardHeader className="px-5 pb-3 pt-5 sm:px-6 sm:pt-6">
        <p
          className={`text-[10px] font-semibold uppercase tracking-[0.16em] ${styles.eyebrow}`}
        >
          {title}
        </p>

        <CardTitle className={`mt-2 text-2xl ${styles.title}`}>
          Rs. {formatCurrency(budget)}
        </CardTitle>

        <CardDescription className={styles.description}>
          {description}
        </CardDescription>
      </CardHeader>

      <CardContent className="px-5 pb-6 sm:px-6">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className={`text-xs ${styles.secondary}`}>Spent</p>
            <p className={`mt-1 text-lg font-semibold ${styles.main}`}>
              Rs. {formatCurrency(spent)}
            </p>
          </div>

          <div className="text-right">
            <p className={`text-xs ${styles.secondary}`}>
              {exceeded ? "Over Budget" : "Remaining"}
            </p>

            <p
              className={`mt-1 text-lg font-semibold ${
                exceeded
                  ? "text-[#A34F4F]"
                  : accent === "dark"
                    ? "text-white"
                    : "text-[#2F765D]"
              }`}
            >
              Rs. {formatCurrency(Math.abs(remaining))}
            </p>
          </div>
        </div>

        <div className={`h-2 overflow-hidden rounded-full ${styles.track}`}>
          <div
            className={`h-full rounded-full transition-all duration-500 ${styles.progress}`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div className="mt-2 flex items-center justify-between">
          <span className={`text-[11px] ${styles.secondary}`}>
            Budget utilization
          </span>

          <span className={`text-[11px] font-semibold ${styles.main}`}>
            {percentage.toFixed(0)}%
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function SummaryCard({ label, value, description, danger = false }) {
  return (
    <div className="rounded-[22px] border border-white/70 bg-white/80 p-4 shadow-sm sm:p-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#688BB0] sm:text-xs">
        {label}
      </p>

      <p
        className={`mt-2 text-2xl font-semibold tracking-tight sm:text-3xl ${
          danger ? "text-[#A34F4F]" : "text-[#1A2B48]"
        }`}
      >
        Rs. {formatCurrency(value)}
      </p>

      <p className="mt-1 text-xs text-[#688BB0]">{description}</p>
    </div>
  );
}

export default function FinanceDashboard() {
  const [eventId, setEventId] = useState(null);
  const [items, setItems] = useState([]);
  const [queuedItems, setQueuedItems] = useState([]);
  const [summary, setSummary] = useState(null);

  const [form, setForm] = useState(emptyForm);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [editingId, setEditingId] = useState(null);

  const [targets, setTargets] = useState({
    plannedBudget: "",
    reckyPlannedBudget: "",
  });

  const [savingTargets, setSavingTargets] = useState(false);

  const fetchAll = useCallback(async () => {
    if (!eventId) {
      setSummary(null);
      return;
    }

    setError("");

    try {
      const [itemsRes, summaryRes] = await Promise.all([
        api.get(`/budget/events/${eventId}`),
        api.get(`/budget/events/${eventId}/summary`),
      ]);

      setItems(itemsRes.data.items);

      const budgetSummary = summaryRes.data.summary;

      setSummary(budgetSummary);

      setTargets({
        plannedBudget: budgetSummary.plannedBudget,
        reckyPlannedBudget: budgetSummary.reckyPlannedBudget,
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load budget data. Please check your connection.",
      );
    }

    setQueuedItems(getQueueForEvent(eventId, "budget_item"));
  }, [eventId]);

  const { isOnline, pendingCount, syncing, manualSync } =
    useOnlineSync(fetchAll);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  async function handleSaveTargets(e) {
    e.preventDefault();

    setSavingTargets(true);
    setError("");
    setMessage("");

    try {
      await api.patch(`/events/${eventId}/budget-targets`, targets);

      setMessage("Budget targets updated successfully.");

      await fetchAll();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to save budget targets.",
      );
    } finally {
      setSavingTargets(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setMessage("");

    if (editingId) {
      try {
        await api.patch(`/budget/${editingId}`, form);

        setForm(emptyForm);
        setEditingId(null);
        setMessage("Budget entry updated successfully.");

        fetchAll();
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Editing budget entries requires connectivity.",
        );
      }

      return;
    }

    try {
      await api.post(`/budget/events/${eventId}`, form);

      setForm(emptyForm);
      setMessage("Budget entry added successfully.");

      fetchAll();
    } catch (err) {
      if (!err.response) {
        addToQueue("budget_item", eventId, form);

        setForm(emptyForm);

        setQueuedItems(getQueueForEvent(eventId, "budget_item"));

        setMessage(
          "Budget entry saved offline. It will sync automatically when connectivity returns.",
        );
      } else {
        setError(
          err.response?.data?.message || "Failed to save budget entry.",
        );
      }
    }
  }

  function handleEdit(item) {
    setForm({
      phase: item.phase,
      category: item.category,
      description: item.description,
      amount: item.amount,
    });

    setEditingId(item.id);
    setError("");
    setMessage("");
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this budget entry?")) return;

    setError("");
    setMessage("");

    try {
      await api.delete(`/budget/${id}`);

      setMessage("Budget entry deleted.");
      fetchAll();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Deleting budget entries requires connectivity.",
      );
    }
  }

  const eventBudget = Number(summary?.plannedBudget || 0);
  const reckyBudget = Number(summary?.reckyPlannedBudget || 0);

  const eventSpent = Number(summary?.grandTotal || 0);
  const reckySpent = Number(summary?.reckyTotal || 0);

  const eventRemaining = eventBudget - eventSpent;
  const reckyRemaining = reckyBudget - reckySpent;

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
          {/* =====================================================
              HEADER
          ====================================================== */}
          <div className="mb-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#5F97DF]" />

                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#688BB0]">
                    GAC / Finance
                  </p>
                </div>

                <h1 className="text-3xl font-semibold tracking-tight text-[#1A2B48] sm:text-4xl md:text-5xl">
                  Keep every adventure financially on track.
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-[#688BB0] sm:text-base">
                  Set event and Recky budgets, monitor spending, and keep every
                  expense accountable.
                </p>
              </div>

              <div className="w-full lg:w-[320px]">
                <EventPicker
                  selectedEventId={eventId}
                  onSelect={(id) => {
                    setEventId(id);
                    setSummary(null);
                    setError("");
                    setMessage("");
                  }}
                />
              </div>
            </div>
          </div>

          {/* =====================================================
              SYNC
          ====================================================== */}
          <div className="mb-6 rounded-[22px] border border-white/70 bg-white/70 p-3 shadow-sm backdrop-blur-sm sm:p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-[#1A2B48]">
                  Finance sync
                </p>

                <p className="mt-0.5 text-xs text-[#688BB0]">
                  Offline budget entries are queued and synchronized when
                  connectivity returns.
                </p>
              </div>

              <SyncStatusBadge
                isOnline={isOnline}
                pendingCount={pendingCount}
                syncing={syncing}
                onSync={manualSync}
              />
            </div>
          </div>

          {/* =====================================================
              ALERTS
          ====================================================== */}
          {error && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-700 shadow-sm">
              <div className="flex gap-3">
                <span>!</span>
                <p>{error}</p>
              </div>
            </div>
          )}

          {message && (
            <div className="mb-6 rounded-2xl border border-[#B9DCCB] bg-[#DDEFE7] px-4 py-3.5 text-sm text-[#2F765D] shadow-sm">
              <div className="flex gap-3">
                <span>✓</span>
                <p>{message}</p>
              </div>
            </div>
          )}

          {/* =====================================================
              NO EVENT
          ====================================================== */}
          {!eventId ? (
            <div className="rounded-[30px] bg-[#1A2B48] px-6 py-14 text-center text-white shadow-xl sm:px-10 sm:py-20">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#88B3D8]/15">
                <span className="text-2xl">₨</span>
              </div>

              <h2 className="text-2xl font-semibold sm:text-3xl">
                Select an adventure
              </h2>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#B9CDE0]">
                Choose an event above to view and manage its complete financial
                plan.
              </p>
            </div>
          ) : (
            <>
              {/* =====================================================
                  BUDGET OVERVIEW
              ====================================================== */}
              {summary && (
                <>
                  <div className="mb-8">
                    <div className="mb-5">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#688BB0]">
                        Financial overview
                      </p>

                      <h2 className="mt-1 text-2xl font-semibold tracking-tight text-[#1A2B48] sm:text-3xl">
                        Budget at a glance
                      </h2>

                      <p className="mt-1 text-sm text-[#688BB0]">
                        Clearly separated allocations for the full event and
                        Recky operations.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                      {/* EVENT BUDGET */}
                      <BudgetCard
                        title="Event Budget"
                        description="Total budget allocated for the entire adventure."
                        budget={eventBudget}
                        spent={eventSpent}
                        remaining={eventRemaining}
                        accent="dark"
                      />

                      {/* RECKY BUDGET */}
                      <BudgetCard
                        title="Recky Budget"
                        description="Dedicated budget allocated for Recky planning and scouting."
                        budget={reckyBudget}
                        spent={reckySpent}
                        remaining={reckyRemaining}
                        accent="blue"
                      />
                    </div>
                  </div>

                  {/* =================================================
                      QUICK NUMBERS
                  ================================================== */}
                  <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                    <SummaryCard
                      label="Pre-Event"
                      value={summary.preEventTotal}
                      description="Recorded spending"
                    />

                    <SummaryCard
                      label="On-Event"
                      value={summary.onEventTotal}
                      description="Recorded spending"
                    />

                    <SummaryCard
                      label="Post-Event"
                      value={summary.postEventTotal}
                      description="Recorded spending"
                    />

                    <SummaryCard
                      label="Recky Spent"
                      value={reckySpent}
                      description={`of Rs. ${formatCurrency(reckyBudget)}`}
                    />

                    <SummaryCard
                      label="Event Remaining"
                      value={Math.abs(eventRemaining)}
                      description={
                        eventRemaining < 0
                          ? "Event budget exceeded"
                          : "Still available"
                      }
                      danger={eventRemaining < 0}
                    />
                  </div>
                </>
              )}

              {/* =====================================================
                  BUDGET TARGETS
              ====================================================== */}
              <Card className="mb-8 overflow-hidden rounded-[28px] border-0 bg-white shadow-sm">
                <CardHeader className="border-b border-[#E9EFF2] px-5 py-5 sm:px-6">
                  <div>
                    <CardTitle className="text-xl text-[#1A2B48]">
                      Budget Allocation
                    </CardTitle>

                    <CardDescription className="mt-1 text-[#688BB0]">
                      Set the financial limits for the selected event and its
                      Recky operation.
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="px-5 py-6 sm:px-6">
                  <form onSubmit={handleSaveTargets}>
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                      <div>
                        <Label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#688BB0]">
                          Event Budget (PKR)
                        </Label>

                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#688BB0]">
                            Rs.
                          </span>

                          <Input
                            type="number"
                            min="0"
                            value={targets.plannedBudget}
                            onChange={(e) =>
                              setTargets((p) => ({
                                ...p,
                                plannedBudget: e.target.value,
                              }))
                            }
                            className="
                              h-12 rounded-xl
                              border-[#D8E4EC]
                              bg-[#F8FBFC]
                              pl-11
                              text-[#1A2B48]
                            "
                          />
                        </div>

                        <p className="mt-2 text-xs text-[#688BB0]">
                          Overall spending limit for the event.
                        </p>
                      </div>

                      <div>
                        <Label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#688BB0]">
                          Recky Budget (PKR)
                        </Label>

                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#688BB0]">
                            Rs.
                          </span>

                          <Input
                            type="number"
                            min="0"
                            value={targets.reckyPlannedBudget}
                            onChange={(e) =>
                              setTargets((p) => ({
                                ...p,
                                reckyPlannedBudget: e.target.value,
                              }))
                            }
                            className="
                              h-12 rounded-xl
                              border-[#D8E4EC]
                              bg-[#F8FBFC]
                              pl-11
                              text-[#1A2B48]
                            "
                          />
                        </div>

                        <p className="mt-2 text-xs text-[#688BB0]">
                          Dedicated amount available for Recky operations.
                        </p>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={savingTargets}
                      className="
                        mt-5 h-11 w-full rounded-xl
                        bg-[#1A2B48]
                        font-semibold text-white
                        hover:bg-[#294263]
                      "
                    >
                      {savingTargets
                        ? "Saving Budget..."
                        : "Save Budget Allocation ↗"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* =====================================================
                  ADD EXPENSE
              ====================================================== */}
              <Card className="mb-8 overflow-hidden rounded-[28px] border-0 bg-white shadow-sm">
                <CardHeader className="border-b border-[#E9EFF2] px-5 py-5 sm:px-6">
                  <div>
                    <CardTitle className="text-xl text-[#1A2B48]">
                      {editingId ? "Edit Budget Entry" : "Add Budget Entry"}
                    </CardTitle>

                    <CardDescription className="mt-1 text-[#688BB0]">
                      Record expenses against the event budget.
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="px-5 py-6 sm:px-6">
                  <form
                    onSubmit={handleSubmit}
                    className="grid grid-cols-1 gap-4 md:grid-cols-2"
                  >
                    <div>
                      <Label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#688BB0]">
                        Event Phase
                      </Label>

                      <select
                        className="
                          h-11 w-full rounded-xl
                          border border-[#D8E4EC]
                          bg-[#F8FBFC]
                          px-3 text-sm text-[#1A2B48]
                          outline-none
                          focus:border-[#88B3D8]
                          focus:ring-2 focus:ring-[#88B3D8]/20
                        "
                        value={form.phase}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            phase: e.target.value,
                          }))
                        }
                      >
                        {PHASES.map((p) => (
                          <option key={p.value} value={p.value}>
                            {p.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#688BB0]">
                        Category
                      </Label>

                      <select
                        className="
                          h-11 w-full rounded-xl
                          border border-[#D8E4EC]
                          bg-[#F8FBFC]
                          px-3 text-sm text-[#1A2B48]
                          outline-none
                          focus:border-[#88B3D8]
                          focus:ring-2 focus:ring-[#88B3D8]/20
                        "
                        value={form.category}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            category: e.target.value,
                          }))
                        }
                      >
                        {CATEGORIES.map((category) => (
                          <option key={category} value={category}>
                            {category.charAt(0).toUpperCase() +
                              category.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <Label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#688BB0]">
                        Description
                      </Label>

                      <Input
                        placeholder="e.g. Transport fuel for event vehicles"
                        value={form.description}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            description: e.target.value,
                          }))
                        }
                        required
                        className="
                          h-11 rounded-xl
                          border-[#D8E4EC]
                          bg-[#F8FBFC]
                          text-[#1A2B48]
                          placeholder:text-[#9AAFC0]
                        "
                      />
                    </div>

                    <div>
                      <Label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#688BB0]">
                        Amount (PKR)
                      </Label>

                      <Input
                        type="number"
                        min="0"
                        placeholder="e.g. 5000"
                        value={form.amount}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            amount: e.target.value,
                          }))
                        }
                        required
                        className="
                          h-11 rounded-xl
                          border-[#D8E4EC]
                          bg-[#F8FBFC]
                          text-[#1A2B48]
                          placeholder:text-[#9AAFC0]
                        "
                      />
                    </div>

                    <div className="flex items-end gap-2">
                      <Button
                        type="submit"
                        className="
                          h-11 flex-1 rounded-xl
                          bg-[#3D6BB4]
                          font-semibold text-white
                          hover:bg-[#345D9D]
                        "
                      >
                        {editingId ? "Update Entry" : "Add Expense"}
                      </Button>

                      {editingId && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setEditingId(null);
                            setForm(emptyForm);
                          }}
                          className="h-11 rounded-xl"
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* =====================================================
                  QUEUED ITEMS
              ====================================================== */}
              {queuedItems.length > 0 && (
                <Card className="mb-8 overflow-hidden rounded-[26px] border-[#E8D49D] bg-[#FFF9E9] shadow-sm">
                  <CardHeader className="border-b border-[#E8D49D] px-5 py-5 sm:px-6">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <CardTitle className="text-lg text-[#775A21]">
                          Expenses Waiting to Sync
                        </CardTitle>

                        <CardDescription className="text-[#967A3E]">
                          These entries are stored locally and will sync when
                          connectivity returns.
                        </CardDescription>
                      </div>

                      <span className="w-fit rounded-full bg-[#F4E4B8] px-3 py-1 text-xs font-semibold text-[#775A21]">
                        {queuedItems.length} pending
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent className="p-0">
                    <div className="divide-y divide-[#E8D49D]">
                      {queuedItems.map((q) => (
                        <div
                          key={q.id}
                          className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                        >
                          <div>
                            <p className="text-sm font-medium text-[#5F4A1D]">
                              {q.payload.description}
                            </p>

                            <p className="mt-1 text-xs text-[#967A3E]">
                              {q.payload.category} ·{" "}
                              {q.payload.phase?.replace("_", "-")}
                            </p>
                          </div>

                          <span className="text-sm font-semibold text-[#775A21]">
                            Rs. {formatCurrency(q.payload.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* =====================================================
                  TRANSACTION HISTORY
              ====================================================== */}
              <div className="mb-10">
                <div className="mb-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#688BB0]">
                    Financial activity
                  </p>

                  <h2 className="mt-1 text-2xl font-semibold tracking-tight text-[#1A2B48]">
                    Expense history
                  </h2>

                  <p className="mt-1 text-sm text-[#688BB0]">
                    All recorded expenses for this event.
                  </p>
                </div>

                {items.length === 0 ? (
                  <div className="rounded-[28px] border border-dashed border-[#C9D8E1] bg-white/70 px-6 py-12 text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EBF2F2] text-xl text-[#3D6BB4]">
                      ₨
                    </div>

                    <h3 className="text-lg font-semibold text-[#1A2B48]">
                      No expenses recorded
                    </h3>

                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#688BB0]">
                      Add your first budget entry above to start tracking event
                      expenses.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {items.map((item, index) => (
                      <Card
                        key={item.id}
                        className="
                          overflow-hidden
                          rounded-[24px]
                          border-0
                          bg-white
                          shadow-sm
                          transition-all
                          hover:shadow-md
                        "
                      >
                        <CardContent className="p-4 sm:p-5">
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex min-w-0 items-start gap-4">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EBF2F2] text-xs font-semibold text-[#3D6BB4]">
                                {String(index + 1).padStart(2, "0")}
                              </div>

                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-[#1A2B48]">
                                  {item.description}
                                </p>

                                <p className="mt-1 text-xs text-[#688BB0]">
                                  {item.category} ·{" "}
                                  {item.phase?.replace("_", "-")} · by{" "}
                                  {item.submittedByRole}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center justify-between gap-4 border-t border-[#E9EFF2] pt-3 sm:border-0 sm:pt-0">
                              <span className="text-sm font-semibold text-[#1A2B48]">
                                Rs. {formatCurrency(item.amount)}
                              </span>

                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(item)}
                                  className="rounded-xl text-xs"
                                >
                                  Edit
                                </Button>

                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(item.id)}
                                  className="
                                    rounded-xl
                                    text-xs
                                    text-[#A34F4F]
                                    hover:bg-[#FBECEC]
                                    hover:text-[#8E3D3D]
                                  "
                                >
                                  Delete
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* FOOTER */}
              <div className="flex flex-col gap-3 border-t border-[#D6E1E6] pt-6 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-[#688BB0]">
                  GIKI Adventure Club · Finance Operations
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