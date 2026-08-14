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
      setEvents(data.events || []);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to load events.'
      );
    } finally {
      setIsLoading(false);
    }
  }

  function handleFormChange(e) {
    const { id, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [id]: value,
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

      await fetchEvents();
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to create event.'
      );
    } finally {
      setCreating(false);
    }
  }

  async function handleSaveWhatsappLink(eventId, link) {
    setError('');

    try {
      await api.patch(`/events/${eventId}`, {
        whatsappGroupLink: link,
      });

      await fetchEvents();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to save WhatsApp link.'
      );
    }
  }

  async function handleStatusChange(eventId, newStatus) {
    setError('');

    try {
      await api.patch(`/events/${eventId}/status`, {
        status: newStatus,
      });

      await fetchEvents();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to update status.'
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
      await fetchEvents();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to delete event.'
      );
    }
  }

  const upcomingEvents = events.filter(
    (event) =>
      event.status === 'coming_soon' ||
      event.status === 'confirmed'
  ).length;

  const draftEvents = events.filter(
    (event) => event.status === 'draft'
  ).length;

  const completedEvents = events.filter(
    (event) => event.status === 'passed'
  ).length;

  return (
    <AdminLayout>
      <div className="min-h-screen w-full overflow-x-hidden bg-[#EBF2F2]">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-5 sm:py-8 lg:px-8 lg:py-10">

          {/* =====================================================
              HEADER
          ====================================================== */}
          <section className="mb-7 sm:mb-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">

              <div className="min-w-0">
                <div className="mb-3 flex items-center gap-2">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-[#5F97DF]" />

                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#688BB0] sm:text-xs">
                    GAC / Event Management
                  </p>
                </div>

                <h1 className="max-w-3xl text-3xl font-semibold leading-tight tracking-tight text-[#1A2B48] sm:text-4xl lg:text-5xl">
                  Manage your adventures.
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-[#688BB0] sm:text-base">
                  Create events, manage their status, and organize
                  the planning behind every GAC adventure.
                </p>
              </div>

              <Button
                onClick={() =>
                  setShowCreateForm((prev) => !prev)
                }
                className="
                  h-11
                  w-full
                  shrink-0
                  rounded-full
                  bg-[#1A2B48]
                  px-6
                  text-sm
                  font-medium
                  text-white
                  shadow-sm
                  transition-all
                  hover:bg-[#294263]
                  hover:shadow-md
                  sm:h-12
                  sm:w-auto
                "
              >
                {showCreateForm ? 'Close Form' : '+ New Event'}
              </Button>
            </div>
          </section>

          {/* =====================================================
              STATS
          ====================================================== */}
          {!isLoading && (
            <section className="mb-7 grid grid-cols-2 gap-3 sm:gap-4 lg:mb-8 lg:grid-cols-4">

              <div className="min-w-0 rounded-[20px] border border-white/70 bg-white/70 p-4 backdrop-blur-sm sm:rounded-[24px] sm:p-5">
                <p className="truncate text-[10px] font-medium uppercase tracking-wider text-[#688BB0] sm:text-xs">
                  Total Events
                </p>

                <p className="mt-2 text-2xl font-semibold text-[#1A2B48] sm:text-3xl">
                  {events.length}
                </p>
              </div>

              <div className="min-w-0 rounded-[20px] border border-white/70 bg-white/70 p-4 backdrop-blur-sm sm:rounded-[24px] sm:p-5">
                <p className="truncate text-[10px] font-medium uppercase tracking-wider text-[#688BB0] sm:text-xs">
                  Upcoming
                </p>

                <p className="mt-2 text-2xl font-semibold text-[#1A2B48] sm:text-3xl">
                  {upcomingEvents}
                </p>
              </div>

              <div className="min-w-0 rounded-[20px] border border-white/70 bg-white/70 p-4 backdrop-blur-sm sm:rounded-[24px] sm:p-5">
                <p className="truncate text-[10px] font-medium uppercase tracking-wider text-[#688BB0] sm:text-xs">
                  Drafts
                </p>

                <p className="mt-2 text-2xl font-semibold text-[#1A2B48] sm:text-3xl">
                  {draftEvents}
                </p>
              </div>

              <div className="min-w-0 rounded-[20px] border border-white/70 bg-white/70 p-4 backdrop-blur-sm sm:rounded-[24px] sm:p-5">
                <p className="truncate text-[10px] font-medium uppercase tracking-wider text-[#688BB0] sm:text-xs">
                  Completed
                </p>

                <p className="mt-2 text-2xl font-semibold text-[#1A2B48] sm:text-3xl">
                  {completedEvents}
                </p>
              </div>

            </section>
          )}

          {/* =====================================================
              ERROR
          ====================================================== */}
          {error && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm leading-5 text-red-700 sm:px-5">
              {error}
            </div>
          )}

          {/* =====================================================
              CREATE EVENT
          ====================================================== */}
          {showCreateForm && (
            <Card className="mb-8 overflow-hidden rounded-[24px] border-0 bg-[#1A2B48] text-white shadow-xl sm:rounded-[30px]">

              <CardHeader className="border-b border-white/10 px-5 py-5 sm:px-6 sm:py-6 lg:px-8">
                <div className="flex items-start justify-between gap-4">

                  <div className="min-w-0">
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#88B3D8] sm:text-xs">
                      New adventure
                    </p>

                    <CardTitle className="text-xl font-semibold text-white sm:text-2xl">
                      Create New Event
                    </CardTitle>

                    <CardDescription className="mt-2 max-w-xl text-xs leading-5 text-[#B9CDE0] sm:text-sm sm:leading-6">
                      Start with a draft and publish it when
                      everything is ready.
                    </CardDescription>
                  </div>

                  <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#88B3D8]/15 sm:flex">
                    <span className="text-xl">↗</span>
                  </div>

                </div>
              </CardHeader>

              <CardContent className="px-5 py-6 sm:px-6 sm:py-7 lg:px-8">

                <form
                  onSubmit={handleCreate}
                  className="grid grid-cols-1 gap-5 md:grid-cols-2"
                >

                  {/* TITLE */}
                  <div className="min-w-0 md:col-span-2">
                    <Label
                      htmlFor="title"
                      className="mb-2 block text-[10px] font-medium uppercase tracking-wider text-[#B9CDE0] sm:text-xs"
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
                        h-11
                        w-full
                        rounded-xl
                        border-white/10
                        bg-white/10
                        text-sm
                        text-white
                        placeholder:text-white/35
                        focus-visible:ring-[#88B3D8]
                        sm:h-12
                      "
                    />
                  </div>

                  {/* DESCRIPTION */}
                  <div className="min-w-0 md:col-span-2">
                    <Label
                      htmlFor="description"
                      className="mb-2 block text-[10px] font-medium uppercase tracking-wider text-[#B9CDE0] sm:text-xs"
                    >
                      Description
                    </Label>

                    <Textarea
                      id="description"
                      value={form.description}
                      onChange={handleFormChange}
                      placeholder="Tell students what this adventure is about..."
                      className="
                        min-h-[110px]
                        w-full
                        resize-none
                        rounded-xl
                        border-white/10
                        bg-white/10
                        text-sm
                        text-white
                        placeholder:text-white/35
                        focus-visible:ring-[#88B3D8]
                        sm:min-h-[120px]
                      "
                    />
                  </div>

                  {/* LOCATION */}
                  <div className="min-w-0">
                    <Label
                      htmlFor="location"
                      className="mb-2 block text-[10px] font-medium uppercase tracking-wider text-[#B9CDE0] sm:text-xs"
                    >
                      Location
                    </Label>

                    <Input
                      id="location"
                      value={form.location}
                      onChange={handleFormChange}
                      placeholder="e.g. Hunza, Gilgit-Baltistan"
                      className="
                        h-11
                        w-full
                        rounded-xl
                        border-white/10
                        bg-white/10
                        text-sm
                        text-white
                        placeholder:text-white/35
                        focus-visible:ring-[#88B3D8]
                        sm:h-12
                      "
                    />
                  </div>

                  {/* CAPACITY */}
                  <div className="min-w-0">
                    <Label
                      htmlFor="capacity"
                      className="mb-2 block text-[10px] font-medium uppercase tracking-wider text-[#B9CDE0] sm:text-xs"
                    >
                      Capacity
                    </Label>

                    <Input
                      id="capacity"
                      type="number"
                      min="1"
                      value={form.capacity}
                      onChange={handleFormChange}
                      className="
                        h-11
                        w-full
                        rounded-xl
                        border-white/10
                        bg-white/10
                        text-sm
                        text-white
                        focus-visible:ring-[#88B3D8]
                        sm:h-12
                      "
                    />
                  </div>

                  {/* START DATE */}
                  <div className="min-w-0">
                    <Label
                      htmlFor="startDate"
                      className="mb-2 block text-[10px] font-medium uppercase tracking-wider text-[#B9CDE0] sm:text-xs"
                    >
                      Start Date
                    </Label>

                    <Input
                      id="startDate"
                      type="date"
                      value={form.startDate}
                      onChange={handleFormChange}
                      className="
                        h-11
                        w-full
                        min-w-0
                        rounded-xl
                        border-white/10
                        bg-white/10
                        text-sm
                        text-white
                        focus-visible:ring-[#88B3D8]
                        sm:h-12
                      "
                    />
                  </div>

                  {/* END DATE */}
                  <div className="min-w-0">
                    <Label
                      htmlFor="endDate"
                      className="mb-2 block text-[10px] font-medium uppercase tracking-wider text-[#B9CDE0] sm:text-xs"
                    >
                      End Date
                    </Label>

                    <Input
                      id="endDate"
                      type="date"
                      value={form.endDate}
                      onChange={handleFormChange}
                      className="
                        h-11
                        w-full
                        min-w-0
                        rounded-xl
                        border-white/10
                        bg-white/10
                        text-sm
                        text-white
                        focus-visible:ring-[#88B3D8]
                        sm:h-12
                      "
                    />
                  </div>

                  {/* PRICE */}
                  <div className="min-w-0">
                    <Label
                      htmlFor="ticketPrice"
                      className="mb-2 block text-[10px] font-medium uppercase tracking-wider text-[#B9CDE0] sm:text-xs"
                    >
                      Ticket Price (PKR)
                    </Label>

                    <Input
                      id="ticketPrice"
                      type="number"
                      min="0"
                      value={form.ticketPrice}
                      onChange={handleFormChange}
                      className="
                        h-11
                        w-full
                        rounded-xl
                        border-white/10
                        bg-white/10
                        text-sm
                        text-white
                        focus-visible:ring-[#88B3D8]
                        sm:h-12
                      "
                    />
                  </div>

                  {/* CREATE BUTTON */}
                  <div className="flex items-end md:justify-end">
                    <Button
                      type="submit"
                      disabled={creating}
                      className="
                        h-11
                        w-full
                        rounded-xl
                        bg-[#88B3D8]
                        px-8
                        font-semibold
                        text-[#1A2B48]
                        hover:bg-[#A5C8E4]
                        sm:h-12
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

          {/* =====================================================
              EVENT SECTION HEADER
          ====================================================== */}
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#688BB0] sm:text-xs">
                Your events
              </p>

              <h2 className="mt-1 text-xl font-semibold text-[#1A2B48] sm:text-2xl">
                Adventure catalogue
              </h2>
            </div>

            {!isLoading && events.length > 0 && (
              <span className="w-fit rounded-full bg-white px-4 py-2 text-[10px] font-medium text-[#688BB0] shadow-sm sm:text-xs">
                {events.length} {events.length === 1 ? 'event' : 'events'}
              </span>
            )}

          </div>

          {/* =====================================================
              LOADING
          ====================================================== */}
          {isLoading ? (
            <div className="rounded-[24px] bg-white p-10 text-center shadow-sm sm:rounded-[30px] sm:p-12">

              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-[#DDE6ED] border-t-[#3D6BB4]" />

              <p className="text-sm text-[#688BB0]">
                Loading adventures...
              </p>

            </div>
          ) : events.length === 0 ? (

            /* =====================================================
                EMPTY STATE
            ====================================================== */
            <div className="rounded-[24px] bg-[#1A2B48] p-8 text-center text-white shadow-xl sm:rounded-[30px] sm:p-12 md:p-16">

              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#88B3D8]/15 text-xl sm:mb-6 sm:h-16 sm:w-16 sm:text-2xl">
                ↗
              </div>

              <h3 className="text-xl font-semibold sm:text-2xl">
                No adventures yet.
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#B9CDE0]">
                Create your first GAC event and start planning
                the next adventure.
              </p>

              <Button
                onClick={() => setShowCreateForm(true)}
                className="
                  mt-6
                  w-full
                  rounded-full
                  bg-[#88B3D8]
                  px-6
                  text-[#1A2B48]
                  hover:bg-[#A5C8E4]
                  sm:w-auto
                "
              >
                + Create First Event
              </Button>

            </div>

          ) : (

            /* =====================================================
                EVENT LIST
            ====================================================== */
            <div className="grid grid-cols-1 gap-4 sm:gap-5">

              {events.map((event, index) => (
                <Card
                  key={event.id}
                  className="
                    group
                    w-full
                    overflow-hidden
                    rounded-[24px]
                    border-0
                    bg-white
                    shadow-sm
                    transition-all
                    duration-300
                    hover:shadow-xl
                    sm:rounded-[30px]
                    lg:hover:-translate-y-1
                  "
                >
                  <CardContent className="p-0">

                    <div className="flex min-w-0 flex-col lg:flex-row">

                      {/* =================================================
                          LEFT ACCENT
                      ================================================== */}
                      <div
                        className="
                          relative
                          flex
                          min-h-[145px]
                          w-full
                          shrink-0
                          flex-col
                          justify-between
                          overflow-hidden
                          bg-[#1A2B48]
                          p-5
                          sm:min-h-[160px]
                          sm:p-6
                          lg:min-h-[220px]
                          lg:w-[190px]
                        "
                      >

                        <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-[#88B3D8]/10" />

                        <div className="absolute -bottom-16 -left-10 h-32 w-32 rounded-full bg-[#3D6BB4]/20" />

                        <div className="relative">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#88B3D8] sm:text-xs">
                            Adventure
                          </p>

                          <p className="mt-2 text-4xl font-semibold text-white sm:text-5xl">
                            {String(index + 1).padStart(2, '0')}
                          </p>
                        </div>

                        <div className="relative">
                          <p className="text-[10px] text-[#B9CDE0] sm:text-xs">
                            Capacity
                          </p>

                          <p className="mt-1 text-sm font-medium text-white">
                            {event.capacity || 0} people
                          </p>
                        </div>

                      </div>

                      {/* =================================================
                          MAIN EVENT CONTENT
                      ================================================== */}
                      <div className="flex min-w-0 flex-1 flex-col justify-between p-5 sm:p-6 md:p-7">

                        {/* EVENT INFO */}
                        <div className="min-w-0">

                          {/* STATUS + PRICE */}
                          <div className="mb-3 flex flex-wrap items-center gap-2">

                            <span
                              className={`
                                rounded-full
                                border
                                px-3
                                py-1
                                text-[10px]
                                font-semibold
                                uppercase
                                tracking-wide
                                sm:text-[11px]
                                ${STATUS_STYLES[event.status] || STATUS_STYLES.draft}
                              `}
                            >
                              {STATUS_LABELS[event.status] ||
                                event.status}
                            </span>

                            <span className="text-[11px] text-[#867C7C] sm:text-xs">
                              PKR{' '}
                              {Number(
                                event.ticketPrice || 0
                              ).toLocaleString()}
                            </span>

                          </div>

                          {/* TITLE */}
                          <h3 className="break-words text-xl font-semibold leading-tight tracking-tight text-[#1A2B48] sm:text-2xl md:text-3xl">
                            {event.title}
                          </h3>

                          {/* DESCRIPTION */}
                          {event.description && (
                            <p className="mt-3 max-w-3xl break-words text-sm leading-6 text-[#688BB0]">
                              {event.description}
                            </p>
                          )}

                          {/* META */}
                          <div className="mt-4 flex min-w-0 flex-col gap-2 text-sm text-[#688BB0] sm:flex-row sm:flex-wrap sm:gap-x-5 sm:gap-y-2">

                            <span className="flex min-w-0 items-start gap-2">
                              <span className="shrink-0 text-[#3D6BB4]">
                                ⌖
                              </span>

                              <span className="break-words">
                                {event.location ||
                                  'Location not specified'}
                              </span>
                            </span>

                            {event.startDate && (
                              <span className="flex items-center gap-2">
                                <span className="shrink-0 text-[#3D6BB4]">
                                  ◷
                                </span>

                                <span>
                                  {new Date(
                                    event.startDate
                                  ).toLocaleDateString(
                                    'en-US',
                                    {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric',
                                    }
                                  )}
                                </span>
                              </span>
                            )}

                            {event.endDate && (
                              <span className="flex items-center gap-2">
                                <span className="shrink-0 text-[#3D6BB4]">
                                  → 
                                </span>

                                <span>
                                  {new Date(
                                    event.endDate
                                  ).toLocaleDateString(
                                    'en-US',
                                    {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric',
                                    }
                                  )}
                                </span>
                              </span>
                            )}

                          </div>

                          {/* =================================================
                              WHATSAPP GROUP
                          ================================================== */}
                          <div className="mt-5 w-full max-w-xl">

                            <Label
                              htmlFor={`whatsapp-${event.id}`}
                              className="mb-2 block text-[10px] font-medium uppercase tracking-[0.14em] text-[#688BB0]"
                            >
                              WhatsApp Group
                            </Label>

                            <div className="flex w-full flex-col gap-2 sm:flex-row">

                              <Input
                                id={`whatsapp-${event.id}`}
                                type="url"
                                defaultValue={
                                  event.whatsappGroupLink || ''
                                }
                                placeholder="https://chat.whatsapp.com/..."
                                className="
                                  h-10
                                  min-w-0
                                  flex-1
                                  rounded-xl
                                  border-[#D8E4EC]
                                  bg-[#F8FBFC]
                                  text-xs
                                  text-[#1A2B48]
                                  placeholder:text-[#9BAAB7]
                                  focus-visible:ring-[#88B3D8]
                                "
                                onBlur={(e) => {
                                  const value =
                                    e.target.value.trim();

                                  const previous =
                                    event.whatsappGroupLink ||
                                    '';

                                  if (value !== previous) {
                                    handleSaveWhatsappLink(
                                      event.id,
                                      value
                                    );
                                  }
                                }}
                              />

                              {event.whatsappGroupLink && (
                                <a
                                  href={
                                    event.whatsappGroupLink
                                  }
                                  target="_blank"
                                  rel="noreferrer"
                                  className="
                                    flex
                                    h-10
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-xl
                                    bg-[#E8F5EE]
                                    px-4
                                    text-xs
                                    font-semibold
                                    text-[#2F765D]
                                    transition-colors
                                    hover:bg-[#DDEFE7]
                                  "
                                >
                                  Open ↗
                                </a>
                              )}

                            </div>
                          </div>

                        </div>

                        {/* =================================================
                            ACTION AREA
                        ================================================== */}
                        <div
                          className="
                            mt-6
                            flex
                            min-w-0
                            flex-col
                            gap-4
                            border-t
                            border-[#E9EFF2]
                            pt-5
                            xl:flex-row
                            xl:items-center
                            xl:justify-between
                          "
                        >

                          {/* STATUS ACTIONS */}
                          <div className="flex min-w-0 flex-wrap gap-2">

                            {ALLOWED_TRANSITIONS[
                              event.status
                            ]?.map((nextStatus) => (
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
                                  h-9
                                  rounded-full
                                  border-[#D8E4EC]
                                  bg-[#F8FBFC]
                                  px-3
                                  text-[11px]
                                  text-[#3D6BB4]
                                  hover:border-[#88B3D8]
                                  hover:bg-[#EBF2F2]
                                  sm:text-xs
                                "
                              >
                                {nextStatus === 'cancelled'
                                  ? 'Cancel'
                                  : `→ ${STATUS_LABELS[nextStatus]}`}
                              </Button>
                            ))}

                          </div>

                          {/* LINKS */}
                          <div
                            className="
                              flex
                              min-w-0
                              flex-wrap
                              items-center
                              gap-x-5
                              gap-y-3
                              xl:justify-end
                            "
                          >

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
                                h-9
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

          {/* =====================================================
              FOOTER
          ====================================================== */}
          {!isLoading && events.length > 0 && (
            <div
              className="
                mt-8
                flex
                flex-col
                gap-4
                border-t
                border-[#D6E1E6]
                pt-6
                sm:mt-10
                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >

              <p className="text-[10px] text-[#688BB0] sm:text-xs">
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