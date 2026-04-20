import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { resourceApi } from '../services/api';
import {
  Box, Grid, Card, CardContent, Typography, Button, TextField,
  MenuItem, Chip, CircularProgress, IconButton, Dialog,
  DialogTitle, DialogContent, DialogActions, Alert,
} from '@mui/material';
import { Add, Edit, Delete, Search } from '@mui/icons-material';

const TYPES = ['LECTURE_HALL', 'LAB', 'MEETING_ROOM', 'EQUIPMENT'];
const STATUS = ['ACTIVE', 'OUT_OF_SERVICE'];

const ResourcesPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [searchLoc, setSearchLoc] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const loadResources = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filterType) params.type = filterType;
      if (filterStatus) params.status = filterStatus;
      if (searchLoc) params.location = searchLoc;
      const res = await resourceApi.getAll(params);
      setResources(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadResources(); }, [filterType, filterStatus]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await resourceApi.delete(deleteId);
      setDeleteId(null);
      loadResources();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  };

  const typeColor = (type: string) => {
    const colors: Record<string, string> = {
      LECTURE_HALL: '#667eea', LAB: '#764ba2', MEETING_ROOM: '#4facfe', EQUIPMENT: '#43e97b',
    };
    return colors[type] || '#999';
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Campus Resources</Typography>
        {isAdmin && (
          <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/resources/new')}
            sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: 2 }}>
            Add Resource
          </Button>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField select label="Type" value={filterType} onChange={(e) => setFilterType(e.target.value)}
          size="small" sx={{ minWidth: 150 }}>
          <MenuItem value="">All Types</MenuItem>
          {TYPES.map(t => <MenuItem key={t} value={t}>{t.replace('_', ' ')}</MenuItem>)}
        </TextField>
        <TextField select label="Status" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          size="small" sx={{ minWidth: 150 }}>
          <MenuItem value="">All Status</MenuItem>
          {STATUS.map(s => <MenuItem key={s} value={s}>{s.replace('_', ' ')}</MenuItem>)}
        </TextField>
        <TextField label="Search Location" value={searchLoc} onChange={(e) => setSearchLoc(e.target.value)}
          size="small" sx={{ minWidth: 200 }}
          slotProps={{ input: { endAdornment: <IconButton size="small" onClick={loadResources}><Search /></IconButton> } }}
        />
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress /></Box>
      ) : resources.length === 0 ? (
        <Typography color="text.secondary" sx={{ textAlign: "center", py: 8 }}>No resources found</Typography>
      ) : (
        <Grid container spacing={3}>
          {resources.map((r) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={r.id}>
              <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                borderTop: `4px solid ${typeColor(r.type)}`, '&:hover': { transform: 'translateY(-2px)', transition: '0.2s' } }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Chip label={r.type.replace('_', ' ')} size="small"
                      sx={{ bgcolor: `${typeColor(r.type)}20`, color: typeColor(r.type) }} />
                    <Chip label={r.status} size="small"
                      color={r.status === 'ACTIVE' ? 'success' : 'error'} variant="outlined" />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>{r.name}</Typography>
                  <Typography variant="body2" color="text.secondary">📍 {r.location}</Typography>
                  <Typography variant="body2" color="text.secondary">👥 Capacity: {r.capacity}</Typography>
                  {r.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{r.description}</Typography>
                  )}
                  <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                    <Button size="small" variant="outlined" onClick={() => navigate(`/bookings/new?resourceId=${r.id}`)}>
                      Book
                    </Button>
                    {isAdmin && (
                      <>
                        <IconButton size="small" onClick={() => navigate(`/resources/edit/${r.id}`)}><Edit fontSize="small" /></IconButton>
                        <IconButton size="small" color="error" onClick={() => setDeleteId(r.id)}><Delete fontSize="small" /></IconButton>
                      </>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={Boolean(deleteId)} onClose={() => setDeleteId(null)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>Are you sure you want to delete this resource?</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ResourcesPage;





