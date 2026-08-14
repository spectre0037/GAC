import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");

    const result = await login({ email, password });

    if (result.success) {
      navigate("/dashboard");
    } else if (result.needsVerification) {
      navigate("/verify-otp", {
        state: { email: result.email },
      });
    } else {
      setFormError(result.message);
    }
  }

  return (
    <div className="min-h-screen bg-[#EBF2F2] px-3 py-3 sm:px-5 sm:py-5 md:px-6 md:py-6 lg:px-8 lg:py-8">
      <div
        className="
          relative mx-auto flex
          min-h-[calc(100vh-1.5rem)]
          w-full max-w-7xl
          overflow-hidden rounded-[1.5rem]
          bg-white
          shadow-[0_30px_100px_rgba(26,43,72,0.12)]
          sm:min-h-[calc(100vh-2.5rem)]
          sm:rounded-[1.75rem]
          md:min-h-[calc(100vh-3rem)]
          md:rounded-[2rem]
          lg:min-h-[calc(100vh-4rem)]
        "
      >
        {/* =========================================================
            LEFT VISUAL PANEL
            Hidden below lg to give tablets/mobile a clean form layout
        ========================================================= */}
        <div className="relative hidden overflow-hidden bg-[#1A2B48] lg:flex lg:w-[50%] xl:w-[52%]">
          {/* Decorative circles */}
          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full border border-[#88B3D8]/15" />

          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full border border-[#88B3D8]/15" />

          <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full border border-[#88B3D8]/10" />

          {/* Abstract mountain landscape */}
          <div className="absolute bottom-0 left-0 h-[50%] w-full bg-[#3D6BB4] [clip-path:polygon(0_65%,15%_40%,30%_60%,45%_20%,60%_55%,75%_30%,100%_60%,100%_100%,0_100%)]" />

          <div className="absolute bottom-0 left-0 h-[35%] w-full bg-[#88B3D8] [clip-path:polygon(0_70%,18%_40%,35%_65%,50%_30%,68%_60%,82%_35%,100%_55%,100%_100%,0_100%)]" />

          {/* Sun */}
          <div className="absolute right-10 top-16 h-20 w-20 rounded-full bg-[#EBF2F2]/90 xl:right-16 xl:top-20 xl:h-24 xl:w-24" />

          {/* Content */}
          <div className="relative z-10 flex h-full w-full flex-col justify-between p-8 xl:p-12 2xl:p-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-[#1A2B48] xl:h-11 xl:w-11">
                G
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-white">
                  GIKI Adventure Club
                </p>

                <p className="mt-1 text-[9px] font-medium uppercase tracking-[0.2em] text-[#88B3D8]">
                  GAC
                </p>
              </div>
            </Link>

            {/* Main Message */}
            <div className="relative max-w-lg pb-12 xl:pb-20">
              <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#88B3D8] xl:mb-5 xl:text-xs">
                Welcome back
              </p>

              <h1 className="text-4xl font-semibold leading-[0.95] tracking-[-0.05em] text-white xl:text-5xl 2xl:text-6xl">
                Your next
                <br />
                adventure
                <br />
                <span className="text-[#88B3D8]">starts here.</span>
              </h1>

              <div className="mt-6 h-px w-14 bg-[#88B3D8] xl:mt-7 xl:w-16" />

              <p className="mt-5 max-w-sm text-xs leading-6 text-white/50 xl:mt-6 xl:text-sm xl:leading-7">
                Sign in to manage your trips, tickets, and upcoming adventures
                with GIKI Adventure Club.
              </p>
            </div>

            {/* Bottom */}
            <div className="relative flex items-center justify-between gap-4">
              <p className="text-[10px] uppercase tracking-[0.18em] text-white/40 xl:text-xs">
                Beyond the ordinary
              </p>

              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#1A2B48] xl:h-11 xl:w-11">
                ↗
              </span>
            </div>
          </div>
        </div>

        {/* =========================================================
            RIGHT FORM PANEL
        ========================================================= */}
        <div
          className="
            flex w-full flex-col justify-center
            px-5 py-8
            sm:px-8 sm:py-10
            md:px-12 md:py-12
            lg:w-[50%] lg:px-10
            xl:w-[48%] xl:px-14
            2xl:px-20
          "
        >
          {/* Mobile / Tablet Logo */}
          <Link
            to="/"
            className="
              mb-8 flex items-center gap-3
              sm:mb-10
              lg:hidden
            "
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1A2B48] text-sm font-bold text-white">
              G
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-[#1A2B48]">
                GIKI Adventure Club
              </p>

              <p className="mt-1 text-[9px] font-medium uppercase tracking-[0.2em] text-[#688BB0]">
                GAC
              </p>
            </div>
          </Link>

          <div className="mx-auto w-full max-w-md">
            {/* Header */}
            <div className="mb-8 sm:mb-9 md:mb-10">
              <div className="mb-4 flex items-center gap-3 sm:mb-5">
                <span className="h-2 w-2 shrink-0 rounded-full bg-[#3D6BB4]" />

                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#688BB0] sm:text-xs">
                  Member Login
                </span>
              </div>

              <h2
                className="
                  text-3xl font-semibold
                  tracking-[-0.045em]
                  text-[#1A2B48]
                  sm:text-4xl
                  md:text-5xl
                "
              >
                Log in to
                <br />
                <span className="text-[#3D6BB4]">GAC</span>
              </h2>

              <p className="mt-4 text-sm leading-6 text-[#688BB0] sm:mt-5 sm:leading-7">
                Enter your email and password to continue
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-5 sm:gap-6">
              {/* Email */}
              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="email"
                  className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#1A2B48] sm:text-xs"
                >
                  Email
                </Label>

                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="
                    h-12 rounded-xl
                    border-[#88B3D8]/40
                    bg-[#EBF2F2]/40
                    px-4
                    text-[#1A2B48]
                    placeholder:text-[#688BB0]/50
                    focus:border-[#3D6BB4]
                    focus:ring-[#3D6BB4]/20
                    sm:h-14 sm:rounded-2xl sm:px-5
                  "
                  placeholder="you@example.com"
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="password"
                  className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#1A2B48] sm:text-xs"
                >
                  Password
                </Label>

                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="
                    h-12 rounded-xl
                    border-[#88B3D8]/40
                    bg-[#EBF2F2]/40
                    px-4
                    text-[#1A2B48]
                    placeholder:text-[#688BB0]/50
                    focus:border-[#3D6BB4]
                    focus:ring-[#3D6BB4]/20
                    sm:h-14 sm:rounded-2xl sm:px-5
                  "
                  placeholder="Enter your password"
                />
              </div>

              {/* Error */}
              {formError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 sm:rounded-2xl">
                  <p className="break-words text-sm leading-5 text-red-600">
                    {formError}
                  </p>
                </div>
              )}

              {/* Submit */}
              <Button
                type="submit"
                disabled={isLoading}
                className="
                  mt-1 h-12 w-full
                  rounded-full
                  bg-[#1A2B48]
                  px-5
                  text-sm font-semibold
                  text-white
                  shadow-lg shadow-[#1A2B48]/10
                  transition-all duration-300
                  hover:bg-[#3D6BB4]
                  hover:shadow-xl
                  disabled:opacity-60
                  sm:mt-2 sm:h-14 sm:px-6
                "
              >
                {isLoading ? (
                  "Logging in..."
                ) : (
                  <>
                    Log In
                    <span className="ml-auto text-lg">↗</span>
                  </>
                )}
              </Button>

              {/* Signup divider */}
              <div className="relative my-1 flex items-center gap-3 sm:my-2 sm:gap-4">
                <div className="h-px flex-1 bg-[#88B3D8]/20" />

                <span className="text-[9px] uppercase tracking-[0.15em] text-[#688BB0] sm:text-[10px]">
                  or
                </span>

                <div className="h-px flex-1 bg-[#88B3D8]/20" />
              </div>

              {/* Signup */}
              <p className="text-center text-sm text-[#688BB0]">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="font-semibold text-[#3D6BB4] transition-colors hover:text-[#1A2B48]"
                >
                  Sign up ↗
                </Link>
              </p>
            </form>

            {/* Footer note */}
            <div className="mt-8 flex items-center justify-center gap-2 sm:mt-12">
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