import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '@/lib/axios';

export default function HistorySection() {
  const [grouped, setGrouped] = useState({});

  useEffect(() => {
    api.get('/history').then(({ data }) => {
      const g = data.members.reduce((acc, m) => {
        (acc[m.termLabel] ||= []).push(m);
        return acc;
      }, {});

      setGrouped(g);
    });
  }, []);

  const terms = Object.keys(grouped).sort().reverse();

  if (terms.length === 0) return null;

  return (
    <section className="relative overflow-hidden bg-[#EBF2F2] px-6 py-20 sm:px-10 lg:px-16 lg:py-28">

      {/* Background decoration */}
      <div className="pointer-events-none absolute -right-40 top-20 h-96 w-96 rounded-full bg-[#88B3D8]/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">

        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 flex flex-col justify-between gap-6 sm:flex-row sm:items-end"
        >
          <div>
            <div className="mb-5 flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-[#3D6BB4]" />

              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#688BB0]">
                The people behind the adventures
              </span>
            </div>

            <h2 className="max-w-xl text-5xl font-semibold leading-[0.95] tracking-[-0.05em] text-[#1A2B48] sm:text-6xl">
              Our
              <br />
              <span className="text-[#3D6BB4]">History</span>
            </h2>
          </div>

          <div className="max-w-xs">
            <p className="text-sm leading-7 text-[#688BB0]">
              The people who have helped shape GAC and taken countless
              adventures beyond the ordinary.
            </p>
          </div>
        </motion.div>

        {/* History */}
        <div className="flex flex-col gap-6">

          {terms.map((term, i) => (
            <motion.div
              key={term}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.6,
                delay: i * 0.08,
              }}
              className="overflow-hidden rounded-[2rem] border border-[#88B3D8]/30 bg-white shadow-[0_15px_50px_rgba(26,43,72,0.06)]"
            >
              <div className="grid lg:grid-cols-[230px_1fr]">

                {/* Term */}
                <div className="relative overflow-hidden bg-[#1A2B48] p-7 sm:p-9">

                  {/* Decorative circles */}
                  <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full border border-[#88B3D8]/20" />

                  <div className="absolute -bottom-12 -left-12 h-32 w-32 rounded-full border border-[#88B3D8]/10" />

                  <div className="relative flex h-full flex-col justify-between">

                    <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#88B3D8]">
                      Expedition
                    </span>

                    <div className="mt-8 lg:mt-20">
                      <p className="text-3xl font-semibold leading-tight tracking-[-0.04em] text-white">
                        {term}
                      </p>

                      <div className="mt-4 h-px w-10 bg-[#88B3D8]" />
                    </div>

                    <span className="mt-8 text-3xl text-white/20 lg:mt-10">
                      ↘
                    </span>
                  </div>
                </div>

                {/* Members */}
                <div className="p-7 sm:p-9">

                  <div className="mb-7 flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#688BB0]">
                      Leadership & Members
                    </p>

                    <span className="rounded-full bg-[#EBF2F2] px-3 py-1 text-xs font-medium text-[#3D6BB4]">
                      {grouped[term].length}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">

                    {grouped[term].map((m, memberIndex) => (
                      <motion.div
                        key={m.id}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{
                          duration: 0.4,
                          delay: memberIndex * 0.04,
                        }}
                        className="group text-center"
                      >
                        {/* Avatar */}
                        <div className="relative mx-auto mb-4 h-20 w-20 sm:h-24 sm:w-24">

                          <div className="absolute inset-0 rounded-full border border-[#88B3D8]/30 transition-all duration-300 group-hover:scale-110 group-hover:border-[#3D6BB4]/50" />

                          {m.photoUrl ? (
                            <img
                              src={m.photoUrl}
                              alt={m.name}
                              className="absolute inset-1 h-[calc(100%-8px)] w-[calc(100%-8px)] rounded-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="absolute inset-1 flex items-center justify-center rounded-full bg-[#EBF2F2] text-2xl font-semibold text-[#3D6BB4]">
                              {m.name.charAt(0)}
                            </div>
                          )}

                          {/* Small indicator */}
                          <span className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-[#1A2B48] text-[10px] text-white">
                            ↗
                          </span>
                        </div>

                        <p className="text-sm font-semibold leading-5 text-[#1A2B48]">
                          {m.name}
                        </p>

                        <p className="mt-1 text-xs leading-5 text-[#688BB0]">
                          {m.role}
                        </p>
                      </motion.div>
                    ))}

                  </div>
                </div>
              </div>
            </motion.div>
          ))}

        </div>

        {/* Bottom decoration */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
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

      </div>
    </section>
  );
}