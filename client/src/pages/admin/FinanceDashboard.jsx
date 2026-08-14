import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import EventPicker from "./EventPicker";
import AdminLayout from "@/components/admin/AdminLayout";

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
  { value: "post_event", label: "Post-Event" },
];

const emptyForm = {
  phase: "pre_event",
  category: "logistics",
  description: "",
  amount: "",
};

const CATEGORY_STYLES = {
  logistics: "bg-amber-50 text-amber-700",
  operations: "bg-blue-50 text-blue-700",
  transport: "bg-violet-50 text-violet-700",
  food: "bg-emerald-50 text-emerald-700",
  water: "bg-cyan-50 text-cyan-700",
  misc: "bg-slate-100 text-slate-600",
};

export default function FinanceDashboard() {
  const [eventId, setEventId] = useState(null);
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (eventId) {
      fetchAll();
    }
  }, [eventId]);

  async function fetchAll() {
    setLoading(true);
    setError("");

    try {
      const [itemsRes, summaryRes] = await Promise.all([
        api.get(`/budget/events/${eventId}`),
        api.get(`/budget/events/${eventId}/summary`),
      ]);

      setItems(itemsRes.data.items);
      setSummary(summaryRes.data.summary);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load budget data."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      if (editingId) {
        await api.patch(`/budget/${editingId}`, form);
      } else {
        await api.post(`/budget/events/${eventId}`, form);
      }

      setForm(emptyForm);
      setEditingId(null);
      fetchAll();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to save entry."
      );
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

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this budget entry?")) return;

    setError("");

    try {
      await api.delete(`/budget/${id}`);
      fetchAll();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to delete."
      );
    }
  }

  function handleCancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  function formatCategory(category) {
    return (
      category.charAt(0).toUpperCase() +
      category.slice(1)
    );
  }

  function formatPhase(phase) {
    return phase
      .replace("_", "-")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  return (
    <AdminLayout>
      <div className="min-h-screen px-5 py-8 md:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">

          {/* =====================================================
              HEADER
          ====================================================== */}

          <div className="mb-8">

            <div className="mb-5 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#3D6BB4]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#3D6BB4]" />
              Finance & Budget
            </div>

            <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">

              <div>
                <h1 className="text-3xl font-semibold tracking-[-0.04em] text-[#1A2B48] md:text-4xl">
                  Finance Dashboard
                </h1>

                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                  Track event expenses, manage budget entries,
                  and keep every financial detail organized.
                </p>
              </div>

              {summary && (
                <div className="rounded-2xl bg-white px-5 py-3 shadow-sm ring-1 ring-slate-200/70">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Grand Total
                  </p>

                  <p className="mt-1 text-2xl font-semibold tracking-tight text-[#1A2B48]">
                    Rs. {summary.grandTotal}
                  </p>
                </div>
              )}

            </div>
          </div>

          {/* =====================================================
              EVENT SELECTOR
          ====================================================== */}

          <section className="mb-8 rounded-[24px] bg-white p-5 shadow-sm ring-1 ring-slate-200/70 md:p-7">

            <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">

              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#3D6BB4]">
                  Event Selection
                </p>

                <h2 className="mt-1 text-base font-semibold text-[#1A2B48]">
                  Select an Event
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Choose an event to view and manage its budget.
                </p>
              </div>

              {eventId && (
                <span className="rounded-full bg-[#EBF2F2] px-3 py-1.5 text-[10px] font-medium text-slate-500">
                  Budget Active
                </span>
              )}

            </div>

            <div className="max-w-md">
              <EventPicker
                selectedEventId={eventId}
                onSelect={setEventId}
              />
            </div>

          </section>

          {/* =====================================================
              ERROR
          ====================================================== */}

          {error && (
            <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">

              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-semibold">
                !
              </span>

              <span>{error}</span>

            </div>
          )}

          {/* =====================================================
              EMPTY STATE
          ====================================================== */}

          {!eventId ? (
            <div className="flex min-h-[360px] items-center justify-center rounded-[24px] bg-white shadow-sm ring-1 ring-slate-200/70">

              <div className="text-center">

                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#EBF2F2] text-xl text-slate-400">
                  Rs
                </div>

                <p className="text-sm font-medium text-[#1A2B48]">
                  Select an event
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Choose an event above to view its financial data.
                </p>

              </div>

            </div>
          ) : (
            <>
              {/* =====================================================
                  SUMMARY
              ====================================================== */}

              {summary && (
                <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">

                  {/* PRE EVENT */}

                  <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/70">

                    <p className="truncate text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                      Pre-Event
                    </p>

                    <div className="mt-3 flex items-end justify-between">

                      <p className="text-2xl font-semibold tracking-tight text-[#1A2B48]">
                        Rs. {summary.preEventTotal}
                      </p>

                      <span className="h-2 w-2 rounded-full bg-blue-500" />

                    </div>

                  </div>

                  {/* POST EVENT */}

                  <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/70">

                    <p className="truncate text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                      Post-Event
                    </p>

                    <div className="mt-3 flex items-end justify-between">

                      <p className="text-2xl font-semibold tracking-tight text-[#1A2B48]">
                        Rs. {summary.postEventTotal}
                      </p>

                      <span className="h-2 w-2 rounded-full bg-emerald-500" />

                    </div>

                  </div>

                  {/* RECKY */}

                  <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/70">

                    <p className="truncate text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                      Recky
                    </p>

                    <div className="mt-3 flex items-end justify-between">

                      <p className="text-2xl font-semibold tracking-tight text-[#1A2B48]">
                        Rs. {summary.reckyTotal}
                      </p>

                      <span className="h-2 w-2 rounded-full bg-amber-500" />

                    </div>

                  </div>

                  {/* GRAND TOTAL */}

                  <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/70">

                    <p className="truncate text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                      Grand Total
                    </p>

                    <div className="mt-3 flex items-end justify-between">

                      <p className="text-2xl font-semibold tracking-tight text-[#1A2B48]">
                        Rs. {summary.grandTotal}
                      </p>

                      <span className="h-2 w-2 rounded-full bg-[#1A2B48]" />

                    </div>

                  </div>

                </div>
              )}

              {/* =====================================================
                  ADD / EDIT BUDGET
              ====================================================== */}

              <section className="mb-8 overflow-hidden rounded-[24px] bg-white shadow-sm ring-1 ring-slate-200/70">

                {/* Header */}

                <div className="flex flex-col justify-between gap-4 border-b border-slate-100 px-5 py-5 md:flex-row md:items-center md:px-7">

                  <div>

                    <div className="mb-1 flex items-center gap-2">

                      <span className="h-1.5 w-1.5 rounded-full bg-[#3D6BB4]" />

                      <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#3D6BB4]">
                        Budget Control
                      </p>

                    </div>

                    <h2 className="text-base font-semibold text-[#1A2B48]">
                      {editingId
                        ? "Edit Budget Entry"
                        : "Add Budget Entry"}
                    </h2>

                    <p className="mt-1 text-xs text-slate-400">
                      Record an expense for the selected event.
                    </p>

                  </div>

                  <div className="rounded-full bg-[#EBF2F2] px-3 py-1.5 text-[10px] font-medium text-slate-500">
                    {editingId ? "Editing Entry" : "New Entry"}
                  </div>

                </div>

                {/* Form */}

                <div className="px-5 py-6 md:px-7">

                  <form
                    onSubmit={handleSubmit}
                    className="grid grid-cols-1 gap-5 md:grid-cols-2"
                  >

                    {/* PHASE */}

                    <div>

                      <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                        Phase
                      </label>

                      <div className="relative">

                        <select
                          className="w-full appearance-none rounded-xl border-0 bg-[#F4F7F7] py-3 pl-3 pr-9 text-xs font-medium text-[#1A2B48] outline-none ring-1 ring-slate-200 transition-all focus:bg-white focus:ring-[#3D6BB4]"
                          value={form.phase}
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              phase: e.target.value,
                            }))
                          }
                        >
                          {PHASES.map((p) => (
                            <option
                              key={p.value}
                              value={p.value}
                            >
                              {p.label}
                            </option>
                          ))}
                        </select>

                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">
                          ↓
                        </span>

                      </div>

                    </div>

                    {/* CATEGORY */}

                    <div>

                      <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                        Category
                      </label>

                      <div className="relative">

                        <select
                          className="w-full appearance-none rounded-xl border-0 bg-[#F4F7F7] py-3 pl-3 pr-9 text-xs font-medium text-[#1A2B48] outline-none ring-1 ring-slate-200 transition-all focus:bg-white focus:ring-[#3D6BB4]"
                          value={form.category}
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              category: e.target.value,
                            }))
                          }
                        >
                          {CATEGORIES.map((category) => (
                            <option
                              key={category}
                              value={category}
                            >
                              {formatCategory(category)}
                            </option>
                          ))}
                        </select>

                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">
                          ↓
                        </span>

                      </div>

                    </div>

                    {/* DESCRIPTION */}

                    <div className="md:col-span-2">

                      <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                        Description
                      </label>

                      <Input
                        placeholder="e.g. Transport for expedition team"
                        value={form.description}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            description: e.target.value,
                          }))
                        }
                        required
                        className="h-11 rounded-xl border-0 bg-[#F4F7F7] text-xs font-medium text-[#1A2B48] shadow-none ring-1 ring-slate-200 placeholder:text-slate-400 focus:bg-white focus:ring-[#3D6BB4]"
                      />

                    </div>

                    {/* AMOUNT */}

                    <div>

                      <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                        Amount
                      </label>

                      <div className="relative">

                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
                          Rs.
                        </span>

                        <Input
                          type="number"
                          placeholder="0"
                          value={form.amount}
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              amount: e.target.value,
                            }))
                          }
                          required
                          className="h-11 rounded-xl border-0 bg-[#F4F7F7] pl-10 text-xs font-medium text-[#1A2B48] shadow-none ring-1 ring-slate-200 placeholder:text-slate-400 focus:bg-white focus:ring-[#3D6BB4]"
                        />

                      </div>

                    </div>

                    {/* ACTIONS */}

                    <div className="flex items-end gap-2">

                      <Button
                        type="submit"
                        disabled={loading}
                        className="h-11 rounded-xl bg-[#1A2B48] px-5 text-xs font-medium text-white shadow-none transition-all hover:bg-[#253b5f]"
                      >
                        {loading
                          ? "Saving..."
                          : editingId
                            ? "Update Entry"
                            : "Add Entry"}
                      </Button>

                      {editingId && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleCancelEdit}
                          className="h-11 rounded-xl border-0 bg-[#F4F7F7] px-5 text-xs font-medium text-slate-500 ring-1 ring-slate-200 hover:bg-slate-100"
                        >
                          Cancel
                        </Button>
                      )}

                    </div>

                  </form>

                </div>

              </section>

              {/* =====================================================
                  BUDGET ENTRIES
              ====================================================== */}

              <section className="overflow-hidden rounded-[24px] bg-white shadow-sm ring-1 ring-slate-200/70">

                {/* Header */}

                <div className="flex flex-col justify-between gap-4 border-b border-slate-100 px-5 py-5 md:flex-row md:items-center md:px-7">

                  <div>

                    <h2 className="text-base font-semibold text-[#1A2B48]">
                      Budget Entries
                    </h2>

                    <p className="mt-1 text-xs text-slate-400">
                      All recorded expenses for this event.
                    </p>

                  </div>

                  <div className="rounded-full bg-[#EBF2F2] px-3 py-1.5 text-[10px] font-medium text-slate-500">
                    {items.length}{" "}
                    {items.length === 1
                      ? "entry"
                      : "entries"}
                  </div>

                </div>

                {/* Loading */}

                {loading ? (

                  <div className="flex min-h-[280px] items-center justify-center">

                    <div className="text-center">

                      <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-[#3D6BB4]" />

                      <p className="text-xs text-slate-400">
                        Loading budget data...
                      </p>

                    </div>

                  </div>

                ) : items.length === 0 ? (

                  <div className="flex min-h-[280px] items-center justify-center">

                    <div className="text-center">

                      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#EBF2F2] text-xl text-slate-400">
                        Rs
                      </div>

                      <p className="text-sm font-medium text-[#1A2B48]">
                        No budget entries
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Add the first expense using the form above.
                      </p>

                    </div>

                  </div>

                ) : (

                  <div className="overflow-x-auto">

                    <table className="w-full min-w-[900px]">

                      <thead>

                        <tr className="border-b border-slate-100 bg-slate-50/50">

                          <th className="px-7 py-4 text-left text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                            Description
                          </th>

                          <th className="px-5 py-4 text-left text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                            Category
                          </th>

                          <th className="px-5 py-4 text-left text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                            Phase
                          </th>

                          <th className="px-5 py-4 text-left text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                            Submitted By
                          </th>

                          <th className="px-5 py-4 text-right text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                            Amount
                          </th>

                          <th className="px-7 py-4 text-right text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                            Actions
                          </th>

                        </tr>

                      </thead>

                      <tbody>

                        {items.map((item) => (

                          <tr
                            key={item.id}
                            className="group border-b border-slate-100 last:border-0 transition-colors hover:bg-[#F7FAFA]"
                          >

                            {/* DESCRIPTION */}

                            <td className="px-7 py-5">

                              <p className="max-w-[260px] text-sm font-medium text-[#1A2B48]">
                                {item.description}
                              </p>

                            </td>

                            {/* CATEGORY */}

                            <td className="px-5 py-5">

                              <span
                                className={`inline-flex rounded-full px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.08em] ${
                                  CATEGORY_STYLES[
                                    item.category
                                  ] ||
                                  "bg-slate-100 text-slate-600"
                                }`}
                              >
                                {formatCategory(
                                  item.category
                                )}
                              </span>

                            </td>

                            {/* PHASE */}

                            <td className="px-5 py-5">

                              <span className="text-xs font-medium text-slate-500">
                                {formatPhase(item.phase)}
                              </span>

                            </td>

                            {/* SUBMITTED BY */}

                            <td className="px-5 py-5">

                              <span className="text-xs text-slate-500">
                                {item.submittedByRole}
                              </span>

                            </td>

                            {/* AMOUNT */}

                            <td className="px-5 py-5 text-right">

                              <p className="text-sm font-semibold text-[#1A2B48]">
                                Rs. {item.amount}
                              </p>

                            </td>

                            {/* ACTIONS */}

                            <td className="px-7 py-5 text-right">

                              <div className="flex items-center justify-end gap-1">

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleEdit(item)
                                  }
                                  className="rounded-xl px-3 py-2 text-[10px] font-medium text-slate-400 transition-all hover:bg-[#EBF2F2] hover:text-[#3D6BB4]"
                                >
                                  Edit
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDelete(item.id)
                                  }
                                  className="rounded-xl px-3 py-2 text-[10px] font-medium text-slate-400 transition-all hover:bg-red-50 hover:text-red-600"
                                >
                                  Remove
                                </button>

                              </div>

                            </td>

                          </tr>

                        ))}

                      </tbody>

                    </table>

                  </div>

                )}

              </section>

              {/* =====================================================
                  FOOTNOTE
              ====================================================== */}

              <div className="mt-5 flex flex-col justify-between gap-2 px-2 text-[9px] text-slate-400 sm:flex-row">

                <p>
                  Budget changes are reflected immediately.
                </p>

                <p>
                  GIKI Adventure Club · Finance Portal
                </p>

              </div>

            </>
          )}

        </div>
      </div>
    </AdminLayout>
  );
}