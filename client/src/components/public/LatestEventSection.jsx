import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';

export default function LatestEventSection() {
  const [events, setEvents] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLatest();
  }, []);

  async function loadLatest() {
    try {
      const { data } = await api.get('/events');

      if (data.events.length > 0) {
        setEvents(data.events);
      }
    } finally {
      setLoading(false);
    }
  }

  function nextEvent() {
    setCurrentIndex((prev) =>
      prev === events.length - 1 ? 0 : prev + 1
    );
  }

  function previousEvent() {
    setCurrentIndex((prev) =>
      prev === 0 ? events.length - 1 : prev - 1
    );
  }

  if (loading || events.length === 0) return null;

  const event = events[currentIndex];

  return (
    <section className="relative overflow-hidden bg-white px-4 py-16 sm:px-6 sm:py-20 md:px-8 lg:px-12 lg:py-28 xl:px-16">

      {/* Background decoration */}
      <div className="pointer-events-none absolute -left-40 top-20 h-80 w-80 rounded-full bg-[#88B3D8]/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">

        {/* =========================================================
            SECTION HEADING
        ========================================================= */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex items-end justify-between gap-6 sm:mb-10"
        >
          <div>
            <div className="mb-4 flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-[#3D6BB4]" />

              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#688BB0]">
                Coming Up
              </span>
            </div>

            <h2 className="text-3xl font-semibold tracking-[-0.04em] text-[#1A2B48] sm:text-4xl md:text-5xl">
              Where we're going
            </h2>
          </div>

          {/* Carousel Controls */}
          {events.length > 1 && (
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={previousEvent}
                aria-label="Previous event"
                className="
                  flex h-11 w-11
                  items-center justify-center
                  rounded-full
                  border border-[#88B3D8]/50
                  text-lg text-[#3D6BB4]
                  transition-all duration-300
                  hover:bg-[#EBF2F2]
                "
              >
                ←
              </button>

              <button
                type="button"
                onClick={nextEvent}
                aria-label="Next event"
                className="
                  flex h-11 w-11
                  items-center justify-center
                  rounded-full
                  border border-[#88B3D8]/50
                  text-lg text-[#3D6BB4]
                  transition-all duration-300
                  hover:bg-[#EBF2F2]
                "
              >
                →
              </button>
            </div>
          )}
        </motion.div>

        {/* =========================================================
            FEATURED EVENT CAROUSEL
        ========================================================= */}
        <AnimatePresence mode="wait">
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: 25 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -25 }}
            transition={{ duration: 0.35 }}
            className="overflow-hidden rounded-[2rem] bg-[#1A2B48] shadow-[0_30px_80px_rgba(26,43,72,0.12)]"
          >
            <div className="grid lg:grid-cols-[1.35fr_0.65fr]">

              {/* =====================================================
                  IMAGE
              ===================================================== */}
              {event.coverImageUrl && (
                <div className="group relative min-h-[300px] overflow-hidden sm:min-h-[380px] lg:min-h-[520px]">

                  <img
                    src={event.coverImageUrl}
                    alt={event.title}
                    className="
                      absolute inset-0
                      h-full w-full
                      object-cover
                      transition-transform duration-700
                      group-hover:scale-105
                    "
                  />

                  {/* Image overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1A2B48]/60 via-transparent to-transparent" />

                  {/* Destination tag */}
                  <div className="absolute left-5 top-5 sm:left-6 sm:top-6">
                    <div className="rounded-full border border-white/30 bg-[#1A2B48]/50 px-4 py-2 backdrop-blur-md">
                      <span className="text-xs font-medium uppercase tracking-[0.15em] text-white">
                        GAC Expedition
                      </span>
                    </div>
                  </div>

                  {/* Image bottom label */}
                  <div className="absolute bottom-5 left-5 right-5 sm:bottom-6 sm:left-6 sm:right-6">
                    <div className="flex items-end justify-between gap-4">

                      <p className="text-sm font-medium text-white/80">
                        {event.location}
                      </p>

                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-lg text-[#1A2B48]">
                        ↗
                      </span>

                    </div>
                  </div>
                </div>
              )}

              {/* =====================================================
                  EVENT INFORMATION
              ===================================================== */}
              <div className="relative flex flex-col justify-between overflow-hidden p-7 sm:p-10 lg:p-12">

                {/* Decorative circles */}
                <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full border border-[#88B3D8]/15" />

                <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full border border-[#88B3D8]/10" />

                <div className="relative">

                  {/* Status */}
                  <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 lg:mb-10">
                    <span className="h-2 w-2 rounded-full bg-[#88B3D8]" />

                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#88B3D8]">
                      Upcoming
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="max-w-lg text-3xl font-semibold leading-[1.05] tracking-[-0.04em] text-white sm:text-4xl lg:text-5xl">
                    {event.title}
                  </h3>

                  {/* Location */}
                  <div className="mt-7 flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#88B3D8]/10 text-sm text-[#88B3D8]">
                      ●
                    </span>

                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
                        Destination
                      </p>

                      <p className="mt-1 text-sm font-medium text-[#88B3D8]">
                        {event.location}
                      </p>
                    </div>
                  </div>

                  {/* Date */}
                  {event.startDate && (
                    <div className="mt-5 flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#88B3D8]/10 text-sm text-[#88B3D8]">
                        ◷
                      </span>

                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
                          Date
                        </p>

                        <p className="mt-1 text-sm font-medium text-white">
                          {new Date(event.startDate).toLocaleDateString(
                            'en-US',
                            {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric',
                            }
                          )}
                        </p>
                      </div>
                    </div>
                  )}

                </div>

                {/* =====================================================
                    CTA
                ===================================================== */}
                <div className="relative mt-10 border-t border-white/10 pt-7 sm:mt-12">

                  <Link to={`/events/${event.slug}`}>
                    <Button
                      size="lg"
                      className="
                        h-14
                        w-full
                        rounded-full
                        bg-white
                        px-6
                        text-sm
                        font-semibold
                        text-[#1A2B48]
                        transition-all
                        duration-300
                        hover:bg-[#88B3D8]
                        hover:text-white
                      "
                    >
                      View & Register

                      <span className="ml-auto text-lg">
                        ↗
                      </span>
                    </Button>
                  </Link>

                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* =========================================================
            CAROUSEL FOOTER
        ========================================================= */}
        <div className="mt-6 flex items-center justify-between">

          {/* Counter */}
          <p className="text-xs uppercase tracking-[0.15em] text-[#688BB0]">
            {String(currentIndex + 1).padStart(2, '0')}
            {' / '}
            {String(events.length).padStart(2, '0')}
          </p>

          {/* Indicators */}
          {events.length > 1 && (
            <div className="flex items-center gap-2">
              {events.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setCurrentIndex(index)}
                  aria-label={`Go to event ${index + 1}`}
                  className={`
                    h-1.5 rounded-full transition-all duration-300
                    ${
                      index === currentIndex
                        ? 'w-8 bg-[#3D6BB4]'
                        : 'w-1.5 bg-[#88B3D8]/40'
                    }
                  `}
                />
              ))}
            </div>
          )}

          {/* Bottom note */}
          <p className="hidden text-xs uppercase tracking-[0.15em] text-[#688BB0] sm:block">
            GAC beyond the ordinary
          </p>

        </div>

      </div>
    </section>
  );
}