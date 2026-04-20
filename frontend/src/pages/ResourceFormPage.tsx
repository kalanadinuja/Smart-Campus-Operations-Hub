import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { resourceApi } from '../services/api';
import {
  Box, Card, CardContent, TextField, Button, Typography,
  MenuItem, Alert, CircularProgress,
} from '@mui/material';

const TYPES = ['LECTURE_HALL', 'LAB', 'MEETING_ROOM', 'EQUIPMENT'];

const ResourceFormPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [form, setForm] = useState({ name: '', type: 'LECTURE_HALL', capacity: 1, location: '', description: '', status: 'ACTIVE' });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit && id) {
      setLoading(true);
      resourceApi.getById(id).then(res => {
        const r = res.data;
        setForm({ name: r.name, type: r.type, capacity: r.capacity, location: r.location, description: r.description || '', status: r.status });
      }).catch(() => setError('Failed to load resource'))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      if (isEdit && id) {
        await resourceApi.update(id, form);
      } else {
        await resourceApi.create(form);
      }
      navigate('/resources');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  if (loading) return <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ maxWidth: 600, mx: "auto" }}>
      <Typography variant="h5" sx={{ fontWeight: 700,  mb: 3  }}>
        {isEdit ? 'Edit Resource' : 'Add New Resource'}
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <TextField fullWidth label="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} sx={{ mb: 2 }} required />
            <TextField fullWidth select label="Type" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} sx={{ mb: 2 }}>
              {TYPES.map(t => <MenuItem key={t} value={t}>{t.replace('_', ' ')}</MenuItem>)}
            </TextField>
            <TextField fullWidth label="Capacity" type="number" value={form.capacity} onChange={e => setForm({ ...form, capacity: parseInt(e.target.value) || 1 })} sx={{ mb: 2 }} slotProps={{ htmlInput: { min: 1 } }} />
            <TextField fullWidth label="Location" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} sx={{ mb: 2 }} required />
            <TextField fullWidth label="Description" multiline rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} sx={{ mb: 2 }} />
            <TextField fullWidth select label="Status" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} sx={{ mb: 3 }}>
              <MenuItem value="ACTIVE">Active</MenuItem>
              <MenuItem value="OUT_OF_SERVICE">Out of Service</MenuItem>
            </TextField>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="outlined" onClick={() => navigate('/resources')}>Cancel</Button>
              <Button variant="contained" type="submit" disabled={saving}
                sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                {saving ? <CircularProgress size={24} color="inherit" /> : (isEdit ? 'Update' : 'Create')}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ResourceFormPage;




