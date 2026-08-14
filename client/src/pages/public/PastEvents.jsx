import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '@/lib/axios';
import PublicLayout from '@/components/public/PublicLayout';

export default function PastEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/events/past')
      .then(({ data }) => setEvents(data.events))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PublicLayout>
      <main className="min-h-screen overflow-hidden bg-[#EBF2F2]">

        {/* Background decoration */}
        <div className="pointer-events-none absolute -left-40 top-32 h-96 w-96 rounded-full bg-[#88B3D8]/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 py-12 sm:px-10 lg:px-16 lg:py-20">

          {/* =====================================================
              HEADER
          ====================================================== */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-14 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end"
          >
            <div>
              <div className="mb-5 flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-[#3D6BB4]" />

                <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#688BB0]">
                  The GAC Archive
                </span>
              </div>

              <h1 className="text-5xl font-semibold leading-[0.9] tracking-[-0.055em] text-[#1A2B48] sm:text-6xl lg:text-8xl">
                Past
                <br />
                <span className="text-[#3D6BB4]">Trips.</span>
              </h1>
            </div>

            <div className="max-w-md lg:justify-self-end">
              <p className="text-sm leading-7 text-[#688BB0]">
                A look back at where GAC has been — the trails we've walked,
                the places we've discovered, and the memories we've made
                along the way.
              </p>

              {!loading && events.length > 0 && (
                <div className="mt-7 flex items-center gap-4">
                  <span className="text-4xl font-semibold tracking-[-0.04em] text-[#1A2B48]">
                    {events.length}+
                  </span>

                  <span className="max-w-[120px] text-[10px] font-semibold uppercase leading-4 tracking-[0.15em] text-[#688BB0]">
                    Adventures completed
                  </span>
                </div>
              )}
            </div>
          </motion.div>

          {/* =====================================================
              LOADING
          ====================================================== */}
          {loading && (
            <div className="rounded-[2rem] bg-white p-12 text-center shadow-[0_15px_50px_rgba(26,43,72,0.06)]">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-[#88B3D8]/30 border-t-[#3D6BB4]" />

              <p className="text-sm text-[#688BB0]">
                Loading trips...
              </p>
            </div>
          )}

          {/* =====================================================
              EMPTY STATE
          ====================================================== */}
          {!loading && events.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-[2rem] bg-[#1A2B48] p-12 text-center sm:p-20"
            >
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full border border-[#88B3D8]/10" />

              <div className="relative">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-xl text-[#1A2B48]">
                  ↗
                </span>

                <h2 className="mt-7 text-3xl font-semibold text-white">
                  The journey is just beginning
                </h2>

                <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-white/50">
                  No past events yet.
                </p>
              </div>
            </motion.div>
          )}

          {/* =====================================================
              TRIPS
          ====================================================== */}
          {!loading && events.length > 0 && (
            <div className="space-y-8">

              {events.map((event, index) => (
                <motion.article
                  key={event.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.6,
                    delay: index * 0.08,
                  }}
                  className="group relative overflow-hidden rounded-[2rem] bg-white shadow-[0_15px_50px_rgba(26,43,72,0.06)] transition-all duration-500 hover:shadow-[0_25px_70px_rgba(26,43,72,0.11)]"
                >
                  <div className="grid lg:grid-cols-[1.1fr_0.9fr]">

                    {/* =================================================
                        IMAGE
                    ================================================== */}
                    <div className="relative h-72 overflow-hidden bg-[#1A2B48] sm:h-96 lg:h-[420px]">

                      {event.coverImageUrl ? (
                        <img
                          src={event.coverImageUrl}
                          alt={event.title}
                          className="h-full w-full object-cover grayscale-[15%] transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-[#1A2B48]">
                          <span className="text-7xl font-semibold text-[#88B3D8]/20">
                            GAC
                          </span>
                        </div>
                      )}

                      {/* Image overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1A2B48]/70 via-transparent to-transparent" />

                      {/* Trip number */}
                      <div className="absolute left-6 top-6">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-xs font-bold text-[#1A2B48] backdrop-blur-sm">
                          {String(index + 1).padStart(2, '0')}
                        </div>
                      </div>

                      {/* Bottom location */}
                      <div className="absolute bottom-6 left-6">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/60">
                          Destination
                        </p>

                        <p className="mt-1 text-lg font-medium text-white">
                          {event.location}
                        </p>
                      </div>

                    </div>

                    {/* =================================================
                        INFORMATION
                    ================================================== */}
                    <div className="flex flex-col justify-between p-7 sm:p-9 lg:p-12">

                      <div>

                        {/* Archive label */}
                        <div className="mb-7 flex items-center justify-between">
                          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#688BB0]">
                            GAC Expedition
                          </span>

                          <span className="text-xs text-[#688BB0]">
                            {String(index + 1).padStart(2, '0')} /{' '}
                            {String(events.length).padStart(2, '0')}
                          </span>
                        </div>

                        {/* Title */}
                        <h2 className="max-w-lg text-3xl font-semibold leading-[1] tracking-[-0.04em] text-[#1A2B48] sm:text-4xl lg:text-5xl">
                          {event.title}
                        </h2>

                        {/* Description line */}
                        <div className="mt-7 h-px w-16 bg-[#88B3D8]" />

                        <p className="mt-6 max-w-md text-sm leading-7 text-[#688BB0]">
                          Another chapter in the GAC journey through the
                          mountains and landscapes of northern Pakistan.
                        </p>
                      </div>

                      {/* Metadata */}
                      <div className="mt-10">

                        <div className="grid grid-cols-2 gap-6 border-t border-[#88B3D8]/20 pt-6">

                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#688BB0]">
                              Location
                            </p>

                            <p className="mt-2 text-sm font-medium text-[#1A2B48]">
                              {event.location}
                            </p>
                          </div>

                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#688BB0]">
                              Date
                            </p>

                            {event.endDate && (
                              <p className="mt-2 text-sm font-medium text-[#1A2B48]">
                                {new Date(
                                  event.endDate
                                ).toLocaleDateString('en-US', {
                                  month: 'long',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </p>
                            )}
                          </div>

                        </div>

                        {/* Bottom */}
                        <div className="mt-8 flex items-center justify-between">

                          <span className="text-xs font-medium uppercase tracking-[0.16em] text-[#688BB0]">
                            Journey complete
                          </span>

                          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#EBF2F2] text-[#1A2B48] transition-all duration-300 group-hover:bg-[#1A2B48] group-hover:text-white">
                            ↗
                          </div>

                        </div>

                      </div>

                    </div>
                  </div>
                </motion.article>
              ))}

            </div>
          )}

          {/* =====================================================
              FOOTER LABEL
          ====================================================== */}
          {!loading && events.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-12 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#688BB0]">
                Every trail leaves a story.
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