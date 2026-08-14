import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-[#EBF2F2] px-4 pb-4 pt-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-[#1A2B48]">

        {/* Main footer */}
        <div className="relative px-7 py-12 sm:px-10 sm:py-14 lg:px-14 lg:py-16">

          {/* Decorative circles */}
          <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full border border-[#88B3D8]/10" />

          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full border border-[#88B3D8]/10" />

          <div className="relative grid gap-12 lg:grid-cols-[1fr_auto] lg:items-end">

            {/* Brand */}
            <div>
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-sm font-bold text-[#1A2B48]">
                  G
                </div>

                <div>
                  <p className="text-sm font-bold text-white">
                    GIKI Adventure Club
                  </p>

                  <p className="mt-1 text-[9px] font-medium uppercase tracking-[0.2em] text-[#88B3D8]">
                    GAC
                  </p>
                </div>
              </div>

              <h2 className="max-w-2xl text-4xl font-semibold leading-[0.95] tracking-[-0.05em] text-white sm:text-5xl lg:text-6xl">
                Beyond
                <br />
                <span className="text-[#88B3D8]">the ordinary.</span>
              </h2>

              <p className="mt-6 max-w-md text-sm leading-7 text-white/50">
                Trips and hikes across northern Pakistan, planned and run by
                GIKI students.
              </p>
            </div>

            {/* Navigation */}
            <div className="lg:min-w-[240px]">
              <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#88B3D8]">
                Explore
              </p>

              <div className="flex flex-col gap-2">

                <Link
                  to="/events"
                  className="group flex items-center justify-between border-b border-white/10 py-3 text-sm text-white/70 transition-colors duration-300 hover:text-white"
                >
                  <span>Events</span>

                  <span className="text-white/30 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-[#88B3D8]">
                    ↗
                  </span>
                </Link>

                <Link
                  to="/past-events"
                  className="group flex items-center justify-between border-b border-white/10 py-3 text-sm text-white/70 transition-colors duration-300 hover:text-white"
                >
                  <span>Past Trips</span>

                  <span className="text-white/30 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-[#88B3D8]">
                    ↗
                  </span>
                </Link>

                <Link
                  to="/login"
                  className="group flex items-center justify-between border-b border-white/10 py-3 text-sm text-white/70 transition-colors duration-300 hover:text-white"
                >
                  <span>Log in</span>

                  <span className="text-white/30 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-[#88B3D8]">
                    ↗
                  </span>
                </Link>

              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="relative my-10 h-px bg-white/10" />

          {/* Bottom row */}
          <div className="relative flex flex-col gap-5 text-xs sm:flex-row sm:items-center sm:justify-between">

            <p className="text-white/40">
              © {new Date().getFullYear()} GIKI Adventure Club
            </p>

            <div className="flex items-center gap-3">
              <span className="text-white/30">
                GAC
              </span>

              <span className="h-1 w-1 rounded-full bg-[#88B3D8]" />

              <span className="text-white/40">
                GIKI
              </span>

              <span className="h-1 w-1 rounded-full bg-[#88B3D8]" />

              <span className="text-white/40">
                Pakistan
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#88B3D8]" />
              <span className="h-1.5 w-1.5 rounded-full bg-[#5F97DF]" />
              <span className="h-1.5 w-1.5 rounded-full bg-[#3D6BB4]" />
            </div>

          </div>
        </div>
      </div>
    </footer>
  );
}