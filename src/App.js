import React, { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { supabase } from './supabaseClient';

// Import all partner components
import ActivitiesDetails from './pages/ActivitiesDetails';
import NotificationsPage from './pages/NotificationsPage';
import PartnerLoginPage from './pages/PartnerLoginPage';
import PaymentsPage from './pages/PaymentsPage';
import ProfilePage from './pages/ProfilePage';
import QRScannerPage from './pages/QRScannerPage';
import SalesAnalytics from './pages/SalesAnalytics';
import SummaryPage from './pages/SummaryPage';
import TicketTypesPage from './pages/TicketTypesPage';
import UpdatedPartnerHomePage from './pages/UpdatedPartnerHomePage';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Partner Portal Routes */}
        <Route 
          path="/partner/login" 
          element={
            session ? <Navigate to="/partner/home" replace /> : <PartnerLoginPage />
          } 
        />
        
        <Route 
          path="/partner/home" 
          element={
            session ? <UpdatedPartnerHomePage /> : <Navigate to="/partner/login" replace />
          } 
        />
        
        <Route 
          path="/partner/qr-scanner" 
          element={
            session ? <QRScannerPage /> : <Navigate to="/partner/login" replace />
          } 
        />
        
        <Route 
          path="/partner/ticket-types" 
          element={
            session ? <TicketTypesPage /> : <Navigate to="/partner/login" replace />
          } 
        />
        
        <Route 
          path="/partner/payments" 
          element={
            session ? <PaymentsPage /> : <Navigate to="/partner/login" replace />
          } 
        />
        
        <Route 
          path="/partner/notifications" 
          element={
            session ? <NotificationsPage /> : <Navigate to="/partner/login" replace />
          } 
        />
        
        <Route 
          path="/partner/analytics" 
          element={
            session ? <SalesAnalytics /> : <Navigate to="/partner/login" replace />
          } 
        />
        
        <Route 
          path="/partner/activities" 
          element={
            session ? <ActivitiesDetails /> : <Navigate to="/partner/login" replace />
          } 
        />
        
        <Route 
          path="/partner/profile" 
          element={
            session ? <ProfilePage /> : <Navigate to="/partner/login" replace />
          } 
        />
        
        <Route 
          path="/partner/summary" 
          element={
            session ? <SummaryPage /> : <Navigate to="/partner/login" replace />
          } 
        />

        {/* Default redirects */}
        <Route path="/partner" element={<Navigate to="/partner/login" replace />} />
        <Route path="/" element={<Navigate to="/partner/login" replace />} />
        <Route path="*" element={<Navigate to="/partner/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;