import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');

    const result = await login({ email, password });

    if (result.success) {
      navigate('/dashboard');
    } else {
      setFormError(result.message);
    }
  }

  return (
    <div className="min-h-screen bg-[#EBF2F2] p-4 sm:p-6 lg:p-8">
      <div className="relative mx-auto flex min-h-[calc(100vh-2rem)] max-w-7xl overflow-hidden rounded-[2rem] bg-white shadow-[0_30px_100px_rgba(26,43,72,0.12)] sm:min-h-[calc(100vh-3rem)] lg:min-h-[calc(100vh-4rem)]">

        {/* Left Visual Panel */}
        <div className="relative hidden overflow-hidden bg-[#1A2B48] lg:flex lg:w-[52%]">

          {/* Decorative circles */}
          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full border border-[#88B3D8]/15" />

          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full border border-[#88B3D8]/15" />

          <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full border border-[#88B3D8]/10" />

          {/* Abstract mountain landscape */}
          <div className="absolute bottom-0 left-0 h-[50%] w-full bg-[#3D6BB4] [clip-path:polygon(0_65%,15%_40%,30%_60%,45%_20%,60%_55%,75%_30%,100%_60%,100%_100%,0_100%)]" />

          <div className="absolute bottom-0 left-0 h-[35%] w-full bg-[#88B3D8] [clip-path:polygon(0_70%,18%_40%,35%_65%,50%_30%,68%_60%,82%_35%,100%_55%,100%_100%,0_100%)]" />

          {/* Sun */}
          <div className="absolute right-16 top-20 h-24 w-24 rounded-full bg-[#EBF2F2]/90" />

          {/* Content */}
          <div className="relative z-10 flex w-full flex-col justify-between p-12 xl:p-16">

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
            <div className="relative max-w-lg pb-20">

              <p className="mb-5 text-xs font-semibold uppercase tracking-[0.22em] text-[#88B3D8]">
                Welcome back
              </p>

              <h1 className="text-5xl font-semibold leading-[0.95] tracking-[-0.05em] text-white xl:text-6xl">
                Your next
                <br />
                adventure
                <br />
                <span className="text-[#88B3D8]">starts here.</span>
              </h1>

              <div className="mt-7 h-px w-16 bg-[#88B3D8]" />

              <p className="mt-6 max-w-sm text-sm leading-7 text-white/50">
                Sign in to manage your trips, tickets, and upcoming
                adventures with GIKI Adventure Club.
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

        {/* Right Form Panel */}
        <div className="flex w-full flex-col justify-center px-7 py-12 sm:px-12 lg:w-[48%] lg:px-16 xl:px-20">

          {/* Mobile Logo */}
          <Link
            to="/"
            className="mb-12 flex items-center gap-3 lg:hidden"
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

          <div className="mx-auto w-full max-w-md">

            {/* Header */}
            <div className="mb-10">
              <div className="mb-5 flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-[#3D6BB4]" />

                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#688BB0]">
                  Member Login
                </span>
              </div>

              <h2 className="text-4xl font-semibold tracking-[-0.045em] text-[#1A2B48] sm:text-5xl">
                Log in to
                <br />
                <span className="text-[#3D6BB4]">GAC</span>
              </h2>

              <p className="mt-5 text-sm leading-7 text-[#688BB0]">
                Enter your email and password to continue
              </p>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-6"
            >

              {/* Email */}
              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="email"
                  className="text-xs font-semibold uppercase tracking-[0.15em] text-[#1A2B48]"
                >
                  Email
                </Label>

                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-14 rounded-2xl border-[#88B3D8]/40 bg-[#EBF2F2]/40 px-5 text-[#1A2B48] placeholder:text-[#688BB0]/50 focus:border-[#3D6BB4] focus:ring-[#3D6BB4]/20"
                  placeholder="you@example.com"
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="password"
                  className="text-xs font-semibold uppercase tracking-[0.15em] text-[#1A2B48]"
                >
                  Password
                </Label>

                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-14 rounded-2xl border-[#88B3D8]/40 bg-[#EBF2F2]/40 px-5 text-[#1A2B48] placeholder:text-[#688BB0]/50 focus:border-[#3D6BB4] focus:ring-[#3D6BB4]/20"
                  placeholder="Enter your password"
                />
              </div>

              {/* Error */}
              {formError && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
                  <p className="text-sm text-red-600">
                    {formError}
                  </p>
                </div>
              )}

              {/* Submit */}
              <Button
                type="submit"
                disabled={isLoading}
                className="mt-2 h-14 w-full rounded-full bg-[#1A2B48] px-6 text-sm font-semibold text-white shadow-lg shadow-[#1A2B48]/10 transition-all duration-300 hover:bg-[#3D6BB4] hover:shadow-xl disabled:opacity-60"
              >
                {isLoading ? (
                  'Logging in...'
                ) : (
                  <>
                    Log In
                    <span className="ml-auto text-lg">
                      ↗
                    </span>
                  </>
                )}
              </Button>

              {/* Signup */}
              <div className="relative my-2 flex items-center gap-4">
                <div className="h-px flex-1 bg-[#88B3D8]/20" />

                <span className="text-[10px] uppercase tracking-[0.15em] text-[#688BB0]">
                  or
                </span>

                <div className="h-px flex-1 bg-[#88B3D8]/20" />
              </div>

              <p className="text-center text-sm text-[#688BB0]">
                Don't have an account?{' '}
                <Link
                  to="/signup"
                  className="font-semibold text-[#3D6BB4] transition-colors hover:text-[#1A2B48]"
                >
                  Sign up ↗
                </Link>
              </p>
            </form>

            {/* Footer note */}
            <div className="mt-12 flex items-center justify-center gap-2">
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