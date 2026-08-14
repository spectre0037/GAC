import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <section
      className="
    relative min-h-[90vh]
    overflow-hidden
    bg-[#EBF2F2]
    px-4 py-16
    sm:px-6 sm:py-10
    md:px-8 md:py-12
    lg:px-12 lg:py-14
    xl:px-16
  "
    >
      {/* =========================================================
          BACKGROUND DECORATION
      ========================================================= */}
      <div className="pointer-events-none absolute -right-32 -top-32 h-[350px] w-[350px] rounded-full bg-[#88B3D8]/20 blur-3xl sm:h-[450px] sm:w-[450px] lg:h-[500px] lg:w-[500px]" />

      <div className="pointer-events-none absolute -bottom-40 -left-40 h-[350px] w-[350px] rounded-full bg-[#5F97DF]/10 blur-3xl sm:h-[450px] sm:w-[450px] lg:h-[500px] lg:w-[500px]" />

      {/* Decorative rings */}
      <div className="pointer-events-none absolute right-[6%] top-[14%] hidden h-40 w-40 rounded-full border border-[#88B3D8]/30 lg:block xl:h-48 xl:w-48" />

      <div className="pointer-events-none absolute right-[9%] top-[18%] hidden h-28 w-28 rounded-full border border-[#88B3D8]/20 lg:block xl:h-32 xl:w-32" />

      {/* =========================================================
          MAIN CONTAINER
      ========================================================= */}
      <div
        className="
          relative mx-auto flex
          min-h-[calc(90vh-4rem)]
          w-full max-w-7xl
          flex-col justify-center
          sm:min-h-[calc(90vh-5rem)]
          lg:min-h-[calc(90vh-7rem)]
        "
      >
        {/* =======================================================
            TOP LABEL
        ======================================================= */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 flex items-center gap-3 sm:mb-8"
        >
          <span className="h-2 w-2 shrink-0 rounded-full bg-[#3D6BB4]" />

          <span
            className="
              text-[10px] font-semibold uppercase
              tracking-[0.2em]
              text-[#688BB0]
              sm:text-xs
              sm:tracking-[0.25em]
              md:text-sm
            "
          >
            GAC • GIKI Adventure Club
          </span>
        </motion.div>

        {/* =======================================================
            MAIN HERO GRID
        ======================================================= */}
        <div
          className="
            grid items-center
            gap-10
            lg:grid-cols-[1.25fr_0.75fr]
            lg:gap-8
            xl:grid-cols-[1.3fr_0.7fr]
            xl:gap-12
          "
        >
          {/* =====================================================
              LEFT CONTENT
          ===================================================== */}
          <div className="min-w-0">
            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="
                max-w-4xl
                text-[3.25rem]
                font-semibold
                leading-[0.94]
                tracking-[-0.055em]
                text-[#1A2B48]
                xs:text-[3.5rem]
                sm:text-6xl
                md:text-7xl
                lg:text-[5.25rem]
                xl:text-[6.5rem]
              "
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
              className="mt-6 h-1 w-16 rounded-full bg-[#3D6BB4] sm:mt-8"
            />

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="
                mt-6 max-w-xl
                text-sm
                leading-7
                text-[#688BB0]
                sm:mt-7
                sm:text-base
                sm:leading-8
                md:text-lg
              "
            >
              Trips and hikes across northern Pakistan, planned and run by GIKI
              students. Register, track your spot, and see where we're headed
              next.
            </motion.p>

            {/* =================================================
                BUTTONS
            ================================================= */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="
                mt-7 flex
                w-full flex-col
                gap-3
                sm:mt-9
                sm:w-auto sm:flex-row
              "
            >
              <Link to="/events" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="
                    h-12 w-full
                    rounded-full
                    bg-[#1A2B48]
                    px-6
                    text-sm font-medium
                    text-white
                    shadow-lg shadow-[#1A2B48]/15
                    transition-all duration-300
                    hover:bg-[#3D6BB4]
                    hover:shadow-xl
                    sm:h-14
                    sm:w-auto
                    sm:px-7
                  "
                >
                  Browse Upcoming Events
                  <span className="ml-3 text-lg">↗</span>
                </Button>
              </Link>

              <Link to="/past-events" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="
                    h-12 w-full
                    rounded-full
                    border-[#88B3D8]
                    bg-transparent
                    px-6
                    text-sm font-medium
                    text-[#1A2B48]
                    transition-all duration-300
                    hover:bg-white
                    sm:h-14
                    sm:w-auto
                    sm:px-7
                  "
                >
                  See Past Trips
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* =====================================================
              RIGHT VISUAL PANEL
              Hidden on mobile/tablet
          ===================================================== */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="
              relative hidden
              h-[400px]
              lg:block
              xl:h-[460px]
              2xl:h-[480px]
            "
          >
            {/* Main visual card */}
            <div
              className="
                absolute right-0 top-1/2
                h-[350px] w-[265px]
                -translate-y-1/2
                rotate-3
                overflow-hidden
                rounded-[1.75rem]
                bg-[#1A2B48]
                shadow-[0_30px_80px_rgba(26,43,72,0.2)]
                lg:h-[380px]
                lg:w-[285px]
                xl:h-[420px]
                xl:w-[320px]
              "
            >
              {/* Abstract mountain shapes */}
              <div className="absolute bottom-0 left-0 h-[55%] w-full bg-[#3D6BB4] [clip-path:polygon(0_55%,25%_20%,42%_45%,65%_5%,100%_50%,100%_100%,0_100%)]" />

              <div className="absolute bottom-0 left-0 h-[42%] w-full bg-[#88B3D8] [clip-path:polygon(0_65%,20%_35%,38%_60%,58%_25%,78%_55%,100%_30%,100%_100%,0_100%)]" />

              {/* Sun */}
              <div className="absolute right-8 top-10 h-16 w-16 rounded-full bg-[#EBF2F2]/90 xl:right-10 xl:top-12 xl:h-20 xl:w-20" />

              {/* Card text */}
              <div className="absolute left-6 top-6 xl:left-7 xl:top-7">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#88B3D8] xl:text-xs">
                  Explore
                </p>

                <p className="mt-2 max-w-[170px] text-2xl font-semibold leading-tight text-white xl:max-w-[190px] xl:text-3xl">
                  Beyond
                  <br />
                  the ordinary.
                </p>
              </div>

              {/* Bottom label */}
              <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between gap-3 xl:bottom-7 xl:left-7 xl:right-7">
                <span className="text-[10px] uppercase tracking-[0.15em] text-white/60 xl:text-xs xl:tracking-[0.18em]">
                  Northern Pakistan
                </span>

                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-sm text-[#1A2B48] xl:h-10 xl:w-10 xl:text-base">
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
                ease: "easeInOut",
              }}
              className="
                absolute bottom-6 left-0
                z-10
                rounded-full
                border border-white/70
                bg-white
                px-4 py-2.5
                shadow-xl
                lg:bottom-8
                lg:px-4
                xl:bottom-12
                xl:px-5 xl:py-3
              "
            >
              <div className="flex items-center gap-2.5 xl:gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#EBF2F2] text-sm text-[#3D6BB4] xl:h-8 xl:w-8">
                  ↗
                </span>

                <span className="text-xs font-medium text-[#1A2B48] xl:text-sm">
                  Find your next trail
                </span>
              </div>
            </motion.div>

            {/* Floating circle */}
            <div className="absolute -left-4 top-10 h-12 w-12 rounded-full border border-[#88B3D8]/50 lg:top-14 lg:h-14 lg:w-14 xl:-left-5 xl:top-16 xl:h-16 xl:w-16" />
          </motion.div>
        </div>

        {/* =======================================================
            SCROLL INDICATOR
        ======================================================= */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="
            absolute bottom-0 left-0
            hidden
            items-center gap-3
            text-[#688BB0]
            sm:flex
          "
        >
          <motion.span
            animate={{ y: [0, 7, 0] }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="
              flex h-9 w-9
              items-center justify-center
              rounded-full
              border border-[#88B3D8]/50
              text-base
              sm:h-10 sm:w-10 sm:text-lg
            "
          >
            ↓
          </motion.span>

          <span className="text-[10px] font-medium uppercase tracking-[0.15em] sm:text-xs sm:tracking-[0.18em]">
            Scroll to explore
          </span>
        </motion.div>
      </div>
    </section>
  );
}
