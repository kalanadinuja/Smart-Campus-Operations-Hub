import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ResourcesPage from './pages/ResourcesPage';
import ResourceFormPage from './pages/ResourceFormPage';
import BookingsPage from './pages/BookingsPage';
import BookingFormPage from './pages/BookingFormPage';
import TicketsPage from './pages/TicketsPage';
import TicketFormPage from './pages/TicketFormPage';
import TicketDetailPage from './pages/TicketDetailPage';
import ResourceCalendarPage from './pages/ResourceCalendarPage';
import UsersPage from './pages/UsersPage';
import OAuth2RedirectHandler from './pages/OAuth2RedirectHandler';
import RegisterPage from './pages/RegisterPage';

const theme = createTheme({
  palette: {
    primary: { main: '#667eea' },
    secondary: { main: '#764ba2' },
    background: { default: '#f5f7fb' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600 },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <NotificationProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />
              <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="resources" element={<ResourcesPage />} />
                <Route path="resources/new" element={<ProtectedRoute roles={['ADMIN']}><ResourceFormPage /></ProtectedRoute>} />
                <Route path="resources/edit/:id" element={<ProtectedRoute roles={['ADMIN']}><ResourceFormPage /></ProtectedRoute>} />
                <Route path="bookings" element={<BookingsPage />} />
                <Route path="bookings/all" element={<ProtectedRoute roles={['ADMIN']}><BookingsPage /></ProtectedRoute>} />
                <Route path="bookings/new" element={<BookingFormPage />} />
                <Route path="tickets" element={<TicketsPage mode="mine" />} />
                <Route path="tickets/all" element={<ProtectedRoute roles={['ADMIN']}><TicketsPage mode="all" /></ProtectedRoute>} />
                <Route path="tickets/assigned" element={<ProtectedRoute roles={['TECHNICIAN']}><TicketsPage mode="assigned" /></ProtectedRoute>} />
                <Route path="tickets/new" element={<TicketFormPage />} />
                <Route path="tickets/:id" element={<TicketDetailPage />} />
                <Route path="calendar" element={<ResourceCalendarPage />} />
                <Route path="analytics" element={<ProtectedRoute roles={['ADMIN']}><DashboardPage /></ProtectedRoute>} />
                <Route path="users" element={<ProtectedRoute roles={['ADMIN']}><UsersPage /></ProtectedRoute>} />
              </Route>
            </Routes>
          </NotificationProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
