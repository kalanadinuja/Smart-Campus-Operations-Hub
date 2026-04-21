import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { authApi } from '../services/api';
import {
  Box, Card, CardContent, TextField, Button, Typography,
  Alert, CircularProgress, Link,
} from '@mui/material';
import { School, PersonAdd } from '@mui/icons-material';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = (): string | null => {
    if (!name.trim()) return 'Name is required';
    if (!email.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Invalid email format';
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    if (password !== confirmPassword) return 'Passwords do not match';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.signup(name.trim(), email.trim(), password);
      setSuccess(res.data.message || 'Account created successfully! Redirecting to sign in...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    }}>
      <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Card sx={{ maxWidth: 420, width: '100%', mx: 2, borderRadius: 3, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <School sx={{ fontSize: 48, color: '#667eea' }} />
            <Typography variant="h5" sx={{ fontWeight: 700, mt: 1 }}>Create Account</Typography>
            <Typography variant="body2" color="text.secondary">Join Smart Campus Hub</Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField
              id="signup-name"
              fullWidth
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              sx={{ mb: 2 }}
              size="small"
              required
            />
            <TextField
              id="signup-email"
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 2 }}
              size="small"
              required
            />
            <TextField
              id="signup-password"
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 2 }}
              size="small"
              required
              helperText="Minimum 6 characters"
            />
            <TextField
              id="signup-confirm-password"
              fullWidth
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              sx={{ mb: 3 }}
              size="small"
              required
            />
            <Button
              id="signup-submit"
              fullWidth
              variant="contained"
              type="submit"
              disabled={loading || !!success}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PersonAdd />}
              sx={{
                py: 1.2,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: 2,
              }}
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </Button>
          </form>

          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <Link component={RouterLink} to="/login" underline="hover" sx={{ fontWeight: 600, color: '#667eea' }}>
                Sign in
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
      </Box>

      {/* Footer */}
      <Box component="footer" sx={{ 
        py: 2, px: 3, 
        bgcolor: 'rgba(0,0,0,0.15)', 
        color: 'rgba(255,255,255,0.8)', 
        display: 'flex', 
        flexWrap: 'wrap', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}>
        <Typography variant="body2">
          © {new Date().getFullYear()} Smart Campus Operations Hub – SLIIT
        </Typography>
        <Typography variant="body2">
          Contact: support@smartcampus.lk | Version 1.0
        </Typography>
      </Box>
    </Box>
  );
};

export default RegisterPage;
