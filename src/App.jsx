import { Routes, Route, Navigate } from 'react-router-dom';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Voting from './pages/Voting';
import HomePage from './pages/HomePage';
import Explore from './pages/Explore';
import EventDetail from './pages/EventDetail';
import MainLayout from './layouts/MainLayout';
import Placeholder from './pages/Placeholder';
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
import './App.css';
import { ToastProvider } from './components/Toast';

function App() {
  return (
    <ToastProvider>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        
        {/* Unified Layout */}
        <Route element={<MainLayout />}>
          {/* Attendee content */}
          <Route path="/explore" element={<Explore />} />
          <Route path="/voting" element={<Voting />} />
          <Route path="/event/:id" element={<EventDetail />} />
          <Route path="/tickets" element={<TicketWallet />} />
          <Route path="/upgrade" element={<Upgrade />} />
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/payment/failed" element={<PaymentFailure />} />
  
          {/* Organizer content */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/explore" element={<Explore />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/dashboard/events/create" element={<CreateEvent />} />
          <Route path="/dashboard/events/edit/:id" element={<CreateEvent />} />
          <Route path="/dashboard/scanner" element={<EventScanner />} />
  
          <Route path="/dashboard/events" element={<EventsManagement />} />
          <Route path="/dashboard/analytics" element={<Analytics />} />
          <Route path="/dashboard/attendees" element={<AttendeeList />} />
          <Route path="/dashboard/voting" element={<PollManager />} />
          <Route path="/dashboard/settings" element={<Profile />} />
        </Route>
      </Routes>
    </ToastProvider>
  );
}


export default App;
