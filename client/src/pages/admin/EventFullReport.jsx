import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/axios';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import AdminLayout from '@/components/admin/AdminLayout';
import EventPicker from './EventPicker';

export default function EventFullReport() {
  const [eventId, setEventId] = useState(null);
  const [event, setEvent] = useState(null);
  const [summary, setSummary] = useState(null);
  const [budgetItems, setBudgetItems] = useState([]);
  const [reckyExpenses, setReckyExpenses] = useState([]);
  const [logisticsItems, setLogisticsItems] = useState([]);
  const [regSummary, setRegSummary] = useState(null);
  const [error, setError] = useState('');

  const fetchAll = useCallback(async () => {
    if (!eventId) return;

    setError('');

    try {
      const [
        eventsRes,
        summaryRes,
        budgetRes,
        reckyRes,
        logisticsRes,
        regRes,
      ] = await Promise.all([
        api.get('/events/admin/all'),
        api.get(`/budget/events/${eventId}/summary`),
        api.get(`/budget/events/${eventId}`),
        api.get(`/recky/events/${eventId}/expenses`),
        api.get(`/logistics/events/${eventId}`),
        api.get(`/registrations/events/${eventId}/analytics`),
      ]);

      setEvent(
        eventsRes.data.events.find(
          (e) => Number(e.id) === Number(eventId)
        )
      );

      setSummary(summaryRes.data.summary);
      setBudgetItems(budgetRes.data.items || []);
      setReckyExpenses(reckyRes.data.expenses || []);
      setLogisticsItems(logisticsRes.data.items || []);
      setRegSummary(regRes.data.summary);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to load report.'
      );
    }
  }, [eventId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  /*
   * ---------------------------------------------------------
   * Derived budget values
   * ---------------------------------------------------------
   */

  const plannedEventBudget = Number(summary?.plannedBudget || 0);
  const plannedReckyBudget = Number(
    summary?.reckyPlannedBudget || 0
  );

  const reckySpent = Number(summary?.reckyTotal || 0);

  /*
   * Event budget excludes recky expenses.
   *
   * preEventTotal + onEventTotal + postEventTotal
   * represent the normal event budget spending.
   */
  const eventSpent =
    Number(summary?.preEventTotal || 0) +
    Number(summary?.onEventTotal || 0) +
    Number(summary?.postEventTotal || 0);

  const eventBudgetRemaining =
    plannedEventBudget - eventSpent;

  const reckyBudgetRemaining =
    plannedReckyBudget - reckySpent;

  const overallPlannedBudget =
    plannedEventBudget + plannedReckyBudget;

  const overallSpent =
    eventSpent + reckySpent;

  const overallRemaining =
    overallPlannedBudget - overallSpent;

  return (
    <AdminLayout>
      <div className="w-full px-4 py-5 sm:px-6 sm:py-7 lg:px-10 lg:py-10">
        <div className="mx-auto w-full max-w-5xl">

          {/* =====================================================
              HEADER
          ====================================================== */}
          <div className="mb-6">
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#3D6BB4]">
              Event Management
            </p>

            <h1 className="text-2xl font-semibold tracking-tight text-[#1A2B48] sm:text-3xl">
              Complete Event Report
            </h1>

            <p className="mt-1.5 text-sm leading-6 text-slate-500">
              Complete financial, registration, logistics, and
              recky report for the selected event.
            </p>

            <div className="mt-5">
              <EventPicker
                selectedEventId={eventId}
                onSelect={setEventId}
              />
            </div>
          </div>

          {/* =====================================================
              ERROR
          ====================================================== */}
          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {!eventId ? (
            <p className="text-sm text-muted-foreground">
              Select an event to view its report.
            </p>
          ) : (
            <div className="flex flex-col gap-6">

              {/* =================================================
                  EVENT INFORMATION
              ================================================== */}
              {event && (
                <Card className="border-slate-200/70 bg-white shadow-sm">
                  <CardContent className="p-5">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#3D6BB4]">
                      Event
                    </p>

                    <h2 className="text-xl font-semibold text-[#1A2B48]">
                      {event.title}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      {event.location}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                        Capacity: {event.capacity}
                      </span>

                      <span className="rounded-full bg-[#EBF2F2] px-3 py-1 text-xs font-medium capitalize text-[#3D6BB4]">
                        Status: {event.status}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* =================================================
                  BUDGET OVERVIEW
              ================================================== */}
              {summary && (
                <div>
                  <div className="mb-3">
                    <h3 className="text-lg font-semibold text-[#1A2B48]">
                      Budget Overview
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Event and recky budgets assigned by Finance.
                    </p>
                  </div>

                  {/* Main Budget Cards */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                    {/* EVENT BUDGET */}
                    <Card className="border-blue-200 bg-blue-50/40 shadow-sm">
                      <CardContent className="p-5">
                        <p className="text-xs font-semibold uppercase tracking-wide text-[#3D6BB4]">
                          Event Budget
                        </p>

                        <p className="mt-2 text-3xl font-bold text-[#1A2B48]">
                          Rs. {plannedEventBudget.toLocaleString()}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Budget assigned for the main event
                        </p>

                        <div className="mt-5 border-t border-blue-100 pt-4">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-500">
                              Event Spent
                            </span>

                            <span className="font-semibold text-[#1A2B48]">
                              Rs. {eventSpent.toLocaleString()}
                            </span>
                          </div>

                          <div className="mt-2 flex items-center justify-between text-sm">
                            <span className="text-slate-500">
                              Remaining
                            </span>

                            <span
                              className={`font-semibold ${
                                eventBudgetRemaining < 0
                                  ? 'text-red-600'
                                  : 'text-emerald-600'
                              }`}
                            >
                              Rs.{' '}
                              {eventBudgetRemaining.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* RECKY BUDGET */}
                    <Card className="border-purple-200 bg-purple-50/40 shadow-sm">
                      <CardContent className="p-5">
                        <p className="text-xs font-semibold uppercase tracking-wide text-purple-600">
                          Recky Budget
                        </p>

                        <p className="mt-2 text-3xl font-bold text-[#1A2B48]">
                          Rs. {plannedReckyBudget.toLocaleString()}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Budget assigned for reconnaissance
                        </p>

                        <div className="mt-5 border-t border-purple-100 pt-4">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-500">
                              Recky Spent
                            </span>

                            <span className="font-semibold text-[#1A2B48]">
                              Rs. {reckySpent.toLocaleString()}
                            </span>
                          </div>

                          <div className="mt-2 flex items-center justify-between text-sm">
                            <span className="text-slate-500">
                              Remaining
                            </span>

                            <span
                              className={`font-semibold ${
                                reckyBudgetRemaining < 0
                                  ? 'text-red-600'
                                  : 'text-emerald-600'
                              }`}
                            >
                              Rs.{' '}
                              {reckyBudgetRemaining.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Overall Financial Summary */}
                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">

                    <Card>
                      <CardContent className="p-4 text-center">
                        <p className="text-xl font-semibold text-[#1A2B48]">
                          Rs.{' '}
                          {overallPlannedBudget.toLocaleString()}
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                          Total Planned
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4 text-center">
                        <p className="text-xl font-semibold text-[#1A2B48]">
                          Rs. {eventSpent.toLocaleString()}
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                          Event Spent
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4 text-center">
                        <p className="text-xl font-semibold text-[#1A2B48]">
                          Rs. {reckySpent.toLocaleString()}
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                          Recky Spent
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4 text-center">
                        <p
                          className={`text-xl font-semibold ${
                            overallRemaining < 0
                              ? 'text-red-600'
                              : 'text-emerald-600'
                          }`}
                        >
                          Rs. {overallRemaining.toLocaleString()}
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                          Total Remaining
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* =================================================
                  REGISTRATIONS
              ================================================== */}
              {regSummary && (
                <div>
                  <h3 className="mb-3 text-lg font-semibold text-[#1A2B48]">
                    Registrations
                  </h3>

                  <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
                    {Object.entries(regSummary).map(
                      ([key, value]) => (
                        <Card key={key}>
                          <CardContent className="p-3 text-center">
                            <p className="text-lg font-semibold text-[#1A2B48]">
                              {value}
                            </p>

                            <p className="mt-1 text-xs capitalize text-muted-foreground">
                              {key.replace(/([A-Z])/g, ' $1')}
                            </p>
                          </CardContent>
                        </Card>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* =================================================
                  BUDGET LINE ITEMS
              ================================================== */}
              <div>
                <div className="mb-3">
                  <h3 className="text-lg font-semibold text-[#1A2B48]">
                    Event Budget Line Items
                  </h3>

                  <p className="text-sm text-slate-500">
                    {budgetItems.length} recorded budget entries.
                  </p>
                </div>

                {budgetItems.length === 0 ? (
                  <Card>
                    <CardContent className="p-6 text-center text-sm text-slate-500">
                      No budget entries found.
                    </CardContent>
                  </Card>
                ) : (
                  <div className="flex flex-col gap-2">
                    {budgetItems.map((item) => (
                      <Card key={item.id}>
                        <CardContent className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm font-medium text-[#1A2B48]">
                              {item.description}
                            </p>

                            <p className="text-xs capitalize text-muted-foreground">
                              {item.category} ·{' '}
                              {item.phase.replace('_', '-')}
                            </p>
                          </div>

                          <span className="text-sm font-semibold text-[#1A2B48]">
                            Rs.{' '}
                            {Number(item.amount).toLocaleString()}
                          </span>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* =================================================
                  RECKY EXPENSES
              ================================================== */}
              <div>
                <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-[#1A2B48]">
                      Recky Expenses
                    </h3>

                    <p className="text-sm text-slate-500">
                      {reckyExpenses.length} recorded recky expenses.
                    </p>
                  </div>

                  {summary && (
                    <div className="text-sm">
                      <span className="text-slate-500">
                        Recky budget:{' '}
                      </span>

                      <span className="font-semibold text-[#1A2B48]">
                        Rs.{' '}
                        {plannedReckyBudget.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                {reckyExpenses.length === 0 ? (
                  <Card>
                    <CardContent className="p-6 text-center text-sm text-slate-500">
                      No recky expenses recorded.
                    </CardContent>
                  </Card>
                ) : (
                  <div className="flex flex-col gap-2">
                    {reckyExpenses.map((exp) => (
                      <Card key={exp.id}>
                        <CardContent className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm font-medium text-[#1A2B48]">
                              {exp.description}
                            </p>

                            <p className="text-xs capitalize text-muted-foreground">
                              {exp.category}
                            </p>
                          </div>

                          <span className="text-sm font-semibold text-[#1A2B48]">
                            Rs.{' '}
                            {Number(exp.amount).toLocaleString()}
                          </span>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* =================================================
                  LOGISTICS
              ================================================== */}
              <div>
                <div className="mb-3">
                  <h3 className="text-lg font-semibold text-[#1A2B48]">
                    Logistics Inventory
                  </h3>

                  <p className="text-sm text-slate-500">
                    {logisticsItems.length} logistics items.
                  </p>
                </div>

                {logisticsItems.length === 0 ? (
                  <Card>
                    <CardContent className="p-6 text-center text-sm text-slate-500">
                      No logistics items found.
                    </CardContent>
                  </Card>
                ) : (
                  <div className="flex flex-col gap-2">
                    {logisticsItems.map((item) => (
                      <Card key={item.id}>
                        <CardContent className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm font-medium text-[#1A2B48]">
                              {item.itemName} × {item.quantity}
                            </p>

                            <p className="text-xs capitalize text-muted-foreground">
                              {item.phase.replace('_', '-')}
                            </p>
                          </div>

                          <span className="w-fit rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium capitalize text-slate-600">
                            {item.status}
                          </span>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}