import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '@/lib/axios';
import PublicLayout from '@/components/public/PublicLayout';

const STATUS_LABELS = {
  coming_soon: 'Coming Soon',
  confirmed: 'Confirmed',
};

const STATUS_COLORS = {
  coming_soon: 'bg-[#EBF2F2] text-[#3D6BB4]',
  confirmed: 'bg-[#E4F3EC] text-[#28734A]',
};

export default function EventsBrowse() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/events')
      .then(({ data }) => setEvents(data.events))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PublicLayout>
      <main className="min-h-screen overflow-hidden bg-[#EBF2F2]">

        {/* Decorative background */}
        <div className="pointer-events-none absolute -right-40 top-20 h-96 w-96 rounded-full bg-[#88B3D8]/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 py-12 sm:px-10 lg:px-16 lg:py-20">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12 flex flex-col justify-between gap-8 sm:flex-row sm:items-end"
          >
            <div>
              <div className="mb-5 flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-[#3D6BB4]" />

                <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#688BB0]">
                  Explore with GAC
                </span>
              </div>

              <h1 className="text-5xl font-semibold leading-[0.95] tracking-[-0.05em] text-[#1A2B48] sm:text-6xl lg:text-7xl">
                Upcoming
                <br />
                <span className="text-[#3D6BB4]">Events</span>
              </h1>
            </div>

            <div className="max-w-sm">
              <p className="text-sm leading-7 text-[#688BB0]">
                Discover the next hiking and trekking adventures planned by
                GIKI students across northern Pakistan.
              </p>
            </div>
          </motion.div>

          {/* Loading */}
          {loading && (
            <div className="rounded-[2rem] bg-white p-10 text-center shadow-[0_15px_50px_rgba(26,43,72,0.06)]">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-[#88B3D8]/30 border-t-[#3D6BB4]" />

              <p className="text-sm text-[#688BB0]">
                Loading events...
              </p>
            </div>
          )}

          {/* Empty */}
          {!loading && events.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-[2rem] bg-[#1A2B48] p-10 text-center sm:p-16"
            >
              <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full border border-[#88B3D8]/10" />

              <div className="relative">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-xl text-[#1A2B48]">
                  ↗
                </span>

                <h2 className="mt-7 text-3xl font-semibold text-white">
                  No adventures yet
                </h2>

                <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-white/50">
                  No events open right now — check back soon.
                </p>
              </div>
            </motion.div>
          )}

          {/* Events */}
          {!loading && events.length > 0 && (
            <div className="grid grid-cols-1 gap-7 md:grid-cols-2">

              {events.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 25 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.6,
                    delay: index * 0.08,
                  }}
                >
                  <Link
                    to={`/events/${event.slug}`}
                    className="group block h-full"
                  >
                    <article className="h-full overflow-hidden rounded-[2rem] bg-white shadow-[0_15px_50px_rgba(26,43,72,0.07)] transition-all duration-500 group-hover:-translate-y-1 group-hover:shadow-[0_25px_70px_rgba(26,43,72,0.12)]">

                      {/* Image */}
                      <div className="relative h-72 overflow-hidden bg-[#1A2B48] sm:h-80">

                        {event.coverImageUrl ? (
                          <img
                            src={event.coverImageUrl}
                            alt={event.title}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-[#1A2B48]">
                            <span className="text-6xl font-semibold text-[#88B3D8]/20">
                              GAC
                            </span>
                          </div>
                        )}

                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1A2B48]/70 via-transparent to-transparent" />

                        {/* Status */}
                        <div className="absolute left-5 top-5">
                          <span
                            className={`inline-flex rounded-full px-4 py-2 text-xs font-semibold ${STATUS_COLORS[event.status]}`}
                          >
                            {STATUS_LABELS[event.status]}
                          </span>
                        </div>

                        {/* Arrow */}
                        <div className="absolute bottom-5 right-5 flex h-11 w-11 items-center justify-center rounded-full bg-white text-lg text-[#1A2B48] transition-all duration-300 group-hover:bg-[#88B3D8] group-hover:text-white">
                          ↗
                        </div>

                        {/* Location */}
                        <div className="absolute bottom-6 left-6">
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/60">
                            Destination
                          </p>

                          <p className="mt-1 text-sm font-medium text-white">
                            {event.location}
                          </p>
                        </div>
                      </div>

                      {/* Information */}
                      <div className="p-6 sm:p-7">

                        <div className="flex items-start justify-between gap-4">
                          <h3 className="max-w-md text-2xl font-semibold leading-tight tracking-[-0.03em] text-[#1A2B48] transition-colors duration-300 group-hover:text-[#3D6BB4]">
                            {event.title}
                          </h3>

                          <span className="shrink-0 text-xs font-semibold uppercase tracking-[0.12em] text-[#688BB0]">
                            GAC
                          </span>
                        </div>

                        <div className="mt-6 flex items-end justify-between border-t border-[#88B3D8]/20 pt-5">

                          <div>
                            {event.startDate && (
                              <>
                                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#688BB0]">
                                  Date
                                </p>

                                <p className="mt-1 text-sm font-medium text-[#1A2B48]">
                                  {new Date(
                                    event.startDate
                                  ).toLocaleDateString('en-US', {
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric',
                                  })}
                                </p>
                              </>
                            )}
                          </div>

                          <div className="text-right">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#688BB0]">
                              Ticket
                            </p>

                            <p className="mt-1 text-lg font-semibold text-[#1A2B48]">
                              Rs. {event.ticketPrice}
                            </p>
                          </div>

                        </div>
                      </div>
                    </article>
                  </Link>
                </motion.div>
              ))}

            </div>
          )}

          {/* Bottom label */}
          {!loading && events.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-10 flex items-center justify-between"
            >
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#688BB0]">
                GAC beyond the ordinary
              </p>

              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#88B3D8]" />
                <span className="h-1.5 w-1.5 rounded-full bg-[#5F97DF]" />
                <span className="h-1.5 w-1.5 rounded-full bg-[#3D6BB4]" />
              </div>
            </motion.div>
          )}

        </div>
      </main>
    </PublicLayout>
  );
}