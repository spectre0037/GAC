import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '@/lib/axios';

export default function AboutSection() {
  const [tripCount, setTripCount] = useState(null);

  useEffect(() => {
    api.get('/events/past').then(({ data }) => setTripCount(data.events.length));
  }, []);

  return (
    <section className="relative overflow-hidden bg-[#EBF2F2] px-6 py-20 sm:px-10 lg:px-16 lg:py-28">
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
          className="mb-8 flex items-center gap-3"
        >
          <span className="h-2 w-2 rounded-full bg-[#3D6BB4]" />

          <span className="text-sm font-semibold uppercase tracking-[0.2em] text-[#688BB0]">
            GIKI Adventure Club
          </span>
        </motion.div>

        {/* Main card */}
        <div className="grid overflow-hidden rounded-[2rem] border border-[#88B3D8]/30 bg-white shadow-[0_20px_70px_rgba(26,43,72,0.08)] lg:grid-cols-[1.4fr_0.8fr]">

          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative p-8 sm:p-12 lg:p-16"
          >
            {/* Small decorative circle */}
            <div className="absolute right-10 top-10 hidden h-12 w-12 rounded-full border border-[#88B3D8]/40 sm:block" />

            <div className="relative max-w-2xl">
              <h2 className="mb-7 text-4xl font-semibold leading-[1.05] tracking-[-0.04em] text-[#1A2B48] sm:text-5xl lg:text-6xl">
                About
                <br />
                <span className="text-[#3D6BB4]">GAC</span>
              </h2>

              <div className="mb-8 h-px w-16 bg-[#88B3D8]" />

              <p className="max-w-xl text-base leading-8 text-[#688BB0] sm:text-lg">
                The GIKI Adventure Club plans and runs hiking and trekking trips across northern
                Pakistan for GIKI students. Every trip starts with a recon expedition by a small core
                team, who scout the route, plan logistics, and keep costs as low as possible before
                opening registration to the wider student body.
              </p>

              {/* Bottom pill */}
              <div className="mt-10 inline-flex items-center gap-3 rounded-full bg-[#EBF2F2] px-5 py-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1A2B48] text-xs text-white">
                  ↗
                </span>

                <span className="text-sm font-medium text-[#1A2B48]">
                  Beyond the ordinary
                </span>
              </div>
            </div>
          </motion.div>

          {/* Right Statistic */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="relative flex min-h-[360px] flex-col justify-between overflow-hidden bg-[#1A2B48] p-8 text-white sm:p-12 lg:min-h-full lg:p-14"
          >
            {/* Decorative circles */}
            <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full border border-[#88B3D8]/20" />
            <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full border border-[#88B3D8]/20" />

            <div className="relative">
              <div className="mb-8 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#88B3D8]">
                  Our Journey
                </span>

                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-lg">
                  ↗
                </span>
              </div>

              {tripCount !== null && (
                <div>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                    className="text-8xl font-semibold leading-none tracking-[-0.07em] text-white sm:text-9xl"
                  >
                    {tripCount}
                    <span className="text-[#88B3D8]">+</span>
                  </motion.p>

                  <p className="mt-5 max-w-[220px] text-lg leading-7 text-[#88B3D8]">
                    Trips run and counting
                  </p>
                </div>
              )}
            </div>

            {/* Bottom text */}
            <div className="relative mt-16">
              <div className="mb-5 h-px w-full bg-white/10" />

              <div className="flex items-end justify-between gap-5">
                <p className="max-w-[190px] text-sm leading-6 text-white/60">
                  Exploring Pakistan,
                  <br />
                  one trail at a time.
                </p>

                <div className="flex -space-x-2">
                  <div className="h-8 w-8 rounded-full border-2 border-[#1A2B48] bg-[#88B3D8]" />
                  <div className="h-8 w-8 rounded-full border-2 border-[#1A2B48] bg-[#5F97DF]" />
                  <div className="h-8 w-8 rounded-full border-2 border-[#1A2B48] bg-[#688BB0]" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}