import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { bookingApi, resourceApi } from '../services/api';
import {
  Box, Card, CardContent, TextField, Button, Typography,
  MenuItem, Alert, CircularProgress,
} from '@mui/material';

const BookingFormPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [resources, setResources] = useState<any[]>([]);
  const [form, setForm] = useState({
    resourceId: searchParams.get('resourceId') || '',
    date: '', startTime: '', endTime: '', purpose: '', expectedAttendees: 1,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    resourceApi.getAll({ status: 'ACTIVE' }).then(res => setResources(res.data))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      await bookingApi.create(form);
      navigate('/bookings');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Booking failed';
      setError(err.response?.status === 409 ? '⚠️ Time slot conflict! This resource is already booked for the selected time.' : msg);
    } finally { setSaving(false); }
  };

  if (loading) return <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ maxWidth: 600, mx: "auto" }}>
      <Typography variant="h5" sx={{ fontWeight: 700,  mb: 3  }}>New Booking</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <TextField fullWidth select label="Resource" value={form.resourceId}
              onChange={e => setForm({ ...form, resourceId: e.target.value })} sx={{ mb: 2 }} required>
              {resources.map(r => <MenuItem key={r.id} value={r.id}>{r.name} ({r.type.replace('_', ' ')})</MenuItem>)}
            </TextField>
            <TextField fullWidth label="Date" type="date" value={form.date}
              onChange={e => setForm({ ...form, date: e.target.value })} sx={{ mb: 2 }}
              slotProps={{ inputLabel: { shrink: true } }} required />
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField fullWidth label="Start Time" type="time" value={form.startTime}
                onChange={e => setForm({ ...form, startTime: e.target.value })}
                slotProps={{ inputLabel: { shrink: true } }} required />
              <TextField fullWidth label="End Time" type="time" value={form.endTime}
                onChange={e => setForm({ ...form, endTime: e.target.value })}
                slotProps={{ inputLabel: { shrink: true } }} required />
            </Box>
            <TextField fullWidth label="Purpose" value={form.purpose}
              onChange={e => setForm({ ...form, purpose: e.target.value })} sx={{ mb: 2 }} required multiline rows={2} />
            <TextField fullWidth label="Expected Attendees" type="number" value={form.expectedAttendees}
              onChange={e => setForm({ ...form, expectedAttendees: parseInt(e.target.value) || 1 })} sx={{ mb: 3 }}
              slotProps={{ htmlInput: { min: 1 } }} />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="outlined" onClick={() => navigate('/bookings')}>Cancel</Button>
              <Button variant="contained" type="submit" disabled={saving}
                sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                {saving ? <CircularProgress size={24} color="inherit" /> : 'Create Booking'}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default BookingFormPage;





