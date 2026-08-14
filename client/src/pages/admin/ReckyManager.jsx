import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

import api from '@/lib/axios';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';

import AdminLayout from '@/components/admin/AdminLayout';

const CATEGORIES = [
  'logistics',
  'operations',
  'transport',
  'food',
  'water',
  'misc',
];

const CATEGORY_STYLES = {
  logistics: 'bg-blue-50 text-blue-700',
  operations: 'bg-purple-50 text-purple-700',
  transport: 'bg-cyan-50 text-cyan-700',
  food: 'bg-amber-50 text-amber-700',
  water: 'bg-sky-50 text-sky-700',
  misc: 'bg-slate-100 text-slate-600',
};

export default function ReckyManager() {
  const { eventId } = useParams();

  const [assignments, setAssignments] = useState([]);
  const [expenses, setExpenses] = useState([]);

  const [inviteEmail, setInviteEmail] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [loadingAssignments, setLoadingAssignments] = useState(true);
  const [loadingExpenses, setLoadingExpenses] = useState(true);

  const [inviting, setInviting] = useState(false);
  const [addingExpense, setAddingExpense] = useState(false);

  const [expenseForm, setExpenseForm] = useState({
    category: 'logistics',
    description: '',
    amount: '',
  });

  useEffect(() => {
    if (!eventId) return;

    fetchAssignments();
    fetchExpenses();
  }, [eventId]);

  async function fetchAssignments() {
    setLoadingAssignments(true);

    try {
      const { data } = await api.get(
        `/recky/events/${eventId}/assignments`
      );

      setAssignments(data.assignments || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to load assignments.'
      );
    } finally {
      setLoadingAssignments(false);
    }
  }

  async function fetchExpenses() {
    setLoadingExpenses(true);

    try {
      const { data } = await api.get(
        `/recky/events/${eventId}/expenses`
      );

      setExpenses(data.expenses || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to load expenses.'
      );
    } finally {
      setLoadingExpenses(false);
    }
  }

  function clearMessages() {
    setError('');
    setSuccess('');
  }

  async function handleInvite(e) {
    e.preventDefault();

    clearMessages();
    setInviting(true);

    try {
      await api.post(`/recky/events/${eventId}/assign`, {
        email: inviteEmail,
      });

      setInviteEmail('');

      await fetchAssignments();

      setSuccess('Recky planner assigned successfully.');
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to assign recky planner.'
      );
    } finally {
      setInviting(false);
    }
  }

  async function handleAddExpense(e) {
    e.preventDefault();

    clearMessages();
    setAddingExpense(true);

    try {
      await api.post(`/recky/events/${eventId}/expenses`, {
        category: expenseForm.category,
        description: expenseForm.description,
        amount: expenseForm.amount,
      });

      setExpenseForm({
        category: 'logistics',
        description: '',
        amount: '',
      });

      await fetchExpenses();

      setSuccess('Expense added successfully.');
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to log expense.'
      );
    } finally {
      setAddingExpense(false);
    }
  }

  const totalSpent = useMemo(() => {
    return expenses.reduce(
      (sum, expense) => sum + Number(expense.amount || 0),
      0
    );
  }, [expenses]);

  const formattedTotal = totalSpent.toLocaleString('en-PK');

  return (
    <AdminLayout>
      <div className="min-h-screen bg-[#EBF2F2] px-4 py-6 sm:px-6 md:px-8 lg:px-10 lg:py-8">
        <div className="mx-auto max-w-7xl">

          {/* =====================================================
              HEADER
          ===================================================== */}

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <Link
              to="/admin/events"
              className="mb-6 inline-flex items-center gap-2 text-xs font-medium text-[#688BB0] transition-colors hover:text-[#1A2B48]"
            >
              <span>←</span>
              Back to Events
            </Link>

            <div className="mb-4 flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-[#3D6BB4]" />

              <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#688BB0]">
                Event Operations
              </span>
            </div>

            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">

              <div>
                <h1 className="text-4xl font-semibold tracking-[-0.05em] text-[#1A2B48] sm:text-5xl">
                  Recky
                  <br />
                  <span className="text-[#3D6BB4]">
                    Planning
                  </span>
                </h1>

                <div className="mt-5 h-px w-16 bg-[#88B3D8]" />

                <p className="mt-5 max-w-xl text-sm leading-7 text-[#688BB0]">
                  Coordinate reconnaissance planning, assign
                  team members, and keep track of expenses for
                  this event.
                </p>
              </div>

              {/* Total Spending */}

              <div className="flex w-full items-center gap-4 rounded-[20px] bg-white px-5 py-4 shadow-[0_15px_50px_rgba(26,43,72,0.06)] ring-1 ring-[#88B3D8]/20 md:w-auto md:min-w-[230px]">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#EBF2F2] text-xs font-bold text-[#3D6BB4]">
                  Rs
                </div>

                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#688BB0]">
                    Total Spent
                  </p>

                  <p className="mt-1 text-xl font-semibold tracking-tight text-[#1A2B48]">
                    Rs. {formattedTotal}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* =====================================================
              FEEDBACK
          ===================================================== */}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-600">
                !
              </span>

              <p className="text-sm text-red-700">
                {error}
              </p>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-600">
                ✓
              </span>

              <p className="text-sm text-emerald-700">
                {success}
              </p>
            </motion.div>
          )}

          {/* =====================================================
              MAIN GRID
          ===================================================== */}

          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">

            {/* =================================================
                ASSIGN RECKY
            ================================================= */}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="overflow-hidden rounded-[28px] border-0 bg-white shadow-[0_20px_70px_rgba(26,43,72,0.07)] ring-1 ring-[#88B3D8]/20">

                <CardHeader className="border-b border-slate-100 px-5 py-6 sm:px-7">

                  <div className="flex items-start justify-between gap-4">

                    <div>
                      <div className="mb-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#688BB0]">
                        Team Assignment
                      </div>

                      <CardTitle className="text-lg font-semibold tracking-tight text-[#1A2B48]">
                        Assign Recky Planner
                      </CardTitle>

                      <CardDescription className="mt-2 max-w-md text-xs leading-5 text-slate-400">
                        Invite core members who will participate
                        in the reconnaissance trip.
                      </CardDescription>
                    </div>

                    <div className="shrink-0 rounded-full bg-[#EBF2F2] px-3 py-1.5 text-[10px] font-semibold text-[#3D6BB4]">
                      {assignments.length}{' '}
                      {assignments.length === 1
                        ? 'Member'
                        : 'Members'}
                    </div>

                  </div>
                </CardHeader>

                <CardContent className="px-5 py-6 sm:px-7">

                  <form
                    onSubmit={handleInvite}
                    className="flex flex-col gap-3 sm:flex-row sm:items-end"
                  >
                    <div className="flex-1">
                      <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                        Member Email
                      </label>

                      <Input
                        type="email"
                        placeholder="member@email.com"
                        value={inviteEmail}
                        onChange={(e) =>
                          setInviteEmail(e.target.value)
                        }
                        required
                        disabled={inviting}
                        className="h-11 rounded-xl border-0 bg-[#F4F7F7] px-4 text-xs font-medium text-[#1A2B48] shadow-none ring-1 ring-slate-200 transition-all placeholder:text-slate-400 focus:bg-white focus:ring-[#3D6BB4]"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={inviting}
                      className="h-11 rounded-xl bg-[#1A2B48] px-5 text-xs font-semibold text-white shadow-none transition-all hover:bg-[#3D6BB4] disabled:opacity-60"
                    >
                      {inviting
                        ? 'Inviting...'
                        : 'Invite Member'}

                      {!inviting && (
                        <span className="ml-2">
                          ↗
                        </span>
                      )}
                    </Button>
                  </form>

                  {/* Assignments */}

                  <div className="mt-8">

                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                        Current Assignments
                      </span>

                      {assignments.length > 0 && (
                        <span className="text-[9px] text-slate-400">
                          {assignments.length}/3 recommended
                        </span>
                      )}
                    </div>

                    {loadingAssignments ? (
                      <div className="space-y-2">
                        {[1, 2].map((item) => (
                          <div
                            key={item}
                            className="h-[66px] animate-pulse rounded-2xl bg-[#F4F7F7]"
                          />
                        ))}
                      </div>
                    ) : assignments.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-[#88B3D8]/40 bg-[#EBF2F2]/40 px-5 py-8 text-center">
                        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#EBF2F2] text-sm text-[#3D6BB4]">
                          +
                        </div>

                        <p className="text-xs font-semibold text-[#1A2B48]">
                          No planners assigned
                        </p>

                        <p className="mt-1 text-[10px] text-slate-400">
                          Invite members using the form above.
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-hidden rounded-2xl ring-1 ring-slate-200/70">
                        {assignments.map((assignment, index) => (
                          <div
                            key={assignment.id}
                            className={`flex items-center justify-between gap-4 px-4 py-4 transition-colors hover:bg-[#F7FAFA] ${
                              index !== assignments.length - 1
                                ? 'border-b border-slate-100'
                                : ''
                            }`}
                          >
                            <div className="flex min-w-0 items-center gap-3">

                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EBF2F2] text-xs font-bold text-[#3D6BB4]">
                                {assignment.invitedEmail
                                  ?.charAt(0)
                                  ?.toUpperCase() || '?'}
                              </div>

                              <div className="min-w-0">
                                <p className="truncate text-xs font-semibold text-[#1A2B48]">
                                  {assignment.invitedEmail}
                                </p>

                                <p className="mt-1 text-[9px] text-slate-400">
                                  Recky planner
                                </p>
                              </div>

                            </div>

                            <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.08em] text-emerald-700">
                              {assignment.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* =================================================
                EXPENSE FORM
            ================================================= */}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card className="overflow-hidden rounded-[28px] border-0 bg-white shadow-[0_20px_70px_rgba(26,43,72,0.07)] ring-1 ring-[#88B3D8]/20">

                <CardHeader className="border-b border-slate-100 px-5 py-6 sm:px-7">

                  <div className="mb-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#688BB0]">
                    Financial Tracking
                  </div>

                  <CardTitle className="text-lg font-semibold tracking-tight text-[#1A2B48]">
                    Log Expense
                  </CardTitle>

                  <CardDescription className="mt-2 text-xs leading-5 text-slate-400">
                    Record reconnaissance expenses against
                    the event budget.
                  </CardDescription>

                </CardHeader>

                <CardContent className="px-5 py-6 sm:px-7">

                  <form
                    onSubmit={handleAddExpense}
                    className="flex flex-col gap-5"
                  >

                    {/* Category */}

                    <div>
                      <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                        Category
                      </label>

                      <select
                        value={expenseForm.category}
                        disabled={addingExpense}
                        onChange={(e) =>
                          setExpenseForm((prev) => ({
                            ...prev,
                            category: e.target.value,
                          }))
                        }
                        className="h-11 w-full appearance-none rounded-xl border-0 bg-[#F4F7F7] px-4 text-xs font-medium text-[#1A2B48] outline-none ring-1 ring-slate-200 transition-all focus:bg-white focus:ring-[#3D6BB4] disabled:opacity-60"
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

                    {/* Description */}

                    <div>
                      <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                        Description
                      </label>

                      <Textarea
                        value={expenseForm.description}
                        disabled={addingExpense}
                        onChange={(e) =>
                          setExpenseForm((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        required
                        placeholder="Describe the expense..."
                        className="min-h-[105px] resize-none rounded-xl border-0 bg-[#F4F7F7] px-4 py-3 text-xs font-medium text-[#1A2B48] shadow-none ring-1 ring-slate-200 transition-all placeholder:text-slate-400 focus:bg-white focus:ring-[#3D6BB4]"
                      />
                    </div>

                    {/* Amount */}

                    <div>
                      <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                        Amount (PKR)
                      </label>

                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-[#688BB0]">
                          Rs.
                        </span>

                        <Input
                          type="number"
                          min="0"
                          step="1"
                          value={expenseForm.amount}
                          disabled={addingExpense}
                          onChange={(e) =>
                            setExpenseForm((prev) => ({
                              ...prev,
                              amount: e.target.value,
                            }))
                          }
                          required
                          placeholder="0"
                          className="h-11 rounded-xl border-0 bg-[#F4F7F7] pl-11 pr-4 text-xs font-medium text-[#1A2B48] shadow-none ring-1 ring-slate-200 transition-all placeholder:text-slate-400 focus:bg-white focus:ring-[#3D6BB4]"
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={addingExpense}
                      className="h-11 w-fit rounded-xl bg-[#1A2B48] px-6 text-xs font-semibold text-white shadow-none transition-all hover:bg-[#3D6BB4] disabled:opacity-60"
                    >
                      {addingExpense
                        ? 'Adding...'
                        : 'Add Expense'}

                      {!addingExpense && (
                        <span className="ml-2">
                          ↗
                        </span>
                      )}
                    </Button>

                  </form>

                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* =====================================================
              EXPENSE HISTORY
          ===================================================== */}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="mt-6 overflow-hidden rounded-[28px] border-0 bg-white shadow-[0_20px_70px_rgba(26,43,72,0.07)] ring-1 ring-[#88B3D8]/20">

              <CardHeader className="border-b border-slate-100 px-5 py-6 sm:px-7">

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                  <div>
                    <div className="mb-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#688BB0]">
                      Financial History
                    </div>

                    <CardTitle className="text-lg font-semibold tracking-tight text-[#1A2B48]">
                      Expenses So Far
                    </CardTitle>

                    <CardDescription className="mt-1 text-xs text-slate-400">
                      All reconnaissance expenses recorded
                      for this event.
                    </CardDescription>
                  </div>

                  <div className="rounded-full bg-[#EBF2F2] px-4 py-2 text-xs font-semibold text-[#1A2B48]">
                    Rs. {formattedTotal}
                  </div>

                </div>
              </CardHeader>

              <CardContent className="p-0">

                {loadingExpenses ? (
                  <div className="space-y-3 px-5 py-6 sm:px-7">
                    {[1, 2, 3].map((item) => (
                      <div
                        key={item}
                        className="h-14 animate-pulse rounded-xl bg-[#F4F7F7]"
                      />
                    ))}
                  </div>
                ) : expenses.length === 0 ? (

                  <div className="px-5 py-14 text-center sm:px-7">

                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#EBF2F2] text-xs font-bold text-[#3D6BB4]">
                      Rs
                    </div>

                    <p className="text-sm font-semibold text-[#1A2B48]">
                      No expenses logged yet
                    </p>

                    <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-400">
                      Reconnaissance expenses will appear
                      here once they are recorded.
                    </p>

                  </div>

                ) : (

                  <div>

                    {/* Desktop Header */}

                    <div className="hidden grid-cols-[1fr_1.6fr_160px] gap-5 border-b border-slate-100 bg-[#F7FAFA] px-5 py-3 sm:grid sm:px-7">

                      <span className="text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                        Category
                      </span>

                      <span className="text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                        Description
                      </span>

                      <span className="text-right text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                        Amount
                      </span>

                    </div>

                    {expenses.map((expense, index) => (
                      <div
                        key={expense.id}
                        className={`grid gap-4 px-5 py-5 transition-colors hover:bg-[#F7FAFA] sm:grid-cols-[1fr_1.6fr_160px] sm:items-center sm:px-7 ${
                          index !== expenses.length - 1
                            ? 'border-b border-slate-100'
                            : ''
                        }`}
                      >

                        {/* Category */}

                        <div>
                          <span className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400 sm:hidden">
                            Category
                          </span>

                          <span
                            className={`inline-flex rounded-full px-3 py-1.5 text-[9px] font-semibold capitalize ${
                              CATEGORY_STYLES[
                                expense.category
                              ] ||
                              CATEGORY_STYLES.misc
                            }`}
                          >
                            {expense.category}
                          </span>
                        </div>

                        {/* Description */}

                        <div>
                          <span className="mb-1 block text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400 sm:hidden">
                            Description
                          </span>

                          <p className="text-xs font-medium leading-5 text-[#1A2B48]">
                            {expense.description}
                          </p>
                        </div>

                        {/* Amount */}

                        <div className="sm:text-right">
                          <span className="mb-1 block text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400 sm:hidden">
                            Amount
                          </span>

                          <p className="text-sm font-semibold text-[#1A2B48]">
                            Rs.{' '}
                            {Number(
                              expense.amount || 0
                            ).toLocaleString('en-PK')}
                          </p>
                        </div>

                      </div>
                    ))}

                  </div>
                )}

              </CardContent>
            </Card>
          </motion.div>

          {/* =====================================================
              FOOTER NOTE
          ===================================================== */}

          <div className="mt-5 flex flex-col gap-2 px-2 pb-6 text-[9px] text-slate-400 sm:flex-row sm:items-center sm:justify-between">

            <span>
              Recky assignments and expenses are specific
              to this event.
            </span>

            <span className="font-medium">
              GIKI Adventure Club · Admin Portal
            </span>

          </div>

        </div>
      </div>
    </AdminLayout>
  );
}