import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';
import AdminLayout from '@/components/admin/AdminLayout';

const ROLES = [
  'student',
  'event_coordinator',
  'finance_master',
  'master_logistics',
  'vp_ops',
  'president',
  'super_admin',
  'general_secretary',
];

const ROLE_LABELS = {
  student: 'Student',
  event_coordinator: 'Event Coordinator',
  finance_master: 'Finance Master',
  master_logistics: 'Master Logistics',
  vp_ops: 'VP Operations',
  president: 'President',
  super_admin: 'Super Admin',
  general_secretary: 'General Secretary',
};

const ROLE_COLORS = {
  student: 'bg-slate-100 text-slate-600',
  event_coordinator: 'bg-blue-50 text-blue-700',
  finance_master: 'bg-emerald-50 text-emerald-700',
  master_logistics: 'bg-amber-50 text-amber-700',
  vp_ops: 'bg-violet-50 text-violet-700',
  president: 'bg-indigo-50 text-indigo-700',
  super_admin: 'bg-[#1A2B48] text-white',
  general_secretary:'bg-indigo-100 text-indigo-500',
};

export default function SuperAdminDashboard() {
  const currentUser = useAuthStore((state) => state.user);

  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setIsLoading(true);

    try {
      const { data } = await api.get('/admin/users');
      setUsers(data.users);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to load users.'
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRoleChange(userId, newRole) {
    setSavingId(userId);
    setError('');

    try {
      await api.patch(`/admin/users/${userId}/role`, {
        role: newRole,
      });

      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? { ...u, role: newRole }
            : u
        )
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to update role.'
      );
    } finally {
      setSavingId(null);
    }
  }

  async function handleDelete(userId, name) {
    const confirmed = window.confirm(
      `Permanently delete ${name}'s account? This cannot be undone.`
    );

    if (!confirmed) return;

    setError('');

    try {
      await api.delete(`/admin/users/${userId}`);

      setUsers((prev) =>
        prev.filter((u) => u.id !== userId)
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to delete user.'
      );
    }
  }

  const roleCounts = ROLES.reduce((acc, role) => {
    acc[role] = users.filter(
      (user) => user.role === role
    ).length;

    return acc;
  }, {});

  return (
    <AdminLayout>
      <div className="min-h-screen px-5 py-8 md:px-8 lg:px-12">

        <div className="mx-auto max-w-7xl">

          {/* =====================================================
              HEADER
          ====================================================== */}

          <div className="mb-8">

            <div className="mb-5 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#3D6BB4]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#3D6BB4]" />
              Administration
            </div>

            <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">

              <div>
                <h1 className="text-3xl font-semibold tracking-[-0.04em] text-[#1A2B48] md:text-4xl">
                  Role Management
                </h1>

                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                  Manage the GAC community, appoint leadership
                  positions, and control access across the portal.
                </p>
              </div>

              <div className="flex items-center gap-3">

                <div className="rounded-2xl bg-white px-5 py-3 shadow-sm ring-1 ring-slate-200/70">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Total Members
                  </p>

                  <p className="mt-1 text-2xl font-semibold tracking-tight text-[#1A2B48]">
                    {users.length}
                  </p>
                </div>

              </div>

            </div>

          </div>

          {/* =====================================================
              ROLE OVERVIEW
          ====================================================== */}

          <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">

            {ROLES.map((role) => (
              <div
                key={role}
                className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/70"
              >
                <p className="truncate text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                  {ROLE_LABELS[role]}
                </p>

                <div className="mt-3 flex items-end justify-between">

                  <p className="text-2xl font-semibold tracking-tight text-[#1A2B48]">
                    {roleCounts[role] || 0}
                  </p>

                  <span
                    className={`h-2 w-2 rounded-full ${
                      role === 'super_admin'
                        ? 'bg-[#1A2B48]'
                        : role === 'president'
                          ? 'bg-indigo-500'
                          : role === 'vp_ops'
                            ? 'bg-violet-500'
                            : role === 'event_coordinator'
                              ? 'bg-blue-500'
                              : role === 'finance_master'
                                ? 'bg-emerald-500'
                                : role === 'master_logistics'
                                  ? 'bg-amber-500'
                                  : 'bg-slate-300'
                    }`}
                  />

                </div>

              </div>
            ))}

          </div>

          {/* =====================================================
              ERROR
          ====================================================== */}

          {error && (
            <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100">
                !
              </span>

              {error}
            </div>
          )}

          {/* =====================================================
              USERS
          ====================================================== */}

          <section className="overflow-hidden rounded-[24px] bg-white shadow-sm ring-1 ring-slate-200/70">

            {/* Section header */}

            <div className="flex flex-col justify-between gap-4 border-b border-slate-100 px-5 py-5 md:flex-row md:items-center md:px-7">

              <div>
                <h2 className="text-base font-semibold text-[#1A2B48]">
                  Community Members
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Manage member roles and account access.
                </p>
              </div>

              <div className="rounded-full bg-[#EBF2F2] px-3 py-1.5 text-[10px] font-medium text-slate-500">
                {users.length} accounts
              </div>

            </div>

            {/* Loading */}

            {isLoading ? (

              <div className="flex min-h-[300px] items-center justify-center">

                <div className="text-center">

                  <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-[#3D6BB4]" />

                  <p className="text-xs text-slate-400">
                    Loading members...
                  </p>

                </div>

              </div>

            ) : users.length === 0 ? (

              <div className="flex min-h-[300px] items-center justify-center">

                <div className="text-center">

                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#EBF2F2] text-xl text-slate-400">
                    ◌
                  </div>

                  <p className="text-sm font-medium text-[#1A2B48]">
                    No members found
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    There are currently no accounts to manage.
                  </p>

                </div>

              </div>

            ) : (

              <div className="overflow-x-auto">

                <table className="w-full min-w-[850px]">

                  <thead>

                    <tr className="border-b border-slate-100 bg-slate-50/50">

                      <th className="px-7 py-4 text-left text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                        Member
                      </th>

                      <th className="px-5 py-4 text-left text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                        Email
                      </th>

                      <th className="px-5 py-4 text-left text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                        Current Role
                      </th>

                      <th className="px-5 py-4 text-left text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                        Assign Role
                      </th>

                      <th className="px-7 py-4 text-right text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                        Action
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {users.map((u) => {

                      const isCurrentUser =
                        u.id === currentUser?.id;

                      const initials =
                        u.fullName
                          ?.split(' ')
                          .map((n) => n.charAt(0))
                          .slice(0, 2)
                          .join('')
                          .toUpperCase() || '?';

                      return (
                        <tr
                          key={u.id}
                          className="group border-b border-slate-100 last:border-0 transition-colors hover:bg-[#F7FAFA]"
                        >

                          {/* MEMBER */}

                          <td className="px-7 py-5">

                            <div className="flex items-center gap-3">

                              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#EBF2F2] text-xs font-semibold text-[#3D6BB4]">

                                {u.avatarUrl ? (
                                  <img
                                    src={u.avatarUrl}
                                    alt=""
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  initials
                                )}

                              </div>

                              <div className="min-w-0">

                                <div className="flex items-center gap-2">

                                  <p className="truncate text-sm font-medium text-[#1A2B48]">
                                    {u.fullName}
                                  </p>

                                  {isCurrentUser && (
                                    <span className="rounded-full bg-[#EBF2F2] px-2 py-0.5 text-[8px] font-semibold uppercase tracking-wider text-[#3D6BB4]">
                                      You
                                    </span>
                                  )}

                                </div>

                                {u.regNo && (
                                  <p className="mt-0.5 text-[10px] text-slate-400">
                                    {u.regNo}
                                  </p>
                                )}

                              </div>

                            </div>

                          </td>

                          {/* EMAIL */}

                          <td className="px-5 py-5">

                            <p className="max-w-[220px] truncate text-xs text-slate-500">
                              {u.email}
                            </p>

                          </td>

                          {/* CURRENT ROLE */}

                          <td className="px-5 py-5">

                            <span
                              className={`inline-flex rounded-full px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.08em] ${
                                ROLE_COLORS[u.role] ||
                                'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {ROLE_LABELS[u.role]}
                            </span>

                          </td>

                          {/* CHANGE ROLE */}

                          <td className="px-5 py-5">

                            <div className="relative inline-block">

                              <select
                                value={u.role}
                                disabled={
                                  isCurrentUser ||
                                  savingId === u.id
                                }
                                onChange={(e) =>
                                  handleRoleChange(
                                    u.id,
                                    e.target.value
                                  )
                                }
                                className="appearance-none rounded-xl border-0 bg-[#F4F7F7] py-2.5 pl-3 pr-9 text-xs font-medium text-[#1A2B48] outline-none ring-1 ring-slate-200 transition-all focus:bg-white focus:ring-[#3D6BB4] disabled:cursor-not-allowed disabled:opacity-40"
                              >

                                {ROLES.map((role) => (
                                  <option
                                    key={role}
                                    value={role}
                                  >
                                    {ROLE_LABELS[role]}
                                  </option>
                                ))}

                              </select>

                              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">
                                ↓
                              </span>

                            </div>

                            {savingId === u.id && (
                              <span className="ml-2 text-[9px] text-[#3D6BB4]">
                                Saving...
                              </span>
                            )}

                          </td>

                          {/* DELETE */}

                          <td className="px-7 py-5 text-right">

                            {!isCurrentUser && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleDelete(
                                    u.id,
                                    u.fullName
                                  )
                                }
                                className="rounded-xl px-3 py-2 text-[10px] font-medium text-slate-400 transition-all hover:bg-red-50 hover:text-red-600"
                              >
                                Remove
                              </button>
                            )}

                          </td>

                        </tr>
                      );
                    })}

                  </tbody>

                </table>

              </div>

            )}

          </section>

          {/* =====================================================
              FOOTNOTE
          ====================================================== */}

          <div className="mt-5 flex flex-col justify-between gap-2 px-2 text-[9px] text-slate-400 sm:flex-row">

            <p>
              Changes to member roles take effect immediately.
            </p>

            <p>
              GIKI Adventure Club · Admin Portal
            </p>

          </div>

        </div>

      </div>
    </AdminLayout>
  );
}