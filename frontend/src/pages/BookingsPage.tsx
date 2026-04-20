import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { bookingApi } from '../services/api';
import {
  Box, Typography, Card, CardContent, Chip, Button, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
} from '@mui/material';

const BookingsPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectDialog, setRejectDialog] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [error, setError] = useState('');

  const loadBookings = async () => {
    setLoading(true);
    try {
      const res = isAdmin ? await bookingApi.getAll() : await bookingApi.getMine();
      setBookings(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadBookings(); }, [isAdmin]);

  const handleApprove = async (id: string) => {
    try { await bookingApi.approve(id); loadBookings(); }
    catch (err: any) { setError(err.response?.data?.message || 'Failed'); }
  };

  const handleReject = async () => {
    if (!rejectDialog) return;
    try { await bookingApi.reject(rejectDialog, rejectReason); setRejectDialog(null); setRejectReason(''); loadBookings(); }
    catch (err: any) { setError(err.response?.data?.message || 'Failed'); }
  };

  const handleCancel = async (id: string) => {
    try { await bookingApi.cancel(id); loadBookings(); }
    catch (err: any) { setError(err.response?.data?.message || 'Failed'); }
  };

  const statusColor = (s: string) => {
    const map: Record<string, any> = { PENDING: 'warning', APPROVED: 'success', REJECTED: 'error', CANCELLED: 'default' };
    return map[s] || 'default';
  };

  if (loading) return <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>{isAdmin ? 'All Bookings' : 'My Bookings'}</Typography>
        <Button variant="contained" onClick={() => navigate('/bookings/new')}
          sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: 2 }}>
          New Booking
        </Button>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f5f7fb' }}>
              <TableCell><strong>Resource</strong></TableCell>
              <TableCell><strong>Date</strong></TableCell>
              <TableCell><strong>Time</strong></TableCell>
              <TableCell><strong>Purpose</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              {isAdmin && <TableCell><strong>User</strong></TableCell>}
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bookings.length === 0 ? (
              <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4 }}>No bookings found</TableCell></TableRow>
            ) : bookings.map(b => (
              <TableRow key={b.id} hover>
                <TableCell>{b.resourceName}</TableCell>
                <TableCell>{b.date}</TableCell>
                <TableCell>{b.startTime} - {b.endTime}</TableCell>
                <TableCell>{b.purpose}</TableCell>
                <TableCell><Chip label={b.status} size="small" color={statusColor(b.status)} /></TableCell>
                {isAdmin && <TableCell>{b.userName}</TableCell>}
                <TableCell>
                  {isAdmin && b.status === 'PENDING' && (
                    <>
                      <Button size="small" color="success" onClick={() => handleApprove(b.id)}>Approve</Button>
                      <Button size="small" color="error" onClick={() => setRejectDialog(b.id)}>Reject</Button>
                    </>
                  )}
                  {!isAdmin && (b.status === 'PENDING' || b.status === 'APPROVED') && (
                    <Button size="small" color="error" onClick={() => handleCancel(b.id)}>Cancel</Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={Boolean(rejectDialog)} onClose={() => setRejectDialog(null)}>
        <DialogTitle>Reject Booking</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Reason for rejection" value={rejectReason}
            onChange={e => setRejectReason(e.target.value)} sx={{ mt: 1 }} multiline rows={2} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialog(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleReject}>Reject</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BookingsPage;


