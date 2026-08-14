import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/authStore";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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
  const canManageEvents = ["event_coordinator", "super_admin"].includes(
    user?.role,
  );
  const isFinance = ["finance_master", "super_admin"].includes(user?.role);
  const isLogistics = ["master_logistics", "super_admin"].includes(user?.role);
  const canViewBudget = [
    "president",
    "vp_ops",
    "event_coordinator",
    "super_admin",
  ].includes(user?.role);
  const isLeadership = ["president", "vp_ops", "super_admin"].includes(
    user?.role,
  );
  const isSuperAdmin = user?.role === "super_admin";
  const canViewFemaleList = [
    "general_secretary",
    "super_admin",
    "event_coordinator",
  ].includes(user?.role);
  useEffect(() => {
    if (!isStudent) return;

    api.get("/registrations/my").then(({ data }) => {
      const regs = data.registrations;

      setStats({
        total: regs.length,
        approved: regs.filter((r) => r.status === "approved").length,
        pending: regs.filter((r) => r.status === "pending").length,
        waitlisted: regs.filter((r) => r.status === "waitlisted").length,
      });
    });
  }, [isStudent]);

  return (
    <AdminLayout>
      <main className="min-h-screen bg-[#EBF2F2]">
        {/* =========================================================
            MAIN CONTAINER
        ========================================================== */}
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
          {/* =======================================================
              WELCOME HERO
          ======================================================== */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative mb-8 overflow-hidden rounded-[2rem] bg-[#1A2B48]"
          >
            {/* Decorative rings */}
            <div className="pointer-events-none absolute -right-28 -top-28 h-72 w-72 rounded-full border border-[#88B3D8]/10" />

            <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full border border-[#88B3D8]/10" />

            {/* Mountain silhouette */}
            <div className="pointer-events-none absolute bottom-0 right-0 h-[45%] w-[55%] bg-[#3D6BB4]/30 [clip-path:polygon(0_100%,20%_45%,36%_70%,54%_20%,70%_60%,85%_35%,100%_65%,100%_100%)]" />

            <div className="relative flex flex-col gap-8 p-7 sm:p-9 lg:flex-row lg:items-end lg:justify-between lg:p-12">
              {/* User */}
              <div className="flex items-center gap-5">
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt=""
                    className="h-20 w-20 rounded-full border-4 border-white/10 object-cover sm:h-24 sm:w-24"
                  />
                ) : (
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-white text-2xl font-semibold text-[#1A2B48] sm:h-24 sm:w-24">
                    {user?.fullName?.charAt(0)}
                  </div>
                )}

                <div>
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#88B3D8]">
                    GAC Dashboard
                  </p>

                  <h1 className="text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl lg:text-5xl">
                    Welcome back,
                    <br />
                    <span className="text-[#88B3D8]">
                      {user?.fullName?.split(" ")[0]}.
                    </span>
                  </h1>

                  <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
                    <span className="rounded-full bg-white/10 px-3 py-1.5 text-white/70">
                      {ROLE_LABELS[user?.role]}
                    </span>

                    <Link
                      to="/profile"
                      className="text-white/40 transition-colors hover:text-white"
                    >
                      Edit Profile ↗
                    </Link>
                  </div>
                </div>
              </div>

              {/* Brand message */}
              <div className="relative z-10 max-w-xs lg:text-right">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/30">
                  GAC
                </p>

                <p className="mt-2 text-sm leading-6 text-white/50">
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
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-8"
            >
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#688BB0]">
                    Your Journey
                  </p>

                  <h2 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-[#1A2B48]">
                    Adventure Overview
                  </h2>
                </div>

                <Link
                  to="/my-tickets"
                  className="hidden text-xs font-semibold uppercase tracking-[0.14em] text-[#3D6BB4] transition-colors hover:text-[#1A2B48] sm:block"
                >
                  My Tickets ↗
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {/* Total */}
                <StatCard
                  value={stats.total}
                  label="Total Registrations"
                  number="01"
                  delay={0}
                />

                {/* Confirmed */}
                <StatCard
                  value={stats.approved}
                  label="Confirmed"
                  number="02"
                  delay={0.05}
                  accent
                />

                {/* Pending */}
                <StatCard
                  value={stats.pending}
                  label="Pending"
                  number="03"
                  delay={0.1}
                />

                {/* Waitlisted */}
                <StatCard
                  value={stats.waitlisted}
                  label="Waitlisted"
                  number="04"
                  delay={0.15}
                />
              </div>

              {/* Tickets CTA */}
              <Link to="/my-tickets" className="mt-4 block sm:hidden">
                <div className="flex items-center justify-between rounded-2xl bg-white px-5 py-4 shadow-[0_10px_35px_rgba(26,43,72,0.05)]">
                  <span className="text-sm font-medium text-[#1A2B48]">
                    View My Tickets
                  </span>

                  <span className="text-[#3D6BB4]">↗</span>
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
              <div className="mb-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#688BB0]">
                  Management
                </p>

                <h2 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-[#1A2B48]">
                  Admin Tools
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {/* Role Management */}
                {isSuperAdmin && (
                  <AdminTool
                    to="/admin"
                    number="01"
                    title="Role Management"
                    description="Manage user roles and permissions."
                  />
                )}

                {/* Events */}
                {canManageEvents && (
                  <AdminTool
                    to="/admin/events"
                    number="02"
                    title="Manage Events"
                    description="Create, edit and manage GAC adventures."
                  />
                )}

                {/* Finance */}
                {isFinance && (
                  <AdminTool
                    to="/admin/finance"
                    number="03"
                    title="Finance Dashboard"
                    description="Track payments, registrations and finances."
                  />
                )}

                {/* Logistics */}
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
                {/* Budget */}
                {canViewBudget && (
                  <AdminTool
                    to="/admin/budget-overview"
                    number="05"
                    title="Budget Overview"
                    description="Review budgets and financial planning."
                  />
                )}

                {/* Organization */}
                {isLeadership && (
                  <AdminTool
                    to="/admin/overview"
                    number="06"
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
          <div className="mt-12 flex items-center justify-between border-t border-[#88B3D8]/20 pt-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#688BB0]">
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

function StatCard({ value, label, number, accent = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group relative overflow-hidden rounded-[1.5rem] p-6 shadow-[0_10px_35px_rgba(26,43,72,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(26,43,72,0.1)] ${
        accent ? "bg-[#1A2B48] text-white" : "bg-white text-[#1A2B48]"
      }`}
    >
      {/* Number */}
      <div
        className={`absolute right-5 top-5 text-[10px] font-semibold tracking-[0.15em] ${
          accent ? "text-white/20" : "text-[#88B3D8]/60"
        }`}
      >
        {number}
      </div>

      {/* Value */}
      <p className="text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">
        {value}
      </p>

      {/* Label */}
      <p
        className={`mt-3 text-xs leading-5 ${
          accent ? "text-white/50" : "text-[#688BB0]"
        }`}
      >
        {label}
      </p>

      {/* Accent line */}
      <div
        className={`mt-5 h-1 w-8 rounded-full transition-all duration-300 group-hover:w-14 ${
          accent ? "bg-[#88B3D8]" : "bg-[#3D6BB4]"
        }`}
      />
    </motion.div>
  );
}

/* ===============================================================
   ADMIN TOOL CARD
================================================================ */

function AdminTool({ to, number, title, description }) {
  return (
    <Link to={to} className="group block">
      <motion.div
        whileHover={{ y: -3 }}
        transition={{ duration: 0.2 }}
        className="relative h-full overflow-hidden rounded-[1.5rem] bg-white p-6 shadow-[0_10px_35px_rgba(26,43,72,0.05)] transition-all duration-300 group-hover:shadow-[0_20px_50px_rgba(26,43,72,0.1)]"
      >
        {/* Background decoration */}
        <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full border border-[#88B3D8]/10 transition-transform duration-500 group-hover:scale-125" />

        {/* Header */}
        <div className="relative flex items-center justify-between">
          <span className="text-[10px] font-semibold tracking-[0.18em] text-[#88B3D8]">
            {number}
          </span>

          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#EBF2F2] text-sm text-[#1A2B48] transition-all duration-300 group-hover:bg-[#1A2B48] group-hover:text-white">
            ↗
          </span>
        </div>

        {/* Content */}
        <div className="relative mt-8">
          <h3 className="text-xl font-semibold tracking-[-0.03em] text-[#1A2B48] transition-colors duration-300 group-hover:text-[#3D6BB4]">
            {title}
          </h3>

          <p className="mt-2 max-w-xs text-sm leading-6 text-[#688BB0]">
            {description}
          </p>
        </div>

        {/* Bottom */}
        <div className="relative mt-8 h-px w-full bg-[#88B3D8]/15">
          <div className="h-px w-8 bg-[#3D6BB4] transition-all duration-500 group-hover:w-20" />
        </div>
      </motion.div>
    </Link>
  );
}
