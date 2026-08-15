import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '@/lib/axios';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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

const CATEGORIES = [
  'logistics',
  'operations',
  'transport',
  'food',
  'water',
  'misc',
];

const initialExpenseForm = {
  category: 'logistics',
  description: '',
  amount: '',
};

export default function ReckyManager() {
  const { eventId } = useParams();

  const [assignments, setAssignments] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [queuedExpenses, setQueuedExpenses] = useState([]);

  // Budget information assigned from Finance
  const [budgetSummary, setBudgetSummary] = useState(null);

  const [inviteEmail, setInviteEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [expenseForm, setExpenseForm] = useState(initialExpenseForm);
  const [inviting, setInviting] = useState(false);
  const [addingExpense, setAddingExpense] = useState(false);

  const fetchAll = useCallback(async () => {
    setError('');

    /*
     * Load assignments
     */
    try {
      const { data } = await api.get(
        `/recky/events/${eventId}/assignments`
      );

      setAssignments(data.assignments || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to load recky assignments.'
      );
    }

    /*
     * Load Recky expenses
     */
    try {
      const { data } = await api.get(
        `/recky/events/${eventId}/expenses`
      );

      setExpenses(data.expenses || []);
    } catch (err) {
      // Offline is fine — queued expenses are still displayed.
    }

    /*
     * Load budget information assigned by Finance.
     *
     * This is the same endpoint used by FinanceDashboard,
     * so both dashboards use the same budget source.
     */
    try {
      const { data } = await api.get(
        `/budget/events/${eventId}/summary`
      );

      setBudgetSummary(data.summary || null);
    } catch (err) {
      // Don't block the Recky dashboard if budget data cannot
      // be loaded while offline.
    }

    /*
     * Load offline queued expenses
     */
    setQueuedExpenses(
      getQueueForEvent(Number(eventId), 'recky_expense')
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

  async function handleInvite(e) {
    e.preventDefault();

    setError('');
    setSuccess('');
    setInviting(true);

    try {
      await api.post(`/recky/events/${eventId}/assign`, {
        email: inviteEmail,
      });

      setInviteEmail('');
      setSuccess('Recky planner invitation sent.');
      fetchAll();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to assign recky planner. Please check your connection.'
      );
    } finally {
      setInviting(false);
    }
  }

  async function handleAddExpense(e) {
    e.preventDefault();

    setError('');
    setSuccess('');
    setAddingExpense(true);

    const payload = {
      ...expenseForm,
    };

    try {
      await api.post(
        `/recky/events/${eventId}/expenses`,
        payload
      );

      setExpenseForm(initialExpenseForm);

      setSuccess('Expense added successfully.');
      fetchAll();
    } catch (err) {
      if (!err.response) {
        addToQueue(
          'recky_expense',
          Number(eventId),
          payload
        );

        setExpenseForm(initialExpenseForm);

        setQueuedExpenses(
          getQueueForEvent(
            Number(eventId),
            'recky_expense'
          )
        );

        setSuccess(
          'Saved offline. It will sync automatically when you are back online.'
        );
      } else {
        setError(
          err.response?.data?.message ||
            'Failed to log expense.'
        );
      }
    } finally {
      setAddingExpense(false);
    }
  }

  /*
   * Calculate current Recky spending.
   *
   * This includes synced expenses displayed on this page.
   */
  const totalSpent = expenses.reduce(
    (sum, expense) => sum + Number(expense.amount || 0),
    0
  );

  /*
   * Budget assigned by Finance/Admin.
   *
   * budgetSummary.reckyPlannedBudget is the authoritative
   * Recky budget.
   */
  const reckyBudget = Number(
    budgetSummary?.reckyPlannedBudget || 0
  );

  const budgetRemaining = reckyBudget - totalSpent;

  const budgetExceeded =
    reckyBudget > 0 && budgetRemaining < 0;

  const budgetPercentage =
    reckyBudget > 0
      ? Math.min((totalSpent / reckyBudget) * 100, 100)
      : 0;

  return (
    <AdminLayout>
      <div className="w-full px-4 py-5 sm:px-6 sm:py-7 lg:px-10 lg:py-10">
        <div className="mx-auto w-full max-w-5xl">

          {/* =====================================================
              PAGE HEADER
          ====================================================== */}
          <div className="mb-6 sm:mb-8">
            <Link
              to="/admin/events"
              className="
                inline-flex items-center gap-1.5
                text-sm font-medium
                text-slate-500
                transition-colors
                hover:text-[#1A2B48]
              "
            >
              <span className="text-base">←</span>
              Back to Events
            </Link>

            <div className="mt-4 flex flex-col gap-3 sm:mt-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#3D6BB4]">
                  Event Operations
                </p>

                <h1 className="text-2xl font-semibold tracking-tight text-[#1A2B48] sm:text-3xl">
                  Recky Planning
                </h1>

                <p className="mt-1.5 max-w-xl text-sm leading-6 text-slate-500">
                  Assign planners, manage field expenses, and keep
                  your recky records synchronized.
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
            <div
              className="
                mb-5 rounded-xl
                border border-red-200
                bg-red-50
                px-4 py-3
                text-sm text-red-700
              "
            >
              {error}
            </div>
          )}

          {success && (
            <div
              className="
                mb-5 rounded-xl
                border border-emerald-200
                bg-emerald-50
                px-4 py-3
                text-sm text-emerald-700
              "
            >
              {success}
            </div>
          )}

          {/* =====================================================
              RECKY BUDGET
          ====================================================== */}
          {budgetSummary && (
            <Card
              className={`mb-6 overflow-hidden shadow-sm ${
                budgetExceeded
                  ? 'border-red-200'
                  : 'border-slate-200/70'
              }`}
            >
              <CardHeader
                className={`border-b px-4 py-5 sm:px-6 ${
                  budgetExceeded
                    ? 'border-red-100 bg-red-50/60'
                    : 'border-slate-100 bg-slate-50/60'
                }`}
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold text-[#1A2B48]">
                      Recky Budget
                    </CardTitle>

                    <CardDescription className="mt-1">
                      Budget assigned by Finance/Admin for this recky.
                    </CardDescription>
                  </div>

                  {budgetExceeded ? (
                    <span
                      className="
                        inline-flex w-fit items-center
                        rounded-full
                        bg-red-100
                        px-3 py-1
                        text-xs font-semibold
                        text-red-700
                      "
                    >
                      Budget Exceeded
                    </span>
                  ) : (
                    <span
                      className="
                        inline-flex w-fit items-center
                        rounded-full
                        bg-emerald-50
                        px-3 py-1
                        text-xs font-semibold
                        text-emerald-700
                      "
                    >
                      Within Budget
                    </span>
                  )}
                </div>
              </CardHeader>

              <CardContent className="p-4 sm:p-6">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">

                  {/* Assigned Budget */}
                  <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Assigned Budget
                    </p>

                    <p className="mt-1 text-2xl font-semibold text-[#1A2B48]">
                      Rs. {reckyBudget.toLocaleString()}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Set by Finance/Admin
                    </p>
                  </div>

                  {/* Spent */}
                  <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Recky Spent
                    </p>

                    <p
                      className={`mt-1 text-2xl font-semibold ${
                        budgetExceeded
                          ? 'text-red-600'
                          : 'text-[#1A2B48]'
                      }`}
                    >
                      Rs. {totalSpent.toLocaleString()}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Synced expenses
                    </p>
                  </div>

                  {/* Remaining */}
                  <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Remaining
                    </p>

                    <p
                      className={`mt-1 text-2xl font-semibold ${
                        budgetRemaining < 0
                          ? 'text-red-600'
                          : 'text-[#1A2B48]'
                      }`}
                    >
                      Rs. {budgetRemaining.toLocaleString()}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {budgetRemaining < 0
                        ? 'Amount over budget'
                        : 'Available for recky'}
                    </p>
                  </div>
                </div>

                {/* Progress */}
                <div className="mt-5">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-medium text-slate-500">
                      Budget Usage
                    </p>

                    <p
                      className={`text-xs font-semibold ${
                        budgetExceeded
                          ? 'text-red-600'
                          : 'text-[#3D6BB4]'
                      }`}
                    >
                      {reckyBudget > 0
                        ? `${((totalSpent / reckyBudget) * 100).toFixed(1)}%`
                        : '0%'}
                    </p>
                  </div>

                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full transition-all ${
                        budgetExceeded
                          ? 'bg-red-500'
                          : 'bg-[#3D6BB4]'
                      }`}
                      style={{
                        width: `${budgetPercentage}%`,
                      }}
                    />
                  </div>

                  {budgetExceeded && (
                    <p className="mt-2 text-xs font-medium text-red-600">
                      Recky expenses have exceeded the budget assigned by
                      Finance.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* =====================================================
              SUMMARY
          ====================================================== */}
          <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">

            <Card className="border-slate-200/70 bg-white shadow-sm">
              <CardContent className="p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Planners
                </p>

                <p className="mt-1 text-2xl font-semibold text-[#1A2B48]">
                  {assignments.length}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Assigned to this event
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200/70 bg-white shadow-sm">
              <CardContent className="p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Expenses
                </p>

                <p className="mt-1 text-2xl font-semibold text-[#1A2B48]">
                  {expenses.length}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Synced expense records
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200/70 bg-white shadow-sm">
              <CardContent className="p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Total Spent
                </p>

                <p
                  className={`mt-1 break-words text-2xl font-semibold ${
                    budgetExceeded
                      ? 'text-red-600'
                      : 'text-[#1A2B48]'
                  }`}
                >
                  Rs. {totalSpent.toLocaleString()}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Synced expenses only
                </p>
              </CardContent>
            </Card>
          </div>

          {/* =====================================================
              ASSIGN RECKY PLANNER
          ====================================================== */}
          <Card className="mb-6 overflow-hidden border-slate-200/70 bg-white shadow-sm">
            <CardHeader className="border-b border-slate-100 bg-slate-50/60 px-4 py-5 sm:px-6">
              <CardTitle className="text-lg font-semibold text-[#1A2B48]">
                Assign Recky Planner
              </CardTitle>

              <CardDescription className="text-sm leading-5">
                Assign a member before heading out for the
                reconnaissance trip.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-4 sm:p-6">
              <form
                onSubmit={handleInvite}
                className="flex flex-col gap-3 sm:flex-row"
              >
                <div className="min-w-0 flex-1">
                  <Label
                    htmlFor="invite-email"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Member Email
                  </Label>

                  <Input
                    id="invite-email"
                    type="email"
                    placeholder="member@email.com"
                    value={inviteEmail}
                    onChange={(e) =>
                      setInviteEmail(e.target.value)
                    }
                    className="h-11 bg-white"
                    required
                  />
                </div>

                <div className="sm:self-end">
                  <Button
                    type="submit"
                    variant="accent"
                    disabled={inviting}
                    className="h-11 w-full sm:w-auto"
                  >
                    {inviting
                      ? 'Inviting...'
                      : 'Invite Planner'}
                  </Button>
                </div>
              </form>

              {assignments.length > 0 && (
                <div className="mt-6 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Current Assignments
                  </p>

                  {assignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="
                        flex flex-col gap-2
                        rounded-xl
                        border border-slate-100
                        bg-slate-50/60
                        p-3.5
                        sm:flex-row sm:items-center
                        sm:justify-between
                      "
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-[#1A2B48]">
                          {assignment.invitedEmail}
                        </p>
                      </div>

                      <span
                        className="
                          inline-flex w-fit items-center
                          rounded-full
                          bg-[#EBF2F2]
                          px-2.5 py-1
                          text-xs font-medium
                          capitalize text-[#3D6BB4]
                        "
                      >
                        {assignment.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* =====================================================
              EXPENSE FORM
          ====================================================== */}
          <Card className="mb-6 overflow-hidden border-slate-200/70 bg-white shadow-sm">
            <CardHeader className="border-b border-slate-100 bg-slate-50/60 px-4 py-5 sm:px-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold text-[#1A2B48]">
                    Log Recky Expense
                  </CardTitle>

                  <CardDescription className="mt-1 max-w-2xl text-sm leading-5">
                    Expenses can be saved while offline and
                    automatically synchronized once connectivity
                    returns.
                  </CardDescription>
                </div>

                <span
                  className="
                    inline-flex w-fit shrink-0
                    items-center gap-1.5
                    rounded-full
                    bg-emerald-50
                    px-2.5 py-1
                    text-xs font-medium
                    text-emerald-700
                  "
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Offline ready
                </span>
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-6">
              <form
                onSubmit={handleAddExpense}
                className="space-y-5"
              >
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                  <div className="flex flex-col gap-2">
                    <Label
                      htmlFor="category"
                      className="text-sm font-medium text-slate-700"
                    >
                      Category
                    </Label>

                    <select
                      id="category"
                      className="
                        h-11 w-full
                        rounded-xl
                        border border-slate-200
                        bg-white
                        px-3
                        text-sm text-[#1A2B48]
                        outline-none
                        transition-all
                        focus:border-[#3D6BB4]
                        focus:ring-2
                        focus:ring-[#3D6BB4]/10
                      "
                      value={expenseForm.category}
                      onChange={(e) =>
                        setExpenseForm((prev) => ({
                          ...prev,
                          category: e.target.value,
                        }))
                      }
                    >
                      {CATEGORIES.map((category) => (
                        <option
                          key={category}
                          value={category}
                        >
                          {category.charAt(0).toUpperCase() +
                            category.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label
                      htmlFor="amount"
                      className="text-sm font-medium text-slate-700"
                    >
                      Amount (PKR)
                    </Label>

                    <Input
                      id="amount"
                      type="number"
                      min="0"
                      placeholder="e.g. 5000"
                      value={expenseForm.amount}
                      onChange={(e) =>
                        setExpenseForm((prev) => ({
                          ...prev,
                          amount: e.target.value,
                        }))
                      }
                      className="h-11"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Label
                    htmlFor="description"
                    className="text-sm font-medium text-slate-700"
                  >
                    Description
                  </Label>

                  <Textarea
                    id="description"
                    placeholder="What was this expense for?"
                    value={expenseForm.description}
                    onChange={(e) =>
                      setExpenseForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    className="min-h-[100px] resize-none"
                    required
                  />
                </div>

                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <Button
                    type="submit"
                    variant="accent"
                    disabled={addingExpense}
                    className="h-11 w-full sm:w-auto"
                  >
                    {addingExpense
                      ? 'Saving...'
                      : 'Add Expense'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* =====================================================
              QUEUED EXPENSES
          ====================================================== */}
          {queuedExpenses.length > 0 && (
            <Card
              className="
                mb-6 overflow-hidden
                border-amber-200
                bg-amber-50/40
                shadow-sm
              "
            >
              <CardHeader className="border-b border-amber-100 px-4 py-5 sm:px-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-base font-semibold text-amber-900">
                      Waiting to Sync
                    </CardTitle>

                    <CardDescription className="mt-1 text-amber-700/80">
                      These expenses are stored locally.
                    </CardDescription>
                  </div>

                  <span
                    className="
                      flex h-8 min-w-8 items-center justify-center
                      rounded-full
                      bg-amber-100
                      px-2
                      text-xs font-semibold
                      text-amber-800
                    "
                  >
                    {queuedExpenses.length}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="p-4 sm:p-6">
                <div className="space-y-2">
                  {queuedExpenses.map((queued) => (
                    <div
                      key={queued.id}
                      className="
                        rounded-xl
                        border border-amber-100
                        bg-white/80
                        p-3.5
                      "
                    >
                      <div
                        className="
                          flex flex-col gap-2
                          sm:flex-row sm:items-center
                          sm:justify-between
                        "
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium capitalize text-[#1A2B48]">
                            {queued.payload.category}
                          </p>

                          <p className="mt-0.5 break-words text-sm text-slate-500">
                            {queued.payload.description}
                          </p>

                          {queued.status === 'failed' && (
                            <p className="mt-1 text-xs text-red-600">
                              {queued.errorMessage}
                            </p>
                          )}
                        </div>

                        <p className="shrink-0 text-sm font-semibold text-[#1A2B48]">
                          Rs.{' '}
                          {Number(
                            queued.payload.amount
                          ).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* =====================================================
              SYNCED EXPENSES
          ====================================================== */}
          <Card className="overflow-hidden border-slate-200/70 bg-white shadow-sm">
            <CardHeader className="border-b border-slate-100 bg-slate-50/60 px-4 py-5 sm:px-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold text-[#1A2B48]">
                    Synced Expenses
                  </CardTitle>

                  <CardDescription>
                    Expenses successfully saved to the server.
                  </CardDescription>
                </div>

                <div className="rounded-xl bg-[#EBF2F2] px-3 py-2">
                  <p className="text-xs text-slate-500">
                    Total spent
                  </p>

                  <p className="text-sm font-semibold text-[#1A2B48]">
                    Rs. {totalSpent.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-6">
              {expenses.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-10 text-center">
                  <p className="text-sm font-medium text-slate-600">
                    No expenses synced yet.
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Added expenses will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {expenses.map((expense) => (
                    <div
                      key={expense.id}
                      className="
                        rounded-xl
                        border border-slate-100
                        bg-slate-50/50
                        p-3.5
                        transition-colors
                        hover:bg-slate-50
                      "
                    >
                      <div
                        className="
                          flex flex-col gap-3
                          sm:flex-row
                          sm:items-center
                          sm:justify-between
                        "
                      >
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className="
                                rounded-full
                                bg-[#EBF2F2]
                                px-2.5 py-1
                                text-xs font-medium
                                capitalize text-[#3D6BB4]
                              "
                            >
                              {expense.category}
                            </span>

                            {!expense.receiptImageUrl && (
                              <span
                                className="
                                  rounded-full
                                  bg-amber-50
                                  px-2.5 py-1
                                  text-xs font-medium
                                  text-amber-700
                                "
                              >
                                No receipt
                              </span>
                            )}
                          </div>

                          <p className="mt-2 break-words text-sm text-slate-600">
                            {expense.description}
                          </p>
                        </div>

                        <p className="shrink-0 text-sm font-semibold text-[#1A2B48]">
                          Rs.{' '}
                          {Number(
                            expense.amount
                          ).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </AdminLayout>
  );
}