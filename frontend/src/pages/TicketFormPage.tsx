import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ticketApi, resourceApi } from '../services/api';
import {
  Box, Card, CardContent, TextField, Button, Typography,
  MenuItem, Alert, CircularProgress,
} from '@mui/material';

const TicketFormPage: React.FC = () => {
  const navigate = useNavigate();
  const [resources, setResources] = useState<any[]>([]);
  const [form, setForm] = useState({
    resourceId: '', category: '', description: '', priority: 'MEDIUM', contactDetails: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    resourceApi.getAll().then(res => setResources(res.data)).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      await ticketApi.create(form);
      navigate('/tickets');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create ticket');
    } finally { setSaving(false); }
  };

  if (loading) return <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ maxWidth: 600, mx: "auto" }}>
      <Typography variant="h5" sx={{ fontWeight: 700,  mb: 3  }}>Report an Issue</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <TextField fullWidth select label="Resource" value={form.resourceId}
              onChange={e => setForm({ ...form, resourceId: e.target.value })} sx={{ mb: 2 }} required>
              {resources.map(r => <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>)}
            </TextField>
            <TextField fullWidth label="Category" value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })} sx={{ mb: 2 }} required
              placeholder="e.g. Electrical, Plumbing, HVAC, IT Equipment" />
            <TextField fullWidth select label="Priority" value={form.priority}
              onChange={e => setForm({ ...form, priority: e.target.value })} sx={{ mb: 2 }}>
              {['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
            </TextField>
            <TextField fullWidth label="Description" multiline rows={4} value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })} sx={{ mb: 2 }} required />
            <TextField fullWidth label="Contact Details" value={form.contactDetails}
              onChange={e => setForm({ ...form, contactDetails: e.target.value })} sx={{ mb: 3 }}
              placeholder="Phone or alternative email" />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="outlined" onClick={() => navigate('/tickets')}>Cancel</Button>
              <Button variant="contained" type="submit" disabled={saving}
                sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                {saving ? <CircularProgress size={24} color="inherit" /> : 'Submit Ticket'}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default TicketFormPage;



