import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/axios';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';

import AdminLayout from '@/components/admin/AdminLayout';
import SyncStatusBadge from '@/components/SyncStatusBadge';
import { useOnlineSync } from '@/hooks/useOnlineSync';
import {
  addToQueue,
  getQueueForEvent,
} from '@/lib/offlineQueue';

import EventPicker from './EventPicker';

const CATEGORIES = [
  'logistics',
  'operations',
  'transport',
  'food',
  'water',
  'misc',
];

const PHASES = [
  {
    value: 'pre_event',
    label: 'Pre-Event',
  },
  {
    value: 'post_event',
    label: 'Post-Event',
  },
];

const emptyForm = {
  phase: 'pre_event',
  category: 'logistics',
  description: '',
  amount: '',
};

const CATEGORY_STYLES = {
  logistics: 'bg-blue-50 text-blue-700',
  operations: 'bg-indigo-50 text-indigo-700',
  transport: 'bg-cyan-50 text-cyan-700',
  food: 'bg-amber-50 text-amber-700',
  water: 'bg-sky-50 text-sky-700',
  misc: 'bg-slate-100 text-slate-600',
};

function formatCategory(category) {
  if (!category) return '';

  return category.charAt(0).toUpperCase() + category.slice(1);
}

function formatPhase(phase) {
  return phase?.replace('_', '-') || '';
}

function formatAmount(amount) {
  return Number(amount || 0).toLocaleString('en-PK');
}

export default function FinanceDashboard() {
  const [eventId, setEventId] = useState(null);
  const [items, setItems] = useState([]);
  const [queuedItems, setQueuedItems] = useState([]);
  const [summary, setSummary] = useState(null);

  const [form, setForm] = useState(emptyForm);

  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);

  const fetchAll = useCallback(async () => {
    if (!eventId) return;

    setError('');

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
          'Failed to load budget data. You may need an internet connection.'
      );
    }

    setQueuedItems(
      getQueueForEvent(eventId, 'budget_item')
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

  function handleEventChange(id) {
    setEventId(id);
    setItems([]);
    setSummary(null);
    setQueuedItems([]);
    setEditingId(null);
    setForm(emptyForm);
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!eventId) return;

    if (editingId) {
      try {
        await api.patch(
          `/budget/${editingId}`,
          form
        );

        setForm(emptyForm);
        setEditingId(null);

        fetchAll();
      } catch (err) {
        setError(
          err.response?.data?.message ||
            'Editing requires connectivity. Try again once you are back online.'
        );
      }

      return;
    }

    try {
      await api.post(
        `/budget/events/${eventId}`,
        form
      );

      setForm(emptyForm);

      fetchAll();
    } catch (err) {
      if (!err.response) {
        addToQueue(
          'budget_item',
          eventId,
          form
        );

        setForm(emptyForm);

        setQueuedItems(
          getQueueForEvent(
            eventId,
            'budget_item'
          )
        );
      } else {
        setError(
          err.response?.data?.message ||
            'Failed to save budget entry.'
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

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleDelete(id) {
    if (
      !window.confirm(
        'Delete this budget entry?'
      )
    ) {
      return;
    }

    setError('');

    try {
      await api.delete(`/budget/${id}`);

      fetchAll();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Deleting requires connectivity.'
      );
    }
  }

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
                GAC / Finance
              </p>
            </div>

            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
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
                  Manage the numbers.
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
                  Track event expenses, manage budget
                  entries, and keep financial records
                  synchronized even when you're offline.
                </p>
              </div>
            </div>
          </header>

          {/* =====================================================
              EVENT PICKER + SYNC
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
              ERROR
          ====================================================== */}

          {error && (
            <div
              className="
                mb-6
                rounded-2xl
                border
                border-red-200
                bg-red-50
                px-4
                py-3
                text-sm
                leading-5
                text-red-700
                sm:px-5
              "
            >
              {error}
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
                py-12
                text-center
                shadow-xl
                sm:px-10
                sm:py-16
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
                ₨
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
                Choose an event above to view its
                budget, add expenses, and manage
                financial records.
              </p>
            </div>
          ) : (
            <>
              {/* =================================================
                  SUMMARY
              ================================================== */}

              {summary && (
                <section className="mb-7">
                  <div className="mb-4">
                    <p
                      className="
                        text-[10px]
                        font-semibold
                        uppercase
                        tracking-[0.18em]
                        text-[#688BB0]
                      "
                    >
                      Financial overview
                    </p>

                    <h2
                      className="
                        mt-1
                        text-xl
                        font-semibold
                        text-[#1A2B48]
                        sm:text-2xl
                      "
                    >
                      Budget snapshot
                    </h2>
                  </div>

                  <div
                    className="
                      grid
                      grid-cols-2
                      gap-3
                      sm:grid-cols-2
                      lg:grid-cols-4
                    "
                  >
                    {/* PRE EVENT */}

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
                          Pre-Event
                        </p>

                        <span className="h-2 w-2 rounded-full bg-[#88B3D8]" />
                      </div>

                      <p
                        className="
                          break-words
                          text-xl
                          font-semibold
                          text-[#1A2B48]
                          sm:text-2xl
                        "
                      >
                        Rs.{' '}
                        {formatAmount(
                          summary.preEventTotal
                        )}
                      </p>
                    </div>

                    {/* POST EVENT */}

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
                          Post-Event
                        </p>

                        <span className="h-2 w-2 rounded-full bg-[#5F97DF]" />
                      </div>

                      <p
                        className="
                          break-words
                          text-xl
                          font-semibold
                          text-[#1A2B48]
                          sm:text-2xl
                        "
                      >
                        Rs.{' '}
                        {formatAmount(
                          summary.postEventTotal
                        )}
                      </p>
                    </div>

                    {/* RECKY */}

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
                          Recky
                        </p>

                        <span className="h-2 w-2 rounded-full bg-[#3D6BB4]" />
                      </div>

                      <p
                        className="
                          break-words
                          text-xl
                          font-semibold
                          text-[#1A2B48]
                          sm:text-2xl
                        "
                      >
                        Rs.{' '}
                        {formatAmount(
                          summary.reckyTotal
                        )}
                      </p>
                    </div>

                    {/* GRAND TOTAL */}

                    <div
                      className="
                        rounded-[22px]
                        bg-[#1A2B48]
                        p-4
                        shadow-md
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
                          Grand Total
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
                        Rs.{' '}
                        {formatAmount(
                          summary.grandTotal
                        )}
                      </p>

                      <p
                        className="
                          mt-1
                          text-[9px]
                          leading-4
                          text-[#B9CDE0]
                        "
                      >
                        Excludes unsynced entries
                      </p>
                    </div>
                  </div>
                </section>
              )}

              {/* =================================================
                  ADD / EDIT FORM
              ================================================== */}

              <Card
                className="
                  mb-7
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
                    sm:px-7
                    sm:py-6
                  "
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p
                        className="
                          mb-2
                          text-[10px]
                          font-semibold
                          uppercase
                          tracking-[0.18em]
                          text-[#88B3D8]
                        "
                      >
                        {editingId
                          ? 'Budget management'
                          : 'New expense'}
                      </p>

                      <CardTitle
                        className="
                          text-xl
                          font-semibold
                          text-white
                          sm:text-2xl
                        "
                      >
                        {editingId
                          ? 'Edit Budget Entry'
                          : 'Add Budget Entry'}
                      </CardTitle>
                    </div>

                    <div
                      className="
                        hidden
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-[#88B3D8]/15
                        text-lg
                        text-[#88B3D8]
                        sm:flex
                      "
                    >
                      ₨
                    </div>
                  </div>
                </CardHeader>

                <CardContent
                  className="
                    px-5
                    py-6
                    sm:px-7
                    sm:py-7
                  "
                >
                  <form
                    onSubmit={handleSubmit}
                    className="
                      grid
                      grid-cols-1
                      gap-4
                      sm:grid-cols-2
                    "
                  >
                    {/* PHASE */}

                    <div className="min-w-0">
                      <label
                        htmlFor="budget-phase"
                        className="
                          mb-2
                          block
                          text-[10px]
                          font-semibold
                          uppercase
                          tracking-wider
                          text-[#B9CDE0]
                        "
                      >
                        Phase
                      </label>

                      <select
                        id="budget-phase"
                        value={form.phase}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            phase: e.target.value,
                          }))
                        }
                        className="
                          h-12
                          w-full
                          appearance-none
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
                          focus:ring-2
                          focus:ring-[#88B3D8]/20
                        "
                      >
                        {PHASES.map((p) => (
                          <option
                            key={p.value}
                            value={p.value}
                            className="bg-[#1A2B48] text-white"
                          >
                            {p.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* CATEGORY */}

                    <div className="min-w-0">
                      <label
                        htmlFor="budget-category"
                        className="
                          mb-2
                          block
                          text-[10px]
                          font-semibold
                          uppercase
                          tracking-wider
                          text-[#B9CDE0]
                        "
                      >
                        Category
                      </label>

                      <select
                        id="budget-category"
                        value={form.category}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            category: e.target.value,
                          }))
                        }
                        className="
                          h-12
                          w-full
                          appearance-none
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
                          focus:ring-2
                          focus:ring-[#88B3D8]/20
                        "
                      >
                        {CATEGORIES.map((category) => (
                          <option
                            key={category}
                            value={category}
                            className="bg-[#1A2B48] text-white"
                          >
                            {formatCategory(category)}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* DESCRIPTION */}

                    <div className="sm:col-span-2">
                      <label
                        htmlFor="budget-description"
                        className="
                          mb-2
                          block
                          text-[10px]
                          font-semibold
                          uppercase
                          tracking-wider
                          text-[#B9CDE0]
                        "
                      >
                        Description
                      </label>

                      <Input
                        id="budget-description"
                        placeholder="e.g. Transport advance for Sharan trip"
                        value={form.description}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            description:
                              e.target.value,
                          }))
                        }
                        required
                        className="
                          h-12
                          rounded-xl
                          border-white/10
                          bg-white/10
                          text-white
                          placeholder:text-white/35
                          focus-visible:ring-[#88B3D8]
                        "
                      />
                    </div>

                    {/* AMOUNT */}

                    <div className="min-w-0">
                      <label
                        htmlFor="budget-amount"
                        className="
                          mb-2
                          block
                          text-[10px]
                          font-semibold
                          uppercase
                          tracking-wider
                          text-[#B9CDE0]
                        "
                      >
                        Amount (PKR)
                      </label>

                      <Input
                        id="budget-amount"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0"
                        value={form.amount}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            amount: e.target.value,
                          }))
                        }
                        required
                        className="
                          h-12
                          rounded-xl
                          border-white/10
                          bg-white/10
                          text-white
                          placeholder:text-white/35
                          focus-visible:ring-[#88B3D8]
                        "
                      />
                    </div>

                    {/* ACTIONS */}

                    <div
                      className="
                        flex
                        flex-col
                        gap-2
                        sm:items-end
                        sm:justify-end
                        sm:flex-row
                      "
                    >
                      {editingId && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={cancelEdit}
                          className="
                            h-12
                            w-full
                            rounded-xl
                            border-white/15
                            bg-white/5
                            text-white
                            hover:bg-white/10
                            hover:text-white
                            sm:w-auto
                          "
                        >
                          Cancel
                        </Button>
                      )}

                      <Button
                        type="submit"
                        className="
                          h-12
                          w-full
                          rounded-xl
                          bg-[#88B3D8]
                          px-7
                          font-semibold
                          text-[#1A2B48]
                          shadow-sm
                          hover:bg-[#A5C8E4]
                          sm:w-auto
                        "
                      >
                        {editingId
                          ? 'Update Entry ↗'
                          : 'Add Entry ↗'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* =================================================
                  QUEUED / OFFLINE ITEMS
              ================================================== */}

              {queuedItems.length > 0 && (
                <Card
                  className="
                    mb-7
                    overflow-hidden
                    rounded-[26px]
                    border
                    border-amber-200
                    bg-amber-50/70
                    shadow-sm
                  "
                >
                  <CardHeader className="px-5 py-5 sm:px-6">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p
                          className="
                            mb-1
                            text-[10px]
                            font-semibold
                            uppercase
                            tracking-[0.16em]
                            text-amber-700
                          "
                        >
                          Offline queue
                        </p>

                        <CardTitle
                          className="
                            text-lg
                            font-semibold
                            text-amber-950
                          "
                        >
                          Waiting to Sync
                        </CardTitle>
                      </div>

                      <span
                        className="
                          rounded-full
                          bg-amber-100
                          px-3
                          py-1
                          text-xs
                          font-semibold
                          text-amber-700
                        "
                      >
                        {queuedItems.length}
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent className="px-5 pb-5 sm:px-6">
                    <div className="flex flex-col gap-2">
                      {queuedItems.map((q) => (
                        <div
                          key={q.id}
                          className="
                            flex
                            flex-col
                            gap-3
                            rounded-xl
                            border
                            border-amber-200/70
                            bg-white/70
                            p-3
                            sm:flex-row
                            sm:items-center
                            sm:justify-between
                          "
                        >
                          <div className="min-w-0">
                            <p
                              className="
                                break-words
                                text-sm
                                font-medium
                                text-[#1A2B48]
                              "
                            >
                              {q.payload.description}
                            </p>

                            <div className="mt-1 flex flex-wrap items-center gap-2">
                              <span className="text-[10px] uppercase tracking-wider text-slate-400">
                                {formatCategory(
                                  q.payload.category
                                )}
                              </span>

                              <span className="text-slate-300">
                                ·
                              </span>

                              <span className="text-[10px] uppercase tracking-wider text-slate-400">
                                {formatPhase(
                                  q.payload.phase
                                )}
                              </span>
                            </div>

                            {q.status === 'failed' && (
                              <p className="mt-1 text-xs text-red-600">
                                {q.errorMessage}
                              </p>
                            )}
                          </div>

                          <span
                            className="
                              shrink-0
                              text-sm
                              font-semibold
                              text-[#1A2B48]
                            "
                          >
                            Rs.{' '}
                            {formatAmount(
                              q.payload.amount
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* =================================================
                  BUDGET ENTRIES
              ================================================== */}

              <section>
                <div
                  className="
                    mb-4
                    flex
                    flex-col
                    gap-2
                    sm:flex-row
                    sm:items-end
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
                        text-[#688BB0]
                      "
                    >
                      Expense records
                    </p>

                    <h2
                      className="
                        mt-1
                        text-xl
                        font-semibold
                        text-[#1A2B48]
                        sm:text-2xl
                      "
                    >
                      Budget entries
                    </h2>
                  </div>

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
                    {items.length}{' '}
                    {items.length === 1
                      ? 'entry'
                      : 'entries'}
                  </span>
                </div>

                {items.length === 0 ? (
                  <div
                    className="
                      rounded-[26px]
                      border
                      border-dashed
                      border-slate-200
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
                        h-12
                        w-12
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

                    <h3
                      className="
                        text-base
                        font-semibold
                        text-[#1A2B48]
                      "
                    >
                      No budget entries yet
                    </h3>

                    <p
                      className="
                        mx-auto
                        mt-1
                        max-w-sm
                        text-sm
                        leading-5
                        text-[#688BB0]
                      "
                    >
                      Add the first expense for this
                      event using the form above.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {items.map((item, index) => (
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
                        <CardContent
                          className="
                            p-4
                            sm:p-5
                          "
                        >
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
                            {/* LEFT */}

                            <div className="flex min-w-0 flex-1 gap-3">
                              <div
                                className="
                                  hidden
                                  h-10
                                  w-10
                                  shrink-0
                                  items-center
                                  justify-center
                                  rounded-xl
                                  bg-[#EBF2F2]
                                  text-xs
                                  font-semibold
                                  text-[#3D6BB4]
                                  sm:flex
                                "
                              >
                                {String(
                                  index + 1
                                ).padStart(2, '0')}
                              </div>

                              <div className="min-w-0 flex-1">
                                <div
                                  className="
                                    flex
                                    flex-wrap
                                    items-center
                                    gap-2
                                  "
                                >
                                  <h3
                                    className="
                                      min-w-0
                                      break-words
                                      text-sm
                                      font-semibold
                                      text-[#1A2B48]
                                    "
                                  >
                                    {item.description}
                                  </h3>

                                  <span
                                    className={`
                                      rounded-full
                                      px-2.5
                                      py-1
                                      text-[9px]
                                      font-semibold
                                      uppercase
                                      tracking-wider
                                      ${
                                        CATEGORY_STYLES[
                                          item.category
                                        ] ||
                                        CATEGORY_STYLES.misc
                                      }
                                    `}
                                  >
                                    {formatCategory(
                                      item.category
                                    )}
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

                                  <span>·</span>

                                  <span>
                                    By{' '}
                                    {item.submittedByRole ||
                                      'Unknown'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* RIGHT */}

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
                                sm:justify-between
                                lg:border-0
                                lg:pt-0
                              "
                            >
                              <p
                                className="
                                  text-base
                                  font-semibold
                                  text-[#1A2B48]
                                "
                              >
                                Rs.{' '}
                                {formatAmount(
                                  item.amount
                                )}
                              </p>

                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleEdit(item)
                                  }
                                  className="
                                    rounded-xl
                                    border-slate-200
                                    text-[#3D6BB4]
                                  "
                                >
                                  Edit
                                </Button>

                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleDelete(
                                      item.id
                                    )
                                  }
                                  className="
                                    rounded-xl
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
              </section>

              {/* =================================================
                  FOOTER
              ================================================== */}

              <div
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