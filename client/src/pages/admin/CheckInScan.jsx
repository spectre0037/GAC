import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  User,
  Phone,
  Users,
  Clock3,
  ShieldCheck,
  ScanLine,
  RefreshCw,
} from "lucide-react";

export default function CheckInScan() {
  const { code } = useParams();

  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchTicket();
  }, [code]);

  async function fetchTicket() {
    setError("");
    setMessage("");

    try {
      const { data } = await api.get(`/checkin/${code}`);
      setData(data);
    } catch (err) {
      setError(err.response?.data?.message || "Ticket not found.");
    }
  }

  async function handleConfirm() {
    setConfirming(true);
    setError("");
    setMessage("");

    try {
      const { data: result } = await api.patch(`/checkin/${code}/confirm`);

      setData((prev) => ({
        ...prev,
        registration: result.registration,
      }));

      setMessage("Participant successfully checked in.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to check in.");
    } finally {
      setConfirming(false);
    }
  }

  const registration = data?.registration;
  const event = data?.event;

  const checkedIn = Boolean(registration?.checkedInAt);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Top navigation */}
      <header className="border-b border-white/10 bg-slate-950/95">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 md:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-950">
              <ScanLine className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm font-semibold tracking-tight">
                Event Operations
              </p>
              <p className="text-xs text-slate-400">Ticket Verification</p>
            </div>
          </div>

          <Link
            to="/dashboard"
            className="flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center px-5 py-10 md:px-8">
        <div className="grid w-full gap-6 lg:grid-cols-[1fr_420px]">
          {/* Left information panel */}
          <section className="hidden rounded-3xl border border-white/10 bg-white/[0.03] p-8 lg:flex lg:flex-col lg:justify-between">
            <div>
              <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-950">
                <ShieldCheck className="h-7 w-7" />
              </div>

              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Entry Management
              </p>

              <h1 className="max-w-xl text-4xl font-semibold tracking-tight">
                Verify participant
                <br />
                <span className="text-slate-400">before granting entry.</span>
              </h1>

              <p className="mt-5 max-w-lg text-sm leading-6 text-slate-400">
                Scan or open a participant ticket to verify their registration
                details and record their event check-in.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <ScanLine className="mb-6 h-5 w-5 text-slate-400" />
                <p className="text-sm font-medium">Ticket Scan</p>
                <p className="mt-1 text-xs text-slate-500">
                  Verify ticket code
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <CheckCircle2 className="mb-6 h-5 w-5 text-slate-400" />
                <p className="text-sm font-medium">Instant Check-In</p>
                <p className="mt-1 text-xs text-slate-500">
                  Record attendance
                </p>
              </div>
            </div>
          </section>

          {/* Verification card */}
          <Card className="overflow-hidden rounded-3xl border-white/10 bg-white text-slate-950 shadow-2xl">
            <CardHeader className="border-b border-slate-200 bg-slate-50 p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <ScanLine className="h-4 w-4" />
                    Ticket Scan
                  </div>

                  <CardTitle className="text-2xl tracking-tight">
                    Event Check-In
                  </CardTitle>

                  <CardDescription className="mt-1">
                    Verify this ticket before confirming entry.
                  </CardDescription>
                </div>

                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                    checkedIn
                      ? "bg-emerald-100 text-emerald-600"
                      : error
                        ? "bg-red-100 text-red-600"
                        : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {checkedIn ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : error ? (
                    <AlertCircle className="h-5 w-5" />
                  ) : (
                    <ScanLine className="h-5 w-5" />
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              {/* Error */}
              {error && (
                <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

                  <div>
                    <p className="text-sm font-semibold">
                      Ticket verification failed
                    </p>
                    <p className="mt-1 text-xs text-red-700">{error}</p>
                  </div>
                </div>
              )}

              {/* Success */}
              {message && (
                <div className="mb-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />

                  <div>
                    <p className="text-sm font-semibold">
                      Check-in successful
                    </p>
                    <p className="mt-1 text-xs text-emerald-700">
                      {message}
                    </p>
                  </div>
                </div>
              )}

              {/* Loading / Empty */}
              {!data && !error && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                    <RefreshCw className="h-6 w-6 animate-spin text-slate-500" />
                  </div>

                  <p className="text-sm font-medium">
                    Verifying ticket...
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Please wait while we retrieve the registration.
                  </p>
                </div>
              )}

              {/* Ticket */}
              {data && registration && (
                <div className="space-y-5">
                  {/* Status */}
                  <div
                    className={`rounded-2xl border p-4 ${
                      checkedIn
                        ? "border-emerald-200 bg-emerald-50"
                        : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                          Ticket Status
                        </p>

                        <p
                          className={`mt-1 text-sm font-semibold ${
                            checkedIn
                              ? "text-emerald-700"
                              : "text-slate-900"
                          }`}
                        >
                          {checkedIn
                            ? "Checked In"
                            : "Valid — Awaiting Check-In"}
                        </p>
                      </div>

                      <div
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          checkedIn
                            ? "bg-emerald-200 text-emerald-800"
                            : "bg-white text-slate-700"
                        }`}
                      >
                        {checkedIn ? "VERIFIED" : "VALID"}
                      </div>
                    </div>
                  </div>

                  {/* Participant */}
                  <div>
                    <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Participant
                    </p>

                    <div className="rounded-2xl border border-slate-200 p-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white">
                          <User className="h-6 w-6" />
                        </div>

                        <div className="min-w-0">
                          <h2 className="truncate text-lg font-semibold">
                            {registration.fullName}
                          </h2>

                          <p className="mt-0.5 text-xs text-slate-500">
                            {registration.regNo || "Registration number unavailable"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-xl bg-slate-50 p-3">
                          <div className="mb-1 flex items-center gap-2 text-slate-400">
                            <Phone className="h-3.5 w-3.5" />
                            <span className="text-[10px] font-semibold uppercase tracking-wider">
                              WhatsApp
                            </span>
                          </div>

                          <p className="text-sm font-medium">
                            {registration.whatsappNumber || "—"}
                          </p>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-3">
                          <div className="mb-1 flex items-center gap-2 text-slate-400">
                            <Users className="h-3.5 w-3.5" />
                            <span className="text-[10px] font-semibold uppercase tracking-wider">
                              Group
                            </span>
                          </div>

                          <p className="text-sm font-medium">
                            {registration.groupName || "Individual"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Event */}
                  {event && (
                    <div>
                      <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        Event
                      </p>

                      <div className="rounded-2xl border border-slate-200 p-4">
                        <p className="font-semibold">{event.title}</p>

                        {event.location && (
                          <p className="mt-1 text-xs text-slate-500">
                            {event.location}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Existing check-in */}
                  {checkedIn ? (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-200 text-emerald-700">
                          <Clock3 className="h-4 w-4" />
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-emerald-800">
                            Already checked in
                          </p>

                          <p className="mt-1 text-xs text-emerald-700">
                            {new Date(
                              registration.checkedInAt
                            ).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Button
                      onClick={handleConfirm}
                      disabled={confirming}
                      className="h-12 w-full rounded-xl bg-slate-950 text-sm font-semibold text-white hover:bg-slate-800"
                    >
                      {confirming ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Confirming Check-In...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="mr-2 h-5 w-5" />
                          Confirm Check-In
                        </>
                      )}
                    </Button>
                  )}

                  {/* Ticket code */}
                  <div className="border-t border-slate-200 pt-4 text-center">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                      Ticket Code
                    </p>

                    <code className="mt-1 block text-xs text-slate-500">
                      {code}
                    </code>
                  </div>
                </div>
              )}

              {/* Error retry */}
              {error && (
                <Button
                  variant="outline"
                  onClick={fetchTicket}
                  className="mt-2 w-full rounded-xl"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
              )}

              <Link
                to="/dashboard"
                className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-500 transition hover:text-slate-900"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Return to Dashboard
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}