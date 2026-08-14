import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/authStore";
import AdminLayout from "@/components/admin/AdminLayout";

const ROLES = [
  "student",
  "event_coordinator",
  "finance_master",
  "master_logistics",
  "vp_ops",
  "president",
  "super_admin",
  "general_secretary",
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

const ROLE_COLORS = {
  student: "bg-slate-100 text-slate-600",
  event_coordinator: "bg-blue-50 text-blue-700",
  finance_master: "bg-emerald-50 text-emerald-700",
  master_logistics: "bg-amber-50 text-amber-700",
  vp_ops: "bg-violet-50 text-violet-700",
  president: "bg-indigo-50 text-indigo-700",
  super_admin: "bg-[#1A2B48] text-white",
  general_secretary: "bg-indigo-100 text-indigo-500",
};

const ROLE_DOT_COLORS = {
  student: "bg-slate-300",
  event_coordinator: "bg-blue-500",
  finance_master: "bg-emerald-500",
  master_logistics: "bg-amber-500",
  vp_ops: "bg-violet-500",
  president: "bg-indigo-500",
  super_admin: "bg-[#1A2B48]",
  general_secretary: "bg-indigo-400",
};

export default function SuperAdminDashboard() {
  const currentUser = useAuthStore((state) => state.user);

  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setIsLoading(true);
    setError("");

    try {
      const { data } = await api.get("/admin/users");
      setUsers(data.users || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load users."
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRoleChange(userId, newRole) {
    setSavingId(userId);
    setError("");

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
          "Failed to update role."
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

    setError("");

    try {
      await api.delete(`/admin/users/${userId}`);

      setUsers((prev) =>
        prev.filter((u) => u.id !== userId)
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to delete user."
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
      <div className="min-h-screen w-full overflow-x-hidden bg-[#EBF2F2]">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 md:px-8 lg:px-10 lg:py-10 xl:px-12">

          {/* =====================================================
              HEADER
          ====================================================== */}

          <div className="mb-7 sm:mb-8">
            <div className="mb-4 flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#3D6BB4] sm:mb-5 sm:text-[10px] sm:tracking-[0.2em]">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#3D6BB4]" />
              Administration
            </div>

            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="min-w-0">
                <h1 className="text-2xl font-semibold tracking-[-0.04em] text-[#1A2B48] sm:text-3xl md:text-4xl">
                  Role Management
                </h1>

                <p className="mt-2 max-w-xl text-xs leading-5 text-slate-500 sm:text-sm sm:leading-6">
                  Manage the GAC community, appoint leadership
                  positions, and control access across the portal.
                </p>
              </div>

              <div className="flex w-full sm:w-auto">
                <div className="w-full rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200/70 sm:min-w-[145px] sm:px-5">
                  <p className="text-[8px] font-semibold uppercase tracking-[0.16em] text-slate-400 sm:text-[9px]">
                    Total Members
                  </p>

                  <p className="mt-1 text-xl font-semibold tracking-tight text-[#1A2B48] sm:text-2xl">
                    {users.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* =====================================================
              ROLE OVERVIEW
          ====================================================== */}

          <div className="mb-7 grid grid-cols-2 gap-2.5 sm:mb-8 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-8">
            {ROLES.map((role) => (
              <div
                key={role}
                className="min-w-0 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-200/70 sm:p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="min-w-0 truncate text-[8px] font-semibold uppercase tracking-[0.1em] text-slate-400 sm:text-[9px] sm:tracking-[0.12em]">
                    {ROLE_LABELS[role]}
                  </p>

                  <span
                    className={`mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full sm:h-2 sm:w-2 ${
                      ROLE_DOT_COLORS[role] ||
                      "bg-slate-300"
                    }`}
                  />
                </div>

                <p className="mt-2 text-xl font-semibold tracking-tight text-[#1A2B48] sm:mt-3 sm:text-2xl">
                  {roleCounts[role] || 0}
                </p>
              </div>
            ))}
          </div>

          {/* =====================================================
              ERROR
          ====================================================== */}

          {error && (
            <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-3.5 py-3 text-xs text-red-700 sm:mb-6 sm:px-4 sm:text-sm">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 font-semibold">
                !
              </span>

              <span className="pt-1">{error}</span>
            </div>
          )}

          {/* =====================================================
              USERS
          ====================================================== */}

          <section className="overflow-hidden rounded-[20px] bg-white shadow-sm ring-1 ring-slate-200/70 sm:rounded-[24px]">

            {/* Section Header */}

            <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-4 sm:px-5 sm:py-5 md:flex-row md:items-center md:justify-between md:px-7">
              <div className="min-w-0">
                <h2 className="text-sm font-semibold text-[#1A2B48] sm:text-base">
                  Community Members
                </h2>

                <p className="mt-1 text-[10px] text-slate-400 sm:text-xs">
                  Manage member roles and account access.
                </p>
              </div>

              <div className="self-start rounded-full bg-[#EBF2F2] px-3 py-1.5 text-[9px] font-medium text-slate-500 sm:text-[10px] md:self-auto">
                {users.length} accounts
              </div>
            </div>

            {/* Loading */}

            {isLoading ? (
              <div className="flex min-h-[280px] items-center justify-center px-5">
                <div className="text-center">
                  <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-[#3D6BB4]" />

                  <p className="text-xs text-slate-400">
                    Loading members...
                  </p>
                </div>
              </div>
            ) : users.length === 0 ? (
              <div className="flex min-h-[280px] items-center justify-center px-5">
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
              <>
                {/* =================================================
                    MOBILE / SMALL TABLET CARDS
                ================================================== */}

                <div className="divide-y divide-slate-100 md:hidden">
                  {users.map((u) => {
                    const isCurrentUser =
                      u.id === currentUser?.id;

                    const initials =
                      u.fullName
                        ?.split(" ")
                        .map((n) => n.charAt(0))
                        .slice(0, 2)
                        .join("")
                        .toUpperCase() || "?";

                    return (
                      <div
                        key={u.id}
                        className="p-4 sm:p-5"
                      >
                        {/* User */}

                        <div className="flex items-start gap-3">
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

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="min-w-0 truncate text-sm font-medium text-[#1A2B48]">
                                {u.fullName}
                              </p>

                              {isCurrentUser && (
                                <span className="shrink-0 rounded-full bg-[#EBF2F2] px-2 py-0.5 text-[7px] font-semibold uppercase tracking-wider text-[#3D6BB4]">
                                  You
                                </span>
                              )}
                            </div>

                            {u.regNo && (
                              <p className="mt-0.5 text-[9px] text-slate-400">
                                {u.regNo}
                              </p>
                            )}

                            <p className="mt-1 truncate text-[10px] text-slate-500">
                              {u.email}
                            </p>
                          </div>
                        </div>

                        {/* Role */}

                        <div className="mt-4 flex flex-col gap-3">
                          <div>
                            <p className="mb-1.5 text-[8px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                              Current Role
                            </p>

                            <span
                              className={`inline-flex max-w-full rounded-full px-3 py-1.5 text-[8px] font-semibold uppercase tracking-[0.08em] ${
                                ROLE_COLORS[u.role] ||
                                "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {ROLE_LABELS[u.role] ||
                                u.role}
                            </span>
                          </div>

                          {/* Assign Role */}

                          <div>
                            <p className="mb-1.5 text-[8px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                              Assign Role
                            </p>

                            <div className="relative">
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
                                className="h-10 w-full appearance-none rounded-xl border-0 bg-[#F4F7F7] py-2.5 pl-3 pr-9 text-xs font-medium text-[#1A2B48] outline-none ring-1 ring-slate-200 transition-all focus:bg-white focus:ring-[#3D6BB4] disabled:cursor-not-allowed disabled:opacity-40"
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
                              <p className="mt-1.5 text-[9px] text-[#3D6BB4]">
                                Saving...
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Delete */}

                        {!isCurrentUser && (
                          <div className="mt-3 flex justify-end">
                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(
                                  u.id,
                                  u.fullName
                                )
                              }
                              className="rounded-xl px-3 py-2 text-[9px] font-medium text-slate-400 transition-all hover:bg-red-50 hover:text-red-600"
                            >
                              Remove Account
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* =================================================
                    TABLET / DESKTOP TABLE
                ================================================== */}

                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full min-w-[760px]">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/50">
                        <th className="px-5 py-4 text-left text-[8px] font-semibold uppercase tracking-[0.14em] text-slate-400 lg:px-7 lg:text-[9px]">
                          Member
                        </th>

                        <th className="px-4 py-4 text-left text-[8px] font-semibold uppercase tracking-[0.14em] text-slate-400 lg:px-5 lg:text-[9px]">
                          Email
                        </th>

                        <th className="px-4 py-4 text-left text-[8px] font-semibold uppercase tracking-[0.14em] text-slate-400 lg:px-5 lg:text-[9px]">
                          Current Role
                        </th>

                        <th className="px-4 py-4 text-left text-[8px] font-semibold uppercase tracking-[0.14em] text-slate-400 lg:px-5 lg:text-[9px]">
                          Assign Role
                        </th>

                        <th className="px-5 py-4 text-right text-[8px] font-semibold uppercase tracking-[0.14em] text-slate-400 lg:px-7 lg:text-[9px]">
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
                            ?.split(" ")
                            .map((n) => n.charAt(0))
                            .slice(0, 2)
                            .join("")
                            .toUpperCase() || "?";

                        return (
                          <tr
                            key={u.id}
                            className="group border-b border-slate-100 last:border-0 transition-colors hover:bg-[#F7FAFA]"
                          >
                            {/* MEMBER */}

                            <td className="px-5 py-4 lg:px-7 lg:py-5">
                              <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#EBF2F2] text-[10px] font-semibold text-[#3D6BB4] lg:h-10 lg:w-10 lg:text-xs">
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
                                    <p className="max-w-[160px] truncate text-xs font-medium text-[#1A2B48] lg:max-w-[220px] lg:text-sm">
                                      {u.fullName}
                                    </p>

                                    {isCurrentUser && (
                                      <span className="shrink-0 rounded-full bg-[#EBF2F2] px-2 py-0.5 text-[7px] font-semibold uppercase tracking-wider text-[#3D6BB4]">
                                        You
                                      </span>
                                    )}
                                  </div>

                                  {u.regNo && (
                                    <p className="mt-0.5 text-[9px] text-slate-400">
                                      {u.regNo}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* EMAIL */}

                            <td className="px-4 py-4 lg:px-5 lg:py-5">
                              <p className="max-w-[160px] truncate text-[10px] text-slate-500 lg:max-w-[220px] lg:text-xs">
                                {u.email}
                              </p>
                            </td>

                            {/* CURRENT ROLE */}

                            <td className="px-4 py-4 lg:px-5 lg:py-5">
                              <span
                                className={`inline-flex max-w-[150px] rounded-full px-2.5 py-1.5 text-[8px] font-semibold uppercase tracking-[0.06em] lg:px-3 lg:text-[9px] lg:tracking-[0.08em] ${
                                  ROLE_COLORS[u.role] ||
                                  "bg-slate-100 text-slate-600"
                                }`}
                              >
                                <span className="truncate">
                                  {ROLE_LABELS[u.role] ||
                                    u.role}
                                </span>
                              </span>
                            </td>

                            {/* CHANGE ROLE */}

                            <td className="px-4 py-4 lg:px-5 lg:py-5">
                              <div className="relative inline-block max-w-full">
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
                                  className="max-w-[170px] appearance-none rounded-xl border-0 bg-[#F4F7F7] py-2 pl-3 pr-8 text-[10px] font-medium text-[#1A2B48] outline-none ring-1 ring-slate-200 transition-all focus:bg-white focus:ring-[#3D6BB4] disabled:cursor-not-allowed disabled:opacity-40 lg:max-w-none lg:py-2.5 lg:text-xs"
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

                                <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] text-slate-400 lg:right-3 lg:text-[10px]">
                                  ↓
                                </span>
                              </div>

                              {savingId === u.id && (
                                <span className="ml-2 text-[8px] text-[#3D6BB4] lg:text-[9px]">
                                  Saving...
                                </span>
                              )}
                            </td>

                            {/* DELETE */}

                            <td className="px-5 py-4 text-right lg:px-7 lg:py-5">
                              {!isCurrentUser && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDelete(
                                      u.id,
                                      u.fullName
                                    )
                                  }
                                  className="rounded-xl px-2.5 py-2 text-[9px] font-medium text-slate-400 transition-all hover:bg-red-50 hover:text-red-600 lg:px-3 lg:text-[10px]"
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
              </>
            )}
          </section>

          {/* =====================================================
              FOOTNOTE
          ====================================================== */}

          <div className="mt-5 flex flex-col gap-2 px-2 text-[9px] text-slate-400 sm:mt-6 sm:flex-row sm:items-center sm:justify-between">
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