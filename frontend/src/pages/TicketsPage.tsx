import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ticketApi } from '../services/api';
import {
  Box, Typography, Card, CardContent, Chip, Button, CircularProgress,
  Grid, TextField, MenuItem, Alert,
} from '@mui/material';
import { Add, BugReport } from '@mui/icons-material';

const priorityColor = (p: string) => {
  const map: Record<string, any> = { LOW: 'info', MEDIUM: 'warning', HIGH: 'error', URGENT: 'error' };
  return map[p] || 'default';
};
const statusColor = (s: string) => {
  const map: Record<string, any> = { OPEN: 'warning', IN_PROGRESS: 'info', RESOLVED: 'success', CLOSED: 'default', REJECTED: 'error' };
  return map[s] || 'default';
};

interface Props { mode?: 'mine' | 'all' | 'assigned'; }

const TicketsPage: React.FC<Props> = ({ mode = 'mine' }) => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        let res;
        if (mode === 'all') res = await ticketApi.getAll(filterStatus ? { status: filterStatus } : {});
        else if (mode === 'assigned') res = await ticketApi.getAssigned();
        else res = await ticketApi.getMine();
        setTickets(res.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, [mode, filterStatus]);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {mode === 'all' ? 'All Tickets' : mode === 'assigned' ? 'Assigned Tickets' : 'My Tickets'}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {mode === 'all' && (
            <TextField select label="Status" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              size="small" sx={{ minWidth: 150 }}>
              <MenuItem value="">All</MenuItem>
              {['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED'].map(s =>
                <MenuItem key={s} value={s}>{s.replace('_', ' ')}</MenuItem>)}
            </TextField>
          )}
          <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/tickets/new')}
            sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: 2 }}>
            New Ticket
          </Button>
        </Box>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading ? <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress /></Box> : (
        <Grid container spacing={3}>
          {tickets.length === 0 ? (
            <Grid size={{ xs: 12 }}><Typography color="text.secondary" sx={{ textAlign: "center", py: 8 }}>No tickets found</Typography></Grid>
          ) : tickets.map(t => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={t.id}>
              <Card sx={{ borderRadius: 3, cursor: 'pointer', '&:hover': { transform: 'translateY(-2px)', transition: '0.2s' },
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                onClick={() => navigate(`/tickets/${t.id}`)}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Chip label={t.priority} size="small" color={priorityColor(t.priority)} />
                    <Chip label={t.status.replace('_', ' ')} size="small" color={statusColor(t.status)} variant="outlined" />
                  </Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}><BugReport sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'text-bottom' }} />{t.category}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {t.description}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">📍 {t.resourceName}</Typography>
                  {t.assignedTechnicianName && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>🔧 {t.assignedTechnicianName}</Typography>
                  )}
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
                    💬 {t.commentCount} comments
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default TicketsPage;




