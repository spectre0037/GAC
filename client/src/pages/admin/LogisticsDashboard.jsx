import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/axios';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';

import AdminLayout from '@/components/admin/AdminLayout';
import SyncStatusBadge from '@/components/SyncStatusBadge';
import { useOnlineSync } from '@/hooks/useOnlineSync';
import { addToQueue, getQueueForEvent } from '@/lib/offlineQueue';
import EventPicker from './EventPicker';

const PHASES = [
  { value: 'pre_event', label: 'Pre-Event' },
  { value: 'on_event', label: 'On-Event' },
  { value: 'post_event', label: 'Post-Event' },
];

const STATUSES = [
  { value: 'packed', label: 'Packed' },
  { value: 'in_use', label: 'In Use' },
  { value: 'returned', label: 'Returned' },
  { value: 'lost', label: 'Lost' },
  { value: 'damaged', label: 'Damaged' },
];

const STATUS_STYLES = {
  packed: 'bg-[#E8F1FA] text-[#3D6BB4] border-[#C9DDEE]',
  in_use: 'bg-[#DDEFE7] text-[#2F765D] border-[#B9DCCB]',
  returned: 'bg-[#E8EAED] text-[#5F6670] border-[#D6D9DD]',
  lost: 'bg-[#F6E2E2] text-[#A34F4F] border-[#EBCACA]',
  damaged: 'bg-[#FFF0D8] text-[#A56B24] border-[#F0D5A7]',
};

const PHASE_LABELS = {
  pre_event: 'Pre-Event',
  on_event: 'On-Event',
  post_event: 'Post-Event',
};

const emptyItemForm = {
  itemName: '',
  quantity: 1,
  phase: 'pre_event',
  status: 'packed',
  notes: '',
};

const emptyExpenseForm = {
  phase: 'pre_event',
  description: '',
  amount: '',
};

function SectionHeader({ eyebrow, title, description }) {
  return (
    <div className="mb-5">
      {eyebrow && (
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#688BB0]">
          {eyebrow}
        </p>
      )}

      <h2 className="text-xl font-semibold tracking-tight text-[#1A2B48] sm:text-2xl">
        {title}
      </h2>

      {description && (
        <p className="mt-1 max-w-2xl text-sm leading-6 text-[#688BB0]">
          {description}
        </p>
      )}
    </div>
  );
}

export default function LogisticsDashboard() {
  const [eventId, setEventId] = useState(null);
  const [items, setItems] = useState([]);
  const [queuedItems, setQueuedItems] = useState([]);
  const [queuedExpenses, setQueuedExpenses] = useState([]);

  const [itemForm, setItemForm] = useState(emptyItemForm);
  const [expenseForm, setExpenseForm] = useState(emptyExpenseForm);

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const fetchAll = useCallback(async () => {
    if (!eventId) return;

    setError('');

    try {
      const { data } = await api.get(`/logistics/events/${eventId}`);
      setItems(data.items);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to load inventory. Some data may require connectivity.'
      );
    }

    setQueuedItems(getQueueForEvent(eventId, 'logistics_item'));
    setQueuedExpenses(getQueueForEvent(eventId, 'budget_item'));
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

  async function handleAddItem(e) {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      await api.post(`/logistics/events/${eventId}`, itemForm);

      setItemForm(emptyItemForm);
      setMessage('Inventory item added successfully.');
      fetchAll();
    } catch (err) {
      if (!err.response) {
        addToQueue('logistics_item', eventId, itemForm);

        setItemForm(emptyItemForm);
        setQueuedItems(getQueueForEvent(eventId, 'logistics_item'));

        setMessage(
          'Item saved offline — it will sync automatically when you are back online.'
        );
      } else {
        setError(
          err.response?.data?.message || 'Failed to add inventory item.'
        );
      }
    }
  }

  async function handleStatusChange(itemId, status) {
    setError('');
    setMessage('');

    try {
      await api.patch(`/logistics/${itemId}`, { status });

      setMessage('Inventory status updated.');
      fetchAll();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Status changes require connectivity.'
      );
    }
  }

  async function handleDeleteItem(itemId) {
    if (!window.confirm('Remove this item from the checklist?')) return;

    setError('');
    setMessage('');

    try {
      await api.delete(`/logistics/${itemId}`);

      setMessage('Inventory item removed.');
      fetchAll();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Deleting requires connectivity.'
      );
    }
  }

  async function handleAddExpense(e) {
    e.preventDefault();

    setError('');
    setMessage('');

    const payload = {
      phase: expenseForm.phase,
      category: 'logistics',
      description: expenseForm.description,
      amount: expenseForm.amount,
    };

    try {
      await api.post(`/budget/events/${eventId}`, payload);

      setExpenseForm(emptyExpenseForm);
      setMessage('Logistics expense recorded successfully.');
    } catch (err) {
      if (!err.response) {
        addToQueue('budget_item', eventId, payload);

        setExpenseForm(emptyExpenseForm);
        setQueuedExpenses(
          getQueueForEvent(eventId, 'budget_item')
        );

        setMessage(
          'Expense saved offline — it will sync automatically once you are back online.'
        );
      } else {
        setError(
          err.response?.data?.message ||
            'Failed to log logistics expense.'
        );
      }
    }
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-[#EBF2F2]">
        <div
          className="
            mx-auto w-full max-w-7xl
            px-4
            pb-10
            pt-20
            sm:px-6 sm:pt-20
            md:px-8 md:pt-10
            lg:px-10
            xl:px-12
          "
        >
          {/* =========================================================
              PAGE HEADER
          ========================================================== */}
          <div className="mb-7 sm:mb-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#5F97DF]" />

                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#688BB0]">
                    GAC / Logistics
                  </p>
                </div>

                <h1 className="text-3xl font-semibold tracking-tight text-[#1A2B48] sm:text-4xl md:text-5xl">
                  Keep every adventure moving.
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-[#688BB0] sm:text-base">
                  Manage inventory, track logistics expenses, and keep
                  your event operations organized — even when you are
                  out of signal.
                </p>
              </div>

              <div className="w-full lg:w-auto">
                <EventPicker
                  selectedEventId={eventId}
                  onSelect={(id) => {
                    setEventId(id);
                    setError('');
                    setMessage('');
                  }}
                />
              </div>
            </div>
          </div>

          {/* =========================================================
              SYNC STATUS
          ========================================================== */}
          <div className="mb-6">
            <div className="rounded-[22px] border border-white/70 bg-white/70 p-3 shadow-sm backdrop-blur-sm sm:p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#1A2B48]">
                    Operations sync
                  </p>

                  <p className="mt-0.5 text-xs text-[#688BB0]">
                    Offline entries are queued and synchronized when
                    connectivity returns.
                  </p>
                </div>

                <div className="shrink-0">
                  <SyncStatusBadge
                    isOnline={isOnline}
                    pendingCount={pendingCount}
                    syncing={syncing}
                    onSync={manualSync}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* =========================================================
              ALERTS
          ========================================================== */}
          {error && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-700 shadow-sm">
              <div className="flex gap-3">
                <span className="mt-0.5 shrink-0">!</span>
                <p>{error}</p>
              </div>
            </div>
          )}

          {message && (
            <div className="mb-6 rounded-2xl border border-[#B9DCCB] bg-[#DDEFE7] px-4 py-3.5 text-sm text-[#2F765D] shadow-sm">
              <div className="flex gap-3">
                <span className="mt-0.5 shrink-0">✓</span>
                <p>{message}</p>
              </div>
            </div>
          )}

          {/* =========================================================
              NO EVENT
          ========================================================== */}
          {!eventId ? (
            <div className="rounded-[30px] bg-[#1A2B48] px-6 py-14 text-center text-white shadow-xl sm:px-10 sm:py-20">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#88B3D8]/15">
                <span className="text-2xl">⌁</span>
              </div>

              <h2 className="text-2xl font-semibold sm:text-3xl">
                Select an adventure
              </h2>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#B9CDE0]">
                Choose an event above to manage its inventory,
                expenses, and logistics checklist.
              </p>
            </div>
          ) : (
            <>
              {/* =====================================================
                  OVERVIEW
              ====================================================== */}
              <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                <div className="rounded-[22px] border border-white/70 bg-white/75 p-4 shadow-sm sm:p-5">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[#688BB0] sm:text-xs">
                    Inventory
                  </p>

                  <p className="mt-2 text-2xl font-semibold text-[#1A2B48] sm:text-3xl">
                    {items.length}
                  </p>

                  <p className="mt-1 text-xs text-[#688BB0]">
                    Tracked items
                  </p>
                </div>

                <div className="rounded-[22px] border border-white/70 bg-white/75 p-4 shadow-sm sm:p-5">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[#688BB0] sm:text-xs">
                    Queued
                  </p>

                  <p className="mt-2 text-2xl font-semibold text-[#1A2B48] sm:text-3xl">
                    {queuedItems.length}
                  </p>

                  <p className="mt-1 text-xs text-[#688BB0]">
                    Items waiting
                  </p>
                </div>

                <div className="rounded-[22px] border border-white/70 bg-white/75 p-4 shadow-sm sm:p-5">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[#688BB0] sm:text-xs">
                    Expenses
                  </p>

                  <p className="mt-2 text-2xl font-semibold text-[#1A2B48] sm:text-3xl">
                    {queuedExpenses.length}
                  </p>

                  <p className="mt-1 text-xs text-[#688BB0]">
                    Waiting to sync
                  </p>
                </div>

                <div className="col-span-2 rounded-[22px] border border-[#1A2B48] bg-[#1A2B48] p-4 shadow-sm sm:col-span-1 sm:p-5">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[#88B3D8] sm:text-xs">
                    Connection
                  </p>

                  <p className="mt-2 text-xl font-semibold text-white sm:text-2xl">
                    {isOnline ? 'Online' : 'Offline'}
                  </p>

                  <p className="mt-1 text-xs text-[#B9CDE0]">
                    {isOnline
                      ? 'Sync is available'
                      : 'Changes are queued'}
                  </p>
                </div>
              </div>

              {/* =====================================================
                  EXPENSE + INVENTORY FORMS
              ====================================================== */}
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                {/* EXPENSE */}
                <Card className="overflow-hidden rounded-[28px] border-0 bg-white shadow-sm">
                  <CardHeader className="border-b border-[#E9EFF2] px-5 py-5 sm:px-6">
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#EBF2F2] text-[#3D6BB4]">
                        ₨
                      </div>

                      <div>
                        <CardTitle className="text-lg text-[#1A2B48] sm:text-xl">
                          Log Logistics Expense
                        </CardTitle>

                        <CardDescription className="mt-1 text-[#688BB0]">
                          Record transport, food, water, or other
                          operational expenses.
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="px-5 py-6 sm:px-6">
                    <form
                      onSubmit={handleAddExpense}
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#688BB0]">
                            Phase
                          </label>

                          <select
                            className="
                              h-11 w-full rounded-xl
                              border border-[#D8E4EC]
                              bg-[#F8FBFC]
                              px-3
                              text-sm text-[#1A2B48]
                              outline-none
                              transition
                              focus:border-[#88B3D8]
                              focus:ring-2
                              focus:ring-[#88B3D8]/20
                            "
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
                          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#688BB0]">
                            Amount
                          </label>

                          <Input
                            type="number"
                            min="0"
                            placeholder="e.g. 5000"
                            value={expenseForm.amount}
                            onChange={(e) =>
                              setExpenseForm((p) => ({
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
                      </div>

                      <div>
                        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#688BB0]">
                          Description
                        </label>

                        <Input
                          placeholder="e.g. Transport fuel for event vehicles"
                          value={expenseForm.description}
                          onChange={(e) =>
                            setExpenseForm((p) => ({
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

                      <Button
                        type="submit"
                        className="
                          h-11 w-full rounded-xl
                          bg-[#1A2B48]
                          font-semibold text-white
                          hover:bg-[#294263]
                        "
                      >
                        Log Expense ↗
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* INVENTORY */}
                <Card className="overflow-hidden rounded-[28px] border-0 bg-white shadow-sm">
                  <CardHeader className="border-b border-[#E9EFF2] px-5 py-5 sm:px-6">
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#EBF2F2] text-[#3D6BB4]">
                        ◫
                      </div>

                      <div>
                        <CardTitle className="text-lg text-[#1A2B48] sm:text-xl">
                          Add Inventory Item
                        </CardTitle>

                        <CardDescription className="mt-1 text-[#688BB0]">
                          Add equipment, supplies, and other event
                          resources.
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="px-5 py-6 sm:px-6">
                    <form
                      onSubmit={handleAddItem}
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#688BB0]">
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
                          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#688BB0]">
                            Quantity
                          </label>

                          <Input
                            type="number"
                            min="1"
                            value={itemForm.quantity}
                            onChange={(e) =>
                              setItemForm((p) => ({
                                ...p,
                                quantity: e.target.value,
                              }))
                            }
                            className="
                              h-11 rounded-xl
                              border-[#D8E4EC]
                              bg-[#F8FBFC]
                              text-[#1A2B48]
                            "
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#688BB0]">
                            Event Phase
                          </label>

                          <select
                            className="
                              h-11 w-full rounded-xl
                              border border-[#D8E4EC]
                              bg-[#F8FBFC]
                              px-3
                              text-sm text-[#1A2B48]
                              outline-none
                              transition
                              focus:border-[#88B3D8]
                              focus:ring-2
                              focus:ring-[#88B3D8]/20
                            "
                            value={itemForm.phase}
                            onChange={(e) =>
                              setItemForm((p) => ({
                                ...p,
                                phase: e.target.value,
                              }))
                            }
                          >
                            {PHASES.map((phase) => (
                              <option
                                key={phase.value}
                                value={phase.value}
                              >
                                {phase.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#688BB0]">
                            Notes
                          </label>

                          <Input
                            placeholder="Optional"
                            value={itemForm.notes}
                            onChange={(e) =>
                              setItemForm((p) => ({
                                ...p,
                                notes: e.target.value,
                              }))
                            }
                            className="
                              h-11 rounded-xl
                              border-[#D8E4EC]
                              bg-[#F8FBFC]
                              text-[#1A2B48]
                              placeholder:text-[#9AAFC0]
                            "
                          />
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="
                          h-11 w-full rounded-xl
                          bg-[#3D6BB4]
                          font-semibold text-white
                          hover:bg-[#345D9D]
                        "
                      >
                        Add Inventory Item ↗
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* =====================================================
                  QUEUED EXPENSES
              ====================================================== */}
              {queuedExpenses.length > 0 && (
                <div className="mt-8">
                  <Card className="overflow-hidden rounded-[26px] border-[#E8D49D] bg-[#FFF9E9] shadow-sm">
                    <CardHeader className="border-b border-[#E8D49D] px-5 py-5 sm:px-6">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <CardTitle className="text-base text-[#775A21] sm:text-lg">
                            Expenses Waiting to Sync
                          </CardTitle>

                          <CardDescription className="text-[#967A3E]">
                            These entries are stored locally and will
                            sync when connectivity returns.
                          </CardDescription>
                        </div>

                        <span className="w-fit rounded-full bg-[#F4E4B8] px-3 py-1 text-xs font-semibold text-[#775A21]">
                          {queuedExpenses.length} pending
                        </span>
                      </div>
                    </CardHeader>

                    <CardContent className="p-0">
                      <div className="divide-y divide-[#E8D49D]">
                        {queuedExpenses.map((q) => (
                          <div
                            key={q.id}
                            className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-[#5F4A1D]">
                                {q.payload.description}
                              </p>

                              <p className="mt-1 text-xs text-[#967A3E]">
                                {PHASE_LABELS[q.payload.phase] ||
                                  q.payload.phase}
                              </p>
                            </div>

                            <span className="text-sm font-semibold text-[#775A21]">
                              Rs.{' '}
                              {Number(
                                q.payload.amount
                              ).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* =====================================================
                  QUEUED INVENTORY
              ====================================================== */}
              {queuedItems.length > 0 && (
                <div className="mt-6">
                  <Card className="overflow-hidden rounded-[26px] border-[#E8D49D] bg-[#FFF9E9] shadow-sm">
                    <CardHeader className="border-b border-[#E8D49D] px-5 py-5 sm:px-6">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <CardTitle className="text-base text-[#775A21] sm:text-lg">
                            Inventory Waiting to Sync
                          </CardTitle>

                          <CardDescription className="text-[#967A3E]">
                            Offline inventory changes waiting for
                            synchronization.
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
                                {q.payload.itemName} ×{' '}
                                {q.payload.quantity}
                              </p>

                              <p className="mt-1 text-xs text-[#967A3E]">
                                {PHASE_LABELS[q.payload.phase] ||
                                  q.payload.phase}
                              </p>
                            </div>

                            <span className="rounded-full bg-[#F4E4B8] px-3 py-1 text-xs font-medium text-[#775A21]">
                              Pending
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* =====================================================
                  INVENTORY LIST
              ====================================================== */}
              <div className="mt-10">
                <SectionHeader
                  eyebrow="Event inventory"
                  title="Logistics checklist"
                  description="Track equipment and supplies throughout the adventure."
                />

                {items.length === 0 ? (
                  <div className="rounded-[28px] border border-dashed border-[#C9D8E1] bg-white/70 px-6 py-12 text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EBF2F2] text-xl text-[#3D6BB4]">
                      ◫
                    </div>

                    <h3 className="text-lg font-semibold text-[#1A2B48]">
                      No inventory items yet
                    </h3>

                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#688BB0]">
                      Add your first logistics item using the form
                      above to start building the checklist.
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
                          duration-200
                          hover:shadow-md
                        "
                      >
                        <CardContent className="p-0">
                          <div className="flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
                            {/* ITEM INFO */}
                            <div className="flex min-w-0 items-start gap-4">
                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#1A2B48] text-sm font-semibold text-white">
                                {String(index + 1).padStart(2, '0')}
                              </div>

                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h3 className="truncate text-sm font-semibold text-[#1A2B48] sm:text-base">
                                    {item.itemName}
                                  </h3>

                                  <span className="rounded-full bg-[#EBF2F2] px-2.5 py-1 text-[10px] font-semibold text-[#688BB0]">
                                    × {item.quantity}
                                  </span>
                                </div>

                                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-[#688BB0]">
                                  <span>
                                    {PHASE_LABELS[item.phase] ||
                                      item.phase}
                                  </span>

                                  {item.notes && (
                                    <>
                                      <span className="text-[#B4C1CA]">
                                        •
                                      </span>

                                      <span className="max-w-full break-words">
                                        {item.notes}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* ACTIONS */}
                            <div className="flex flex-col gap-3 border-t border-[#E9EFF2] pt-3 sm:flex-row sm:items-center sm:border-t-0 sm:pt-0 lg:shrink-0">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`
                                    rounded-full border px-3 py-1.5
                                    text-[10px] font-semibold uppercase
                                    tracking-wide
                                    ${
                                      STATUS_STYLES[
                                        item.status
                                      ] ||
                                      'bg-slate-100 text-slate-600 border-slate-200'
                                    }
                                  `}
                                >
                                  {item.status}
                                </span>

                                <select
                                  className="
                                    h-9 rounded-xl
                                    border border-[#D8E4EC]
                                    bg-[#F8FBFC]
                                    px-2.5
                                    text-xs font-medium
                                    text-[#1A2B48]
                                    outline-none
                                    focus:border-[#88B3D8]
                                    focus:ring-2
                                    focus:ring-[#88B3D8]/20
                                  "
                                  value={item.status}
                                  onChange={(e) =>
                                    handleStatusChange(
                                      item.id,
                                      e.target.value
                                    )
                                  }
                                >
                                  {STATUSES.map((status) => (
                                    <option
                                      key={status.value}
                                      value={status.value}
                                    >
                                      {status.label}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleDeleteItem(item.id)
                                }
                                className="
                                  h-9 rounded-xl
                                  px-3
                                  text-xs font-medium
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
                    ))}
                  </div>
                )}
              </div>

              {/* =====================================================
                  FOOTER
              ====================================================== */}
              <div className="mt-10 flex flex-col gap-3 border-t border-[#D6E1E6] pt-6 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-[#688BB0]">
                  GIKI Adventure Club · Logistics Operations
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