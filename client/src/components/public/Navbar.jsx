import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    setMenuOpen(false);
    logout();
    navigate("/");
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="absolute left-0 right-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4 md:px-6 md:pt-5 lg:px-10">
      <nav className="mx-auto w-full max-w-7xl">
        <div className="relative">
          {/* =====================================================
              MAIN NAVBAR
          ===================================================== */}
          <div
            className="
              flex items-center justify-between
              rounded-full
              border border-white/70
              bg-white/85
              px-2 py-2
              shadow-[0_10px_40px_rgba(26,43,72,0.08)]
              backdrop-blur-xl
              sm:px-3
            "
          >
            {/* =================================================
                LOGO
            ================================================= */}
            <Link
              to="/"
              onClick={closeMenu}
              className="
                group flex min-w-0
                items-center gap-2
                rounded-full
                px-2 py-1.5
                sm:gap-3 sm:px-3 sm:py-2
              "
            >
              <div
                className="
                  flex h-9 w-9 shrink-0
                  items-center justify-center
                  rounded-full
                  bg-[#1A2B48]
                  text-sm font-bold
                  text-white
                  transition-colors duration-300
                  group-hover:bg-[#3D6BB4]
                  sm:h-10 sm:w-10
                "
              >
                G
              </div>

              <div className="hidden min-w-0 sm:block">
                <p className="text-sm font-bold leading-none tracking-tight text-[#1A2B48]">
                  GAC
                </p>

                <p className="mt-1 text-[9px] font-medium uppercase tracking-[0.18em] text-[#688BB0]">
                  Adventure Club
                </p>
              </div>
            </Link>

            {/* =================================================
                DESKTOP NAVIGATION
                Hidden below lg to avoid tablet crowding
            ================================================= */}
            <div className="hidden items-center gap-0.5 lg:flex xl:gap-1">
              <Link
                to="/events"
                className="
                  rounded-full
                  px-3 py-2.5
                  text-sm font-medium
                  text-[#688BB0]
                  transition-all duration-300
                  hover:bg-[#EBF2F2]
                  hover:text-[#1A2B48]
                  xl:px-4
                "
              >
                Events
              </Link>

              <Link
                to="/past-events"
                className="
                  rounded-full
                  px-3 py-2.5
                  text-sm font-medium
                  text-[#688BB0]
                  transition-all duration-300
                  hover:bg-[#EBF2F2]
                  hover:text-[#1A2B48]
                  xl:px-4
                "
              >
                Past Events
              </Link>

              {user && (
                <>
                  <Link
                    to="/my-tickets"
                    className="
                      rounded-full
                      px-3 py-2.5
                      text-sm font-medium
                      text-[#688BB0]
                      transition-all duration-300
                      hover:bg-[#EBF2F2]
                      hover:text-[#1A2B48]
                      xl:px-4
                    "
                  >
                    My Tickets
                  </Link>

                  <Link
                    to="/dashboard"
                    className="
                      rounded-full
                      px-3 py-2.5
                      text-sm font-medium
                      text-[#688BB0]
                      transition-all duration-300
                      hover:bg-[#EBF2F2]
                      hover:text-[#1A2B48]
                      xl:px-4
                    "
                  >
                    Dashboard
                  </Link>
                </>
              )}
            </div>

            {/* =================================================
                RIGHT ACTIONS
            ================================================= */}
            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
              {user ? (
                <>
                  {/* Desktop logout */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="
                      hidden
                      h-10 rounded-full
                      border-[#88B3D8]/60
                      bg-transparent
                      px-4
                      text-xs font-semibold
                      text-[#1A2B48]
                      transition-all duration-300
                      hover:border-[#1A2B48]
                      hover:bg-[#1A2B48]
                      hover:text-white
                      lg:flex
                      xl:px-5
                    "
                  >
                    Log out
                  </Button>
                </>
              ) : (
                <>
                  {/* Desktop login */}
                  <Link
                    to="/login"
                    className="
                      hidden
                      rounded-full
                      px-3 py-2.5
                      text-sm font-medium
                      text-[#688BB0]
                      transition-colors duration-300
                      hover:text-[#1A2B48]
                      lg:block
                      xl:px-4
                    "
                  >
                    Log in
                  </Link>

                  {/* Signup */}
                  <Link to="/signup" onClick={closeMenu}>
                    <Button
                      size="sm"
                      className="
                        h-9 rounded-full
                        bg-[#1A2B48]
                        px-4
                        text-[11px] font-semibold
                        text-white
                        shadow-md
                        transition-all duration-300
                        hover:bg-[#3D6BB4]
                        hover:shadow-lg
                        sm:h-10
                        sm:px-5
                        sm:text-xs
                      "
                    >
                      Sign up
                      <span className="ml-1.5 text-sm">↗</span>
                    </Button>
                  </Link>
                </>
              )}

              {/* =================================================
                  MOBILE / TABLET MENU BUTTON
              ================================================= */}
              <button
                type="button"
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((prev) => !prev)}
                className="
                  flex h-9 w-9
                  items-center justify-center
                  rounded-full
                  border border-[#88B3D8]/40
                  bg-[#EBF2F2]/60
                  text-[#1A2B48]
                  transition-all duration-300
                  hover:bg-[#EBF2F2]
                  lg:hidden
                  sm:h-10 sm:w-10
                "
              >
                {menuOpen ? (
                  <span className="text-lg leading-none">×</span>
                ) : (
                  <div className="flex flex-col gap-1">
                    <span className="h-px w-4 bg-[#1A2B48]" />
                    <span className="h-px w-4 bg-[#1A2B48]" />
                    <span className="h-px w-3 bg-[#1A2B48]" />
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* =====================================================
              MOBILE / TABLET DROPDOWN
          ===================================================== */}
          <div
            className={`
              absolute left-0 right-0 top-[calc(100%+0.5rem)]
              overflow-hidden
              rounded-3xl
              border border-white/70
              bg-white/95
              shadow-[0_20px_50px_rgba(26,43,72,0.12)]
              backdrop-blur-xl
              transition-all duration-300
              lg:hidden
              ${
                menuOpen
                  ? "visible translate-y-0 opacity-100"
                  : "invisible -translate-y-2 opacity-0"
              }
            `}
          >
            <div className="flex flex-col p-2">
              {/* Events */}
              <Link
                to="/events"
                onClick={closeMenu}
                className="
                  rounded-2xl
                  px-4 py-3
                  text-sm font-medium
                  text-[#688BB0]
                  transition-colors
                  hover:bg-[#EBF2F2]
                  hover:text-[#1A2B48]
                "
              >
                Events
              </Link>

              {/* Past Events */}
              <Link
                to="/past-events"
                onClick={closeMenu}
                className="
                  rounded-2xl
                  px-4 py-3
                  text-sm font-medium
                  text-[#688BB0]
                  transition-colors
                  hover:bg-[#EBF2F2]
                  hover:text-[#1A2B48]
                "
              >
                Past Events
              </Link>

              {user ? (
                <>
                  {/* My Tickets */}
                  <Link
                    to="/my-tickets"
                    onClick={closeMenu}
                    className="
                      rounded-2xl
                      px-4 py-3
                      text-sm font-medium
                      text-[#688BB0]
                      transition-colors
                      hover:bg-[#EBF2F2]
                      hover:text-[#1A2B48]
                    "
                  >
                    My Tickets
                  </Link>

                  {/* Dashboard */}
                  <Link
                    to="/dashboard"
                    onClick={closeMenu}
                    className="
                      rounded-2xl
                      px-4 py-3
                      text-sm font-medium
                      text-[#688BB0]
                      transition-colors
                      hover:bg-[#EBF2F2]
                      hover:text-[#1A2B48]
                    "
                  >
                    Dashboard
                  </Link>

                  {/* Logout */}
                  <div className="mt-1 border-t border-[#88B3D8]/20 pt-2">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="
                        w-full
                        rounded-2xl
                        px-4 py-3
                        text-left
                        text-sm font-semibold
                        text-[#1A2B48]
                        transition-colors
                        hover:bg-[#EBF2F2]
                      "
                    >
                      Log out
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Login */}
                  <Link
                    to="/login"
                    onClick={closeMenu}
                    className="
                      rounded-2xl
                      px-4 py-3
                      text-sm font-medium
                      text-[#688BB0]
                      transition-colors
                      hover:bg-[#EBF2F2]
                      hover:text-[#1A2B48]
                    "
                  >
                    Log in
                  </Link>

                  {/* Signup */}
                  <Link
                    to="/signup"
                    onClick={closeMenu}
                    className="
                      mt-1
                      rounded-2xl
                      bg-[#1A2B48]
                      px-4 py-3
                      text-sm font-semibold
                      text-white
                      transition-colors
                      hover:bg-[#3D6BB4]
                    "
                  >
                    Sign up
                    <span className="ml-2">↗</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}