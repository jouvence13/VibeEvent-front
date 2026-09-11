import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Voting from './pages/Voting';
import HomePage from './pages/HomePage';
import Explore from './pages/Explore';
import EventDetail from './pages/EventDetail';
import MainLayout from './layouts/MainLayout';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import CreateEvent from './pages/CreateEvent';
import TicketWallet from './pages/TicketWallet';
import EventScanner from './pages/EventScanner';
import EventsManagement from './pages/EventsManagement';
import Analytics from './pages/Analytics';
import AttendeeList from './pages/AttendeeList';
import PollManager from './pages/PollManager';
import Upgrade from './pages/Upgrade';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailure from './pages/PaymentFailure';
import NotFound from './pages/NotFound';
import './App.css';
import { ToastProvider } from './components/Toast';
import ProtectedRoute from './components/ProtectedRoute';

const ORGANIZER_ROLES = ['organizer', 'admin'];

function App() {
  return (
    <ToastProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />

        {/* Unified Layout - requires an authenticated session */}
        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          {/* Attendee content */}
          <Route path="/explore" element={<Explore />} />
          <Route path="/voting" element={<Voting />} />
          <Route path="/event/:id" element={<EventDetail />} />
          <Route path="/tickets" element={<TicketWallet />} />
          <Route path="/upgrade" element={<Upgrade />} />
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/payment/failed" element={<PaymentFailure />} />
          <Route path="/profile" element={<Profile />} />

          {/* Organizer content */}
          <Route path="/dashboard" element={<ProtectedRoute roles={ORGANIZER_ROLES}><Dashboard /></ProtectedRoute>} />
          <Route path="/dashboard/explore" element={<Explore />} />
          <Route path="/dashboard/events/create" element={<ProtectedRoute roles={ORGANIZER_ROLES}><CreateEvent /></ProtectedRoute>} />
          <Route path="/dashboard/events/edit/:id" element={<ProtectedRoute roles={ORGANIZER_ROLES}><CreateEvent /></ProtectedRoute>} />
          <Route path="/dashboard/scanner" element={<ProtectedRoute roles={ORGANIZER_ROLES}><EventScanner /></ProtectedRoute>} />
          <Route path="/dashboard/events" element={<ProtectedRoute roles={ORGANIZER_ROLES}><EventsManagement /></ProtectedRoute>} />
          <Route path="/dashboard/analytics" element={<ProtectedRoute roles={ORGANIZER_ROLES}><Analytics /></ProtectedRoute>} />
          <Route path="/dashboard/attendees" element={<ProtectedRoute roles={ORGANIZER_ROLES}><AttendeeList /></ProtectedRoute>} />
          <Route path="/dashboard/voting" element={<ProtectedRoute roles={ORGANIZER_ROLES}><PollManager /></ProtectedRoute>} />
          <Route path="/dashboard/settings" element={<Profile />} />

          {/* Admin-only content */}
          <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        </Route>

        {/* 404 Not Found Catch-All */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ToastProvider>
  );
}


export default App;
