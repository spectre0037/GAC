import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import FormRenderer, {
  defaultFormSchema,
} from '@/components/forms/FormRenderer';
import PublicLayout from '@/components/public/PublicLayout';

const STATUS_MESSAGES = {
  pending:
    'Your registration is pending — upload your payment screenshot below.',
  waitlisted:
    "You're on the waitlist. We'll notify you if a spot opens up.",
  approved: "You're confirmed! See you there.",
  rejected: 'This registration was not approved.',
  cancelled: 'This registration was cancelled.',
};

const STATUS_STYLES = {
  pending: {
    wrapper: 'bg-amber-50 ring-amber-200/70',
    badge: 'bg-amber-100 text-amber-800',
    dot: 'bg-amber-500',
  },
  waitlisted: {
    wrapper: 'bg-blue-50 ring-blue-200/70',
    badge: 'bg-blue-100 text-blue-800',
    dot: 'bg-[#3D6BB4]',
  },
  approved: {
    wrapper: 'bg-emerald-50 ring-emerald-200/70',
    badge: 'bg-emerald-100 text-emerald-800',
    dot: 'bg-emerald-500',
  },
  rejected: {
    wrapper: 'bg-red-50 ring-red-200/70',
    badge: 'bg-red-100 text-red-800',
    dot: 'bg-red-500',
  },
  cancelled: {
    wrapper: 'bg-slate-100 ring-slate-200/70',
    badge: 'bg-slate-200 text-slate-700',
    dot: 'bg-slate-500',
  },
};

export default function EventRegister() {
  const { slug } = useParams();
  const user = useAuthStore((state) => state.user);

  const [event, setEvent] = useState(null);
  const [form, setForm] = useState(null);
  const [existingReg, setExistingReg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [fixedFields, setFixedFields] = useState({
    fullName: user?.fullName || '',
    gender: '',
    regNo: user?.regNo || '',
    groupName: '',
    whatsappNumber: user?.whatsappNumber || '',
    emergencyContactName: '',
    emergencyContactNumber: '',
    medicalInfo: '',
    waiverAccepted: false,
  });

  const [groupMemberNames, setGroupMemberNames] = useState([]);
  const [customValues, setCustomValues] = useState({});

  const [paymentFile, setPaymentFile] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [uploadingPayment, setUploadingPayment] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState('');

  useEffect(() => {
    loadEverything();
  }, [slug]);

  async function loadEverything() {
    setLoading(true);
    setError('');

    try {
      const { data: eventData } = await api.get(
        `/events/slug/${slug}`
      );

      setEvent(eventData.event);

      try {
        const { data: formData } = await api.get(
          `/forms/events/${eventData.event.id}/public`
        );

        setForm(formData.form);
      } catch {
        setForm(null);
      }

      if (user) {
        const { data: myRegsData } = await api.get(
          '/registrations/my'
        );

        const match = myRegsData.registrations.find(
          (r) => r.event.id === eventData.event.id
        );

        if (match) setExistingReg(match);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Event not found.'
      );
    } finally {
      setLoading(false);
    }
  }

  function addGroupMember() {
    setGroupMemberNames((prev) => [...prev, '']);
  }

  function updateGroupMember(index, value) {
    setGroupMemberNames((prev) =>
      prev.map((n, i) => (i === index ? value : n))
    );
  }

  function removeGroupMember(index) {
    setGroupMemberNames((prev) =>
      prev.filter((_, i) => i !== index)
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const payload = {
        ...fixedFields,
        groupMemberNames: groupMemberNames.filter(
          (n) => n.trim()
        ),
        regNo: fixedFields.regNo || undefined,
        groupName: fixedFields.groupName || undefined,
        medicalInfo: fixedFields.medicalInfo || undefined,
        formResponses: customValues,
      };

      const { data } = await api.post(
        `/registrations/events/${event.id}`,
        payload
      );

      setExistingReg({
        id: data.registration.id,
        status: data.registration.status,
        waitlistPosition:
          data.registration.waitlistPosition,
        event,
        latestPaymentStatus: null,
      });
    } catch (err) {
      setError(
        err.response?.data?.message || 'Registration failed.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePaymentUpload(e) {
    e.preventDefault();

    if (!paymentFile) return;

    setUploadingPayment(true);
    setPaymentMessage('');
    setError('');

    try {
      const formData = new FormData();

      formData.append('screenshot', paymentFile);

      if (paymentAmount) {
        formData.append('amount', paymentAmount);
      }

      await api.post(
        `/registrations/${existingReg.id}/payment`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setPaymentMessage(
        'Screenshot uploaded — awaiting verification from the event coordinator.'
      );

      setExistingReg((prev) => ({
        ...prev,
        latestPaymentStatus: 'pending',
      }));

      setPaymentFile(null);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Upload failed.'
      );
    } finally {
      setUploadingPayment(false);
    }
  }

  if (loading) {
    return (
      <PublicLayout>
        <div className="mx-auto max-w-3xl px-6 py-10">
          <div className="rounded-[24px] bg-white p-8 shadow-sm ring-1 ring-slate-200/70">
            <div className="flex flex-col gap-3">
              <div className="h-3 w-24 animate-pulse rounded-full bg-slate-200" />
              <div className="h-8 w-2/3 animate-pulse rounded-lg bg-slate-200" />
              <div className="h-4 w-1/2 animate-pulse rounded-lg bg-slate-100" />
            </div>
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (error && !event) {
    return (
      <PublicLayout>
        <div className="mx-auto max-w-3xl px-6 py-10">
          <div className="rounded-[24px] bg-red-50 p-6 text-sm text-red-700 ring-1 ring-red-200/70">
            {error}
          </div>
        </div>
      </PublicLayout>
    );
  }

  const statusStyle =
    STATUS_STYLES[existingReg?.status] ||
    STATUS_STYLES.pending;

  return (
    <PublicLayout>
      <div className="mx-auto max-w-3xl px-6 py-8 md:py-12">
        {/* Event Header when no custom form exists */}
        {!form && (
          <div className="mb-6 overflow-hidden rounded-[24px] bg-white shadow-sm ring-1 ring-slate-200/70">
            {event.coverImageUrl && (
              <div className="h-56 overflow-hidden md:h-72">
                <img
                  src={event.coverImageUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            <div className="p-6 md:p-8">
              <div className="mb-3 flex items-center gap-2">
                <span className="rounded-full bg-[#EBF2F2] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#3D6BB4]">
                  Event Registration
                </span>
              </div>

              <h1 className="text-2xl font-semibold tracking-tight text-[#1A2B48] md:text-3xl">
                {event.title}
              </h1>

              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-500">
                {event.location && (
                  <span>{event.location}</span>
                )}

                {event.startDate && (
                  <span>
                    {new Date(
                      event.startDate
                    ).toLocaleDateString()}
                  </span>
                )}
              </div>

              {event.description && (
                <p className="mt-5 text-sm leading-6 text-slate-600">
                  {event.description}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-5 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200/70">
            {error}
          </div>
        )}

        {/* Not Logged In */}
        {!user && (
          <Card className="rounded-[24px] border-0 bg-white shadow-sm ring-1 ring-slate-200/70">
            <CardContent className="p-8 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EBF2F2]">
                <span className="text-lg text-[#3D6BB4]">→</span>
              </div>

              <p className="mb-5 text-sm leading-6 text-slate-600">
                Log in to register for this event.
              </p>

              <Link to="/login">
                <Button className="h-11 rounded-xl bg-[#1A2B48] px-6 text-white shadow-sm hover:bg-[#1A2B48]/90">
                  Log In
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Existing Registration */}
        {user && existingReg && (
          <Card
            className={`rounded-[24px] border-0 shadow-sm ring-1 ${statusStyle.wrapper}`}
          >
            <CardHeader className="p-6 pb-3 md:p-7 md:pb-3">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Registration Status
                  </p>

                  <CardTitle className="text-xl font-semibold text-[#1A2B48]">
                    {existingReg.status === 'approved'
                      ? 'Registration Confirmed'
                      : existingReg.status ===
                        'waitlisted'
                      ? 'You are on the Waitlist'
                      : existingReg.status ===
                        'rejected'
                      ? 'Registration Not Approved'
                      : existingReg.status ===
                        'cancelled'
                      ? 'Registration Cancelled'
                      : 'Registration Pending'}
                  </CardTitle>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider ${statusStyle.badge}`}
                >
                  {existingReg.status}
                </span>
              </div>

              <CardDescription className="pt-1 text-sm leading-6 text-slate-600">
                {STATUS_MESSAGES[existingReg.status]}
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6 pt-3 md:p-7 md:pt-3">
              {/* Waitlist */}
              {existingReg.status === 'waitlisted' && (
                <div className="mb-5 rounded-2xl bg-white/70 p-4 ring-1 ring-slate-200/70">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                    Waitlist Position
                  </p>

                  <p className="mt-1 text-2xl font-semibold text-[#1A2B48]">
                    #{existingReg.waitlistPosition}
                  </p>
                </div>
              )}

              {/* Payment Upload */}
              {existingReg.status === 'pending' &&
                existingReg.latestPaymentStatus !==
                  'pending' &&
                existingReg.latestPaymentStatus !==
                  'verified' && (
                  <form
                    onSubmit={handlePaymentUpload}
                    className="mt-4 flex flex-col gap-5 rounded-2xl bg-white p-5 ring-1 ring-slate-200/70"
                  >
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#3D6BB4]">
                        Payment Verification
                      </p>

                      <h3 className="mt-1 text-base font-semibold text-[#1A2B48]">
                        Submit Payment Screenshot
                      </h3>
                    </div>

                    {existingReg.latestPaymentStatus ===
                      'rejected' && (
                      <div className="rounded-xl bg-red-50 p-4 text-sm leading-6 text-red-700 ring-1 ring-red-200/70">
                        <span className="font-semibold">
                          Previous screenshot rejected.
                        </span>{' '}
                        {existingReg.latestPaymentRejectionReason}
                        <br />
                        Please upload a new one.
                      </div>
                    )}

                    <div className="flex flex-col gap-2">
                      <Label
                        htmlFor="paymentAmount"
                        className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500"
                      >
                        Amount Paid
                        <span className="ml-1 font-normal normal-case tracking-normal text-slate-400">
                          (Optional)
                        </span>
                      </Label>

                      <Input
                        id="paymentAmount"
                        type="number"
                        value={paymentAmount}
                        onChange={(e) =>
                          setPaymentAmount(
                            e.target.value
                          )
                        }
                        className="h-11 rounded-xl border-slate-200 bg-[#F4F7F7] text-[#1A2B48] shadow-none focus-visible:ring-[#3D6BB4]/20"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label
                        htmlFor="paymentFile"
                        className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500"
                      >
                        Payment Screenshot
                      </Label>

                      <label
                        htmlFor="paymentFile"
                        className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-[#F4F7F7] px-5 py-7 text-center transition hover:border-[#3D6BB4] hover:bg-[#EBF2F2]"
                      >
                        <span className="text-sm font-medium text-[#1A2B48]">
                          {paymentFile
                            ? paymentFile.name
                            : 'Choose payment screenshot'}
                        </span>

                        <span className="mt-1 text-xs text-slate-400">
                          PNG, JPG or JPEG
                        </span>

                        <input
                          id="paymentFile"
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            setPaymentFile(
                              e.target.files[0]
                            )
                          }
                          required
                          className="hidden"
                        />
                      </label>
                    </div>

                    <Button
                      type="submit"
                      disabled={uploadingPayment}
                      className="h-11 rounded-xl bg-[#1A2B48] text-white shadow-sm hover:bg-[#1A2B48]/90"
                    >
                      {uploadingPayment
                        ? 'Uploading...'
                        : 'Submit Payment'}
                    </Button>

                    {paymentMessage && (
                      <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 ring-1 ring-emerald-200/70">
                        {paymentMessage}
                      </div>
                    )}
                  </form>
                )}

              {/* Payment Pending */}
              {existingReg.latestPaymentStatus ===
                'pending' && (
                <div className="mt-4 flex items-center gap-3 rounded-2xl bg-amber-50 p-4 text-sm text-amber-800 ring-1 ring-amber-200/70">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-amber-500" />

                  <span>
                    Screenshot uploaded — waiting for
                    verification.
                  </span>
                </div>
              )}

              {/* Approved */}
              {existingReg.status === 'approved' && (
                <div className="mt-4 flex items-center gap-3 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-700 ring-1 ring-emerald-200/70">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />

                  <span>
                    Your registration has been confirmed.
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Registration Closed */}
        {user && !existingReg && form?.isClosed && (
          <Card className="rounded-[24px] border-0 bg-white shadow-sm ring-1 ring-slate-200/70">
            <CardContent className="p-8 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 ring-1 ring-amber-200/70">
                <span className="text-amber-600">!</span>
              </div>

              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                Registration Closed
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Registration for this event is currently
                closed.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Registration Form */}
        {user && !existingReg && !form?.isClosed && (
          <form onSubmit={handleSubmit}>
            <FormRenderer
              schema={
                form
                  ? form.schema
                  : defaultFormSchema()
              }
              values={customValues}
              onChange={(id, value) =>
                setCustomValues((prev) => ({
                  ...prev,
                  [id]: value,
                }))
              }
              fixedValues={fixedFields}
              onFixedChange={(key, value) =>
                setFixedFields((prev) => ({
                  ...prev,
                  [key]: value,
                }))
              }
              groupMemberNames={groupMemberNames}
              onAddGroupMember={addGroupMember}
              onUpdateGroupMember={updateGroupMember}
              onRemoveGroupMember={removeGroupMember}
            />
          </form>
        )}
      </div>
    </PublicLayout>
  );
}