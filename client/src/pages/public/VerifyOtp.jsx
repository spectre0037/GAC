import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
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

export default function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();

  const verifyOtp = useAuthStore((state) => state.verifyOtp);
  const resendOtp = useAuthStore((state) => state.resendOtp);

  const [email] = useState(location.state?.email || '');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    setError('');
    setMessage('');
    setLoading(true);

    try {
      const result = await verifyOtp({
        email,
        otp,
      });

      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to verify the code.'
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setError('');
    setMessage('');
    setResending(true);

    try {
      const result = await resendOtp(email);

      if (result.success) {
        setMessage('A new verification code has been sent.');
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to resend the code.'
      );
    } finally {
      setResending(false);
    }
  }

  /* -----------------------------------------------------------
     No email
  ------------------------------------------------------------ */
  if (!email) {
    return (
      <div
        className="
          flex min-h-[calc(100vh-84px)]
          items-center justify-center
          bg-background
          px-4
          pt-6
          sm:min-h-[calc(100vh-92px)]
          sm:pt-8
          lg:min-h-[calc(100vh-100px)]
          lg:pt-10
        "
      >
        <div className="w-full max-w-md text-center">
          <p className="text-sm text-muted-foreground">
            No email to verify.
          </p>

          <Link
            to="/signup"
            className="
              mt-2
              inline-block
              text-sm
              font-medium
              text-[#3D6BB4]
              underline-offset-4
              hover:underline
            "
          >
            Sign up first
          </Link>
        </div>
      </div>
    );
  }

  /* -----------------------------------------------------------
     Verification page
  ------------------------------------------------------------ */
  return (
    <div
      className="
        flex
        min-h-[calc(100vh-84px)]
        items-center
        justify-center
        bg-background
        px-4
        py-8
        sm:min-h-[calc(100vh-92px)]
        sm:px-6
        sm:py-10
        lg:min-h-[calc(100vh-100px)]
        lg:py-12
      "
    >
      <Card
        className="
          w-full
          max-w-sm
          overflow-hidden
          rounded-2xl
          border
          border-slate-200/70
          bg-white
          shadow-sm
          sm:rounded-[24px]
        "
      >
        <CardHeader className="px-5 pb-4 pt-6 sm:px-6 sm:pt-7">
          <div className="mb-4 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#5F97DF]" />

            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#688BB0]">
              Account verification
            </p>
          </div>

          <CardTitle
            className="
              text-2xl
              font-semibold
              tracking-tight
              text-[#1A2B48]
              sm:text-[26px]
            "
          >
            Verify your email
          </CardTitle>

          <CardDescription
            className="
              mt-2
              break-words
              text-sm
              leading-5
              text-[#688BB0]
            "
          >
            We sent a 6-digit verification code to{' '}
            <span className="font-medium text-[#1A2B48]">
              {email}
            </span>
          </CardDescription>
        </CardHeader>

        <CardContent className="px-5 pb-6 sm:px-6 sm:pb-7">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-5"
          >
            {/* OTP */}
            <div className="flex flex-col gap-2">
              <Label
                htmlFor="otp"
                className="
                  text-xs
                  font-medium
                  uppercase
                  tracking-wider
                  text-[#688BB0]
                "
              >
                Verification Code
              </Label>

              <Input
                id="otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={otp}
                onChange={(e) =>
                  setOtp(
                    e.target.value
                      .replace(/\D/g, '')
                      .slice(0, 6)
                  )
                }
                maxLength={6}
                placeholder="123456"
                required
                className="
                  h-12
                  rounded-xl
                  border-slate-200
                  bg-slate-50
                  text-center
                  text-lg
                  font-semibold
                  tracking-[0.35em]
                  text-[#1A2B48]
                  placeholder:text-slate-300
                  placeholder:tracking-[0.35em]
                  focus-visible:ring-[#3D6BB4]/30
                "
              />
            </div>

            {/* Error */}
            {error && (
              <div
                className="
                  rounded-xl
                  border
                  border-red-200
                  bg-red-50
                  px-3
                  py-2.5
                  text-sm
                  leading-5
                  text-red-700
                "
              >
                {error}
              </div>
            )}

            {/* Success */}
            {message && (
              <div
                className="
                  rounded-xl
                  border
                  border-emerald-200
                  bg-emerald-50
                  px-3
                  py-2.5
                  text-sm
                  leading-5
                  text-emerald-700
                "
              >
                {message}
              </div>
            )}

            {/* Verify */}
            <Button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="
                h-12
                w-full
                rounded-xl
                bg-[#1A2B48]
                text-sm
                font-semibold
                text-white
                shadow-sm
                hover:bg-[#243A5D]
                hover:shadow-md
              "
            >
              {loading ? 'Verifying...' : 'Verify Code ↗'}
            </Button>

            {/* Resend */}
            <Button
              type="button"
              variant="ghost"
              onClick={handleResend}
              disabled={resending}
              className="
                h-10
                w-full
                rounded-xl
                text-sm
                font-medium
                text-[#3D6BB4]
                hover:bg-[#EBF2F2]
                hover:text-[#1A2B48]
              "
            >
              {resending ? 'Sending...' : 'Resend Code'}
            </Button>

            <div className="border-t border-slate-100 pt-4 text-center">
              <Link
                to="/signup"
                className="
                  text-xs
                  font-medium
                  text-[#688BB0]
                  transition-colors
                  hover:text-[#1A2B48]
                "
              >
                Use a different email
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}