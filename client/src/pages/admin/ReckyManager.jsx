import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import AdminLayout from '@/components/admin/AdminLayout';

const CATEGORIES = ['logistics', 'operations', 'transport', 'food', 'water', 'misc'];

export default function ReckyManager() {
  const { eventId } = useParams();
  const [assignments, setAssignments] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [error, setError] = useState('');
  const [expenseForm, setExpenseForm] = useState({
    category: 'logistics',
    description: '',
    amount: '',
  });

  useEffect(() => {
    fetchAssignments();
    fetchExpenses();
  }, [eventId]);

  async function fetchAssignments() {
    try {
      const { data } = await api.get(`/recky/events/${eventId}/assignments`);
      setAssignments(data.assignments);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load assignments.');
    }
  }

  async function fetchExpenses() {
    try {
      const { data } = await api.get(`/recky/events/${eventId}/expenses`);
      setExpenses(data.expenses);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load expenses.');
    }
  }

  async function handleInvite(e) {
    e.preventDefault();
    setError('');

    try {
      await api.post(`/recky/events/${eventId}/assign`, {
        email: inviteEmail,
      });

      setInviteEmail('');
      fetchAssignments();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign recky planner.');
    }
  }

  async function handleAddExpense(e) {
    e.preventDefault();
    setError('');

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

      fetchExpenses();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to log expense.');
    }
  }

  const totalSpent = expenses.reduce(
    (sum, e) => sum + Number(e.amount),
    0
  );

  return (
    <AdminLayout>
      <div className="min-h-screen px-5 py-8 md:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">

          {/* ─────────────────────────────────────────────
              HEADER
          ───────────────────────────────────────────── */}

          <div className="mb-8">
            <Link
              to="/admin/events"
              className="mb-5 inline-flex items-center gap-1 text-xs font-medium text-slate-400 transition-colors hover:text-[#3D6BB4]"
            >
              ← Back to Events
            </Link>

            <div className="mb-5 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#3D6BB4]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#3D6BB4]" />
              Event Operations
            </div>

            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <h1 className="text-3xl font-semibold tracking-[-0.04em] text-[#1A2B48] md:text-4xl">
                  Recky Planning
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  Coordinate reconnaissance planning, assign team members,
                  and keep track of expenses for this event.
                </p>
              </div>

              {/* Total Spending */}
              <div className="flex min-w-[210px] items-center gap-4 rounded-2xl bg-white px-5 py-4 shadow-sm ring-1 ring-slate-200/70">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EBF2F2] text-sm font-semibold text-[#3D6BB4]">
                  Rs
                </div>

                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                    Total Spent
                  </p>
                  <p className="mt-1 text-xl font-semibold tracking-tight text-[#1A2B48]">
                    Rs. {totalSpent}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ─────────────────────────────────────────────
              ERROR
          ───────────────────────────────────────────── */}

          {error && (
            <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-semibold">
                !
              </span>

              <span>{error}</span>
            </div>
          )}

          {/* ─────────────────────────────────────────────
              MAIN GRID
          ───────────────────────────────────────────── */}

          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">

            {/* ═══════════════════════════════════════════
                ASSIGN RECKY
            ═══════════════════════════════════════════ */}

            <Card className="overflow-hidden rounded-[24px] border-0 bg-white shadow-sm ring-1 ring-slate-200/70">
              <CardHeader className="border-b border-slate-100 px-5 py-5 md:px-7">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="mb-2 text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                      Team Assignment
                    </div>

                    <CardTitle className="text-base font-semibold text-[#1A2B48]">
                      Assign Recky Planner
                    </CardTitle>

                    <CardDescription className="mt-1 text-xs leading-5 text-slate-400">
                      Invite by email — 2–3 core members typically go on the
                      reconnaissance trip.
                    </CardDescription>
                  </div>

                  <span className="shrink-0 rounded-full bg-[#EBF2F2] px-3 py-1.5 text-[10px] font-medium text-slate-500">
                    {assignments.length}{' '}
                    {assignments.length === 1 ? 'Member' : 'Members'}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="px-5 py-6 md:px-7">
                <form
                  onSubmit={handleInvite}
                  className="flex flex-col gap-3 sm:flex-row"
                >
                  <div className="flex-1">
                    <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                      Member Email
                    </label>

                    <Input
                      type="email"
                      placeholder="member@email.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      required
                      className="h-11 rounded-xl border-0 bg-[#F4F7F7] px-3 text-xs font-medium text-[#1A2B48] shadow-none ring-1 ring-slate-200 transition-all placeholder:text-slate-400 focus:bg-white focus:ring-[#3D6BB4]"
                    />
                  </div>

                  <div className="sm:self-end">
                    <Button
                      type="submit"
                      className="h-11 w-full rounded-xl bg-[#1A2B48] px-5 text-xs font-medium text-white shadow-none transition-all hover:bg-[#263b5d] sm:w-auto"
                    >
                      Invite Member
                    </Button>
                  </div>
                </form>

                {/* Assignments */}
                {assignments.length > 0 && (
                  <div className="mt-7">
                    <div className="mb-3 text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                      Current Assignments
                    </div>

                    <div className="overflow-hidden rounded-2xl ring-1 ring-slate-200/70">
                      {assignments.map((a, index) => (
                        <div
                          key={a.id}
                          className={`flex items-center justify-between gap-4 px-4 py-4 transition-colors hover:bg-[#F7FAFA] ${
                            index !== assignments.length - 1
                              ? 'border-b border-slate-100'
                              : ''
                          }`}
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EBF2F2] text-xs font-semibold text-[#3D6BB4]">
                              {a.invitedEmail?.charAt(0)?.toUpperCase() || '?'}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-xs font-medium text-[#1A2B48]">
                                {a.invitedEmail}
                              </p>

                              <p className="mt-0.5 text-[9px] text-slate-400">
                                Recky planner
                              </p>
                            </div>
                          </div>

                          <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.08em] text-emerald-700">
                            {a.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* ═══════════════════════════════════════════
                EXPENSE FORM
            ═══════════════════════════════════════════ */}

            <Card className="overflow-hidden rounded-[24px] border-0 bg-white shadow-sm ring-1 ring-slate-200/70">
              <CardHeader className="border-b border-slate-100 px-5 py-5 md:px-7">
                <div className="mb-2 text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                  Financial Tracking
                </div>

                <CardTitle className="text-base font-semibold text-[#1A2B48]">
                  Log Expense
                </CardTitle>

                <CardDescription className="mt-1 text-xs leading-5 text-slate-400">
                  Record reconnaissance expenses against the event budget.
                </CardDescription>
              </CardHeader>

              <CardContent className="px-5 py-6 md:px-7">
                <form
                  onSubmit={handleAddExpense}
                  className="flex flex-col gap-5"
                >
                  {/* Category */}
                  <div>
                    <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                      Category
                    </label>

                    <select
                      className="h-11 w-full appearance-none rounded-xl border-0 bg-[#F4F7F7] px-3 text-xs font-medium text-[#1A2B48] outline-none ring-1 ring-slate-200 transition-all focus:bg-white focus:ring-[#3D6BB4]"
                      value={expenseForm.category}
                      onChange={(e) =>
                        setExpenseForm((prev) => ({
                          ...prev,
                          category: e.target.value,
                        }))
                      }
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c.charAt(0).toUpperCase() + c.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                      Description
                    </label>

                    <Textarea
                      id="description"
                      value={expenseForm.description}
                      onChange={(e) =>
                        setExpenseForm((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      required
                      placeholder="Describe the expense..."
                      className="min-h-[100px] resize-none rounded-xl border-0 bg-[#F4F7F7] px-3 py-3 text-xs font-medium text-[#1A2B48] shadow-none ring-1 ring-slate-200 transition-all placeholder:text-slate-400 focus:bg-white focus:ring-[#3D6BB4]"
                    />
                  </div>

                  {/* Amount */}
                  <div>
                    <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                      Amount (PKR)
                    </label>

                    <Input
                      id="amount"
                      type="number"
                      value={expenseForm.amount}
                      onChange={(e) =>
                        setExpenseForm((prev) => ({
                          ...prev,
                          amount: e.target.value,
                        }))
                      }
                      required
                      placeholder="0"
                      className="h-11 rounded-xl border-0 bg-[#F4F7F7] px-3 text-xs font-medium text-[#1A2B48] shadow-none ring-1 ring-slate-200 transition-all placeholder:text-slate-400 focus:bg-white focus:ring-[#3D6BB4]"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="h-11 w-full rounded-xl bg-[#1A2B48] text-xs font-medium text-white shadow-none transition-all hover:bg-[#263b5d]"
                  >
                    Add Expense
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* ─────────────────────────────────────────────
              EXPENSE HISTORY
          ───────────────────────────────────────────── */}

          <Card className="mt-6 overflow-hidden rounded-[24px] border-0 bg-white shadow-sm ring-1 ring-slate-200/70">
            <CardHeader className="border-b border-slate-100 px-5 py-5 md:px-7">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <div className="mb-2 text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                    Expense History
                  </div>

                  <CardTitle className="text-base font-semibold text-[#1A2B48]">
                    Expenses So Far
                  </CardTitle>

                  <CardDescription className="mt-1 text-xs text-slate-400">
                    All reconnaissance expenses recorded for this event.
                  </CardDescription>
                </div>

                <div className="rounded-full bg-[#EBF2F2] px-3 py-1.5 text-[10px] font-semibold text-[#1A2B48]">
                  Rs. {totalSpent}
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {expenses.length === 0 ? (
                <div className="px-5 py-12 text-center md:px-7">
                  <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#EBF2F2] text-xs font-semibold text-[#3D6BB4]">
                    Rs
                  </div>

                  <p className="text-xs font-medium text-[#1A2B48]">
                    No expenses logged yet
                  </p>

                  <p className="mt-1 text-[10px] text-slate-400">
                    Expenses will appear here once they are recorded.
                  </p>
                </div>
              ) : (
                <div>
                  {/* Table Header */}
                  <div className="hidden grid-cols-[1fr_1.5fr_140px] gap-4 border-b border-slate-100 bg-slate-50/50 px-5 py-3 md:grid md:px-7">
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

                  {expenses.map((exp, index) => (
                    <div
                      key={exp.id}
                      className={`grid gap-3 px-5 py-4 transition-colors hover:bg-[#F7FAFA] md:grid-cols-[1fr_1.5fr_140px] md:items-center md:gap-4 md:px-7 ${
                        index !== expenses.length - 1
                          ? 'border-b border-slate-100'
                          : ''
                      }`}
                    >
                      {/* Category */}
                      <div>
                        <span className="mb-1 block text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400 md:hidden">
                          Category
                        </span>

                        <span className="inline-flex rounded-full bg-amber-50 px-3 py-1.5 text-[9px] font-semibold capitalize text-amber-700">
                          {exp.category}
                        </span>
                      </div>

                      {/* Description */}
                      <div>
                        <span className="mb-1 block text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400 md:hidden">
                          Description
                        </span>

                        <p className="text-xs font-medium text-[#1A2B48]">
                          {exp.description}
                        </p>
                      </div>

                      {/* Amount */}
                      <div className="md:text-right">
                        <span className="mb-1 block text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400 md:hidden">
                          Amount
                        </span>

                        <span className="text-sm font-semibold text-[#1A2B48]">
                          Rs. {exp.amount}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* ─────────────────────────────────────────────
              FOOTER
          ───────────────────────────────────────────── */}

          <div className="mt-5 flex flex-col gap-1 px-2 text-[9px] text-slate-400 sm:flex-row sm:items-center sm:justify-between">
            <span>
              Recky assignments and expenses are specific to this event.
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