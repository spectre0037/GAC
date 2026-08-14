import { Routes, Route, Link } from 'react-router-dom';
import Home from '@/pages/public/Home';
import EventsBrowse from '@/pages/public/EventsBrowse';
import PastEvents from '@/pages/public/PastEvents';
import EventRegister from '@/pages/public/EventRegister';
import Login from '@/pages/public/Login';
import Signup from '@/pages/public/Signup';
import ProtectedRoute from '@/components/ProtectedRoute';
import SuperAdminDashboard from '@/pages/admin/SuperAdminDashboard';
import EventCoordinatorDashboard from '@/pages/admin/EventCoordinatorDashboard';
import ReckyManager from '@/pages/admin/ReckyManager';
import FormBuilder from '@/pages/admin/FormBuilder';
import MyTickets from '@/pages/user/MyTickets';
import TicketingDashboard from '@/pages/admin/TicketingDashboard';
import FinanceDashboard from '@/pages/admin/FinanceDashboard';
import LogisticsDashboard from '@/pages/admin/LogisticsDashboard';
import BudgetReadOnly from '@/pages/admin/BudgetReadOnly';
import { useAuthStore } from '@/store/authStore';
import Dashboard from '@/pages/user/Dashboard';
import ProfileEdit from '@/pages/user/ProfileEdit';
import OrgOverview from '@/pages/admin/OrgOverview';
import CheckInScan from '@/pages/admin/CheckInScan';
import HistoryManager from '@/pages/admin/HistoryManager';
import FemaleListManager from '@/pages/admin/FemaleListManager';
import FemaleListPrint from '@/pages/admin/FemaleListPrint';
import Notifications from '@/pages/user/Notifications';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/events" element={<EventsBrowse />} />
      <Route path="/past-events" element={<PastEvents />} />
      <Route path="/events/:slug" element={<EventRegister />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

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
        path="/checkin/:code"
        element={
          <ProtectedRoute allowedRoles={['event_coordinator', 'master_logistics', 'super_admin']}>
            <CheckInScan />
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
        path="/admin/female-list"
        element={
          <ProtectedRoute allowedRoles={['general_secretary', 'super_admin', 'event_coordinator']}>
            <FemaleListManager />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/female-list/print/:eventId"
        element={
          <ProtectedRoute allowedRoles={['general_secretary', 'super_admin', 'event_coordinator']}>
            <FemaleListPrint />
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
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['super_admin']}>
            <SuperAdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/history"
        element={
          <ProtectedRoute allowedRoles={['super_admin']}>
            <HistoryManager />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/overview"
        element={
          <ProtectedRoute allowedRoles={['president', 'vp_ops', 'super_admin']}>
            <OrgOverview />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/events"
        element={
          <ProtectedRoute allowedRoles={['event_coordinator', 'super_admin']}>
            <EventCoordinatorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/events/:eventId/recky"
        element={
          <ProtectedRoute allowedRoles={['event_coordinator', 'super_admin']}>
            <ReckyManager />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/events/:eventId/form"
        element={
          <ProtectedRoute allowedRoles={['event_coordinator', 'super_admin']}>
            <FormBuilder />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/events/:eventId/tickets"
        element={
          <ProtectedRoute allowedRoles={['event_coordinator', 'super_admin']}>
            <TicketingDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/finance"
        element={
          <ProtectedRoute allowedRoles={['finance_master', 'super_admin']}>
            <FinanceDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/logistics"
        element={
          <ProtectedRoute allowedRoles={['master_logistics', 'super_admin']}>
            <LogisticsDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/budget-overview"
        element={
          <ProtectedRoute
            allowedRoles={['president', 'vp_ops', 'event_coordinator', 'super_admin']}
          >
            <BudgetReadOnly />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;