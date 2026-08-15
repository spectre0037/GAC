import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const NAV_ITEMS = [
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: "⌂",
    roles: "all",
    section: "Overview",
  },
  {
    to: "/notifications",
    label: "Notifications",
    icon: "◌",
    roles: "all",
    section: "Overview",
  },
  {
    to: "/events",
    label: "Browse Events",
    icon: "↗",
    roles: ["student"],
    section: "Explore",
  },
  { to: '/admin/logistics', label: 'Logistics', roles: ['master_logistics', 'finance_master', 'super_admin'] },
  {
    to: "/my-tickets",
    label: "My Tickets",
    icon: "◇",
    roles: ["student"],
    section: "Explore",
  },
  {
    to: "/admin",
    label: "Role Management",
    icon: "◎",
    roles: ["super_admin"],
    section: "Administration",
  },
  {
    to: "/admin/history",
    label: "Exec Council Archive",
    icon: "◫",
    roles: ["super_admin"],
    section: "Administration",
  },
  {
    to: "/admin/female-list",
    label: "Female Students List",
    icon: "♧",
    roles: ["general_secretary", "super_admin", "event_coordinator"],
    section: "Administration",
  },
  {
    to: "/admin/events",
    label: "Manage Events",
    icon: "◈",
    roles: ["event_coordinator", "super_admin"],
    section: "Management",
  },
  {
    to: "/admin/finance",
    label: "Finance",
    icon: "₨",
    roles: ["finance_master", "super_admin"],
    section: "Management",
  },
  { to: '/admin/recky', label: 'Recky Planning', roles: ['finance_master', 'super_admin'] },
  { to: '/admin/reports', label: 'Event Reports', roles: ['super_admin'] },
  {
    to: "/admin/budget-overview",
    label: "Budget Overview",
    icon: "▦",
    roles: ["president", "vp_ops", "event_coordinator", "super_admin"],
    section: "Management",
  },
  {
    to: "/admin/overview",
    label: "Org Overview",
    icon: "△",
    roles: ["president", "vp_ops", "super_admin"],
    section: "Management",
  },
  {
    to: "/profile",
    label: "Profile",
    icon: "○",
    roles: "all",
    section: "Account",
  },
];

const ROLE_LABELS = {
  student: "Student",
  event_coordinator: "Event Coordinator",
  finance_master: "Finance Master",
  master_logistics: "Master Logistics",
  vp_ops: "VP Operations",
  president: "President",
  super_admin: "Super Admin",
  general_secretary: "General Secretary",
};

export default function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  function handleLogout() {
    logout();
    setIsMobileOpen(false);
    navigate("/");
  }

  function handleNavigation() {
    if (window.innerWidth < 768) {
      setIsMobileOpen(false);
    }
  }

  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 768) {
        setIsMobileOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setIsMobileOpen(false);
      }
    }

    window.addEventListener("resize", handleResize);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  const visibleItems = NAV_ITEMS.filter(
    (item) =>
      item.roles === "all" ||
      (Array.isArray(item.roles) && item.roles.includes(user?.role)),
  );

  const groupedItems = visibleItems.reduce((acc, item) => {
    const section = item.section || "Other";

    if (!acc[section]) {
      acc[section] = [];
    }

    acc[section].push(item);

    return acc;
  }, {});

  const initials =
    user?.fullName
      ?.split(" ")
      .map((name) => name.charAt(0))
      .slice(0, 2)
      .join("")
      .toUpperCase() || "GAC";

  return (
    <>
      {/* =========================================================
          MOBILE MENU BUTTON
      ========================================================== */}
      <button
        type="button"
        aria-label={isMobileOpen ? "Close navigation" : "Open navigation"}
        aria-expanded={isMobileOpen}
        onClick={() => setIsMobileOpen((prev) => !prev)}
        className="fixed left-4 top-4 z-[70] flex h-11 w-11 items-center justify-center rounded-xl border border-[#1A2B48]/10 bg-white text-[#1A2B48] shadow-lg transition-all duration-200 hover:bg-slate-50 active:scale-95 md:hidden"
      >
        <span className="relative flex h-5 w-5 flex-col items-center justify-center">
          <span
            className={`absolute h-0.5 w-5 rounded-full bg-current transition-all duration-200 ${
              isMobileOpen ? "rotate-45" : "-translate-y-1.5"
            }`}
          />
          <span
            className={`absolute h-0.5 w-5 rounded-full bg-current transition-all duration-200 ${
              isMobileOpen ? "opacity-0" : "opacity-100"
            }`}
          />
          <span
            className={`absolute h-0.5 w-5 rounded-full bg-current transition-all duration-200 ${
              isMobileOpen ? "-rotate-45" : "translate-y-1.5"
            }`}
          />
        </span>
      </button>

      {/* =========================================================
          MOBILE OVERLAY
      ========================================================== */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.button
            type="button"
            aria-label="Close navigation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 z-[55] bg-black/50 backdrop-blur-[2px] md:hidden"
          />
        )}
      </AnimatePresence>

      {/* =========================================================
          SIDEBAR
      ========================================================== */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-[60]
          flex h-screen shrink-0 flex-col
          overflow-hidden
          bg-[#1A2B48] text-white
          shadow-2xl
          transition-all duration-300 ease-in-out

          w-[270px]

          max-[1279px]:w-[245px]
          max-[1023px]:w-[225px]

          max-md:w-[min(86vw,320px)]
          max-md:shadow-[12px_0_40px_rgba(0,0,0,0.25)]
          max-md:transform
          ${
            isMobileOpen
              ? "max-md:translate-x-0"
              : "max-md:-translate-x-full"
          }
        `}
      >
        {/* =========================================================
            BRAND
        ========================================================== */}
        <div className="relative shrink-0 overflow-hidden border-b border-white/10 px-6 py-6 max-[1279px]:px-5 max-[1023px]:py-5 max-[1023px]:px-4 max-md:px-5 max-md:py-5">
          <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full border border-[#88B3D8]/10" />

          <Link
            to="/dashboard"
            onClick={handleNavigation}
            className="relative flex min-w-0 items-center gap-3"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#88B3D8] text-sm font-bold text-[#1A2B48] max-[1023px]:h-9 max-[1023px]:w-9">
              G
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold tracking-[-0.02em] max-[1023px]:text-[13px]">
                GIKI Adventure
              </p>

              <p className="truncate text-[9px] font-medium uppercase tracking-[0.2em] text-[#88B3D8] max-[1023px]:text-[8px]">
                Club Portal
              </p>
            </div>
          </Link>
        </div>

        {/* =========================================================
            USER ROLE
        ========================================================== */}
        <div className="shrink-0 px-5 pt-5 max-[1279px]:px-4 max-[1023px]:pt-4">
          <div className="rounded-2xl bg-white/5 px-4 py-3 max-[1023px]:px-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#88B3D8] text-xs font-bold text-[#1A2B48] max-[1023px]:h-8 max-[1023px]:w-8">
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initials
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-white">
                  {user?.fullName || "GAC Member"}
                </p>

                <p className="mt-0.5 truncate text-[9px] uppercase tracking-[0.1em] text-white/35">
                  {ROLE_LABELS[user?.role] ||
                    user?.role?.replaceAll("_", " ") ||
                    "Member"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================
            NAVIGATION
        ========================================================== */}
        <nav className="sidebar-scrollbar min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-4 py-6 max-[1279px]:px-3.5 max-[1023px]:py-5 max-[1023px]:px-3 max-md:px-4 max-md:py-5">
          {Object.entries(groupedItems).map(([section, items]) => (
            <div key={section} className="mb-7 last:mb-0 max-[1023px]:mb-5">
              <p className="mb-2 truncate px-3 text-[8px] font-semibold uppercase tracking-[0.22em] text-white/25 max-[1023px]:px-2">
                {section}
              </p>

              <div className="space-y-1">
                {items.map((item) => {
                  const isActive = location.pathname === item.to;

                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={handleNavigation}
                      className="relative block min-w-0"
                    >
                      {isActive && (
                        <motion.div
                          layoutId="sidebar-active"
                          className="absolute inset-0 rounded-xl bg-[#3D6BB4]"
                          transition={{
                            type: "spring",
                            stiffness: 350,
                            damping: 30,
                          }}
                        />
                      )}

                      <div
                        className={`relative flex min-w-0 items-center gap-3 rounded-xl px-3 py-2.5 transition-colors duration-200 max-[1023px]:gap-2.5 max-[1023px]:px-2.5 max-[1023px]:py-2.5 ${
                          isActive
                            ? "text-white"
                            : "text-white/45 hover:bg-white/5 hover:text-white/80"
                        }`}
                      >
                        <span
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm max-[1023px]:h-6 max-[1023px]:w-6 max-[1023px]:text-[13px] ${
                            isActive
                              ? "bg-white/10 text-white"
                              : "text-white/40"
                          }`}
                        >
                          {item.icon}
                        </span>

                        <span className="min-w-0 flex-1 truncate text-xs font-medium max-[1023px]:text-[11px]">
                          {item.label}
                        </span>

                        {isActive && (
                          <span className="ml-auto shrink-0 text-[11px] text-white/50">
                            →
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* =========================================================
            BOTTOM AREA
        ========================================================== */}
        <div className="shrink-0 border-t border-white/10 p-4 max-[1279px]:p-3.5 max-[1023px]:p-3 max-md:p-4">
          {/* GAC slogan */}
          <div className="mb-4 px-2 max-[1023px]:mb-3">
            <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-[#88B3D8]">
              GAC
            </p>

            <p className="mt-1 text-[10px] italic text-white/25">
              Beyond the ordinary.
            </p>
          </div>

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            className="group flex w-full min-w-0 items-center gap-3 rounded-xl px-3 py-3 text-left text-white/40 transition-all duration-200 hover:bg-red-500/10 hover:text-red-300 active:scale-[0.99] max-[1023px]:gap-2.5 max-[1023px]:px-2.5"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/5 text-sm transition-colors group-hover:bg-red-500/10 max-[1023px]:h-6 max-[1023px]:w-6">
              ↪
            </span>

            <span className="truncate text-xs font-medium max-[1023px]:text-[11px]">
              Log out
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}