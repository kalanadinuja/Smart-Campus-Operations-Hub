import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { bookingApi, resourceApi } from '../services/api';
import {
  Box,
  Typography,
  Chip,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  InputAdornment,
  MenuItem,
  Grid,
  Skeleton,
  alpha,
} from '@mui/material';
import {
  EventNote,
  Add,
  CheckCircle,
  Cancel,
  Block,
  FilterList,
  Clear,
} from '@mui/icons-material';

const BookingsPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectDialog, setRejectDialog] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [error, setError] = useState('');

  // Filter states (admin only)
  const [filters, setFilters] = useState({
    status: '',
    resourceId: '',
    startDate: '',
    endDate: '',
  });

  // Fetch resources for filter dropdown
  useEffect(() => {
    if (isAdmin) {
      resourceApi.getAll({ status: 'ACTIVE' }).then(res => setResources(res.data));
    }
  }, [isAdmin]);

  const loadBookings = async () => {
    setLoading(true);
    try {
      let res;
      if (isAdmin) {
        const params: any = {};
        if (filters.status) params.status = filters.status;
        if (filters.resourceId) params.resourceId = filters.resourceId;
        if (filters.startDate) params.startDate = filters.startDate;
        if (filters.endDate) params.endDate = filters.endDate;
        res = await bookingApi.getAll(params);
      } else {
        res = await bookingApi.getMine();
      }
      setBookings(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [isAdmin, filters.status, filters.resourceId, filters.startDate, filters.endDate]);

  const handleApprove = async (id: string) => {
    try {
      await bookingApi.approve(id);
      loadBookings();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Approval failed');
    }
  };

  const handleReject = async () => {
    if (!rejectDialog) return;
    try {
      await bookingApi.reject(rejectDialog, rejectReason);
      setRejectDialog(null);
      setRejectReason('');
      loadBookings();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Rejection failed');
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await bookingApi.cancel(id);
      loadBookings();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Cancellation failed');
    }
  };

  const clearFilters = () => {
    setFilters({ status: '', resourceId: '', startDate: '', endDate: '' });
  };

  const statusColor = (s: string): 'warning' | 'success' | 'error' | 'default' => {
    const map: Record<string, any> = {
      PENDING: 'warning',
      APPROVED: 'success',
      REJECTED: 'error',
      CANCELLED: 'default',
    };
    return map[s] || 'default';
  };

  const statusIcon = (s: string) => {
    switch (s) {
      case 'PENDING':
        return <Block fontSize="small" />;
      case 'APPROVED':
        return <CheckCircle fontSize="small" />;
      case 'REJECTED':
        return <Cancel fontSize="small" />;
      default:
        return <EventNote fontSize="small" />;
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="rounded" height={60} sx={{ mb: 3 }} />
        <Skeleton variant="rounded" height={400} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 4,
          p: 3,
          mb: 4,
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {isAdmin ? 'Manage Bookings' : 'My Bookings'}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
            {isAdmin
              ? 'View, approve, or reject resource booking requests'
              : 'Track and manage your resource reservations'}
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={() => navigate('/bookings/new')}
          startIcon={<Add />}
          sx={{
            bgcolor: 'white',
            color: '#667eea',
            '&:hover': { bgcolor: '#f0f0f0' },
            borderRadius: 2,
            px: 3,
          }}
        >
          New Booking
        </Button>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Filters (Admin only) */}
      {isAdmin && (
        <Paper
          sx={{
            p: 2,
            mb: 3,
            borderRadius: 3,
            backgroundColor: alpha('#f5f7fb', 0.8),
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <FilterList color="primary" />
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Filter Bookings
            </Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                select
                label="Status"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                size="small"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="PENDING">Pending</MenuItem>
                <MenuItem value="APPROVED">Approved</MenuItem>
                <MenuItem value="REJECTED">Rejected</MenuItem>
                <MenuItem value="CANCELLED">Cancelled</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                select
                label="Resource"
                value={filters.resourceId}
                onChange={(e) => setFilters({ ...filters, resourceId: e.target.value })}
                size="small"
              >
                <MenuItem value="">All</MenuItem>
                {resources.map((r) => (
                  <MenuItem key={r.id} value={r.id}>
                    {r.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                size="small"
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                size="small"
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Clear />}
                onClick={clearFilters}
                sx={{ borderRadius: 2 }}
              >
                Clear
              </Button>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Bookings Table */}
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 3,
          overflowX: 'auto',
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        }}
      >
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f5f7fb' }}>
              <TableCell><strong>Resource</strong></TableCell>
              <TableCell><strong>Date</strong></TableCell>
              <TableCell><strong>Time</strong></TableCell>
              <TableCell><strong>Purpose</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              {isAdmin && <TableCell><strong>User</strong></TableCell>}
              <TableCell><strong>Reason</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                  <EventNote sx={{ fontSize: 48, color: '#ccc', mb: 1 }} />
                  <Typography color="text.secondary">No bookings found</Typography>
                  {!isAdmin && (
                    <Button
                      variant="contained"
                      onClick={() => navigate('/bookings/new')}
                      sx={{ mt: 2 }}
                    >
                      Create your first booking
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              bookings.map((booking, index) => (
                <TableRow
                  key={booking.id}
                  hover
                  sx={{
                    backgroundColor: index % 2 === 0 ? 'inherit' : alpha('#f5f7fb', 0.5),
                  }}
                >
                  <TableCell>{booking.resourceName}</TableCell>
                  <TableCell>{booking.date}</TableCell>
                  <TableCell>
                    {booking.startTime} - {booking.endTime}
                  </TableCell>
                  <TableCell>{booking.purpose}</TableCell>
                  <TableCell>
                    <Chip
                      icon={statusIcon(booking.status)}
                      label={booking.status}
                      size="small"
                      color={statusColor(booking.status)}
                      variant="outlined"
                    />
                  </TableCell>
                  {isAdmin && <TableCell>{booking.userName}</TableCell>}
                  <TableCell>
                    {booking.status === 'REJECTED' && booking.rejectionReason
                      ? booking.rejectionReason
                      : '-'}
                  </TableCell>
                  <TableCell>
                    {isAdmin && booking.status === 'PENDING' && (
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          onClick={() => handleApprove(booking.id)}
                          startIcon={<CheckCircle />}
                        >
                          Approve
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() => setRejectDialog(booking.id)}
                          startIcon={<Cancel />}
                        >
                          Reject
                        </Button>
                      </Box>
                    )}
                    {!isAdmin && (booking.status === 'PENDING' || booking.status === 'APPROVED') && (
                      <Button
                        size="small"
                        variant="text"
                        color="error"
                        onClick={() => handleCancel(booking.id)}
                        startIcon={<Cancel />}
                      >
                        Cancel
                      </Button>
                    )}
                    {isAdmin && booking.status !== 'PENDING' && (
                      <Typography variant="caption" color="text.secondary">
                        No actions
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Reject Dialog */}
      <Dialog open={Boolean(rejectDialog)} onClose={() => setRejectDialog(null)}>
        <DialogTitle>Reject Booking</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Reason for rejection"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            sx={{ mt: 1 }}
            multiline
            rows={2}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialog(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleReject}>
            Reject
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BookingsPage;