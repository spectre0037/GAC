import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
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
    if (isSuperAdmin) fetchUsers();
  }, [isSuperAdmin]);

  async function fetchNotifications() {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data.notifications);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load notifications.');
    }
  }

  async function fetchUsers() {
    try {
      const { data } = await api.get('/admin/users');
      setAllUsers(data.users);
    } catch {
      // non-fatal — only affects the per-person email list
    }
  }

  async function handlePost(e) {
    e.preventDefault();
    setPosting(true);
    setError('');
    setInfo('');
    try {
      await api.post('/notifications', { message, url: url || undefined });
      setMessage('');
      setUrl('');
      fetchNotifications();
      setInfo('Notification posted — visible on everyone\'s dashboard now.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post notification.');
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
      const { data } = await api.post(`/notifications/${notificationId}/email`, { target: 'all' });
      setInfo(data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send emails.');
    }
  }

  async function handleEmailPerson(notificationId, userId, name) {
    setEmailingId(userId);
    setError('');
    setInfo('');
    try {
      const { data } = await api.post(`/notifications/${notificationId}/email`, { target: 'user', userId });
      setInfo(data.message);
    } catch (err) {
      setError(err.response?.data?.message || `Failed to email ${name}.`);
    } finally {
      setEmailingId(null);
    }
  }

  const latestNotification = notifications[0];

  const content = (
    <div className="p-6 md:p-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-6 text-2xl">Notifications</h1>

        {error && <p className="mb-4 text-sm text-destructive">{error}</p>}
        {info && <p className="mb-4 text-sm text-green-600">{info}</p>}

        {isSuperAdmin && (
          <>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Post a Notification</CardTitle>
                <CardDescription>Visible to every user on their dashboard immediately.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePost} className="flex flex-col gap-4">
                  <Textarea
                    placeholder="Write your message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                  />
                  <Input
                    placeholder="Link URL (optional)"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                  <Button type="submit" disabled={posting}>
                    {posting ? 'Posting...' : 'Post Notification'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {latestNotification && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Email This Notification</CardTitle>
                  <CardDescription>Sends the most recent notification above via email.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" onClick={() => handleEmailEveryone(latestNotification.id)} className="mb-4">
                    Email Everyone ({allUsers.length})
                  </Button>

                  <p className="mb-2 text-xs font-medium text-muted-foreground">Or email a specific person:</p>
                  <div className="flex flex-col gap-1">
                    {allUsers.map((u) => (
                      <div key={u.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                        <span>
                          {u.fullName} <span className="text-xs text-muted-foreground">— {u.email}</span>
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={emailingId === u.id}
                          onClick={() => handleEmailPerson(latestNotification.id, u.id, u.fullName)}
                        >
                          {emailingId === u.id ? 'Sending...' : 'Send Email'}
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        <h2 className="mb-3 text-sm font-medium text-muted-foreground">All Notifications</h2>
        <div className="flex flex-col gap-3">
          {notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground">No notifications yet.</p>
          ) : (
            notifications.map((n) => (
              <Card key={n.id}>
                <CardContent className="p-4">
                  <p className="text-sm">{n.message}</p>
                  {n.url && (
                    <a href={n.url} target="_blank" rel="noreferrer" className="text-xs text-primary underline">
                      {n.url}
                    </a>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );

  return <AdminLayout>{content}</AdminLayout>;
}