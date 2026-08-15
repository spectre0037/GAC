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
  general_secretary: "General Secretary",
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
          approved: regs.filter((r) => r.status === "approved").length,
          pending: regs.filter((r) => r.status === "pending").length,
          waitlisted: regs.filter((r) => r.status === "waitlisted").length,
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

  const firstName =
    user?.fullName?.split(" ")[0] || "Member";

  const roleLabel =
    ROLE_LABELS[user?.role] ||
    user?.role?.replaceAll("_", " ") ||
    "Member";

  const hasAdminTools =
    isSuperAdmin ||
    canManageEvents ||
    isFinance ||
    isLogistics ||
    canViewBudget ||
    isLeadership ||
    canViewFemaleList;

  return (
    <AdminLayout>
      <main className="min-h-screen w-full overflow-x-hidden bg-[#EBF2F2]">
        <div
          className="
            mx-auto w-full max-w-7xl
            px-4
            pb-8
            pt-20
            sm:px-6 sm:pb-10 sm:pt-8
            md:px-8 md:pt-10
            lg:px-10
            xl:px-12
          "
        >
          {/* =====================================================
              WELCOME HERO
          ====================================================== */}
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="
              relative mb-7 overflow-hidden
              rounded-[1.75rem]
              bg-[#1A2B48]
              shadow-[0_18px_60px_rgba(26,43,72,0.14)]
              sm:mb-9
              sm:rounded-[2rem]
            "
          >
            {/* Soft glow */}
            <div
              className="
                pointer-events-none absolute
                -right-24 -top-28
                h-72 w-72
                rounded-full
                bg-[#3D6BB4]/20
                blur-3xl
              "
            />

            <div
              className="
                pointer-events-none absolute
                -bottom-28 -left-20
                h-64 w-64
                rounded-full
                bg-[#88B3D8]/10
                blur-3xl
              "
            />

            {/* Rings */}
            <div
              className="
                pointer-events-none absolute
                -right-20 -top-20
                h-64 w-64
                rounded-full
                border border-[#88B3D8]/10
              "
            />

            <div
              className="
                pointer-events-none absolute
                -right-2 -top-2
                h-40 w-40
                rounded-full
                border border-[#88B3D8]/10
              "
            />

            {/* Mountain */}
            <div
              className="
                pointer-events-none absolute
                bottom-0 right-0
                h-[42%] w-[85%]
                bg-[#3D6BB4]/25
                [clip-path:polygon(0_100%,18%_48%,32%_70%,48%_25%,63%_62%,77%_38%,90%_60%,100%_45%,100%_100%)]
                sm:h-[50%] sm:w-[65%]
                lg:w-[52%]
              "
            />

            <div
              className="
                pointer-events-none absolute
                bottom-0 right-0
                h-[27%] w-[70%]
                bg-[#88B3D8]/10
                [clip-path:polygon(0_100%,25%_60%,40%_80%,58%_40%,75%_68%,88%_48%,100%_70%,100%_100%)]
                sm:w-[55%]
              "
            />

            <div
              className="
                relative z-10
                flex flex-col
                gap-8
                p-5
                sm:p-8
                md:p-10
                lg:flex-row
                lg:items-end
                lg:justify-between
                lg:p-12
              "
            >
              {/* User */}
              <div className="flex min-w-0 items-center gap-4 sm:gap-5">
                {/* Avatar */}
                <div className="relative shrink-0">
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt=""
                      className="
                        h-16 w-16 rounded-2xl
                        border border-white/15
                        object-cover
                        shadow-xl
                        sm:h-20 sm:w-20
                        md:h-24 md:w-24
                      "
                    />
                  ) : (
                    <div
                      className="
                        flex h-16 w-16
                        items-center justify-center
                        rounded-2xl
                        bg-white
                        text-xl font-semibold
                        text-[#1A2B48]
                        shadow-xl
                        sm:h-20 sm:w-20 sm:text-2xl
                        md:h-24 md:w-24
                      "
                    >
                      {firstName.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <span
                    className="
                      absolute -bottom-1 -right-1
                      h-4 w-4
                      rounded-full
                      border-[3px]
                      border-[#1A2B48]
                      bg-[#88B3D8]
                    "
                  />
                </div>

                <div className="min-w-0">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#88B3D8]" />

                    <p
                      className="
                        text-[9px]
                        font-semibold
                        uppercase
                        tracking-[0.2em]
                        text-[#88B3D8]
                        sm:text-[10px]
                      "
                    >
                      GAC Dashboard
                    </p>
                  </div>

                  <h1
                    className="
                      text-[1.7rem]
                      font-semibold
                      leading-[1.05]
                      tracking-[-0.05em]
                      text-white
                      sm:text-3xl
                      md:text-4xl
                      lg:text-5xl
                    "
                  >
                    Welcome back,
                    <br />
                    <span className="text-[#88B3D8]">
                      {firstName}.
                    </span>
                  </h1>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span
                      className="
                        rounded-full
                        border border-white/10
                        bg-white/10
                        px-3 py-1.5
                        text-[10px]
                        font-medium
                        text-white/70
                        backdrop-blur-sm
                        sm:text-xs
                      "
                    >
                      {roleLabel}
                    </span>

                    <Link
                      to="/profile"
                      className="
                        rounded-full
                        px-3 py-1.5
                        text-[10px]
                        font-medium
                        text-white/40
                        transition
                        hover:bg-white/10
                        hover:text-white
                        sm:text-xs
                      "
                    >
                      Edit Profile →
                    </Link>
                  </div>
                </div>
              </div>

              {/* Brand */}
              <div className="relative z-10 max-w-sm lg:text-right">
                <p
                  className="
                    text-[9px]
                    font-semibold
                    uppercase
                    tracking-[0.25em]
                    text-[#88B3D8]/60
                    sm:text-[10px]
                  "
                >
                  GIKI ADVENTURE CLUB
                </p>

                <p
                  className="
                    mt-2
                    text-sm
                    leading-6
                    text-white/50
                    sm:text-base
                  "
                >
                  Beyond the ordinary.
                  <br />
                  Into the mountains.
                </p>
              </div>
            </div>
          </motion.section>

          {/* =====================================================
              STUDENT OVERVIEW
          ====================================================== */}
          {isStudent && stats && (
            <motion.section
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.08 }}
              className="mb-8 sm:mb-10"
            >
              <SectionHeading
                eyebrow="Your Journey"
                title="Adventure Overview"
                action={
                  <Link
                    to="/my-tickets"
                    className="
                      hidden rounded-full
                      border border-[#88B3D8]/30
                      bg-white px-4 py-2
                      text-[10px]
                      font-semibold
                      uppercase
                      tracking-[0.12em]
                      text-[#3D6BB4]
                      shadow-sm
                      transition
                      hover:border-[#3D6BB4]/30
                      hover:bg-[#1A2B48]
                      hover:text-white
                      sm:block
                    "
                  >
                    My Tickets →
                  </Link>
                }
              />

              <div
                className="
                  grid grid-cols-2
                  gap-3
                  sm:grid-cols-2 sm:gap-4
                  lg:grid-cols-4
                "
              >
                <StatCard
                  value={stats.total}
                  label="Total Registrations"
                  number="01"
                  icon={<TicketIcon />}
                />

                <StatCard
                  value={stats.approved}
                  label="Confirmed"
                  number="02"
                  accent
                  icon={<CheckIcon />}
                />

                <StatCard
                  value={stats.pending}
                  label="Pending"
                  number="03"
                  icon={<ClockIcon />}
                />

                <StatCard
                  value={stats.waitlisted}
                  label="Waitlisted"
                  number="04"
                  icon={<ListIcon />}
                />
              </div>

              <Link
                to="/my-tickets"
                className="mt-3 block sm:hidden"
              >
                <div
                  className="
                    flex items-center justify-between
                    rounded-2xl
                    border border-[#88B3D8]/20
                    bg-white
                    px-4 py-3.5
                    shadow-[0_10px_35px_rgba(26,43,72,0.05)]
                    transition
                    active:scale-[0.99]
                  "
                >
                  <div>
                    <p className="text-xs font-semibold text-[#1A2B48]">
                      View My Tickets
                    </p>

                    <p className="mt-0.5 text-[10px] text-[#688BB0]">
                      Check your upcoming adventures
                    </p>
                  </div>

                  <span
                    className="
                      flex h-8 w-8
                      items-center justify-center
                      rounded-full
                      bg-[#EBF2F2]
                      text-[#3D6BB4]
                    "
                  >
                    →
                  </span>
                </div>
              </Link>
            </motion.section>
          )}

          {/* =====================================================
              ADMIN TOOLS
          ====================================================== */}
          {hasAdminTools && (
            <motion.section
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.55,
                delay: isStudent ? 0.16 : 0.08,
              }}
            >
              <SectionHeading
                eyebrow="Management"
                title="Admin Tools"
              />

              <div
                className="
                  grid grid-cols-1
                  gap-3
                  sm:grid-cols-2 sm:gap-4
                  lg:grid-cols-3
                "
              >
                {isSuperAdmin && (
                  <AdminTool
                    to="/admin"
                    number="01"
                    title="Role Management"
                    description="Manage user roles and permissions."
                    icon={<UsersIcon />}
                  />
                )}

                {canManageEvents && (
                  <AdminTool
                    to="/admin/events"
                    number="02"
                    title="Manage Events"
                    description="Create, edit and manage GAC adventures."
                    icon={<MountainIcon />}
                  />
                )}

                {isFinance && (
                  <AdminTool
                    to="/admin/finance"
                    number="03"
                    title="Finance Dashboard"
                    description="Track payments, registrations and finances."
                    icon={<WalletIcon />}
                  />
                )}

                {isLogistics && (
                  <AdminTool
                    to="/admin/logistics"
                    number="04"
                    title="Logistics Dashboard"
                    description="Manage transport and trip logistics."
                    icon={<BoxIcon />}
                  />
                )}

                {canViewFemaleList && (
                  <AdminTool
                    to="/admin/female-list"
                    number="05"
                    title="Female Students List"
                    description="View and manage registered female students."
                    icon={<UsersIcon />}
                  />
                )}

                {canViewBudget && (
                  <AdminTool
                    to="/admin/budget-overview"
                    number="06"
                    title="Budget Overview"
                    description="Review budgets and financial planning."
                    icon={<ChartIcon />}
                  />
                )}

                {isLeadership && (
                  <AdminTool
                    to="/admin/overview"
                    number="07"
                    title="Organization Overview"
                    description="View the GAC organizational structure."
                    icon={<OrganizationIcon />}
                  />
                )}
              </div>
            </motion.section>
          )}

          {/* =====================================================
              FOOTER
          ====================================================== */}
          <footer
            className="
              mt-10
              flex flex-col gap-4
              border-t border-[#88B3D8]/20
              pt-6
              sm:mt-14
              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >
            <div>
              <p
                className="
                  text-[9px]
                  font-semibold
                  uppercase
                  tracking-[0.2em]
                  text-[#688BB0]
                  sm:text-[10px]
                "
              >
                GIKI Adventure Club
              </p>

              <p className="mt-1 text-[10px] text-[#688BB0]/70">
                Beyond the ordinary.
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#88B3D8]" />
              <span className="h-1.5 w-1.5 rounded-full bg-[#5F97DF]" />
              <span className="h-1.5 w-1.5 rounded-full bg-[#3D6BB4]" />
            </div>
          </footer>
        </div>
      </main>
    </AdminLayout>
  );
}

/* ===============================================================
   SECTION HEADING
================================================================ */

function SectionHeading({ eyebrow, title, action }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4 sm:mb-5">
      <div>
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[#3D6BB4]" />

          <p
            className="
              text-[9px]
              font-semibold
              uppercase
              tracking-[0.2em]
              text-[#688BB0]
              sm:text-[10px]
            "
          >
            {eyebrow}
          </p>
        </div>

        <h2
          className="
            mt-1.5
            text-xl
            font-semibold
            tracking-[-0.04em]
            text-[#1A2B48]
            sm:text-2xl
          "
        >
          {title}
        </h2>
      </div>

      {action}
    </div>
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
  icon,
}) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={`
        group relative min-w-0 overflow-hidden
        rounded-[1.35rem]
        p-4
        shadow-[0_10px_35px_rgba(26,43,72,0.06)]
        transition-shadow duration-300
        hover:shadow-[0_20px_50px_rgba(26,43,72,0.11)]
        sm:rounded-[1.5rem]
        sm:p-5
        md:p-6
        ${
          accent
            ? "bg-[#1A2B48] text-white"
            : "border border-[#88B3D8]/10 bg-white text-[#1A2B48]"
        }
      `}
    >
      {/* Decorative circle */}
      <div
        className={`
          pointer-events-none absolute
          -right-10 -top-10
          h-24 w-24
          rounded-full
          border
          ${
            accent
              ? "border-white/10"
              : "border-[#88B3D8]/10"
          }
          transition-transform duration-500
          group-hover:scale-125
        `}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div
          className={`
            flex h-9 w-9
            items-center justify-center
            rounded-xl
            ${
              accent
                ? "bg-white/10 text-[#88B3D8]"
                : "bg-[#EBF2F2] text-[#3D6BB4]"
            }
          `}
        >
          {icon}
        </div>

        <span
          className={`
            text-[8px]
            font-semibold
            tracking-[0.18em]
            sm:text-[9px]
            ${
              accent
                ? "text-white/20"
                : "text-[#88B3D8]/70"
            }
          `}
        >
          {number}
        </span>
      </div>

      <div className="relative mt-5">
        <p
          className="
            text-3xl
            font-semibold
            tracking-[-0.06em]
            sm:text-4xl
            md:text-5xl
          "
        >
          {value}
        </p>

        <p
          className={`
            mt-1.5
            text-[10px]
            leading-4
            sm:mt-2
            sm:text-xs
            sm:leading-5
            ${
              accent
                ? "text-white/50"
                : "text-[#688BB0]"
            }
          `}
        >
          {label}
        </p>
      </div>

      <div
        className={`
          relative mt-4
          h-1 rounded-full
          transition-all duration-500
          group-hover:w-14
          sm:mt-5
          sm:w-9
          ${
            accent
              ? "bg-[#88B3D8]"
              : "bg-[#3D6BB4]"
          }
        `}
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
  icon,
}) {
  return (
    <Link to={to} className="group block min-w-0">
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
        className="
          relative h-full min-h-[190px]
          overflow-hidden
          rounded-[1.4rem]
          border border-[#88B3D8]/10
          bg-white
          p-5
          shadow-[0_10px_35px_rgba(26,43,72,0.05)]
          transition-all duration-300
          group-hover:border-[#88B3D8]/25
          group-hover:shadow-[0_22px_55px_rgba(26,43,72,0.11)]
          sm:min-h-[205px]
          sm:rounded-[1.5rem]
          sm:p-6
        "
      >
        {/* Large decorative circle */}
        <div
          className="
            pointer-events-none
            absolute
            -right-14 -top-14
            h-36 w-36
            rounded-full
            border border-[#88B3D8]/10
            transition-transform duration-700
            group-hover:scale-125
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            -bottom-20 -left-20
            h-40 w-40
            rounded-full
            bg-[#EBF2F2]/70
          "
        />

        {/* Header */}
        <div className="relative flex items-center justify-between gap-3">
          <div
            className="
              flex h-10 w-10
              items-center justify-center
              rounded-xl
              bg-[#EBF2F2]
              text-[#3D6BB4]
              transition-all duration-300
              group-hover:bg-[#1A2B48]
              group-hover:text-white
            "
          >
            {icon}
          </div>

          <div className="flex items-center gap-3">
            <span
              className="
                text-[9px]
                font-semibold
                tracking-[0.18em]
                text-[#88B3D8]
              "
            >
              {number}
            </span>

            <span
              className="
                flex h-8 w-8
                items-center justify-center
                rounded-full
                border border-[#88B3D8]/20
                bg-white
                text-sm
                text-[#3D6BB4]
                transition-all duration-300
                group-hover:border-[#1A2B48]
                group-hover:bg-[#1A2B48]
                group-hover:text-white
              "
            >
              →
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="relative mt-7">
          <h3
            className="
              text-lg
              font-semibold
              leading-6
              tracking-[-0.035em]
              text-[#1A2B48]
              transition-colors duration-300
              group-hover:text-[#3D6BB4]
              sm:text-xl
            "
          >
            {title}
          </h3>

          <p
            className="
              mt-2
              max-w-sm
              text-xs
              leading-5
              text-[#688BB0]
              sm:text-sm
              sm:leading-6
            "
          >
            {description}
          </p>
        </div>

        {/* Bottom line */}
        <div
          className="
            absolute
            bottom-0 left-5 right-5
            h-px
            bg-[#88B3D8]/15
            sm:left-6 sm:right-6
          "
        >
          <div
            className="
              h-px w-8
              bg-[#3D6BB4]
              transition-all duration-500
              group-hover:w-20
            "
          />
        </div>
      </motion.div>
    </Link>
  );
}

/* ===============================================================
   ICONS
================================================================ */

function TicketIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5h13A2.5 2.5 0 0 1 21 7.5v2a2 2 0 0 0 0 5v2a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 16.5v-2a2 2 0 0 0 0-5z" />
      <path d="M12 7v2M12 15v2" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 6h12M8 12h12M8 18h12" />
      <path d="M4 6h.01M4 12h.01M4 18h.01" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function MountainIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3 19 7-14 4 8 2-3 5 9H3Z" />
      <path d="m8 9 2 2" />
    </svg>
  );
}

function WalletIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 7V5a2 2 0 0 0-2-2H5a3 3 0 0 0 0 6h16v10a2 2 0 0 1-2 2H5a3 3 0 0 1-3-3V6" />
      <path d="M16 15h.01" />
    </svg>
  );
}

function BoxIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m21 8-9 5-9-5 9-5 9 5Z" />
      <path d="M3 8v8l9 5 9-5V8" />
      <path d="M12 13v8" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 19V5" />
      <path d="M4 19h16" />
      <path d="m7 15 3-4 3 2 5-7" />
    </svg>
  );
}

function OrganizationIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="9" y="3" width="6" height="5" rx="1" />
      <rect x="3" y="16" width="6" height="5" rx="1" />
      <rect x="15" y="16" width="6" height="5" rx="1" />
      <path d="M12 8v4M6 16v-2h12v2M18 16v-2" />
    </svg>
  );
}