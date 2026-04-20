import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authApi } from '../services/api';
import { Box, CircularProgress, Typography, Alert } from '@mui/material';

const OAuth2RedirectHandler: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setError('Authentication failed: No token received from server.');
      return;
    }

    const authenticateWithToken = async () => {
      try {
        // Temporarily store token so API calls work
        localStorage.setItem('token', token);
        
        // Fetch user data
        const response = await authApi.getMe();
        const userData = response.data;
        
        // Setup session via AuthContext
        setSession(token, userData);
        
        // Redirect based on role
        if (userData.role === 'ADMIN') {
          navigate('/dashboard', { replace: true });
        } else if (userData.role === 'TECHNICIAN') {
          navigate('/tickets/assigned', { replace: true });
        } else {
          navigate('/resources', { replace: true });
        }
      } catch (err: any) {
        console.error('Failed to fetch user data after OAuth2 login:', err);
        setError('Failed to fetch user profile. Please try logging in again.');
        localStorage.removeItem('token');
      }
    };

    authenticateWithToken();
  }, [searchParams, navigate, setSession]);

  if (error) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f7fb' }}>
        <Box sx={{ maxWidth: 400, width: '100%', p: 3, textAlign: 'center' }}>
          <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
          <Typography variant="body2" sx={{ cursor: 'pointer', color: 'primary.main', textDecoration: 'underline' }} onClick={() => navigate('/login')}>
            Return to Login
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f7fb' }}>
      <CircularProgress size={48} sx={{ mb: 3, color: '#667eea' }} />
      <Typography variant="h6" color="text.secondary">Completing sign in...</Typography>
    </Box>
  );
};

export default OAuth2RedirectHandler;
