import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';

export default function LatestEventSection() {
  const [event, setEvent] = useState(null);
  const [isPast, setIsPast] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLatest();
  }, []);

  async function loadLatest() {
    try {
      const { data: upcoming } = await api.get('/events');

      if (upcoming.events.length > 0) {
        setEvent(upcoming.events[0]);
        setIsPast(false);
      } else {
        const { data: past } = await api.get('/events/past');

        if (past.events.length > 0) {
          setEvent(past.events[0]);
          setIsPast(true);
        }
      }
    } finally {
      setLoading(false);
    }
  }

  if (loading || !event) return null;

  return (
    <section className="relative overflow-hidden bg-white px-6 py-20 sm:px-10 lg:px-16 lg:py-28">

      {/* Background decoration */}
      <div className="pointer-events-none absolute -left-40 top-20 h-80 w-80 rounded-full bg-[#88B3D8]/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">

        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10 flex items-end justify-between gap-6"
        >
          <div>
            <div className="mb-4 flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-[#3D6BB4]" />

              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#688BB0]">
                {isPast ? 'Most Recent Trip' : 'Coming Up'}
              </span>
            </div>

            <h2 className="text-4xl font-semibold tracking-[-0.04em] text-[#1A2B48] sm:text-5xl">
              {isPast ? 'Where we’ve been' : 'Where we’re going'}
            </h2>
          </div>

          <div className="hidden h-12 w-12 items-center justify-center rounded-full border border-[#88B3D8]/50 text-xl text-[#3D6BB4] sm:flex">
            ↘
          </div>
        </motion.div>

        {/* Featured Event */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="overflow-hidden rounded-[2rem] bg-[#1A2B48] shadow-[0_30px_80px_rgba(26,43,72,0.12)]"
        >
          <div className="grid lg:grid-cols-[1.35fr_0.65fr]">

            {/* Image */}
            {event.coverImageUrl && (
              <div className="group relative min-h-[360px] overflow-hidden lg:min-h-[520px]">
                <img
                  src={event.coverImageUrl}
                  alt={event.title}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {/* Image overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A2B48]/60 via-transparent to-transparent" />

                {/* Destination tag */}
                <div className="absolute left-6 top-6 rounded-full border border-white/30 bg-[#1A2B48]/50 px-4 py-2 backdrop-blur-md">
                  <span className="text-xs font-medium uppercase tracking-[0.15em] text-white">
                    GAC Expedition
                  </span>
                </div>

                {/* Image bottom label */}
                <div className="absolute bottom-6 left-6 right-6">
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

            {/* Event Information */}
            <div className="relative flex flex-col justify-between overflow-hidden p-8 sm:p-10 lg:p-12">

              {/* Decorative circles */}
              <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full border border-[#88B3D8]/15" />

              <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full border border-[#88B3D8]/10" />

              <div className="relative">

                {/* Status */}
                <div className="mb-10 inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2">
                  <span className="h-2 w-2 rounded-full bg-[#88B3D8]" />

                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#88B3D8]">
                    {isPast ? 'Completed' : 'Upcoming'}
                  </span>
                </div>

                {/* Title */}
                <h3 className="max-w-lg text-4xl font-semibold leading-[1.05] tracking-[-0.04em] text-white sm:text-5xl">
                  {event.title}
                </h3>

                {/* Location */}
                <div className="mt-7 flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#88B3D8]/10 text-sm text-[#88B3D8]">
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
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#88B3D8]/10 text-sm text-[#88B3D8]">
                      ◷
                    </span>

                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
                        Date
                      </p>

                      <p className="mt-1 text-sm font-medium text-white">
                        {new Date(event.startDate).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom CTA */}
              <div className="relative mt-12 border-t border-white/10 pt-7">
                <Link to={isPast ? '/past-events' : `/events/${event.slug}`}>
                  <Button
                    size="lg"
                    className="h-14 w-full rounded-full bg-white px-6 text-sm font-semibold text-[#1A2B48] transition-all duration-300 hover:bg-[#88B3D8] hover:text-white"
                  >
                    {isPast ? 'See Past Trips' : 'View & Register'}

                    <span className="ml-auto text-lg">
                      ↗
                    </span>
                  </Button>
                </Link>
              </div>

            </div>
          </div>
        </motion.div>

        {/* Bottom note */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 flex items-center justify-between"
        >
          <p className="text-xs uppercase tracking-[0.15em] text-[#688BB0]">
            GAC beyond the ordinary
          </p>

          <div className="hidden items-center gap-2 sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-[#88B3D8]" />
            <span className="h-1.5 w-1.5 rounded-full bg-[#5F97DF]" />
            <span className="h-1.5 w-1.5 rounded-full bg-[#3D6BB4]" />
          </div>
        </motion.div>

      </div>
    </section>
  );
}