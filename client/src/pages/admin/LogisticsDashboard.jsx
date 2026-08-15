import { useEffect, useState, useCallback } from "react";
import api from "@/lib/axios";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

/* =========================================================
   CONSTANTS
========================================================= */

const PHASES = [
  {
    value: "pre_event",
    label: "Pre-Event",
  },
  {
    value: "on_event",
    label: "On-Event",
  },
  {
    value: "post_event",
    label: "Post-Event",
  },
];

const STATUSES = [
  {
    value: "packed",
    label: "Packed",
  },
  {
    value: "in_use",
    label: "In Use",
  },
  {
    value: "returned",
    label: "Returned",
  },
  {
    value: "lost",
    label: "Lost",
  },
  {
    value: "damaged",
    label: "Damaged",
  },
];

const STATUS_STYLES = {
  packed:
    "border-[#C9DDEE] bg-[#E8F1FA] text-[#3D6BB4]",

  in_use:
    "border-[#B9DCCB] bg-[#DDEFE7] text-[#2F765D]",

  returned:
    "border-[#D6D9DD] bg-[#E8EAED] text-[#5F6670]",

  lost:
    "border-[#EBCACA] bg-[#F6E2E2] text-[#A34F4F]",

  damaged:
    "border-[#F0D5A7] bg-[#FFF0D8] text-[#A56B24]",
};

const PHASE_LABELS = {
  pre_event: "Pre-Event",
  on_event: "On-Event",
  post_event: "Post-Event",
};

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

/* =========================================================
   HELPERS
========================================================= */

function formatPhase(phase) {
  return PHASE_LABELS[phase] || phase?.replace("_", "-") || "";
}

function formatAmount(amount) {
  return Number(amount || 0).toLocaleString("en-PK");
}

/* =========================================================
   REUSABLE COMPONENTS
========================================================= */

function SectionHeader({
  eyebrow,
  title,
  description,
  count,
}) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && (
          <p
            className="
              mb-1
              text-[10px]
              font-semibold
              uppercase
              tracking-[0.18em]
              text-[#688BB0]
            "
          >
            {eyebrow}
          </p>
        )}

        <h2
          className="
            text-xl
            font-semibold
            tracking-tight
            text-[#1A2B48]
            sm:text-2xl
          "
        >
          {title}
        </h2>

        {description && (
          <p
            className="
              mt-1
              max-w-2xl
              text-sm
              leading-6
              text-[#688BB0]
            "
          >
            {description}
          </p>
        )}
      </div>

      {count !== undefined && (
        <span
          className="
            w-fit
            rounded-full
            bg-white
            px-3
            py-1.5
            text-[10px]
            font-medium
            text-[#688BB0]
            shadow-sm
          "
        >
          {count} {count === 1 ? "item" : "items"}
        </span>
      )}
    </div>
  );
}

function FieldLabel({ children, htmlFor }) {
  return (
    <label
      htmlFor={htmlFor}
      className="
        mb-2
        block
        text-[10px]
        font-semibold
        uppercase
        tracking-wider
        text-[#688BB0]
      "
    >
      {children}
    </label>
  );
}

function EmptyState({
  icon,
  title,
  description,
}) {
  return (
    <div
      className="
        rounded-[26px]
        border
        border-dashed
        border-[#C9D8E1]
        bg-white/60
        px-6
        py-12
        text-center
      "
    >
      <div
        className="
          mx-auto
          mb-4
          flex
          h-14
          w-14
          items-center
          justify-center
          rounded-2xl
          bg-[#EBF2F2]
          text-xl
          text-[#3D6BB4]
        "
      >
        {icon}
      </div>

      <h3
        className="
          text-base
          font-semibold
          text-[#1A2B48]
          sm:text-lg
        "
      >
        {title}
      </h3>

      <p
        className="
          mx-auto
          mt-2
          max-w-md
          text-sm
          leading-6
          text-[#688BB0]
        "
      >
        {description}
      </p>
    </div>
  );
}

/* =========================================================
   MAIN DASHBOARD
========================================================= */

export default function LogisticsDashboard() {
  const [eventId, setEventId] = useState(null);

  const [items, setItems] = useState([]);
  const [logisticsExpenses, setLogisticsExpenses] = useState([]);

  const [queuedItems, setQueuedItems] = useState([]);
  const [queuedExpenses, setQueuedExpenses] = useState([]);

  const [itemForm, setItemForm] = useState(emptyItemForm);
  const [expenseForm, setExpenseForm] = useState(
    emptyExpenseForm
  );

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  /* =========================================================
     FETCH DATA
  ========================================================= */

  const fetchAll = useCallback(async () => {
    if (!eventId) return;

    setError("");

    /* -----------------------------
       FETCH EXPENSES
    ----------------------------- */

    try {
      const { data } = await api.get(
        `/budget/events/${eventId}`,
        {
          params: {
            category: "logistics",
          },
        }
      );

      setLogisticsExpenses(data.items || []);
    } catch {
      // Expense data can fail while offline.
      setLogisticsExpenses([]);
    }

    /* -----------------------------
       FETCH INVENTORY
    ----------------------------- */

    try {
      const { data } = await api.get(
        `/logistics/events/${eventId}`
      );

      setItems(data.items || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load inventory. Some data may require connectivity."
      );
    }

    /* -----------------------------
       OFFLINE QUEUES
    ----------------------------- */

    setQueuedItems(
      getQueueForEvent(
        eventId,
        "logistics_item"
      )
    );

    setQueuedExpenses(
      getQueueForEvent(
        eventId,
        "budget_item"
      )
    );
  }, [eventId]);

  const {
    isOnline,
    pendingCount,
    syncing,
    manualSync,
  } = useOnlineSync(fetchAll);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  /* =========================================================
     EVENT CHANGE
  ========================================================= */

  function handleEventChange(id) {
    setEventId(id);

    setItems([]);
    setLogisticsExpenses([]);

    setQueuedItems([]);
    setQueuedExpenses([]);

    setItemForm(emptyItemForm);
    setExpenseForm(emptyExpenseForm);

    setError("");
    setMessage("");
  }

  /* =========================================================
     ADD INVENTORY
  ========================================================= */

  async function handleAddItem(e) {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!eventId) return;

    try {
      await api.post(
        `/logistics/events/${eventId}`,
        itemForm
      );

      setItemForm(emptyItemForm);

      setMessage(
        "Inventory item added successfully."
      );

      fetchAll();
    } catch (err) {
      if (!err.response) {
        addToQueue(
          "logistics_item",
          eventId,
          itemForm
        );

        setItemForm(emptyItemForm);

        setQueuedItems(
          getQueueForEvent(
            eventId,
            "logistics_item"
          )
        );

        setMessage(
          "Item saved offline. It will sync automatically when you are back online."
        );
      } else {
        setError(
          err.response?.data?.message ||
            "Failed to add inventory item."
        );
      }
    }
  }

  /* =========================================================
     UPDATE STATUS
  ========================================================= */

  async function handleStatusChange(
    itemId,
    status
  ) {
    setError("");
    setMessage("");

    try {
      await api.patch(
        `/logistics/${itemId}`,
        {
          status,
        }
      );

      setMessage(
        "Inventory status updated."
      );

      fetchAll();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Status changes require connectivity."
      );
    }
  }

  /* =========================================================
     DELETE ITEM
  ========================================================= */

  async function handleDeleteItem(itemId) {
    if (
      !window.confirm(
        "Remove this item from the checklist?"
      )
    ) {
      return;
    }

    setError("");
    setMessage("");

    try {
      await api.delete(
        `/logistics/${itemId}`
      );

      setMessage(
        "Inventory item removed."
      );

      fetchAll();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Deleting requires connectivity."
      );
    }
  }

  /* =========================================================
     ADD EXPENSE
  ========================================================= */

  async function handleAddExpense(e) {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!eventId) return;

    const payload = {
      phase: expenseForm.phase,
      category: "logistics",
      description:
        expenseForm.description,
      amount: expenseForm.amount,
    };

    try {
      await api.post(
        `/budget/events/${eventId}`,
        payload
      );

      setExpenseForm(
        emptyExpenseForm
      );

      setMessage(
        "Logistics expense recorded successfully."
      );

      fetchAll();
    } catch (err) {
      if (!err.response) {
        addToQueue(
          "budget_item",
          eventId,
          payload
        );

        setExpenseForm(
          emptyExpenseForm
        );

        setQueuedExpenses(
          getQueueForEvent(
            eventId,
            "budget_item"
          )
        );

        setMessage(
          "Expense saved offline. It will sync automatically once you are back online."
        );
      } else {
        setError(
          err.response?.data?.message ||
            "Failed to log logistics expense."
        );
      }
    }
  }

  /* =========================================================
     DERIVED VALUES
  ========================================================= */

  const totalExpenses =
    logisticsExpenses.reduce(
      (sum, expense) =>
        sum + Number(expense.amount || 0),
      0
    );

  const packedCount = items.filter(
    (item) => item.status === "packed"
  ).length;

  const inUseCount = items.filter(
    (item) => item.status === "in_use"
  ).length;

  const returnedCount = items.filter(
    (item) => item.status === "returned"
  ).length;

  const issueCount = items.filter(
    (item) =>
      item.status === "lost" ||
      item.status === "damaged"
  ).length;

  /* =========================================================
     UI
  ========================================================= */

  return (
    <AdminLayout>
      <div className="min-h-screen bg-[#EBF2F2]">
        <div
          className="
            mx-auto
            w-full
            max-w-7xl
            min-w-0
            px-4
            pb-10
            pt-20
            sm:px-6
            sm:pt-20
            md:px-8
            md:pt-10
            lg:px-10
          "
        >
          {/* =====================================================
              HEADER
          ====================================================== */}

          <header className="mb-7">
            <div className="mb-3 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#5F97DF]" />

              <p
                className="
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.18em]
                  text-[#688BB0]
                  sm:text-xs
                "
              >
                GAC / Logistics
              </p>
            </div>

            <div
              className="
                flex
                flex-col
                gap-5
                lg:flex-row
                lg:items-end
                lg:justify-between
              "
            >
              <div className="min-w-0">
                <h1
                  className="
                    text-3xl
                    font-semibold
                    tracking-tight
                    text-[#1A2B48]
                    sm:text-4xl
                    md:text-5xl
                  "
                >
                  Keep every adventure moving.
                </h1>

                <p
                  className="
                    mt-2
                    max-w-2xl
                    text-sm
                    leading-6
                    text-[#688BB0]
                    sm:text-base
                  "
                >
                  Manage equipment, track logistics
                  expenses, and keep your event
                  operations organized — even when
                  you're out of signal.
                </p>
              </div>
            </div>
          </header>

          {/* =====================================================
              EVENT + SYNC
          ====================================================== */}

          <div
            className="
              mb-6
              grid
              grid-cols-1
              gap-4
              lg:grid-cols-[1fr_auto]
              lg:items-end
            "
          >
            <div
              className="
                rounded-[24px]
                border
                border-white/70
                bg-white/70
                p-4
                shadow-sm
                backdrop-blur-sm
                sm:p-5
              "
            >
              <EventPicker
                selectedEventId={eventId}
                onSelect={handleEventChange}
              />
            </div>

            <div className="flex lg:justify-end">
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
            <div
              className="
                mb-5
                rounded-2xl
                border
                border-red-200
                bg-red-50
                px-4
                py-3
                text-sm
                leading-5
                text-red-700
              "
            >
              <div className="flex gap-3">
                <span className="font-semibold">
                  !
                </span>

                <p>{error}</p>
              </div>
            </div>
          )}

          {message && (
            <div
              className="
                mb-5
                rounded-2xl
                border
                border-[#B9DCCB]
                bg-[#DDEFE7]
                px-4
                py-3
                text-sm
                leading-5
                text-[#2F765D]
              "
            >
              <div className="flex gap-3">
                <span className="font-semibold">
                  ✓
                </span>

                <p>{message}</p>
              </div>
            </div>
          )}

          {/* =====================================================
              NO EVENT
          ====================================================== */}

          {!eventId ? (
            <div
              className="
                overflow-hidden
                rounded-[28px]
                bg-[#1A2B48]
                px-6
                py-14
                text-center
                shadow-xl
                sm:px-10
                sm:py-20
              "
            >
              <div
                className="
                  mx-auto
                  mb-5
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-2xl
                  bg-[#88B3D8]/15
                  text-2xl
                  text-[#88B3D8]
                "
              >
                ◫
              </div>

              <h2
                className="
                  text-xl
                  font-semibold
                  text-white
                  sm:text-2xl
                "
              >
                Select an adventure
              </h2>

              <p
                className="
                  mx-auto
                  mt-2
                  max-w-md
                  text-sm
                  leading-6
                  text-[#B9CDE0]
                "
              >
                Choose an event above to manage
                its inventory, expenses, and
                logistics checklist.
              </p>
            </div>
          ) : (
            <>
              {/* =================================================
                  OVERVIEW
              ================================================== */}

              <section className="mb-8">
                <SectionHeader
                  eyebrow="Operations overview"
                  title="Logistics snapshot"
                  description="A quick view of your event's equipment, expenses, and operational status."
                />

                <div
                  className="
                    grid
                    grid-cols-2
                    gap-3
                    sm:grid-cols-3
                    lg:grid-cols-5
                  "
                >
                  {/* INVENTORY */}

                  <div
                    className="
                      rounded-[22px]
                      border
                      border-white/70
                      bg-white/75
                      p-4
                      shadow-sm
                      backdrop-blur-sm
                      sm:p-5
                    "
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <p
                        className="
                          text-[10px]
                          font-semibold
                          uppercase
                          tracking-wider
                          text-[#688BB0]
                        "
                      >
                        Inventory
                      </p>

                      <span className="h-2 w-2 rounded-full bg-[#88B3D8]" />
                    </div>

                    <p
                      className="
                        text-2xl
                        font-semibold
                        text-[#1A2B48]
                        sm:text-3xl
                      "
                    >
                      {items.length}
                    </p>

                    <p className="mt-1 text-xs text-[#688BB0]">
                      Tracked items
                    </p>
                  </div>

                  {/* PACKED */}

                  <div
                    className="
                      rounded-[22px]
                      border
                      border-white/70
                      bg-white/75
                      p-4
                      shadow-sm
                      backdrop-blur-sm
                      sm:p-5
                    "
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <p
                        className="
                          text-[10px]
                          font-semibold
                          uppercase
                          tracking-wider
                          text-[#688BB0]
                        "
                      >
                        Packed
                      </p>

                      <span className="h-2 w-2 rounded-full bg-[#3D6BB4]" />
                    </div>

                    <p
                      className="
                        text-2xl
                        font-semibold
                        text-[#1A2B48]
                        sm:text-3xl
                      "
                    >
                      {packedCount}
                    </p>

                    <p className="mt-1 text-xs text-[#688BB0]">
                      Ready for use
                    </p>
                  </div>

                  {/* IN USE */}

                  <div
                    className="
                      rounded-[22px]
                      border
                      border-white/70
                      bg-white/75
                      p-4
                      shadow-sm
                      backdrop-blur-sm
                      sm:p-5
                    "
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <p
                        className="
                          text-[10px]
                          font-semibold
                          uppercase
                          tracking-wider
                          text-[#688BB0]
                        "
                      >
                        In Use
                      </p>

                      <span className="h-2 w-2 rounded-full bg-[#2F765D]" />
                    </div>

                    <p
                      className="
                        text-2xl
                        font-semibold
                        text-[#1A2B48]
                        sm:text-3xl
                      "
                    >
                      {inUseCount}
                    </p>

                    <p className="mt-1 text-xs text-[#688BB0]">
                      Currently deployed
                    </p>
                  </div>

                  {/* ISSUES */}

                  <div
                    className="
                      rounded-[22px]
                      border
                      border-white/70
                      bg-white/75
                      p-4
                      shadow-sm
                      backdrop-blur-sm
                      sm:p-5
                    "
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <p
                        className="
                          text-[10px]
                          font-semibold
                          uppercase
                          tracking-wider
                          text-[#688BB0]
                        "
                      >
                        Issues
                      </p>

                      <span className="h-2 w-2 rounded-full bg-[#A56B24]" />
                    </div>

                    <p
                      className="
                        text-2xl
                        font-semibold
                        text-[#1A2B48]
                        sm:text-3xl
                      "
                    >
                      {issueCount}
                    </p>

                    <p className="mt-1 text-xs text-[#688BB0]">
                      Lost or damaged
                    </p>
                  </div>

                  {/* EXPENSE */}

                  <div
                    className="
                      col-span-2
                      rounded-[22px]
                      bg-[#1A2B48]
                      p-4
                      shadow-md
                      sm:col-span-1
                      sm:p-5
                    "
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <p
                        className="
                          text-[10px]
                          font-semibold
                          uppercase
                          tracking-wider
                          text-[#88B3D8]
                        "
                      >
                        Expenses
                      </p>

                      <span className="h-2 w-2 rounded-full bg-[#88B3D8]" />
                    </div>

                    <p
                      className="
                        break-words
                        text-xl
                        font-semibold
                        text-white
                        sm:text-2xl
                      "
                    >
                      Rs. {formatAmount(totalExpenses)}
                    </p>

                    <p className="mt-1 text-xs text-[#B9CDE0]">
                      Synced logistics expenses
                    </p>
                  </div>
                </div>
              </section>

              {/* =================================================
                  FORMS
              ================================================== */}

              <section className="mb-8">
                <SectionHeader
                  eyebrow="Operations management"
                  title="Add to the adventure"
                  description="Record expenses and equipment as your logistics team prepares for the event."
                />

                <div
                  className="
                    grid
                    grid-cols-1
                    gap-6
                    xl:grid-cols-2
                  "
                >
                  {/* =================================================
                      EXPENSE FORM
                  ================================================== */}

                  <Card
                    className="
                      overflow-hidden
                      rounded-[28px]
                      border-0
                      bg-white
                      shadow-sm
                    "
                  >
                    <CardHeader
                      className="
                        border-b
                        border-[#E9EFF2]
                        px-5
                        py-5
                        sm:px-6
                      "
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className="
                            flex
                            h-11
                            w-11
                            shrink-0
                            items-center
                            justify-center
                            rounded-2xl
                            bg-[#EBF2F2]
                            text-lg
                            text-[#3D6BB4]
                          "
                        >
                          ₨
                        </div>

                        <div>
                          <CardTitle
                            className="
                              text-lg
                              text-[#1A2B48]
                              sm:text-xl
                            "
                          >
                            Log Logistics Expense
                          </CardTitle>

                          <CardDescription className="mt-1 text-[#688BB0]">
                            Record operational costs
                            for this adventure.
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="px-5 py-6 sm:px-6">
                      <form
                        onSubmit={handleAddExpense}
                        className="space-y-5"
                      >
                        <div
                          className="
                            grid
                            grid-cols-1
                            gap-4
                            sm:grid-cols-2
                          "
                        >
                          <div>
                            <FieldLabel>
                              Phase
                            </FieldLabel>

                            <select
                              value={
                                expenseForm.phase
                              }
                              onChange={(e) =>
                                setExpenseForm(
                                  (p) => ({
                                    ...p,
                                    phase:
                                      e.target
                                        .value,
                                  })
                                )
                              }
                              className="
                                h-12
                                w-full
                                rounded-xl
                                border
                                border-[#D8E4EC]
                                bg-[#F8FBFC]
                                px-4
                                text-sm
                                text-[#1A2B48]
                                outline-none
                                transition
                                hover:border-[#B9CBD8]
                                focus:border-[#5F97DF]
                                focus:bg-white
                                focus:ring-2
                                focus:ring-[#5F97DF]/20
                              "
                            >
                              {PHASES.map(
                                (phase) => (
                                  <option
                                    key={
                                      phase.value
                                    }
                                    value={
                                      phase.value
                                    }
                                  >
                                    {
                                      phase.label
                                    }
                                  </option>
                                )
                              )}
                            </select>
                          </div>

                          <div>
                            <FieldLabel htmlFor="expense-amount">
                              Amount
                            </FieldLabel>

                            <Input
                              id="expense-amount"
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="e.g. 5000"
                              value={
                                expenseForm.amount
                              }
                              onChange={(e) =>
                                setExpenseForm(
                                  (p) => ({
                                    ...p,
                                    amount:
                                      e.target
                                        .value,
                                  })
                                )
                              }
                              required
                              className="
                                h-12
                                rounded-xl
                                border-[#D8E4EC]
                                bg-[#F8FBFC]
                                text-[#1A2B48]
                                caret-[#1A2B48]
                                placeholder:text-[#9AAFC0]
                                focus:border-[#5F97DF]
                                focus:bg-white
                                focus:text-[#1A2B48]
                                focus-visible:ring-2
                                focus-visible:ring-[#5F97DF]/20
                              "
                            />
                          </div>
                        </div>

                        <div>
                          <FieldLabel htmlFor="expense-description">
                            Description
                          </FieldLabel>

                          <Input
                            id="expense-description"
                            placeholder="e.g. Transport fuel for event vehicles"
                            value={
                              expenseForm.description
                            }
                            onChange={(e) =>
                              setExpenseForm(
                                (p) => ({
                                  ...p,
                                  description:
                                    e.target
                                      .value,
                                })
                              )
                            }
                            required
                            className="
                              h-12
                              rounded-xl
                              border-[#D8E4EC]
                              bg-[#F8FBFC]
                              text-[#1A2B48]
                              caret-[#1A2B48]
                              placeholder:text-[#9AAFC0]
                              focus:border-[#5F97DF]
                              focus:bg-white
                              focus:text-[#1A2B48]
                              focus-visible:ring-2
                              focus-visible:ring-[#5F97DF]/20
                            "
                          />
                        </div>

                        <Button
                          type="submit"
                          className="
                            h-12
                            w-full
                            rounded-xl
                            bg-[#1A2B48]
                            font-semibold
                            text-white
                            shadow-sm
                            transition
                            hover:bg-[#294263]
                          "
                        >
                          Log Expense ↗
                        </Button>
                      </form>
                    </CardContent>
                  </Card>

                  {/* =================================================
                      INVENTORY FORM
                  ================================================== */}

                  <Card
                    className="
                      overflow-hidden
                      rounded-[28px]
                      border-0
                      bg-[#1A2B48]
                      text-white
                      shadow-xl
                    "
                  >
                    <CardHeader
                      className="
                        border-b
                        border-white/10
                        px-5
                        py-5
                        sm:px-6
                      "
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className="
                            flex
                            h-11
                            w-11
                            shrink-0
                            items-center
                            justify-center
                            rounded-2xl
                            bg-[#88B3D8]/15
                            text-lg
                            text-[#88B3D8]
                          "
                        >
                          ◫
                        </div>

                        <div>
                          <CardTitle
                            className="
                              text-lg
                              text-white
                              sm:text-xl
                            "
                          >
                            Add Inventory Item
                          </CardTitle>

                          <CardDescription className="mt-1 text-[#B9CDE0]">
                            Track equipment,
                            supplies, and event
                            resources.
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="px-5 py-6 sm:px-6">
                      <form
                        onSubmit={handleAddItem}
                        className="space-y-5"
                      >
                        <div
                          className="
                            grid
                            grid-cols-1
                            gap-4
                            sm:grid-cols-[1fr_120px]
                          "
                        >
                          <div>
                            <FieldLabel>
                              Item Name
                            </FieldLabel>

                            <Input
                              placeholder="e.g. Tents"
                              value={
                                itemForm.itemName
                              }
                              onChange={(e) =>
                                setItemForm(
                                  (p) => ({
                                    ...p,
                                    itemName:
                                      e.target
                                        .value,
                                  })
                                )
                              }
                              required
                              className="
                                h-12
                                rounded-xl
                                border-white/10
                                bg-white/10
                                text-white
                                caret-white
                                placeholder:text-white/35
                                focus:border-[#88B3D8]
                                focus:bg-white
                                focus:text-[#1A2B48]
                                focus-visible:ring-2
                                focus-visible:ring-[#88B3D8]/20
                              "
                            />
                          </div>

                          <div>
                            <FieldLabel>
                              Quantity
                            </FieldLabel>

                            <Input
                              type="number"
                              min="1"
                              value={
                                itemForm.quantity
                              }
                              onChange={(e) =>
                                setItemForm(
                                  (p) => ({
                                    ...p,
                                    quantity:
                                      e.target
                                        .value,
                                  })
                                )
                              }
                              className="
                                h-12
                                rounded-xl
                                border-white/10
                                bg-white/10
                                text-white
                                caret-white
                                focus:border-[#88B3D8]
                                focus:bg-white
                                focus:text-[#1A2B48]
                                focus-visible:ring-2
                                focus-visible:ring-[#88B3D8]/20
                              "
                            />
                          </div>
                        </div>

                        <div>
                          <FieldLabel>
                            Event Phase
                          </FieldLabel>

                          <select
                            value={
                              itemForm.phase
                            }
                            onChange={(e) =>
                              setItemForm(
                                (p) => ({
                                  ...p,
                                  phase:
                                    e.target
                                      .value,
                                })
                              )
                            }
                            className="
                              h-12
                              w-full
                              rounded-xl
                              border
                              border-white/10
                              bg-white/10
                              px-4
                              text-sm
                              text-white
                              outline-none
                              transition
                              focus:border-[#88B3D8]
                              focus:bg-white
                              focus:text-[#1A2B48]
                              focus:ring-2
                              focus:ring-[#88B3D8]/20
                            "
                          >
                            {PHASES.map(
                              (phase) => (
                                <option
                                  key={
                                    phase.value
                                  }
                                  value={
                                    phase.value
                                  }
                                  className="
                                    bg-white
                                    text-[#1A2B48]
                                  "
                                >
                                  {phase.label}
                                </option>
                              )
                            )}
                          </select>
                        </div>

                        <div>
                          <FieldLabel>
                            Notes
                          </FieldLabel>

                          <Input
                            placeholder="Optional notes about this item"
                            value={
                              itemForm.notes
                            }
                            onChange={(e) =>
                              setItemForm(
                                (p) => ({
                                  ...p,
                                  notes:
                                    e.target
                                      .value,
                                })
                              )
                            }
                            className="
                              h-12
                              rounded-xl
                              border-white/10
                              bg-white/10
                              text-white
                              caret-white
                              placeholder:text-white/35
                              focus:border-[#88B3D8]
                              focus:bg-white
                              focus:text-[#1A2B48]
                              focus-visible:ring-2
                              focus-visible:ring-[#88B3D8]/20
                            "
                          />
                        </div>

                        <Button
                          type="submit"
                          className="
                            h-12
                            w-full
                            rounded-xl
                            bg-[#88B3D8]
                            font-semibold
                            text-[#1A2B48]
                            shadow-sm
                            hover:bg-[#A5C8E4]
                          "
                        >
                          Add Inventory Item ↗
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </div>
              </section>

              {/* =================================================
                  OFFLINE QUEUES
              ================================================== */}

              {(queuedExpenses.length > 0 ||
                queuedItems.length > 0) && (
                <section className="mb-10">
                  <SectionHeader
                    eyebrow="Offline activity"
                    title="Waiting to sync"
                    description="These changes are stored locally and will be uploaded when connectivity returns."
                  />

                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    {/* QUEUED EXPENSES */}

                    {queuedExpenses.length >
                      0 && (
                      <Card
                        className="
                          overflow-hidden
                          rounded-[26px]
                          border
                          border-[#E8D49D]
                          bg-[#FFF9E9]
                          shadow-sm
                        "
                      >
                        <CardHeader className="border-b border-[#E8D49D] px-5 py-4 sm:px-6">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <CardTitle className="text-base text-[#775A21]">
                                Pending Expenses
                              </CardTitle>

                              <CardDescription className="mt-1 text-[#967A3E]">
                                Logistics expenses
                                waiting for sync.
                              </CardDescription>
                            </div>

                            <span
                              className="
                                rounded-full
                                bg-[#F4E4B8]
                                px-3
                                py-1
                                text-xs
                                font-semibold
                                text-[#775A21]
                              "
                            >
                              {
                                queuedExpenses.length
                              }
                            </span>
                          </div>
                        </CardHeader>

                        <CardContent className="p-0">
                          <div className="divide-y divide-[#E8D49D]">
                            {queuedExpenses.map(
                              (q) => (
                                <div
                                  key={q.id}
                                  className="
                                    flex
                                    flex-col
                                    gap-2
                                    px-5
                                    py-4
                                    sm:flex-row
                                    sm:items-center
                                    sm:justify-between
                                    sm:px-6
                                  "
                                >
                                  <div className="min-w-0">
                                    <p className="break-words text-sm font-medium text-[#5F4A1D]">
                                      {
                                        q.payload
                                          .description
                                      }
                                    </p>

                                    <p className="mt-1 text-xs text-[#967A3E]">
                                      {formatPhase(
                                        q.payload
                                          .phase
                                      )}
                                    </p>
                                  </div>

                                  <span className="shrink-0 text-sm font-semibold text-[#775A21]">
                                    Rs.{" "}
                                    {formatAmount(
                                      q.payload
                                        .amount
                                    )}
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* QUEUED INVENTORY */}

                    {queuedItems.length >
                      0 && (
                      <Card
                        className="
                          overflow-hidden
                          rounded-[26px]
                          border
                          border-[#E8D49D]
                          bg-[#FFF9E9]
                          shadow-sm
                        "
                      >
                        <CardHeader className="border-b border-[#E8D49D] px-5 py-4 sm:px-6">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <CardTitle className="text-base text-[#775A21]">
                                Pending Inventory
                              </CardTitle>

                              <CardDescription className="mt-1 text-[#967A3E]">
                                Inventory changes
                                waiting for sync.
                              </CardDescription>
                            </div>

                            <span
                              className="
                                rounded-full
                                bg-[#F4E4B8]
                                px-3
                                py-1
                                text-xs
                                font-semibold
                                text-[#775A21]
                              "
                            >
                              {
                                queuedItems.length
                              }
                            </span>
                          </div>
                        </CardHeader>

                        <CardContent className="p-0">
                          <div className="divide-y divide-[#E8D49D]">
                            {queuedItems.map(
                              (q) => (
                                <div
                                  key={q.id}
                                  className="
                                    flex
                                    flex-col
                                    gap-2
                                    px-5
                                    py-4
                                    sm:flex-row
                                    sm:items-center
                                    sm:justify-between
                                    sm:px-6
                                  "
                                >
                                  <div>
                                    <p className="text-sm font-medium text-[#5F4A1D]">
                                      {
                                        q.payload
                                          .itemName
                                      }{" "}
                                      ×{" "}
                                      {
                                        q.payload
                                          .quantity
                                      }
                                    </p>

                                    <p className="mt-1 text-xs text-[#967A3E]">
                                      {formatPhase(
                                        q.payload
                                          .phase
                                      )}
                                    </p>
                                  </div>

                                  <span
                                    className="
                                      w-fit
                                      rounded-full
                                      bg-[#F4E4B8]
                                      px-3
                                      py-1
                                      text-xs
                                      font-medium
                                      text-[#775A21]
                                    "
                                  >
                                    Pending
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </section>
              )}

              {/* =================================================
                  INVENTORY
              ================================================== */}

              <section className="mb-10">
                <SectionHeader
                  eyebrow="Event inventory"
                  title="Logistics checklist"
                  description="Track equipment and supplies throughout the adventure."
                  count={items.length}
                />

                {items.length === 0 ? (
                  <EmptyState
                    icon="◫"
                    title="No inventory items yet"
                    description="Add your first logistics item using the form above to start building the event checklist."
                  />
                ) : (
                  <div className="flex flex-col gap-3">
                    {items.map(
                      (item, index) => (
                        <Card
                          key={item.id}
                          className="
                            overflow-hidden
                            rounded-[24px]
                            border
                            border-slate-200/70
                            bg-white
                            shadow-sm
                            transition-all
                            duration-200
                            hover:shadow-md
                          "
                        >
                          <CardContent className="p-4 sm:p-5">
                            <div
                              className="
                                flex
                                flex-col
                                gap-4
                                lg:flex-row
                                lg:items-center
                                lg:justify-between
                              "
                            >
                              {/* ITEM */}

                              <div className="flex min-w-0 flex-1 gap-4">
                                <div
                                  className="
                                    flex
                                    h-11
                                    w-11
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-2xl
                                    bg-[#EBF2F2]
                                    text-xs
                                    font-semibold
                                    text-[#3D6BB4]
                                  "
                                >
                                  {String(
                                    index + 1
                                  ).padStart(2, "0")}
                                </div>

                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <h3
                                      className="
                                        break-words
                                        text-sm
                                        font-semibold
                                        text-[#1A2B48]
                                        sm:text-base
                                      "
                                    >
                                      {
                                        item.itemName
                                      }
                                    </h3>

                                    <span
                                      className="
                                        rounded-full
                                        bg-[#EBF2F2]
                                        px-2.5
                                        py-1
                                        text-[10px]
                                        font-semibold
                                        text-[#688BB0]
                                      "
                                    >
                                      ×{" "}
                                      {
                                        item.quantity
                                      }
                                    </span>
                                  </div>

                                  <div
                                    className="
                                      mt-2
                                      flex
                                      flex-wrap
                                      items-center
                                      gap-x-2
                                      gap-y-1
                                      text-[10px]
                                      text-slate-400
                                    "
                                  >
                                    <span>
                                      {formatPhase(
                                        item.phase
                                      )}
                                    </span>

                                    {item.notes && (
                                      <>
                                        <span>
                                          •
                                        </span>

                                        <span className="break-words">
                                          {
                                            item.notes
                                          }
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* ACTIONS */}

                              <div
                                className="
                                  flex
                                  flex-col
                                  gap-3
                                  border-t
                                  border-slate-100
                                  pt-3
                                  sm:flex-row
                                  sm:items-center
                                  lg:border-0
                                  lg:pt-0
                                "
                              >
                                <div className="flex flex-wrap items-center gap-2">
                                  <span
                                    className={`
                                      rounded-full
                                      border
                                      px-3
                                      py-1.5
                                      text-[10px]
                                      font-semibold
                                      uppercase
                                      tracking-wide
                                      ${
                                        STATUS_STYLES[
                                          item.status
                                        ] ||
                                        "border-slate-200 bg-slate-100 text-slate-600"
                                      }
                                    `}
                                  >
                                    {item.status?.replace(
                                      "_",
                                      " "
                                    )}
                                  </span>

                                  <select
                                    value={
                                      item.status
                                    }
                                    onChange={(e) =>
                                      handleStatusChange(
                                        item.id,
                                        e.target
                                          .value
                                      )
                                    }
                                    className="
                                      h-9
                                      rounded-xl
                                      border
                                      border-[#D8E4EC]
                                      bg-[#F8FBFC]
                                      px-3
                                      text-xs
                                      font-medium
                                      text-[#1A2B48]
                                      outline-none
                                      focus:border-[#5F97DF]
                                      focus:bg-white
                                      focus:ring-2
                                      focus:ring-[#5F97DF]/20
                                    "
                                  >
                                    {STATUSES.map(
                                      (
                                        status
                                      ) => (
                                        <option
                                          key={
                                            status.value
                                          }
                                          value={
                                            status.value
                                          }
                                          className="bg-white text-[#1A2B48]"
                                        >
                                          {
                                            status.label
                                          }
                                        </option>
                                      )
                                    )}
                                  </select>
                                </div>

                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleDeleteItem(
                                      item.id
                                    )
                                  }
                                  className="
                                    h-9
                                    rounded-xl
                                    px-3
                                    text-xs
                                    font-medium
                                    text-[#A34F4F]
                                    hover:bg-[#FBECEC]
                                    hover:text-[#8E3D3D]
                                  "
                                >
                                  Delete
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    )}
                  </div>
                )}
              </section>

              {/* =================================================
                  EXPENSE HISTORY
              ================================================== */}

              <section className="mb-10">
                <SectionHeader
                  eyebrow="Financial activity"
                  title="Logistics expenses"
                  description="Expenses recorded against this event's logistics budget."
                />

                {logisticsExpenses.length ===
                0 ? (
                  <EmptyState
                    icon="₨"
                    title="No logistics expenses yet"
                    description="Expenses logged above will appear here once they are successfully synchronized."
                  />
                ) : (
                  <div className="flex flex-col gap-3">
                    {logisticsExpenses.map(
                      (expense, index) => (
                        <Card
                          key={expense.id}
                          className="
                            overflow-hidden
                            rounded-[22px]
                            border
                            border-slate-200/70
                            bg-white
                            shadow-sm
                          "
                        >
                          <CardContent className="p-4 sm:p-5">
                            <div
                              className="
                                flex
                                flex-col
                                gap-3
                                sm:flex-row
                                sm:items-center
                                sm:justify-between
                              "
                            >
                              <div className="flex min-w-0 items-center gap-3">
                                <div
                                  className="
                                    flex
                                    h-10
                                    w-10
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-xl
                                    bg-[#EBF2F2]
                                    text-[10px]
                                    font-semibold
                                    text-[#3D6BB4]
                                  "
                                >
                                  {String(
                                    index + 1
                                  ).padStart(2, "0")}
                                </div>

                                <div className="min-w-0">
                                  <p
                                    className="
                                      break-words
                                      text-sm
                                      font-semibold
                                      text-[#1A2B48]
                                    "
                                  >
                                    {
                                      expense.description
                                    }
                                  </p>

                                  <div
                                    className="
                                      mt-1
                                      flex
                                      flex-wrap
                                      items-center
                                      gap-2
                                      text-[10px]
                                      uppercase
                                      tracking-wider
                                      text-slate-400
                                    "
                                  >
                                    <span>
                                      {formatPhase(
                                        expense.phase
                                      )}
                                    </span>

                                    <span>
                                      •
                                    </span>

                                    <span>
                                      Logistics
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <p
                                className="
                                  shrink-0
                                  text-base
                                  font-semibold
                                  text-[#1A2B48]
                                "
                              >
                                Rs.{" "}
                                {formatAmount(
                                  expense.amount
                                )}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    )}

                    {/* TOTAL */}

                    <div
                      className="
                        mt-1
                        flex
                        flex-col
                        gap-2
                        rounded-[22px]
                        bg-[#1A2B48]
                        px-5
                        py-4
                        sm:flex-row
                        sm:items-center
                        sm:justify-between
                      "
                    >
                      <div>
                        <p
                          className="
                            text-[10px]
                            font-semibold
                            uppercase
                            tracking-[0.18em]
                            text-[#88B3D8]
                          "
                        >
                          Total logistics spend
                        </p>

                        <p className="mt-1 text-xs text-[#B9CDE0]">
                          Synced expenses for this
                          event
                        </p>
                      </div>

                      <p
                        className="
                          text-xl
                          font-semibold
                          text-white
                          sm:text-2xl
                        "
                      >
                        Rs.{" "}
                        {formatAmount(
                          totalExpenses
                        )}
                      </p>
                    </div>
                  </div>
                )}
              </section>

              {/* =================================================
                  FOOTER
              ================================================== */}

              <footer
                className="
                  mt-10
                  flex
                  flex-col
                  gap-3
                  border-t
                  border-[#D6E1E6]
                  pt-6
                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                "
              >
                <p className="text-[10px] text-[#688BB0] sm:text-xs">
                  GIKI Adventure Club · Logistics
                  Operations
                </p>

                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#88B3D8]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-[#5F97DF]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-[#3D6BB4]" />
                </div>
              </footer>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}