import { Routes, Route } from 'react-router-dom';

// Public pages
import Home from '@/pages/public/Home';
import EventsBrowse from '@/pages/public/EventsBrowse';
import PastEvents from '@/pages/public/PastEvents';
import EventRegister from '@/pages/public/EventRegister';
import Login from '@/pages/public/Login';
import Signup from '@/pages/public/Signup';
import VerifyOtp from '@/pages/public/VerifyOtp';

// Authentication
import ProtectedRoute from '@/components/ProtectedRoute';

// User pages
import Dashboard from '@/pages/user/Dashboard';
import ProfileEdit from '@/pages/user/ProfileEdit';
import MyTickets from '@/pages/user/MyTickets';
import Notifications from '@/pages/user/Notifications';

// Admin pages
import SuperAdminDashboard from '@/pages/admin/SuperAdminDashboard';
import EventCoordinatorDashboard from '@/pages/admin/EventCoordinatorDashboard';
import ReckyManager from '@/pages/admin/ReckyManager';
import FormBuilder from '@/pages/admin/FormBuilder';
import TicketingDashboard from '@/pages/admin/TicketingDashboard';
import FinanceDashboard from '@/pages/admin/FinanceDashboard';
import LogisticsDashboard from '@/pages/admin/LogisticsDashboard';
import BudgetReadOnly from '@/pages/admin/BudgetReadOnly';
import OrgOverview from '@/pages/admin/OrgOverview';
import CheckInScan from '@/pages/admin/CheckInScan';
import HistoryManager from '@/pages/admin/HistoryManager';
import FemaleListManager from '@/pages/admin/FemaleListManager';
import FemaleListPrint from '@/pages/admin/FemaleListPrint';
import ReckyDashboardEntry from '@/pages/admin/ReckyDashboardEntry';
import EventFullReport from '@/pages/admin/EventFullReport';

function App() {
  return (
    <Routes>

      {/* =========================================================
          PUBLIC ROUTES
      ========================================================= */}

      <Route path="/" element={<Home />} />

      <Route
        path="/events"
        element={<EventsBrowse />}
      />

      <Route
        path="/past-events"
        element={<PastEvents />}
      />

      <Route
        path="/events/:slug"
        element={<EventRegister />}
      />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/signup"
        element={<Signup />}
      />

      <Route
        path="/verify-otp"
        element={<VerifyOtp />}
      />

      {/* =========================================================
          USER ROUTES
      ========================================================= */}

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfileEdit />
          </ProtectedRoute>
        }
      />

      <Route
        path="/my-tickets"
        element={
          <ProtectedRoute>
            <MyTickets />
          </ProtectedRoute>
        }
      />

      {/* =========================================================
          CHECK-IN
      ========================================================= */}

      <Route
        path="/checkin/:code"
        element={
          <ProtectedRoute
            allowedRoles={[
              'event_coordinator',
              'master_logistics',
              'super_admin',
            ]}
          >
            <CheckInScan />
          </ProtectedRoute>
        }
      />

      {/* =========================================================
          FEMALE LIST
      ========================================================= */}

      <Route
        path="/admin/female-list"
        element={
          <ProtectedRoute
            allowedRoles={[
              'general_secretary',
              'super_admin',
              'event_coordinator',
            ]}
          >
            <FemaleListManager />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/female-list/print/:eventId"
        element={
          <ProtectedRoute
            allowedRoles={[
              'general_secretary',
              'super_admin',
              'event_coordinator',
            ]}
          >
            <FemaleListPrint />
          </ProtectedRoute>
        }
      />

      {/* =========================================================
          SUPER ADMIN
      ========================================================= */}

      <Route
        path="/admin"
        element={
          <ProtectedRoute
            allowedRoles={['super_admin']}
          >
            <SuperAdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/recky"
        element={
          <ProtectedRoute allowedRoles={['finance_master', 'super_admin']}>
            <ReckyDashboardEntry />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute allowedRoles={['super_admin']}>
            <EventFullReport />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/history"
        element={
          <ProtectedRoute
            allowedRoles={['super_admin']}
          >
            <HistoryManager />
          </ProtectedRoute>
        }
      />

      {/* =========================================================
          ORGANIZATION OVERVIEW
      ========================================================= */}

      <Route
        path="/admin/overview"
        element={
          <ProtectedRoute
            allowedRoles={[
              'president',
              'vp_ops',
              'super_admin',
            ]}
          >
            <OrgOverview />
          </ProtectedRoute>
        }
      />

      {/* =========================================================
          EVENT MANAGEMENT
      ========================================================= */}

      <Route
        path="/admin/events"
        element={
          <ProtectedRoute
            allowedRoles={[
              'event_coordinator',
              'super_admin',
            ]}
          >
            <EventCoordinatorDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/events/:eventId/recky"
        element={
          <ProtectedRoute allowedRoles={['event_coordinator', 'finance_master', 'super_admin']}>
            <ReckyManager />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/events/:eventId/form"
        element={
          <ProtectedRoute
            allowedRoles={[
              'event_coordinator',
              'super_admin',
            ]}
          >
            <FormBuilder />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/events/:eventId/tickets"
        element={
          <ProtectedRoute
            allowedRoles={[
              'event_coordinator',
              'super_admin',
            ]}
          >
            <TicketingDashboard />
          </ProtectedRoute>
        }
      />

      {/* =========================================================
          FINANCE
      ========================================================= */}

      <Route
        path="/admin/finance"
        element={
          <ProtectedRoute
            allowedRoles={[
              'finance_master',
              'super_admin',
            ]}
          >
            <FinanceDashboard />
          </ProtectedRoute>
        }
      />

      {/* =========================================================
          LOGISTICS
      ========================================================= */}

      <Route
        path="/admin/logistics"
        element={
          <ProtectedRoute allowedRoles={['master_logistics', 'finance_master', 'super_admin']}>
            <LogisticsDashboard />
          </ProtectedRoute>
        }
      />

      {/* =========================================================
          BUDGET
      ========================================================= */}

      <Route
        path="/admin/budget-overview"
        element={
          <ProtectedRoute
            allowedRoles={[
              'president',
              'vp_ops',
              'event_coordinator',
              'super_admin',
            ]}
          >
            <BudgetReadOnly />
          </ProtectedRoute>
        }
      />

    </Routes>
  );
}

export default App;