import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import EventPicker from "./EventPicker";
import AdminLayout from "@/components/admin/AdminLayout";

const PHASES = [
  { value: "pre_event", label: "Pre-Event" },
  { value: "on_event", label: "On-Event" },
  { value: "post_event", label: "Post-Event" },
];

const STATUSES = ["packed", "in_use", "returned", "lost", "damaged"];

const emptyItemForm = {
  itemName: "",
  quantity: 1,
  phase: "pre_event",
  status: "packed",
  notes: "",
};

const emptyExpenseForm = {
  phase: "pre_event",
  description: "",
  amount: "",
};

const STATUS_STYLES = {
  packed: "bg-amber-50 text-amber-700 ring-1 ring-amber-100",
  in_use: "bg-blue-50 text-blue-700 ring-1 ring-blue-100",
  returned: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100",
  lost: "bg-red-50 text-red-700 ring-1 ring-red-100",
  damaged: "bg-orange-50 text-orange-700 ring-1 ring-orange-100",
};

const PHASE_LABELS = {
  pre_event: "Pre-Event",
  on_event: "On-Event",
  post_event: "Post-Event",
};

export default function LogisticsDashboard() {
  const [eventId, setEventId] = useState(null);
  const [items, setItems] = useState([]);
  const [itemForm, setItemForm] = useState(emptyItemForm);
  const [expenseForm, setExpenseForm] = useState(emptyExpenseForm);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (eventId) fetchItems();
  }, [eventId]);

  async function fetchItems() {
    setError("");

    try {
      const { data } = await api.get(`/logistics/events/${eventId}`);
      setItems(data.items);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load inventory."
      );
    }
  }

  async function handleAddItem(e) {
    e.preventDefault();
    setError("");

    try {
      await api.post(`/logistics/events/${eventId}`, itemForm);
      setItemForm(emptyItemForm);
      fetchItems();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to add item."
      );
    }
  }

  async function handleStatusChange(itemId, status) {
    try {
      await api.patch(`/logistics/${itemId}`, { status });
      fetchItems();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to update status."
      );
    }
  }

  async function handleDeleteItem(itemId) {
    if (!window.confirm("Remove this item from the checklist?")) return;

    try {
      await api.delete(`/logistics/${itemId}`);
      fetchItems();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to delete."
      );
    }
  }

  async function handleAddExpense(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      await api.post(`/budget/events/${eventId}`, {
        phase: expenseForm.phase,
        category: "logistics",
        description: expenseForm.description,
        amount: expenseForm.amount,
      });

      setExpenseForm(emptyExpenseForm);
      setMessage("Logistics expense logged.");
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to log expense."
      );
    }
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
              Logistics Control
            </div>

            <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
              <div>
                <h1 className="text-3xl font-semibold tracking-[-0.04em] text-[#1A2B48] md:text-4xl">
                  Logistics Dashboard
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  Manage event inventory, logistics expenses, and item
                  status from one place.
                </p>
              </div>

              <div className="w-full lg:w-[280px]">
                <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                  Active Event
                </p>

                <div className="rounded-xl bg-[#F4F7F7] p-1 ring-1 ring-slate-200">
                  <EventPicker
                    selectedEventId={eventId}
                    onSelect={setEventId}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* =====================================================
              ALERTS
          ====================================================== */}
          {error && (
            <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-semibold">
                !
              </div>

              <p>{error}</p>
            </div>
          )}

          {message && (
            <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold">
                ✓
              </div>

              <p>{message}</p>
            </div>
          )}

          {/* =====================================================
              EMPTY STATE
          ====================================================== */}
          {!eventId ? (
            <div className="rounded-[24px] bg-white px-6 py-16 text-center shadow-sm ring-1 ring-slate-200/70 md:px-10">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EBF2F2] text-[#3D6BB4]">
                <svg
                  viewBox="0 0 24 24"
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                >
                  <path
                    d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5v-9Z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="m3 7.5 9 4.5 9-4.5M12 12v9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <p className="text-base font-semibold text-[#1A2B48]">
                Select an event
              </p>

              <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-400">
                Choose an event above to manage its inventory and
                logistics expenses.
              </p>
            </div>
          ) : (
            <>
              {/* =================================================
                  OVERVIEW STATS
              ================================================== */}
              <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">

                <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                      Inventory
                    </p>

                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#EBF2F2] text-[#3D6BB4]">
                      <svg
                        viewBox="0 0 24 24"
                        className="h-3.5 w-3.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
                        <path
                          d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5v-9Z"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="m3 7.5 9 4.5 9-4.5M12 12v9"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </div>

                  <p className="text-2xl font-semibold tracking-tight text-[#1A2B48]">
                    {items.length}
                  </p>

                  <p className="mt-1 text-[10px] text-slate-400">
                    Tracked items
                  </p>
                </div>

                <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                      Packed
                    </p>

                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                      <span className="h-2 w-2 rounded-full bg-amber-500" />
                    </span>
                  </div>

                  <p className="text-2xl font-semibold tracking-tight text-[#1A2B48]">
                    {
                      items.filter(
                        (item) => item.status === "packed"
                      ).length
                    }
                  </p>

                  <p className="mt-1 text-[10px] text-slate-400">
                    Ready for deployment
                  </p>
                </div>

                <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                      In Use
                    </p>

                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-[#3D6BB4]">
                      <span className="h-2 w-2 rounded-full bg-[#3D6BB4]" />
                    </span>
                  </div>

                  <p className="text-2xl font-semibold tracking-tight text-[#1A2B48]">
                    {
                      items.filter(
                        (item) => item.status === "in_use"
                      ).length
                    }
                  </p>

                  <p className="mt-1 text-[10px] text-slate-400">
                    Currently deployed
                  </p>
                </div>

                <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                      Returned
                    </p>

                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    </span>
                  </div>

                  <p className="text-2xl font-semibold tracking-tight text-[#1A2B48]">
                    {
                      items.filter(
                        (item) => item.status === "returned"
                      ).length
                    }
                  </p>

                  <p className="mt-1 text-[10px] text-slate-400">
                    Successfully recovered
                  </p>
                </div>
              </div>

              {/* =================================================
                  EXPENSE + INVENTORY FORMS
              ================================================== */}
              <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-2">

                {/* Expense */}
                <section className="overflow-hidden rounded-[24px] bg-white shadow-sm ring-1 ring-slate-200/70">
                  <div className="border-b border-slate-100 px-5 py-5 md:px-7">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="mb-1 text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                          Budget Control
                        </p>

                        <h2 className="text-base font-semibold text-[#1A2B48]">
                          Log Logistics Expense
                        </h2>

                        <p className="mt-1 text-xs text-slate-400">
                          Record an expense against this event.
                        </p>
                      </div>

                      <span className="rounded-full bg-[#EBF2F2] px-3 py-1.5 text-[9px] font-medium uppercase tracking-[0.1em] text-slate-500">
                        Finance
                      </span>
                    </div>
                  </div>

                  <div className="p-5 md:p-7">
                    <form
                      onSubmit={handleAddExpense}
                      className="space-y-5"
                    >
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                            Phase
                          </label>

                          <select
                            className="w-full appearance-none rounded-xl border-0 bg-[#F4F7F7] px-3 py-2.5 text-xs font-medium text-[#1A2B48] outline-none ring-1 ring-slate-200 transition-all focus:bg-white focus:ring-[#3D6BB4]"
                            value={expenseForm.phase}
                            onChange={(e) =>
                              setExpenseForm((p) => ({
                                ...p,
                                phase: e.target.value,
                              }))
                            }
                          >
                            <option value="pre_event">
                              Pre-Event
                            </option>
                            <option value="post_event">
                              Post-Event
                            </option>
                          </select>
                        </div>

                        <div>
                          <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                            Amount
                          </label>

                          <Input
                            type="number"
                            placeholder="0"
                            value={expenseForm.amount}
                            onChange={(e) =>
                              setExpenseForm((p) => ({
                                ...p,
                                amount: e.target.value,
                              }))
                            }
                            required
                            className="h-auto rounded-xl border-0 bg-[#F4F7F7] py-2.5 text-xs text-[#1A2B48] shadow-none ring-1 ring-slate-200 placeholder:text-slate-400 focus:bg-white focus:ring-[#3D6BB4]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                          Description
                        </label>

                        <Input
                          placeholder="Describe the logistics expense"
                          value={expenseForm.description}
                          onChange={(e) =>
                            setExpenseForm((p) => ({
                              ...p,
                              description: e.target.value,
                            }))
                          }
                          required
                          className="h-auto rounded-xl border-0 bg-[#F4F7F7] py-2.5 text-xs text-[#1A2B48] shadow-none ring-1 ring-slate-200 placeholder:text-slate-400 focus:bg-white focus:ring-[#3D6BB4]"
                        />
                      </div>

                      <Button
                        type="submit"
                        className="h-auto w-full rounded-xl bg-[#1A2B48] px-4 py-2.5 text-xs font-medium text-white shadow-none transition-all hover:bg-[#263b5d]"
                      >
                        Log Expense
                      </Button>
                    </form>
                  </div>
                </section>

                {/* Inventory */}
                <section className="overflow-hidden rounded-[24px] bg-white shadow-sm ring-1 ring-slate-200/70">
                  <div className="border-b border-slate-100 px-5 py-5 md:px-7">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="mb-1 text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                          Inventory Control
                        </p>

                        <h2 className="text-base font-semibold text-[#1A2B48]">
                          Add Inventory Item
                        </h2>

                        <p className="mt-1 text-xs text-slate-400">
                          Add equipment and supplies required for the event.
                        </p>
                      </div>

                      <span className="rounded-full bg-[#EBF2F2] px-3 py-1.5 text-[9px] font-medium uppercase tracking-[0.1em] text-slate-500">
                        Inventory
                      </span>
                    </div>
                  </div>

                  <div className="p-5 md:p-7">
                    <form
                      onSubmit={handleAddItem}
                      className="space-y-5"
                    >
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                            Item Name
                          </label>

                          <Input
                            placeholder="e.g. Tents"
                            value={itemForm.itemName}
                            onChange={(e) =>
                              setItemForm((p) => ({
                                ...p,
                                itemName: e.target.value,
                              }))
                            }
                            required
                            className="h-auto rounded-xl border-0 bg-[#F4F7F7] py-2.5 text-xs text-[#1A2B48] shadow-none ring-1 ring-slate-200 placeholder:text-slate-400 focus:bg-white focus:ring-[#3D6BB4]"
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                            Quantity
                          </label>

                          <Input
                            type="number"
                            placeholder="1"
                            value={itemForm.quantity}
                            onChange={(e) =>
                              setItemForm((p) => ({
                                ...p,
                                quantity: e.target.value,
                              }))
                            }
                            className="h-auto rounded-xl border-0 bg-[#F4F7F7] py-2.5 text-xs text-[#1A2B48] shadow-none ring-1 ring-slate-200 placeholder:text-slate-400 focus:bg-white focus:ring-[#3D6BB4]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                            Phase
                          </label>

                          <select
                            className="w-full appearance-none rounded-xl border-0 bg-[#F4F7F7] px-3 py-2.5 text-xs font-medium text-[#1A2B48] outline-none ring-1 ring-slate-200 transition-all focus:bg-white focus:ring-[#3D6BB4]"
                            value={itemForm.phase}
                            onChange={(e) =>
                              setItemForm((p) => ({
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
                        </div>

                        <div>
                          <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                            Notes
                          </label>

                          <Input
                            placeholder="Optional notes"
                            value={itemForm.notes}
                            onChange={(e) =>
                              setItemForm((p) => ({
                                ...p,
                                notes: e.target.value,
                              }))
                            }
                            className="h-auto rounded-xl border-0 bg-[#F4F7F7] py-2.5 text-xs text-[#1A2B48] shadow-none ring-1 ring-slate-200 placeholder:text-slate-400 focus:bg-white focus:ring-[#3D6BB4]"
                          />
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="h-auto w-full rounded-xl bg-[#1A2B48] px-4 py-2.5 text-xs font-medium text-white shadow-none transition-all hover:bg-[#263b5d]"
                      >
                        Add Inventory Item
                      </Button>
                    </form>
                  </div>
                </section>
              </div>

              {/* =================================================
                  INVENTORY LIST
              ================================================== */}
              <section className="overflow-hidden rounded-[24px] bg-white shadow-sm ring-1 ring-slate-200/70">

                {/* Header */}
                <div className="flex flex-col justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center md:px-7">
                  <div>
                    <p className="mb-1 text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                      Event Inventory
                    </p>

                    <h2 className="text-base font-semibold text-[#1A2B48]">
                      Logistics Checklist
                    </h2>

                    <p className="mt-1 text-xs text-slate-400">
                      Track the status of every logistics item.
                    </p>
                  </div>

                  <span className="w-fit rounded-full bg-[#EBF2F2] px-3 py-1.5 text-[10px] font-medium text-slate-500">
                    {items.length} {items.length === 1 ? "item" : "items"}
                  </span>
                </div>

                {items.length === 0 ? (
                  <div className="px-6 py-14 text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EBF2F2] text-[#3D6BB4]">
                      <svg
                        viewBox="0 0 24 24"
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                      >
                        <path
                          d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5v-9Z"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="m3 7.5 9 4.5 9-4.5M12 12v9"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>

                    <p className="text-sm font-semibold text-[#1A2B48]">
                      No inventory items
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Add your first logistics item using the form above.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Desktop table */}
                    <div className="hidden overflow-x-auto md:block">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-slate-100 bg-slate-50/50">
                            <th className="px-7 py-3 text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                              Item
                            </th>

                            <th className="px-4 py-3 text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                              Phase
                            </th>

                            <th className="px-4 py-3 text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                              Notes
                            </th>

                            <th className="px-4 py-3 text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                              Status
                            </th>

                            <th className="px-7 py-3 text-right text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                              Action
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {items.map((item) => (
                            <tr
                              key={item.id}
                              className="border-b border-slate-100 last:border-0 transition-colors hover:bg-[#F7FAFA]"
                            >
                              <td className="px-7 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EBF2F2] text-xs font-semibold text-[#3D6BB4]">
                                    {item.itemName
                                      ?.charAt(0)
                                      ?.toUpperCase()}
                                  </div>

                                  <div>
                                    <p className="text-sm font-medium text-[#1A2B48]">
                                      {item.itemName}
                                    </p>

                                    <p className="mt-0.5 text-[10px] text-slate-400">
                                      Quantity · {item.quantity}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              <td className="px-4 py-4">
                                <span className="text-xs font-medium text-slate-500">
                                  {PHASE_LABELS[item.phase] ||
                                    item.phase.replace("_", "-")}
                                </span>
                              </td>

                              <td className="max-w-[220px] px-4 py-4">
                                <p className="truncate text-xs text-slate-400">
                                  {item.notes || "No notes"}
                                </p>
                              </td>

                              <td className="px-4 py-4">
                                <select
                                  className={`appearance-none rounded-full border-0 px-3 py-1.5 text-[10px] font-semibold capitalize outline-none transition-all ${
                                    STATUS_STYLES[item.status]
                                  }`}
                                  value={item.status}
                                  onChange={(e) =>
                                    handleStatusChange(
                                      item.id,
                                      e.target.value
                                    )
                                  }
                                >
                                  {STATUSES.map((s) => (
                                    <option
                                      key={s}
                                      value={s}
                                    >
                                      {s.replace("_", " ")}
                                    </option>
                                  ))}
                                </select>
                              </td>

                              <td className="px-7 py-4 text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleDeleteItem(item.id)
                                  }
                                  className="rounded-xl px-3 text-[10px] font-medium text-slate-400 hover:bg-red-50 hover:text-red-600"
                                >
                                  Delete
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile cards */}
                    <div className="divide-y divide-slate-100 md:hidden">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="p-5"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EBF2F2] text-xs font-semibold text-[#3D6BB4]">
                                {item.itemName
                                  ?.charAt(0)
                                  ?.toUpperCase()}
                              </div>

                              <div>
                                <p className="text-sm font-medium text-[#1A2B48]">
                                  {item.itemName}
                                </p>

                                <p className="mt-0.5 text-[10px] text-slate-400">
                                  Quantity · {item.quantity}
                                </p>
                              </div>
                            </div>

                            <select
                              className={`appearance-none rounded-full border-0 px-3 py-1.5 text-[10px] font-semibold capitalize outline-none ${
                                STATUS_STYLES[item.status]
                              }`}
                              value={item.status}
                              onChange={(e) =>
                                handleStatusChange(
                                  item.id,
                                  e.target.value
                                )
                              }
                            >
                              {STATUSES.map((s) => (
                                <option
                                  key={s}
                                  value={s}
                                >
                                  {s.replace("_", " ")}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="mt-4 grid grid-cols-2 gap-4">
                            <div>
                              <p className="mb-1 text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                                Phase
                              </p>

                              <p className="text-xs font-medium text-slate-500">
                                {PHASE_LABELS[item.phase] ||
                                  item.phase.replace("_", "-")}
                              </p>
                            </div>

                            <div>
                              <p className="mb-1 text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                                Notes
                              </p>

                              <p className="truncate text-xs text-slate-400">
                                {item.notes || "No notes"}
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 flex justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleDeleteItem(item.id)
                              }
                              className="rounded-xl px-3 text-[10px] font-medium text-slate-400 hover:bg-red-50 hover:text-red-600"
                            >
                              Delete Item
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </section>

              {/* =================================================
                  FOOTER NOTE
              ================================================== */}
              <div className="mt-5 flex flex-col gap-2 px-2 text-[9px] text-slate-400 sm:flex-row sm:items-center sm:justify-between">
                <span>
                  Logistics changes are reflected immediately.
                </span>

                <span>
                  GIKI Adventure Club · Logistics Control
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}