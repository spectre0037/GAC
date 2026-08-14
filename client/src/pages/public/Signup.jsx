import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Signup() {
  const navigate = useNavigate();
  const signup = useAuthStore((state) => state.signup);
  const isLoading = useAuthStore((state) => state.isLoading);

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    regNo: '',
    whatsappNumber: '',
  });

  const [formError, setFormError] = useState('');

  function handleChange(e) {
    setForm((prev) => ({
      ...prev,
      [e.target.id]: e.target.value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');

    const result = await signup(form);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setFormError(result.message);
    }
  }

  return (
    <div className="min-h-screen bg-[#EBF2F2] p-4 sm:p-6 lg:p-8">
      <div className="relative mx-auto flex min-h-[calc(100vh-2rem)] max-w-7xl overflow-hidden rounded-[2rem] bg-white shadow-[0_30px_100px_rgba(26,43,72,0.12)] sm:min-h-[calc(100vh-3rem)] lg:min-h-[calc(100vh-4rem)]">

        {/* =========================================================
            LEFT VISUAL PANEL
        ========================================================= */}
        <div className="relative hidden overflow-hidden bg-[#1A2B48] lg:flex lg:w-[45%]">

          {/* Decorative rings */}
          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full border border-[#88B3D8]/15" />

          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full border border-[#88B3D8]/15" />

          <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full border border-[#88B3D8]/10" />

          {/* Abstract mountain landscape */}
          <div className="absolute bottom-0 left-0 h-[48%] w-full bg-[#3D6BB4] [clip-path:polygon(0_65%,18%_35%,32%_58%,47%_18%,63%_52%,78%_28%,100%_58%,100%_100%,0_100%)]" />

          <div className="absolute bottom-0 left-0 h-[32%] w-full bg-[#88B3D8] [clip-path:polygon(0_70%,20%_40%,38%_65%,52%_28%,70%_58%,84%_34%,100%_55%,100%_100%,0_100%)]" />

          {/* Sun */}
          <div className="absolute right-14 top-20 h-24 w-24 rounded-full bg-[#EBF2F2]/90" />

          {/* Content */}
          <div className="relative z-10 flex w-full flex-col justify-between p-10 xl:p-14">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-sm font-bold text-[#1A2B48]">
                G
              </div>

              <div>
                <p className="text-sm font-bold text-white">
                  GIKI Adventure Club
                </p>

                <p className="mt-1 text-[9px] font-medium uppercase tracking-[0.2em] text-[#88B3D8]">
                  GAC
                </p>
              </div>
            </Link>

            {/* Main Message */}
            <div className="relative max-w-lg pb-12">

              <p className="mb-5 text-xs font-semibold uppercase tracking-[0.22em] text-[#88B3D8]">
                Join the adventure
              </p>

              <h1 className="text-5xl font-semibold leading-[0.95] tracking-[-0.05em] text-white xl:text-6xl">
                Find your
                <br />
                people.
                <br />
                <span className="text-[#88B3D8]">Find your trail.</span>
              </h1>

              <div className="mt-7 h-px w-16 bg-[#88B3D8]" />

              <p className="mt-6 max-w-sm text-sm leading-7 text-white/50">
                Create your GAC account and discover hiking and trekking
                adventures across northern Pakistan.
              </p>
            </div>

            {/* Bottom */}
            <div className="relative flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.18em] text-white/40">
                Beyond the ordinary
              </p>

              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#1A2B48]">
                ↗
              </span>
            </div>
          </div>
        </div>

        {/* =========================================================
            RIGHT SIGNUP PANEL
        ========================================================= */}
        <div className="flex w-full flex-col justify-center overflow-y-auto px-7 py-10 sm:px-12 lg:w-[55%] lg:px-16 xl:px-20">

          <div className="mx-auto w-full max-w-xl">

            {/* Mobile logo */}
            <Link
              to="/"
              className="mb-10 flex items-center gap-3 lg:hidden"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1A2B48] text-sm font-bold text-white">
                G
              </div>

              <div>
                <p className="text-sm font-bold text-[#1A2B48]">
                  GIKI Adventure Club
                </p>

                <p className="mt-1 text-[9px] font-medium uppercase tracking-[0.2em] text-[#688BB0]">
                  GAC
                </p>
              </div>
            </Link>

            {/* Header */}
            <div className="mb-8">
              <div className="mb-4 flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-[#3D6BB4]" />

                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#688BB0]">
                  New Member
                </span>
              </div>

              <h2 className="text-4xl font-semibold tracking-[-0.045em] text-[#1A2B48] sm:text-5xl">
                Join
                <br />
                <span className="text-[#3D6BB4]">GAC</span>
              </h2>

              <p className="mt-4 text-sm leading-7 text-[#688BB0]">
                Create your account to register for events
              </p>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="grid gap-5 sm:grid-cols-2"
            >

              {/* Full Name */}
              <div className="flex flex-col gap-2 sm:col-span-2">
                <Label
                  htmlFor="fullName"
                  className="text-xs font-semibold uppercase tracking-[0.15em] text-[#1A2B48]"
                >
                  Full Name
                </Label>

                <Input
                  id="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  required
                  placeholder="Your full name"
                  className="h-13 rounded-2xl border-[#88B3D8]/40 bg-[#EBF2F2]/40 px-5 text-[#1A2B48] placeholder:text-[#688BB0]/50 focus:border-[#3D6BB4] focus:ring-[#3D6BB4]/20"
                />
              </div>

              {/* Email */}
              <div className="flex flex-col gap-2 sm:col-span-2">
                <Label
                  htmlFor="email"
                  className="text-xs font-semibold uppercase tracking-[0.15em] text-[#1A2B48]"
                >
                  Email
                </Label>

                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="you@example.com"
                  className="h-13 rounded-2xl border-[#88B3D8]/40 bg-[#EBF2F2]/40 px-5 text-[#1A2B48] placeholder:text-[#688BB0]/50 focus:border-[#3D6BB4] focus:ring-[#3D6BB4]/20"
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-2 sm:col-span-2">
                <Label
                  htmlFor="password"
                  className="text-xs font-semibold uppercase tracking-[0.15em] text-[#1A2B48]"
                >
                  Password
                </Label>

                <Input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="Create a password"
                  className="h-13 rounded-2xl border-[#88B3D8]/40 bg-[#EBF2F2]/40 px-5 text-[#1A2B48] placeholder:text-[#688BB0]/50 focus:border-[#3D6BB4] focus:ring-[#3D6BB4]/20"
                />
              </div>

              {/* Registration Number */}
              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="regNo"
                  className="text-xs font-semibold uppercase tracking-[0.12em] text-[#1A2B48]"
                >
                  Registration No.
                  <span className="ml-1 text-[#688BB0]">(optional)</span>
                </Label>

                <Input
                  id="regNo"
                  value={form.regNo}
                  onChange={handleChange}
                  placeholder="e.g. 2023037"
                  className="h-13 rounded-2xl border-[#88B3D8]/40 bg-[#EBF2F2]/40 px-5 text-[#1A2B48] placeholder:text-[#688BB0]/50 focus:border-[#3D6BB4] focus:ring-[#3D6BB4]/20"
                />
              </div>

              {/* WhatsApp */}
              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="whatsappNumber"
                  className="text-xs font-semibold uppercase tracking-[0.12em] text-[#1A2B48]"
                >
                  WhatsApp Number
                  <span className="ml-1 text-[#688BB0]">(optional)</span>
                </Label>

                <Input
                  id="whatsappNumber"
                  value={form.whatsappNumber}
                  onChange={handleChange}
                  placeholder="+92..."
                  className="h-13 rounded-2xl border-[#88B3D8]/40 bg-[#EBF2F2]/40 px-5 text-[#1A2B48] placeholder:text-[#688BB0]/50 focus:border-[#3D6BB4] focus:ring-[#3D6BB4]/20"
                />
              </div>

              {/* Error */}
              {formError && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 sm:col-span-2">
                  <p className="text-sm text-red-600">
                    {formError}
                  </p>
                </div>
              )}

              {/* Submit */}
              <div className="pt-1 sm:col-span-2">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="h-14 w-full rounded-full bg-[#1A2B48] px-6 text-sm font-semibold text-white shadow-lg shadow-[#1A2B48]/10 transition-all duration-300 hover:bg-[#3D6BB4] hover:shadow-xl disabled:opacity-60"
                >
                  {isLoading ? (
                    'Creating account...'
                  ) : (
                    <>
                      Create Account
                      <span className="ml-auto text-lg">
                        ↗
                      </span>
                    </>
                  )}
                </Button>
              </div>

              {/* Login */}
              <div className="relative flex items-center gap-4 pt-2 sm:col-span-2">
                <div className="h-px flex-1 bg-[#88B3D8]/20" />

                <span className="text-[10px] uppercase tracking-[0.15em] text-[#688BB0]">
                  or
                </span>

                <div className="h-px flex-1 bg-[#88B3D8]/20" />
              </div>

              <p className="text-center text-sm text-[#688BB0] sm:col-span-2">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-semibold text-[#3D6BB4] transition-colors hover:text-[#1A2B48]"
                >
                  Log in ↗
                </Link>
              </p>

            </form>

            {/* Bottom decoration */}
            <div className="mt-8 flex items-center justify-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#88B3D8]" />
              <span className="h-1.5 w-1.5 rounded-full bg-[#5F97DF]" />
              <span className="h-1.5 w-1.5 rounded-full bg-[#3D6BB4]" />
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}