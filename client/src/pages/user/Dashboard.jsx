import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/authStore";
import AdminLayout from "@/components/admin/AdminLayout";

const ROLE_LABELS = {
  student: "Student",
  event_coordinator: "Event Coordinator",
  finance_master: "Finance Master",
  master_logistics: "Master Logistics",
  vp_ops: "VP Operations",
  president: "President",
  super_admin: "Super Admin",
};

export default function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const [stats, setStats] = useState(null);

  const isStudent = user?.role === "student";

  const canManageEvents = [
    "event_coordinator",
    "super_admin",
  ].includes(user?.role);

  const isFinance = [
    "finance_master",
    "super_admin",
  ].includes(user?.role);

  const isLogistics = [
    "master_logistics",
    "super_admin",
  ].includes(user?.role);

  const canViewBudget = [
    "president",
    "vp_ops",
    "event_coordinator",
    "super_admin",
  ].includes(user?.role);

  const isLeadership = [
    "president",
    "vp_ops",
    "super_admin",
  ].includes(user?.role);

  const isSuperAdmin = user?.role === "super_admin";

  const canViewFemaleList = [
    "general_secretary",
    "super_admin",
    "event_coordinator",
  ].includes(user?.role);

  useEffect(() => {
    if (!isStudent) return;

    api
      .get("/registrations/my")
      .then(({ data }) => {
        const regs = data.registrations || [];

        setStats({
          total: regs.length,
          approved: regs.filter(
            (r) => r.status === "approved"
          ).length,
          pending: regs.filter(
            (r) => r.status === "pending"
          ).length,
          waitlisted: regs.filter(
            (r) => r.status === "waitlisted"
          ).length,
        });
      })
      .catch(() => {
        setStats({
          total: 0,
          approved: 0,
          pending: 0,
          waitlisted: 0,
        });
      });
  }, [isStudent]);

  return (
    <AdminLayout>
      <main className="min-h-screen w-full overflow-x-hidden bg-[#EBF2F2]">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 md:px-8 lg:px-10 lg:py-10 xl:px-12">
          {/* =========================================================
              WELCOME HERO
          ========================================================== */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative mb-7 overflow-hidden rounded-[1.5rem] bg-[#1A2B48] sm:mb-8 sm:rounded-[2rem]"
          >
            {/* Decorative rings */}
            <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full border border-[#88B3D8]/10 sm:-right-28 sm:-top-28 sm:h-72 sm:w-72" />

            <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full border border-[#88B3D8]/10 sm:-right-12 sm:-top-12 sm:h-40 sm:w-40" />

            {/* Mountain silhouette */}
            <div className="pointer-events-none absolute bottom-0 right-0 h-[40%] w-[80%] bg-[#3D6BB4]/30 [clip-path:polygon(0_100%,20%_45%,36%_70%,54%_20%,70%_60%,85%_35%,100%_65%,100%_100%)] sm:h-[45%] sm:w-[65%] lg:w-[55%]" />

            <div className="relative flex flex-col gap-7 p-5 sm:gap-8 sm:p-8 md:p-9 lg:flex-row lg:items-end lg:justify-between lg:p-11 xl:p-12">
              {/* User */}
              <div className="flex min-w-0 items-center gap-3 sm:gap-5">
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt=""
                    className="h-16 w-16 shrink-0 rounded-full border-4 border-white/10 object-cover sm:h-20 sm:w-20 md:h-24 md:w-24"
                  />
                ) : (
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white text-xl font-semibold text-[#1A2B48] sm:h-20 sm:w-20 sm:text-2xl md:h-24 md:w-24">
                    {user?.fullName?.charAt(0)?.toUpperCase() || "G"}
                  </div>
                )}

                <div className="min-w-0">
                  <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#88B3D8] sm:mb-2 sm:text-[10px] sm:tracking-[0.2em]">
                    GAC Dashboard
                  </p>

                  <h1 className="text-2xl font-semibold leading-tight tracking-[-0.04em] text-white sm:text-3xl md:text-4xl lg:text-5xl">
                    Welcome back,
                    <br />
                    <span className="text-[#88B3D8]">
                      {user?.fullName?.split(" ")[0] || "Member"}.
                    </span>
                  </h1>

                  <div className="mt-3 flex flex-wrap items-center gap-2.5 text-xs sm:mt-4 sm:gap-3">
                    <span className="rounded-full bg-white/10 px-2.5 py-1.5 text-[10px] text-white/70 sm:px-3 sm:text-xs">
                      {ROLE_LABELS[user?.role] ||
                        user?.role?.replaceAll("_", " ") ||
                        "Member"}
                    </span>

                    <Link
                      to="/profile"
                      className="text-[10px] text-white/40 transition-colors hover:text-white sm:text-xs"
                    >
                      Edit Profile ↗
                    </Link>
                  </div>
                </div>
              </div>

              {/* Brand message */}
              <div className="relative z-10 max-w-xs lg:text-right">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/30">
                  GAC
                </p>

                <p className="mt-1.5 text-xs leading-5 text-white/50 sm:mt-2 sm:text-sm sm:leading-6">
                  Beyond the ordinary.
                  <br />
                  Into the mountains.
                </p>
              </div>
            </div>
          </motion.section>

          {/* =======================================================
              STUDENT STATS
          ======================================================== */}
          {isStudent && stats && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: 0.1,
              }}
              className="mb-7 sm:mb-8"
            >
              <div className="mb-3 flex items-end justify-between gap-3 sm:mb-4">
                <div className="min-w-0">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#688BB0] sm:text-[10px] sm:tracking-[0.2em]">
                    Your Journey
                  </p>

                  <h2 className="mt-1 text-xl font-semibold tracking-[-0.03em] text-[#1A2B48] sm:text-2xl">
                    Adventure Overview
                  </h2>
                </div>

                <Link
                  to="/my-tickets"
                  className="hidden shrink-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#3D6BB4] transition-colors hover:text-[#1A2B48] sm:block sm:text-xs"
                >
                  My Tickets ↗
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
                <StatCard
                  value={stats.total}
                  label="Total Registrations"
                  number="01"
                />

                <StatCard
                  value={stats.approved}
                  label="Confirmed"
                  number="02"
                  accent
                />

                <StatCard
                  value={stats.pending}
                  label="Pending"
                  number="03"
                />

                <StatCard
                  value={stats.waitlisted}
                  label="Waitlisted"
                  number="04"
                />
              </div>

              {/* Tickets CTA */}
              <Link
                to="/my-tickets"
                className="mt-3 block sm:hidden"
              >
                <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3.5 shadow-[0_10px_35px_rgba(26,43,72,0.05)]">
                  <span className="text-xs font-medium text-[#1A2B48]">
                    View My Tickets
                  </span>

                  <span className="text-sm text-[#3D6BB4]">
                    ↗
                  </span>
                </div>
              </Link>
            </motion.section>
          )}

          {/* =======================================================
              ADMIN TOOLS
          ======================================================== */}
          {(isSuperAdmin ||
            canManageEvents ||
            isFinance ||
            isLogistics ||
            canViewBudget ||
            isLeadership ||
            canViewFemaleList) && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: isStudent ? 0.2 : 0.1,
              }}
            >
              <div className="mb-3 sm:mb-4">
                <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#688BB0] sm:text-[10px] sm:tracking-[0.2em]">
                  Management
                </p>

                <h2 className="mt-1 text-xl font-semibold tracking-[-0.03em] text-[#1A2B48] sm:text-2xl">
                  Admin Tools
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
                {isSuperAdmin && (
                  <AdminTool
                    to="/admin"
                    number="01"
                    title="Role Management"
                    description="Manage user roles and permissions."
                  />
                )}

                {canManageEvents && (
                  <AdminTool
                    to="/admin/events"
                    number="02"
                    title="Manage Events"
                    description="Create, edit and manage GAC adventures."
                  />
                )}

                {isFinance && (
                  <AdminTool
                    to="/admin/finance"
                    number="03"
                    title="Finance Dashboard"
                    description="Track payments, registrations and finances."
                  />
                )}

                {isLogistics && (
                  <AdminTool
                    to="/admin/logistics"
                    number="04"
                    title="Logistics Dashboard"
                    description="Manage transport and trip logistics."
                  />
                )}

                {canViewFemaleList && (
                  <AdminTool
                    to="/admin/female-list"
                    number="05"
                    title="Female Students List"
                    description="View and manage the registered female students."
                  />
                )}

                {canViewBudget && (
                  <AdminTool
                    to="/admin/budget-overview"
                    number="06"
                    title="Budget Overview"
                    description="Review budgets and financial planning."
                  />
                )}

                {isLeadership && (
                  <AdminTool
                    to="/admin/overview"
                    number="07"
                    title="Organization Overview"
                    description="View the GAC organizational structure."
                  />
                )}
              </div>
            </motion.section>
          )}

          {/* =======================================================
              FOOTER LABEL
          ======================================================== */}
          <div className="mt-9 flex flex-col gap-3 border-t border-[#88B3D8]/20 pt-5 sm:mt-12 sm:flex-row sm:items-center sm:justify-between sm:gap-0 sm:pt-6">
            <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#688BB0] sm:text-[10px] sm:tracking-[0.2em]">
              GIKI Adventure Club
            </p>

            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#88B3D8]" />
              <span className="h-1.5 w-1.5 rounded-full bg-[#5F97DF]" />
              <span className="h-1.5 w-1.5 rounded-full bg-[#3D6BB4]" />
            </div>
          </div>
        </div>
      </main>
    </AdminLayout>
  );
}

/* ===============================================================
   STAT CARD
================================================================ */

function StatCard({
  value,
  label,
  number,
  accent = false,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group relative min-w-0 overflow-hidden rounded-[1.25rem] p-4 shadow-[0_10px_35px_rgba(26,43,72,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(26,43,72,0.1)] sm:rounded-[1.5rem] sm:p-6 ${
        accent
          ? "bg-[#1A2B48] text-white"
          : "bg-white text-[#1A2B48]"
      }`}
    >
      {/* Number */}
      <div
        className={`absolute right-3 top-3 text-[8px] font-semibold tracking-[0.15em] sm:right-5 sm:top-5 sm:text-[10px] ${
          accent
            ? "text-white/20"
            : "text-[#88B3D8]/60"
        }`}
      >
        {number}
      </div>

      {/* Value */}
      <p className="truncate text-3xl font-semibold tracking-[-0.05em] sm:text-5xl">
        {value}
      </p>

      {/* Label */}
      <p
        className={`mt-2 max-w-[130px] text-[10px] leading-4 sm:mt-3 sm:max-w-none sm:text-xs sm:leading-5 ${
          accent
            ? "text-white/50"
            : "text-[#688BB0]"
        }`}
      >
        {label}
      </p>

      {/* Accent line */}
      <div
        className={`mt-4 h-1 w-7 rounded-full transition-all duration-300 group-hover:w-12 sm:mt-5 sm:w-8 sm:group-hover:w-14 ${
          accent
            ? "bg-[#88B3D8]"
            : "bg-[#3D6BB4]"
        }`}
      />
    </motion.div>
  );
}

/* ===============================================================
   ADMIN TOOL CARD
================================================================ */

function AdminTool({
  to,
  number,
  title,
  description,
}) {
  return (
    <Link
      to={to}
      className="group block min-w-0"
    >
      <motion.div
        whileHover={{ y: -3 }}
        transition={{ duration: 0.2 }}
        className="relative h-full min-h-[190px] overflow-hidden rounded-[1.25rem] bg-white p-5 shadow-[0_10px_35px_rgba(26,43,72,0.05)] transition-all duration-300 group-hover:shadow-[0_20px_50px_rgba(26,43,72,0.1)] sm:min-h-[210px] sm:rounded-[1.5rem] sm:p-6"
      >
        {/* Background decoration */}
        <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full border border-[#88B3D8]/10 transition-transform duration-500 group-hover:scale-125" />

        {/* Header */}
        <div className="relative flex items-center justify-between gap-3">
          <span className="text-[9px] font-semibold tracking-[0.18em] text-[#88B3D8] sm:text-[10px]">
            {number}
          </span>

          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EBF2F2] text-sm text-[#1A2B48] transition-all duration-300 group-hover:bg-[#1A2B48] group-hover:text-white sm:h-9 sm:w-9">
            ↗
          </span>
        </div>

        {/* Content */}
        <div className="relative mt-6 sm:mt-8">
          <h3 className="text-lg font-semibold leading-6 tracking-[-0.03em] text-[#1A2B48] transition-colors duration-300 group-hover:text-[#3D6BB4] sm:text-xl">
            {title}
          </h3>

          <p className="mt-2 max-w-xs text-xs leading-5 text-[#688BB0] sm:text-sm sm:leading-6">
            {description}
          </p>
        </div>

        {/* Bottom */}
        <div className="relative mt-6 h-px w-full bg-[#88B3D8]/15 sm:mt-8">
          <div className="h-px w-7 bg-[#3D6BB4] transition-all duration-500 group-hover:w-16 sm:w-8 sm:group-hover:w-20" />
        </div>
      </motion.div>
    </Link>
  );
}