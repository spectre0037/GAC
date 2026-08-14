import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { motion } from 'framer-motion';

const NAV_ITEMS = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: '⌂',
    roles: 'all',
    section: 'Overview',
  },
  {
    to: '/events',
    label: 'Browse Events',
    icon: '↗',
    roles: ['student'],
    section: 'Explore',
  },
  {
    to: '/my-tickets',
    label: 'My Tickets',
    icon: '◇',
    roles: ['student'],
    section: 'Explore',
  },
  {
    to: '/admin',
    label: 'Role Management',
    icon: '◎',
    roles: ['super_admin'],
    section: 'Administration',
  },
  {
    to: '/admin/history',
    label: 'Exec Council Archive',
    icon: '◫',
    roles: ['super_admin'],
    section: 'Administration',
  },
  {
    to: '/admin/female-list',
    label: 'Female Students List',
    roles: ['general_secretary', 'super_admin', 'event_coordinator'],
  },
  {
    to: '/admin/events',
    label: 'Manage Events',
    icon: '◈',
    roles: ['event_coordinator', 'super_admin'],
    section: 'Management',
  },
  {
    to: '/admin/finance',
    label: 'Finance',
    icon: '₨',
    roles: ['finance_master', 'super_admin'],
    section: 'Management',
  },
  {
    to: '/admin/logistics',
    label: 'Logistics',
    icon: '⌁',
    roles: ['master_logistics', 'super_admin'],
    section: 'Management',
  },
  {
    to: '/admin/budget-overview',
    label: 'Budget Overview',
    icon: '▦',
    roles: [
      'president',
      'vp_ops',
      'event_coordinator',
      'super_admin',
    ],
    section: 'Management',
  },
  {
    to: '/admin/overview',
    label: 'Org Overview',
    icon: '△',
    roles: ['president', 'vp_ops', 'super_admin'],
    section: 'Management',
  },
  {
    to: '/profile',
    label: 'Profile',
    icon: '○',
    roles: 'all',
    section: 'Account',
  },
];

const ROLE_LABELS = {
  student: 'Student',
  event_coordinator: 'Event Coordinator',
  finance_master: 'Finance Master',
  master_logistics: 'Master Logistics',
  vp_ops: 'VP Operations',
  president: 'President',
  super_admin: 'Super Admin',
};

export default function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  function handleLogout() {
    logout();
    navigate('/');
  }

  const visibleItems = NAV_ITEMS.filter(
    (item) =>
      item.roles === 'all' ||
      item.roles.includes(user?.role)
  );

  const groupedItems = visibleItems.reduce((acc, item) => {
    if (!acc[item.section]) {
      acc[item.section] = [];
    }

    acc[item.section].push(item);

    return acc;
  }, {});

  const initials =
    user?.fullName
      ?.split(' ')
      .map((name) => name.charAt(0))
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'GAC';

  return (
    
<aside className="fixed inset-y-0 left-0 z-50 flex h-screen w-[270px] shrink-0 flex-col overflow-hidden bg-[#1A2B48] text-white">
      {/* =========================================================
          BRAND
      ========================================================== */}

      <div className="relative overflow-hidden border-b border-white/10 px-6 py-6">

        {/* Decorative circle */}

        <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full border border-[#88B3D8]/10" />

        <Link
          to="/dashboard"
          className="relative flex items-center gap-3"
        >

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#88B3D8] text-sm font-bold text-[#1A2B48]">
            G
          </div>

          <div>
            <p className="text-sm font-semibold tracking-[-0.02em]">
              GIKI Adventure
            </p>

            <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-[#88B3D8]">
              Club Portal
            </p>
          </div>

        </Link>

      </div>

      {/* =========================================================
          USER ROLE
      ========================================================== */}

      <div className="px-5 pt-5">

        <div className="rounded-2xl bg-white/5 px-4 py-3">

          <div className="flex items-center gap-3">

            <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#88B3D8] text-xs font-bold text-[#1A2B48]">

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

            <div className="min-w-0">

              <p className="truncate text-xs font-medium text-white">
                {user?.fullName || 'GAC Member'}
              </p>

              <p className="mt-0.5 truncate text-[9px] uppercase tracking-[0.1em] text-white/35">
                {ROLE_LABELS[user?.role] ||
                  user?.role?.replaceAll('_', ' ') ||
                  'Member'}
              </p>

            </div>

          </div>

        </div>

      </div>

      {/* =========================================================
          NAVIGATION
      ========================================================== */}

      <nav className="sidebar-scrollbar flex-1 overflow-y-auto px-4 py-6">

        {Object.entries(groupedItems).map(
          ([section, items]) => (
            <div
              key={section}
              className="mb-7 last:mb-0"
            >

              <p className="mb-2 px-3 text-[8px] font-semibold uppercase tracking-[0.22em] text-white/25">
                {section}
              </p>

              <div className="space-y-1">

                {items.map((item) => {
                  const isActive =
                    location.pathname === item.to;

                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className="relative block"
                    >

                      {isActive && (
                        <motion.div
                          layoutId="sidebar-active"
                          className="absolute inset-0 rounded-xl bg-[#3D6BB4]"
                          transition={{
                            type: 'spring',
                            stiffness: 350,
                            damping: 30,
                          }}
                        />
                      )}

                      <div
                        className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors duration-200 ${
                          isActive
                            ? 'text-white'
                            : 'text-white/45 hover:bg-white/5 hover:text-white/80'
                        }`}
                      >

                        <span
                          className={`flex h-7 w-7 items-center justify-center rounded-lg text-sm ${
                            isActive
                              ? 'bg-white/10 text-white'
                              : 'text-white/40'
                          }`}
                        >
                          {item.icon}
                        </span>

                        <span className="text-xs font-medium">
                          {item.label}
                        </span>

                        {isActive && (
                          <span className="ml-auto text-[11px] text-white/50">
                            →
                          </span>
                        )}

                      </div>

                    </Link>
                  );
                })}

              </div>

            </div>
          )
        )}

      </nav>

      {/* =========================================================
          BOTTOM AREA
      ========================================================== */}

      <div className="border-t border-white/10 p-4">

        {/* GAC slogan */}

        <div className="mb-4 px-2">

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
          className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-white/40 transition-all duration-200 hover:bg-red-500/10 hover:text-red-300"
        >

          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 text-sm transition-colors group-hover:bg-red-500/10">
            ↪
          </span>

          <span className="text-xs font-medium">
            Log out
          </span>

        </button>

      </div>

    </aside>
  );
}