import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function HeroSection() {
  return (
    <section className="relative min-h-[90vh] overflow-hidden bg-[#EBF2F2] px-6 py-10 sm:px-10 lg:px-16">

      {/* Background decoration */}
      <div className="pointer-events-none absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full bg-[#88B3D8]/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-[#5F97DF]/10 blur-3xl" />

      {/* Decorative rings */}
      <div className="pointer-events-none absolute right-[8%] top-[15%] hidden h-48 w-48 rounded-full border border-[#88B3D8]/30 lg:block" />
      <div className="pointer-events-none absolute right-[11%] top-[19%] hidden h-32 w-32 rounded-full border border-[#88B3D8]/20 lg:block" />

      <div className="relative mx-auto flex min-h-[calc(90vh-5rem)] max-w-7xl flex-col justify-center">

        {/* Top label */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 flex items-center gap-3"
        >
          <span className="h-2 w-2 rounded-full bg-[#3D6BB4]" />

          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#688BB0] sm:text-sm">
            GAC • GIKI Adventure Club
          </span>
        </motion.div>

        {/* Main Hero */}
        <div className="grid items-center gap-12 lg:grid-cols-[1.3fr_0.7fr]">

          {/* Left */}
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="max-w-4xl text-5xl font-semibold leading-[0.95] tracking-[-0.055em] text-[#1A2B48] sm:text-7xl lg:text-[6.5rem]"
            >
              GIKI
              <br />
              <span className="text-[#3D6BB4]">Adventure</span>
              <br />
              Club
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 64 }}
              transition={{ duration: 0.7, delay: 0.25 }}
              className="mt-8 h-1 rounded-full bg-[#3D6BB4]"
            />

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="mt-7 max-w-xl text-base leading-8 text-[#688BB0] sm:text-lg"
            >
              Trips and hikes across northern Pakistan, planned and run by GIKI students.
              Register, track your spot, and see where we're headed next.
            </motion.p>

            {/* Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-9 flex flex-col gap-3 sm:flex-row"
            >
              <Link to="/events">
                <Button
                  size="lg"
                  className="h-14 rounded-full bg-[#1A2B48] px-7 text-sm font-medium text-white shadow-lg shadow-[#1A2B48]/15 transition-all duration-300 hover:bg-[#3D6BB4] hover:shadow-xl"
                >
                  Browse Upcoming Events
                  <span className="ml-3 text-lg">↗</span>
                </Button>
              </Link>

              <Link to="/past-events">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 rounded-full border-[#88B3D8] bg-transparent px-7 text-sm font-medium text-[#1A2B48] transition-all duration-300 hover:bg-white"
                >
                  See Past Trips
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* Right visual panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative hidden h-[480px] lg:block"
          >

            {/* Main visual card */}
            <div className="absolute right-0 top-1/2 h-[420px] w-[320px] -translate-y-1/2 rotate-3 overflow-hidden rounded-[2rem] bg-[#1A2B48] shadow-[0_30px_80px_rgba(26,43,72,0.2)]">

              {/* Abstract mountain shapes */}
              <div className="absolute bottom-0 left-0 h-[55%] w-full bg-[#3D6BB4] [clip-path:polygon(0_55%,25%_20%,42%_45%,65%_5%,100%_50%,100%_100%,0_100%)]" />

              <div className="absolute bottom-0 left-0 h-[42%] w-full bg-[#88B3D8] [clip-path:polygon(0_65%,20%_35%,38%_60%,58%_25%,78%_55%,100%_30%,100%_100%,0_100%)]" />

              {/* Sun */}
              <div className="absolute right-10 top-12 h-20 w-20 rounded-full bg-[#EBF2F2]/90" />

              {/* Card text */}
              <div className="absolute left-7 top-7">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#88B3D8]">
                  Explore
                </p>

                <p className="mt-2 max-w-[190px] text-3xl font-semibold leading-tight text-white">
                  Beyond
                  <br />
                  the ordinary.
                </p>
              </div>

              {/* Bottom label */}
              <div className="absolute bottom-7 left-7 right-7 flex items-center justify-between">
                <span className="text-xs uppercase tracking-[0.18em] text-white/60">
                  Northern Pakistan
                </span>

                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#1A2B48]">
                  ↗
                </span>
              </div>
            </div>

            {/* Floating location pill */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute bottom-12 left-0 z-10 rounded-full border border-white/70 bg-white px-5 py-3 shadow-xl"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EBF2F2] text-[#3D6BB4]">
                  ↗
                </span>

                <span className="text-sm font-medium text-[#1A2B48]">
                  Find your next trail
                </span>
              </div>
            </motion.div>

            {/* Floating circle */}
            <div className="absolute -left-5 top-16 h-16 w-16 rounded-full border border-[#88B3D8]/50" />

          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="absolute bottom-0 left-0 hidden items-center gap-3 text-[#688BB0] sm:flex"
        >
          <motion.span
            animate={{ y: [0, 7, 0] }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#88B3D8]/50 text-lg"
          >
            ↓
          </motion.span>

          <span className="text-xs font-medium uppercase tracking-[0.18em]">
            Scroll to explore
          </span>
        </motion.div>

      </div>
    </section>
  );
}