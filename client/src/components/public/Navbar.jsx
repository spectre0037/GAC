import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';

export default function Navbar() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <header className="absolute left-0 right-0 top-0 z-50 px-4 pt-5 sm:px-6 lg:px-10">
      <nav className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between rounded-full border border-white/70 bg-white/85 px-3 py-2 shadow-[0_10px_40px_rgba(26,43,72,0.08)] backdrop-blur-xl">

          {/* Logo */}
          <Link
            to="/"
            className="group flex items-center gap-3 rounded-full px-3 py-2"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1A2B48] text-sm font-bold text-white transition-colors duration-300 group-hover:bg-[#3D6BB4]">
              G
            </div>

            <div className="hidden sm:block">
              <p className="text-sm font-bold leading-none tracking-tight text-[#1A2B48]">
                GAC
              </p>
              <p className="mt-1 text-[9px] font-medium uppercase tracking-[0.18em] text-[#688BB0]">
                Adventure Club
              </p>
            </div>
          </Link>

          {/* Navigation */}
          <div className="hidden items-center gap-1 md:flex">
            <Link
              to="/events"
              className="rounded-full px-4 py-2.5 text-sm font-medium text-[#688BB0] transition-all duration-300 hover:bg-[#EBF2F2] hover:text-[#1A2B48]"
            >
              Events
            </Link>

            <Link
              to="/past-events"
              className="rounded-full px-4 py-2.5 text-sm font-medium text-[#688BB0] transition-all duration-300 hover:bg-[#EBF2F2] hover:text-[#1A2B48]"
            >
              Past Events
            </Link>

            {user && (
              <>
                <Link
                  to="/my-tickets"
                  className="rounded-full px-4 py-2.5 text-sm font-medium text-[#688BB0] transition-all duration-300 hover:bg-[#EBF2F2] hover:text-[#1A2B48]"
                >
                  My Tickets
                </Link>

                <Link
                  to="/dashboard"
                  className="rounded-full px-4 py-2.5 text-sm font-medium text-[#688BB0] transition-all duration-300 hover:bg-[#EBF2F2] hover:text-[#1A2B48]"
                >
                  Dashboard
                </Link>
              </>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {user ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="h-10 rounded-full border-[#88B3D8]/60 bg-transparent px-5 text-xs font-semibold text-[#1A2B48] transition-all duration-300 hover:border-[#1A2B48] hover:bg-[#1A2B48] hover:text-white"
              >
                Log out
              </Button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden rounded-full px-4 py-2.5 text-sm font-medium text-[#688BB0] transition-colors duration-300 hover:text-[#1A2B48] sm:block"
                >
                  Log in
                </Link>

                <Link to="/signup">
                  <Button
                    size="sm"
                    className="h-10 rounded-full bg-[#1A2B48] px-5 text-xs font-semibold text-white shadow-md transition-all duration-300 hover:bg-[#3D6BB4] hover:shadow-lg"
                  >
                    Sign up
                    <span className="ml-2 text-sm">↗</span>
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}