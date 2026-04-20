import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Box, Card, CardContent, TextField, Button, Typography,
  Alert, CircularProgress, Divider,
} from '@mui/material';
import { School, Google } from '@mui/icons-material';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('Please fill in all fields'); return; }
    setLoading(true);
    setError('');
    try {
      const user = await login(email, password);
      if (user.role === 'ADMIN') {
        navigate('/dashboard');
      } else if (user.role === 'TECHNICIAN') {
        navigate('/tickets/assigned');
      } else {
        navigate('/resources');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:8081/oauth2/authorization/google';
  };

  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    }}>
      <Card sx={{ maxWidth: 420, width: '100%', mx: 2, borderRadius: 3, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <School sx={{ fontSize: 48, color: '#667eea' }} />
            <Typography variant="h5" sx={{ fontWeight: 700,  mt: 1  }}>Smart Campus Hub</Typography>
            <Typography variant="body2" color="text.secondary">Sign in to manage campus operations</Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Button 
            fullWidth 
            variant="outlined" 
            startIcon={<Google />} 
            onClick={handleGoogleLogin}
            sx={{ mb: 3, py: 1, borderRadius: 2, color: '#DB4437', borderColor: '#DB4437', '&:hover': { borderColor: '#DB4437', backgroundColor: 'rgba(219,68,55,0.04)' } }}
          >
            Sign in with Google
          </Button>

          <Divider sx={{ mb: 3 }}>OR</Divider>

          <form onSubmit={handleSubmit}>
            <TextField fullWidth label="Email" type="email" value={email}
              onChange={(e) => setEmail(e.target.value)} sx={{ mb: 2 }} size="small" />
            <TextField fullWidth label="Password" type="password" value={password}
              onChange={(e) => setPassword(e.target.value)} sx={{ mb: 3 }} size="small" />
            <Button fullWidth variant="contained" type="submit" disabled={loading}
              sx={{ py: 1.2, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: 2 }}>
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LoginPage;


