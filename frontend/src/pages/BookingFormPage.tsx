import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { bookingApi, resourceApi } from '../services/api';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  MenuItem,
  Alert,
  CircularProgress,
  InputAdornment,
  Container,
  alpha,
} from '@mui/material';
import {
  MeetingRoom,
  CalendarToday,
  AccessTime,
  Description,
  People,
  Send,
  Cancel,
} from '@mui/icons-material';

const BookingFormPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [resources, setResources] = useState<any[]>([]);
  const [form, setForm] = useState({
    resourceId: searchParams.get('resourceId') || '',
    date: '',
    startTime: '',
    endTime: '',
    purpose: '',
    expectedAttendees: 1,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    resourceApi
      .getAll({ status: 'ACTIVE' })
      .then((res) => setResources(res.data))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await bookingApi.create(form);
      navigate('/bookings');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Booking failed';
      setError(
        err.response?.status === 409
          ? '⚠️ Time slot conflict! This resource is already booked for the selected time.'
          : msg
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 4,
          p: 4,
          mb: 4,
          color: 'white',
          textAlign: 'center',
          boxShadow: '0 20px 35px -10px rgba(0,0,0,0.2)',
        }}
      >
        <MeetingRoom sx={{ fontSize: 48, mb: 1 }} />
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Request a Booking
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.9, mt: 1 }}>
          Fill in the details below to reserve a campus resource
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Form Card */}
      <Card
        sx={{
          borderRadius: 4,
          boxShadow: '0 15px 35px -12px rgba(0,0,0,0.15)',
          backdropFilter: 'blur(2px)',
          backgroundColor: alpha('#fff', 0.95),
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 25px 40px -12px rgba(0,0,0,0.2)',
          },
        }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
          <form onSubmit={handleSubmit}>
            {/* Resource */}
            <TextField
              fullWidth
              select
              label="Resource"
              value={form.resourceId}
              onChange={(e) => setForm({ ...form, resourceId: e.target.value })}
              margin="normal"
              required
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <MeetingRoom color="primary" />
                    </InputAdornment>
                  ),
                },
              }}
            >
              {resources.map((r) => (
                <MenuItem key={r.id} value={r.id}>
                  {r.name} ({r.type?.replace('_', ' ')})
                </MenuItem>
              ))}
            </TextField>

            {/* Date */}
            <TextField
              fullWidth
              label="Date"
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              margin="normal"
              required
              slotProps={{
                inputLabel: { shrink: true },
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarToday color="primary" />
                    </InputAdornment>
                  ),
                },
              }}
            />

            {/* Start & End Time */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 1 }}>
              <TextField
                fullWidth
                label="Start Time"
                type="time"
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                required
                slotProps={{
                  inputLabel: { shrink: true },
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <AccessTime color="primary" />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{ flex: 1 }}
              />
              <TextField
                fullWidth
                label="End Time"
                type="time"
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                required
                slotProps={{
                  inputLabel: { shrink: true },
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <AccessTime color="primary" />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{ flex: 1 }}
              />
            </Box>

            {/* Purpose */}
            <TextField
              fullWidth
              label="Purpose"
              value={form.purpose}
              onChange={(e) => setForm({ ...form, purpose: e.target.value })}
              margin="normal"
              required
              multiline
              rows={3}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Description color="primary" />
                    </InputAdornment>
                  ),
                },
              }}
            />

            {/* Expected Attendees */}
            <TextField
              fullWidth
              label="Expected Attendees"
              type="number"
              value={form.expectedAttendees}
              onChange={(e) =>
                setForm({
                  ...form,
                  expectedAttendees: parseInt(e.target.value) || 1,
                })
              }
              margin="normal"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <People color="primary" />
                    </InputAdornment>
                  ),
                  inputProps: { min: 1 },
                },
              }}
            />

            {/* Buttons */}
            <Box
              sx={{
                display: 'flex',
                gap: 2,
                justifyContent: 'flex-end',
                mt: 4,
              }}
            >
              <Button
                variant="outlined"
                onClick={() => navigate('/bookings')}
                startIcon={<Cancel />}
                sx={{ borderRadius: 2, px: 3 }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={saving}
                startIcon={saving ? <CircularProgress size={20} /> : <Send />}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: 2,
                  px: 4,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a67d8 0%, #6b46a0 100%)',
                  },
                }}
              >
                {saving ? 'Creating...' : 'Create Booking'}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
};

export default BookingFormPage;