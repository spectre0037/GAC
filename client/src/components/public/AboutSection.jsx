import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '@/lib/axios';

export default function AboutSection() {
  const [tripCount, setTripCount] = useState(null);

  useEffect(() => {
    api.get('/events/past').then(({ data }) => setTripCount(data.events.length));
  }, []);

  return (
    <section className="relative overflow-hidden bg-[#EBF2F2] px-4 py-16 sm:px-6 sm:py-20 md:px-8 lg:px-12 lg:py-28 xl:px-16">
      {/* Decorative background shapes */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#88B3D8]/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-[#5F97DF]/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">

        {/* Section label */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-7 flex items-center gap-3 sm:mb-8"
        >
          <span className="h-2 w-2 shrink-0 rounded-full bg-[#3D6BB4]" />

          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#688BB0] sm:text-xs md:text-sm md:tracking-[0.2em]">
            GIKI Adventure Club
          </span>
        </motion.div>

        {/* Main card */}
        <div className="grid overflow-hidden rounded-[1.5rem] border border-[#88B3D8]/30 bg-white shadow-[0_20px_70px_rgba(26,43,72,0.08)] sm:rounded-[2rem] lg:grid-cols-[1.4fr_0.8fr]">

          {/* =====================================================
              LEFT CONTENT
          ===================================================== */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative p-7 sm:p-10 md:p-12 lg:p-14 xl:p-16"
          >
            {/* Small decorative circle */}
            <div className="absolute right-8 top-8 hidden h-10 w-10 rounded-full border border-[#88B3D8]/40 sm:block lg:right-10 lg:top-10 lg:h-12 lg:w-12" />

            <div className="relative max-w-2xl">

              <h2 className="mb-6 text-4xl font-semibold leading-[1.05] tracking-[-0.04em] text-[#1A2B48] sm:mb-7 sm:text-5xl lg:text-6xl">
                About
                <br />
                <span className="text-[#3D6BB4]">GAC</span>
              </h2>

              <div className="mb-7 h-px w-16 bg-[#88B3D8] sm:mb-8" />

              <p className="max-w-xl text-sm leading-7 text-[#688BB0] sm:text-base sm:leading-8 md:text-lg">
                The GIKI Adventure Club plans and runs hiking and trekking trips across northern
                Pakistan for GIKI students. Every trip starts with a recon expedition by a small core
                team, who scout the route, plan logistics, and keep costs as low as possible before
                opening registration to the wider student body.
              </p>

              {/* Bottom pill */}
              <div className="mt-8 inline-flex max-w-full items-center gap-3 rounded-full bg-[#EBF2F2] px-4 py-2.5 sm:mt-10 sm:px-5 sm:py-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#1A2B48] text-xs text-white">
                  ↗
                </span>

                <span className="text-xs font-medium text-[#1A2B48] sm:text-sm">
                  Beyond the ordinary
                </span>
              </div>

            </div>
          </motion.div>

          {/* =====================================================
              RIGHT STATISTIC
          ===================================================== */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="relative flex min-h-[340px] flex-col justify-between overflow-hidden bg-[#1A2B48] p-7 text-white sm:min-h-[380px] sm:p-10 md:p-12 lg:min-h-full lg:p-14"
          >
            {/* Decorative circles */}
            <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full border border-[#88B3D8]/20" />

            <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full border border-[#88B3D8]/20" />

            <div className="relative">

              {/* Header */}
              <div className="mb-7 flex items-center justify-between gap-4 sm:mb-8">
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#88B3D8] sm:text-xs sm:tracking-[0.2em]">
                  Our Journey
                </span>

                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/20 text-base sm:h-10 sm:w-10 sm:text-lg">
                  ↗
                </span>
              </div>

              {/* Counter */}
              {tripCount !== null && (
                <div>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                    className="text-7xl font-semibold leading-none tracking-[-0.07em] text-white sm:text-8xl md:text-9xl"
                  >
                    {tripCount}
                    <span className="text-[#88B3D8]">+</span>
                  </motion.p>

                  <p className="mt-4 max-w-[220px] text-base leading-6 text-[#88B3D8] sm:mt-5 sm:text-lg sm:leading-7">
                    Trips run and counting
                  </p>
                </div>
              )}
            </div>

            {/* Bottom text */}
            <div className="relative mt-12 sm:mt-16">

              <div className="mb-5 h-px w-full bg-white/10" />

              <div className="flex items-end justify-between gap-4 sm:gap-5">

                <p className="max-w-[190px] text-xs leading-5 text-white/60 sm:text-sm sm:leading-6">
                  Exploring Pakistan,
                  <br />
                  one trail at a time.
                </p>

                <div className="flex shrink-0 -space-x-2">
                  <div className="h-7 w-7 rounded-full border-2 border-[#1A2B48] bg-[#88B3D8] sm:h-8 sm:w-8" />

                  <div className="h-7 w-7 rounded-full border-2 border-[#1A2B48] bg-[#5F97DF] sm:h-8 sm:w-8" />

                  <div className="h-7 w-7 rounded-full border-2 border-[#1A2B48] bg-[#688BB0] sm:h-8 sm:w-8" />
                </div>

              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}