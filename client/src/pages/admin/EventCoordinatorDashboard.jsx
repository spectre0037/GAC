import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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

const STATUS_LABELS = {
  draft: 'Draft',
  coming_soon: 'Coming Soon',
  confirmed: 'Confirmed',
  passed: 'Passed',
  cancelled: 'Cancelled',
};

const STATUS_STYLES = {
  draft: 'bg-slate-100 text-slate-600 border-slate-200',
  coming_soon: 'bg-[#DDECF8] text-[#3D6BB4] border-[#BBD5EA]',
  confirmed: 'bg-[#DDEFE7] text-[#2F765D] border-[#B9DCCB]',
  passed: 'bg-[#E8EAED] text-[#5F6670] border-[#D6D9DD]',
  cancelled: 'bg-[#F6E2E2] text-[#A34F4F] border-[#EBCACA]',
};

// Mirrors backend ALLOWED_TRANSITIONS
const ALLOWED_TRANSITIONS = {
  draft: ['coming_soon', 'cancelled'],
  coming_soon: ['confirmed', 'draft', 'cancelled'],
  confirmed: ['passed', 'cancelled'],
  passed: [],
  cancelled: [],
};

const INITIAL_FORM = {
  title: '',
  description: '',
  location: '',
  startDate: '',
  endDate: '',
  capacity: 80,
  ticketPrice: 0,
};

export default function EventCoordinatorDashboard() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);

  const [form, setForm] = useState(INITIAL_FORM);

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    setIsLoading(true);

    try {
      const { data } = await api.get('/events/admin/all');
      setEvents(data.events);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to load events.'
      );
    } finally {
      setIsLoading(false);
    }
  }

  function handleFormChange(e) {
    setForm((prev) => ({
      ...prev,
      [e.target.id]: e.target.value,
    }));
  }

  async function handleCreate(e) {
    e.preventDefault();

    setCreating(true);
    setError('');

    try {
      await api.post('/events', form);

      setForm(INITIAL_FORM);
      setShowCreateForm(false);

      fetchEvents();
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to create event.'
      );
    } finally {
      setCreating(false);
    }
  }

  async function handleStatusChange(eventId, newStatus) {
    setError('');

    try {
      await api.patch(`/events/${eventId}/status`, {
        status: newStatus,
      });

      fetchEvents();
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to update status.'
      );
    }
  }

  async function handleDelete(eventId, eventTitle) {
    const confirmed = window.confirm(
      `Permanently delete "${eventTitle}"? This removes all registrations, payments, and budget data for this event. This cannot be undone.`
    );

    if (!confirmed) return;

    setError('');

    try {
      await api.delete(`/events/${eventId}`);
      fetchEvents();
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to delete event.'
      );
    }
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-[#EBF2F2]">
        <div className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-10">

          {/* =========================================================
              HEADER
          ========================================================= */}
          <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">

            <div>
              <div className="mb-3 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#5F97DF]" />

                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#688BB0]">
                  GAC / Event Management
                </p>
              </div>

              <h1 className="text-4xl font-semibold tracking-tight text-[#1A2B48] md:text-5xl">
                Manage your adventures.
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-[#688BB0] md:text-base">
                Create events, manage their status, and organize the
                planning behind every GAC adventure.
              </p>
            </div>

            <Button
              onClick={() => setShowCreateForm((prev) => !prev)}
              className="
                h-12 rounded-full
                bg-[#1A2B48]
                px-6
                text-sm font-medium
                text-white
                shadow-sm
                transition-all
                hover:bg-[#294263]
                hover:shadow-md
              "
            >
              {showCreateForm ? 'Close Form' : '+ New Event'}
            </Button>
          </div>

          {/* =========================================================
              TOP STATS
          ========================================================= */}
          {!isLoading && (
            <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">

              <div className="rounded-[24px] border border-white/70 bg-white/70 p-5 backdrop-blur-sm">
                <p className="text-xs font-medium uppercase tracking-wider text-[#688BB0]">
                  Total Events
                </p>

                <p className="mt-2 text-3xl font-semibold text-[#1A2B48]">
                  {events.length}
                </p>
              </div>

              <div className="rounded-[24px] border border-white/70 bg-white/70 p-5 backdrop-blur-sm">
                <p className="text-xs font-medium uppercase tracking-wider text-[#688BB0]">
                  Upcoming
                </p>

                <p className="mt-2 text-3xl font-semibold text-[#1A2B48]">
                  {
                    events.filter(
                      (event) =>
                        event.status === 'coming_soon' ||
                        event.status === 'confirmed'
                    ).length
                  }
                </p>
              </div>

              <div className="rounded-[24px] border border-white/70 bg-white/70 p-5 backdrop-blur-sm">
                <p className="text-xs font-medium uppercase tracking-wider text-[#688BB0]">
                  Drafts
                </p>

                <p className="mt-2 text-3xl font-semibold text-[#1A2B48]">
                  {
                    events.filter(
                      (event) => event.status === 'draft'
                    ).length
                  }
                </p>
              </div>

              <div className="rounded-[24px] border border-white/70 bg-white/70 p-5 backdrop-blur-sm">
                <p className="text-xs font-medium uppercase tracking-wider text-[#688BB0]">
                  Completed
                </p>

                <p className="mt-2 text-3xl font-semibold text-[#1A2B48]">
                  {
                    events.filter(
                      (event) => event.status === 'passed'
                    ).length
                  }
                </p>
              </div>

            </div>
          )}

          {/* =========================================================
              ERROR
          ========================================================= */}
          {error && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* =========================================================
              CREATE EVENT
          ========================================================= */}
          {showCreateForm && (
            <Card className="mb-8 overflow-hidden rounded-[30px] border-0 bg-[#1A2B48] text-white shadow-xl">

              <CardHeader className="border-b border-white/10 px-6 py-6 md:px-8">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#88B3D8]">
                      New adventure
                    </p>

                    <CardTitle className="text-2xl font-semibold text-white">
                      Create New Event
                    </CardTitle>

                    <CardDescription className="mt-2 text-sm text-[#B9CDE0]">
                      Start with a draft and publish it when everything
                      is ready.
                    </CardDescription>
                  </div>

                  <div className="hidden h-12 w-12 items-center justify-center rounded-2xl bg-[#88B3D8]/15 md:flex">
                    <span className="text-xl">↗</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="px-6 py-7 md:px-8">

                <form
                  onSubmit={handleCreate}
                  className="grid grid-cols-1 gap-5 md:grid-cols-2"
                >

                  {/* TITLE */}
                  <div className="md:col-span-2">
                    <Label
                      htmlFor="title"
                      className="mb-2 block text-xs font-medium uppercase tracking-wider text-[#B9CDE0]"
                    >
                      Event Title
                    </Label>

                    <Input
                      id="title"
                      value={form.title}
                      onChange={handleFormChange}
                      placeholder="e.g. Fairy Meadows Expedition"
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

                  {/* DESCRIPTION */}
                  <div className="md:col-span-2">
                    <Label
                      htmlFor="description"
                      className="mb-2 block text-xs font-medium uppercase tracking-wider text-[#B9CDE0]"
                    >
                      Description
                    </Label>

                    <Textarea
                      id="description"
                      value={form.description}
                      onChange={handleFormChange}
                      placeholder="Tell students what this adventure is about..."
                      className="
                        min-h-[120px]
                        resize-none
                        rounded-xl
                        border-white/10
                        bg-white/10
                        text-white
                        placeholder:text-white/35
                        focus-visible:ring-[#88B3D8]
                      "
                    />
                  </div>

                  {/* LOCATION */}
                  <div>
                    <Label
                      htmlFor="location"
                      className="mb-2 block text-xs font-medium uppercase tracking-wider text-[#B9CDE0]"
                    >
                      Location
                    </Label>

                    <Input
                      id="location"
                      value={form.location}
                      onChange={handleFormChange}
                      placeholder="e.g. Hunza, Gilgit-Baltistan"
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

                  {/* CAPACITY */}
                  <div>
                    <Label
                      htmlFor="capacity"
                      className="mb-2 block text-xs font-medium uppercase tracking-wider text-[#B9CDE0]"
                    >
                      Capacity
                    </Label>

                    <Input
                      id="capacity"
                      type="number"
                      value={form.capacity}
                      onChange={handleFormChange}
                      className="
                        h-12
                        rounded-xl
                        border-white/10
                        bg-white/10
                        text-white
                        focus-visible:ring-[#88B3D8]
                      "
                    />
                  </div>

                  {/* START DATE */}
                  <div>
                    <Label
                      htmlFor="startDate"
                      className="mb-2 block text-xs font-medium uppercase tracking-wider text-[#B9CDE0]"
                    >
                      Start Date
                    </Label>

                    <Input
                      id="startDate"
                      type="date"
                      value={form.startDate}
                      onChange={handleFormChange}
                      className="
                        h-12
                        rounded-xl
                        border-white/10
                        bg-white/10
                        text-white
                        focus-visible:ring-[#88B3D8]
                      "
                    />
                  </div>

                  {/* END DATE */}
                  <div>
                    <Label
                      htmlFor="endDate"
                      className="mb-2 block text-xs font-medium uppercase tracking-wider text-[#B9CDE0]"
                    >
                      End Date
                    </Label>

                    <Input
                      id="endDate"
                      type="date"
                      value={form.endDate}
                      onChange={handleFormChange}
                      className="
                        h-12
                        rounded-xl
                        border-white/10
                        bg-white/10
                        text-white
                        focus-visible:ring-[#88B3D8]
                      "
                    />
                  </div>

                  {/* PRICE */}
                  <div>
                    <Label
                      htmlFor="ticketPrice"
                      className="mb-2 block text-xs font-medium uppercase tracking-wider text-[#B9CDE0]"
                    >
                      Ticket Price (PKR)
                    </Label>

                    <Input
                      id="ticketPrice"
                      type="number"
                      value={form.ticketPrice}
                      onChange={handleFormChange}
                      className="
                        h-12
                        rounded-xl
                        border-white/10
                        bg-white/10
                        text-white
                        focus-visible:ring-[#88B3D8]
                      "
                    />
                  </div>

                  {/* BUTTON */}
                  <div className="flex items-end md:justify-end">
                    <Button
                      type="submit"
                      disabled={creating}
                      className="
                        h-12
                        w-full
                        rounded-xl
                        bg-[#88B3D8]
                        px-8
                        font-semibold
                        text-[#1A2B48]
                        hover:bg-[#A5C8E4]
                        md:w-auto
                      "
                    >
                      {creating
                        ? 'Creating...'
                        : 'Create Event ↗'}
                    </Button>
                  </div>

                </form>
              </CardContent>
            </Card>
          )}

          {/* =========================================================
              EVENTS
          ========================================================= */}
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#688BB0]">
                Your events
              </p>

              <h2 className="mt-1 text-2xl font-semibold text-[#1A2B48]">
                Adventure catalogue
              </h2>
            </div>

            {!isLoading && events.length > 0 && (
              <span className="rounded-full bg-white px-4 py-2 text-xs font-medium text-[#688BB0] shadow-sm">
                {events.length} events
              </span>
            )}
          </div>

          {/* LOADING */}
          {isLoading ? (
            <div className="rounded-[30px] bg-white p-12 text-center shadow-sm">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-[#DDE6ED] border-t-[#3D6BB4]" />

              <p className="text-sm text-[#688BB0]">
                Loading adventures...
              </p>
            </div>
          ) : events.length === 0 ? (

            /* EMPTY */
            <div className="rounded-[30px] bg-[#1A2B48] p-10 text-center text-white shadow-xl md:p-16">

              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#88B3D8]/15 text-2xl">
                ↗
              </div>

              <h3 className="text-2xl font-semibold">
                No adventures yet.
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#B9CDE0]">
                Create your first GAC event and start planning the
                next adventure.
              </p>

              <Button
                onClick={() => setShowCreateForm(true)}
                className="
                  mt-6
                  rounded-full
                  bg-[#88B3D8]
                  px-6
                  text-[#1A2B48]
                  hover:bg-[#A5C8E4]
                "
              >
                + Create First Event
              </Button>
            </div>

          ) : (

            /* EVENT LIST */
            <div className="grid grid-cols-1 gap-5">

              {events.map((event, index) => (
                <Card
                  key={event.id}
                  className="
                    group
                    overflow-hidden
                    rounded-[30px]
                    border-0
                    bg-white
                    shadow-sm
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    hover:shadow-xl
                  "
                >
                  <CardContent className="p-0">

                    <div className="flex flex-col lg:flex-row">

                      {/* LEFT NUMBER / ACCENT */}
                      <div className="relative flex min-h-[180px] w-full shrink-0 flex-col justify-between overflow-hidden bg-[#1A2B48] p-6 lg:w-[190px]">

                        <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-[#88B3D8]/10" />
                        <div className="absolute -bottom-16 -left-10 h-32 w-32 rounded-full bg-[#3D6BB4]/20" />

                        <div className="relative">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#88B3D8]">
                            Adventure
                          </p>

                          <p className="mt-3 text-5xl font-semibold text-white">
                            {String(index + 1).padStart(2, '0')}
                          </p>
                        </div>

                        <div className="relative">
                          <p className="text-xs text-[#B9CDE0]">
                            Capacity
                          </p>

                          <p className="mt-1 text-sm font-medium text-white">
                            {event.capacity} people
                          </p>
                        </div>
                      </div>

                      {/* MAIN CONTENT */}
                      <div className="flex flex-1 flex-col justify-between p-6 md:p-7">

                        <div>

                          <div className="mb-3 flex flex-wrap items-center gap-2">
                            <span
                              className={`
                                rounded-full
                                border
                                px-3
                                py-1
                                text-[11px]
                                font-semibold
                                uppercase
                                tracking-wide
                                ${STATUS_STYLES[event.status]}
                              `}
                            >
                              {STATUS_LABELS[event.status]}
                            </span>

                            <span className="text-xs text-[#867C7C]">
                              PKR {Number(event.ticketPrice).toLocaleString()}
                            </span>
                          </div>

                          <h3 className="text-2xl font-semibold tracking-tight text-[#1A2B48] md:text-3xl">
                            {event.title}
                          </h3>

                          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[#688BB0]">

                            <span className="flex items-center gap-2">
                              <span className="text-[#3D6BB4]">⌖</span>
                              {event.location || 'Location not specified'}
                            </span>

                            {event.startDate && (
                              <span className="flex items-center gap-2">
                                <span className="text-[#3D6BB4]">◷</span>

                                {new Date(
                                  event.startDate
                                ).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </span>
                            )}

                          </div>

                        </div>

                        {/* ACTIONS */}
                        <div className="mt-7 flex flex-col gap-4 border-t border-[#E9EFF2] pt-5 xl:flex-row xl:items-center xl:justify-between">

                          {/* STATUS ACTIONS */}
                          <div className="flex flex-wrap gap-2">

                            {ALLOWED_TRANSITIONS[event.status]?.map(
                              (nextStatus) => (
                                <Button
                                  key={nextStatus}
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleStatusChange(
                                      event.id,
                                      nextStatus
                                    )
                                  }
                                  className="
                                    rounded-full
                                    border-[#D8E4EC]
                                    bg-[#F8FBFC]
                                    text-[#3D6BB4]
                                    hover:border-[#88B3D8]
                                    hover:bg-[#EBF2F2]
                                  "
                                >
                                  {nextStatus === 'cancelled'
                                    ? 'Cancel'
                                    : `→ ${STATUS_LABELS[nextStatus]}`}
                                </Button>
                              )
                            )}

                          </div>

                          {/* LINKS */}
                          <div className="flex flex-wrap items-center gap-4">

                            <Link
                              to={`/admin/events/${event.id}/tickets`}
                              className="
                                text-xs
                                font-semibold
                                text-[#3D6BB4]
                                transition-colors
                                hover:text-[#1A2B48]
                              "
                            >
                              Tickets ↗
                            </Link>

                            <Link
                              to={`/admin/events/${event.id}/recky`}
                              className="
                                text-xs
                                font-semibold
                                text-[#3D6BB4]
                                transition-colors
                                hover:text-[#1A2B48]
                              "
                            >
                              Recky ↗
                            </Link>

                            <Link
                              to={`/admin/events/${event.id}/form`}
                              className="
                                text-xs
                                font-semibold
                                text-[#3D6BB4]
                                transition-colors
                                hover:text-[#1A2B48]
                              "
                            >
                              Form ↗
                            </Link>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleDelete(
                                  event.id,
                                  event.title
                                )
                              }
                              className="
                                rounded-full
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

                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

            </div>
          )}

          {/* =========================================================
              FOOTER DECORATION
          ========================================================= */}
          {!isLoading && events.length > 0 && (
            <div className="mt-10 flex items-center justify-between border-t border-[#D6E1E6] pt-6">

              <p className="text-xs text-[#688BB0]">
                GIKI Adventure Club · Event Operations
              </p>

              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#88B3D8]" />
                <span className="h-1.5 w-1.5 rounded-full bg-[#5F97DF]" />
                <span className="h-1.5 w-1.5 rounded-full bg-[#3D6BB4]" />
              </div>

            </div>
          )}

        </div>
      </div>
    </AdminLayout>
  );
}