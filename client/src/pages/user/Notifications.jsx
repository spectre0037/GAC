import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import AdminLayout from '@/components/admin/AdminLayout';

export default function Notifications() {
  const user = useAuthStore((state) => state.user);
  const isSuperAdmin = user?.role === 'super_admin';

  const [notifications, setNotifications] = useState([]);
  const [message, setMessage] = useState('');
  const [url, setUrl] = useState('');
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [emailingId, setEmailingId] = useState(null);

  useEffect(() => {
    fetchNotifications();

    if (isSuperAdmin) {
      fetchUsers();
    }
  }, [isSuperAdmin]);

  async function fetchNotifications() {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data.notifications);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to load notifications.'
      );
    }
  }

  async function fetchUsers() {
    try {
      const { data } = await api.get('/admin/users');
      setAllUsers(data.users);
    } catch {
      // Non-fatal
    }
  }

  async function handlePost(e) {
    e.preventDefault();

    setPosting(true);
    setError('');
    setInfo('');

    try {
      await api.post('/notifications', {
        message,
        url: url || undefined,
      });

      setMessage('');
      setUrl('');

      await fetchNotifications();

      setInfo(
        "Notification posted — visible on everyone's dashboard now."
      );
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to post notification.'
      );
    } finally {
      setPosting(false);
    }
  }

  async function handleEmailEveryone(notificationId) {
    const confirmed = window.confirm(
      `This will email every registered account (${allUsers.length} people). EmailJS's free tier caps at 200 emails/month total — confirm you want to proceed?`
    );

    if (!confirmed) return;

    setError('');
    setInfo('');

    try {
      const { data } = await api.post(
        `/notifications/${notificationId}/email`,
        {
          target: 'all',
        }
      );

      setInfo(data.message);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to send emails.'
      );
    }
  }

  async function handleEmailPerson(notificationId, userId, name) {
    setEmailingId(userId);
    setError('');
    setInfo('');

    try {
      const { data } = await api.post(
        `/notifications/${notificationId}/email`,
        {
          target: 'user',
          userId,
        }
      );

      setInfo(data.message);
    } catch (err) {
      setError(
        err.response?.data?.message || `Failed to email ${name}.`
      );
    } finally {
      setEmailingId(null);
    }
  }

  const latestNotification = notifications[0];

  return (
    <AdminLayout>
      <div className="min-h-screen px-5 py-8 md:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">

          {/* =====================================================
              HEADER
          ===================================================== */}

          <div className="mb-8">
            <div className="mb-5 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#3D6BB4]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#3D6BB4]" />
              Communication
            </div>

            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <h1 className="text-3xl font-semibold tracking-[-0.04em] text-[#1A2B48] md:text-4xl">
                  Notifications
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  Keep GAC members informed with announcements, updates,
                  and important event information.
                </p>
              </div>

              {/* Notification Count */}
              <div className="flex min-w-[180px] items-center gap-4 rounded-2xl bg-white px-5 py-4 shadow-sm ring-1 ring-slate-200/70">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EBF2F2] text-sm font-semibold text-[#3D6BB4]">
                  {notifications.length}
                </div>

                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                    Published
                  </p>

                  <p className="mt-1 text-xl font-semibold tracking-tight text-[#1A2B48]">
                    Notifications
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* =====================================================
              STATUS MESSAGES
          ===================================================== */}

          {error && (
            <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-semibold">
                !
              </span>

              <span>{error}</span>
            </div>
          )}

          {info && (
            <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold">
                ✓
              </span>

              <span>{info}</span>
            </div>
          )}

          {/* =====================================================
              SUPER ADMIN CONTROLS
          ===================================================== */}

          {isSuperAdmin && (
            <>
              <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">

                {/* =================================================
                    POST NOTIFICATION
                ================================================= */}

                <Card className="overflow-hidden rounded-[24px] border-0 bg-white shadow-sm ring-1 ring-slate-200/70">
                  <CardHeader className="border-b border-slate-100 px-5 py-5 md:px-7">
                    <div className="mb-2 text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                      Announcement
                    </div>

                    <CardTitle className="text-base font-semibold text-[#1A2B48]">
                      Post a Notification
                    </CardTitle>

                    <CardDescription className="mt-1 text-xs leading-5 text-slate-400">
                      Publish an announcement that will immediately appear
                      on every user's dashboard.
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="px-5 py-6 md:px-7">
                    <form
                      onSubmit={handlePost}
                      className="flex flex-col gap-5"
                    >
                      {/* Message */}

                      <div>
                        <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                          Message
                        </label>

                        <Textarea
                          placeholder="Write your announcement..."
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          required
                          className="min-h-[150px] resize-none rounded-xl border-0 bg-[#F4F7F7] px-3 py-3 text-xs font-medium text-[#1A2B48] shadow-none ring-1 ring-slate-200 transition-all placeholder:text-slate-400 focus:bg-white focus:ring-[#3D6BB4]"
                        />
                      </div>

                      {/* URL */}

                      <div>
                        <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                          Link
                          <span className="ml-1 normal-case tracking-normal text-slate-300">
                            Optional
                          </span>
                        </label>

                        <Input
                          type="url"
                          placeholder="https://example.com"
                          value={url}
                          onChange={(e) => setUrl(e.target.value)}
                          className="h-11 rounded-xl border-0 bg-[#F4F7F7] px-3 text-xs font-medium text-[#1A2B48] shadow-none ring-1 ring-slate-200 transition-all placeholder:text-slate-400 focus:bg-white focus:ring-[#3D6BB4]"
                        />
                      </div>

                      {/* Submit */}

                      <Button
                        type="submit"
                        disabled={posting}
                        className="h-11 w-full rounded-xl bg-[#1A2B48] text-xs font-medium text-white shadow-none transition-all hover:bg-[#263b5d]"
                      >
                        {posting ? 'Posting...' : 'Publish Notification'}

                        {!posting && (
                          <span className="ml-auto text-sm">↗</span>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* =================================================
                    EMAIL NOTIFICATION
                ================================================= */}

                <Card className="overflow-hidden rounded-[24px] border-0 bg-white shadow-sm ring-1 ring-slate-200/70">
                  <CardHeader className="border-b border-slate-100 px-5 py-5 md:px-7">
                    <div className="mb-2 text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                      Email Distribution
                    </div>

                    <CardTitle className="text-base font-semibold text-[#1A2B48]">
                      Email Notification
                    </CardTitle>

                    <CardDescription className="mt-1 text-xs leading-5 text-slate-400">
                      Send the latest notification directly to registered
                      members through email.
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="px-5 py-6 md:px-7">
                    {!latestNotification ? (
                      <div className="flex min-h-[280px] flex-col items-center justify-center text-center">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#EBF2F2] text-sm font-semibold text-[#3D6BB4]">
                          @
                        </div>

                        <p className="text-sm font-medium text-[#1A2B48]">
                          No notification available
                        </p>

                        <p className="mt-1 max-w-xs text-xs leading-5 text-slate-400">
                          Publish a notification first before sending
                          it through email.
                        </p>
                      </div>
                    ) : (
                      <>
                        {/* Latest Notification Preview */}

                        <div className="mb-6 rounded-2xl bg-[#F4F7F7] p-4 ring-1 ring-slate-200/70">
                          <div className="mb-3 flex items-center justify-between">
                            <span className="text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                              Latest Notification
                            </span>

                            <span className="h-2 w-2 rounded-full bg-[#3D6BB4]" />
                          </div>

                          <p className="text-sm font-medium leading-6 text-[#1A2B48]">
                            {latestNotification.message}
                          </p>

                          <p className="mt-3 text-[9px] text-slate-400">
                            {new Date(
                              latestNotification.createdAt
                            ).toLocaleString()}
                          </p>
                        </div>

                        {/* Email Everyone */}

                        <Button
                          variant="outline"
                          onClick={() =>
                            handleEmailEveryone(
                              latestNotification.id
                            )
                          }
                          className="mb-6 h-11 w-full rounded-xl border-[#88B3D8]/50 bg-white text-xs font-medium text-[#1A2B48] transition-all hover:border-[#1A2B48] hover:bg-[#1A2B48] hover:text-white"
                        >
                          Email Everyone
                          <span className="ml-auto">
                            {allUsers.length}
                          </span>
                        </Button>

                        {/* Specific User */}

                        <div>
                          <div className="mb-3 flex items-center justify-between">
                            <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                              Individual Delivery
                            </p>

                            <span className="text-[9px] text-slate-400">
                              {allUsers.length} users
                            </span>
                          </div>

                          <div className="max-h-[300px] overflow-y-auto rounded-2xl ring-1 ring-slate-200/70">
                            {allUsers.length === 0 ? (
                              <div className="px-4 py-8 text-center text-xs text-slate-400">
                                No registered users found.
                              </div>
                            ) : (
                              allUsers.map((u, index) => (
                                <div
                                  key={u.id}
                                  className={`flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-[#F7FAFA] ${
                                    index !== allUsers.length - 1
                                      ? 'border-b border-slate-100'
                                      : ''
                                  }`}
                                >
                                  <div className="flex min-w-0 items-center gap-3">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EBF2F2] text-[10px] font-semibold text-[#3D6BB4]">
                                      {u.fullName
                                        ?.charAt(0)
                                        ?.toUpperCase() || '?'}
                                    </div>

                                    <div className="min-w-0">
                                      <p className="truncate text-xs font-medium text-[#1A2B48]">
                                        {u.fullName}
                                      </p>

                                      <p className="truncate text-[9px] text-slate-400">
                                        {u.email}
                                      </p>
                                    </div>
                                  </div>

                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    disabled={emailingId === u.id}
                                    onClick={() =>
                                      handleEmailPerson(
                                        latestNotification.id,
                                        u.id,
                                        u.fullName
                                      )
                                    }
                                    className="shrink-0 rounded-lg px-3 text-[10px] font-medium text-[#3D6BB4] hover:bg-[#EBF2F2] hover:text-[#1A2B48]"
                                  >
                                    {emailingId === u.id
                                      ? 'Sending...'
                                      : 'Send'}
                                  </Button>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {/* =====================================================
              ALL NOTIFICATIONS
          ===================================================== */}

          <Card className="mt-6 overflow-hidden rounded-[24px] border-0 bg-white shadow-sm ring-1 ring-slate-200/70">
            <CardHeader className="border-b border-slate-100 px-5 py-5 md:px-7">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <div className="mb-2 text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                    Notification History
                  </div>

                  <CardTitle className="text-base font-semibold text-[#1A2B48]">
                    All Notifications
                  </CardTitle>

                  <CardDescription className="mt-1 text-xs text-slate-400">
                    Previous announcements and updates published by GAC.
                  </CardDescription>
                </div>

                <div className="rounded-full bg-[#EBF2F2] px-3 py-1.5 text-[10px] font-semibold text-[#1A2B48]">
                  {notifications.length}{' '}
                  {notifications.length === 1
                    ? 'Notification'
                    : 'Notifications'}
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {notifications.length === 0 ? (
                <div className="px-5 py-14 text-center md:px-7">
                  <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-[#EBF2F2] text-sm font-semibold text-[#3D6BB4]">
                    !
                  </div>

                  <p className="text-xs font-medium text-[#1A2B48]">
                    No notifications yet
                  </p>

                  <p className="mt-1 text-[10px] text-slate-400">
                    Published announcements will appear here.
                  </p>
                </div>
              ) : (
                <div>
                  {notifications.map((notification, index) => (
                    <div
                      key={notification.id}
                      className={`px-5 py-5 transition-colors hover:bg-[#F7FAFA] md:px-7 ${
                        index !== notifications.length - 1
                          ? 'border-b border-slate-100'
                          : ''
                      }`}
                    >
                      <div className="flex gap-4">
                        {/* Indicator */}

                        <div className="flex shrink-0 flex-col items-center">
                          <span className="mt-1.5 h-2.5 w-2.5 rounded-full bg-[#3D6BB4]" />

                          {index !== notifications.length - 1 && (
                            <span className="mt-2 h-full w-px bg-slate-100" />
                          )}
                        </div>

                        {/* Content */}

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                            <div>
                              <p className="text-sm font-medium leading-6 text-[#1A2B48]">
                                {notification.message}
                              </p>

                              <p className="mt-2 text-[9px] font-medium uppercase tracking-[0.1em] text-slate-400">
                                {new Date(
                                  notification.createdAt
                                ).toLocaleString()}
                              </p>
                            </div>

                            <span className="w-fit shrink-0 rounded-full bg-[#EBF2F2] px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.08em] text-[#3D6BB4]">
                              Published
                            </span>
                          </div>

                          {notification.url && (
                            <a
                              href={notification.url}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-4 inline-flex max-w-full items-center gap-2 rounded-lg bg-[#F4F7F7] px-3 py-2 text-[10px] font-medium text-[#3D6BB4] transition-colors hover:bg-[#EBF2F2] hover:text-[#1A2B48]"
                            >
                              <span className="truncate">
                                {notification.url}
                              </span>

                              <span className="shrink-0">↗</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* =====================================================
              FOOTER NOTE
          ===================================================== */}

          <div className="mt-5 flex flex-col gap-1 px-2 text-[9px] text-slate-400 sm:flex-row sm:items-center sm:justify-between">
            <span>
              Notifications are visible to registered GAC members.
            </span>

            <span className="font-medium">
              GIKI Adventure Club · Admin Portal
            </span>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}