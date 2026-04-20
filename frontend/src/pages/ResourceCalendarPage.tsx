import React, { useEffect, useState } from 'react';
import { resourceApi, bookingApi } from '../services/api';
import {
  Box, Typography, Card, CardContent, TextField, MenuItem,
  CircularProgress, Chip, Grid,
} from '@mui/material';

/**
 * Resource Calendar View (Innovation Feature #2)
 * Shows a monthly view of bookings for a selected resource.
 */
const ResourceCalendarPage: React.FC = () => {
  const [resources, setResources] = useState<any[]>([]);
  const [selectedResource, setSelectedResource] = useState('');
  const [bookings, setBookings] = useState<any[]>([]);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    resourceApi.getAll().then(res => setResources(res.data));
  }, []);

  useEffect(() => {
    if (!selectedResource || !currentMonth) return;
    setLoading(true);
    const [year, month] = currentMonth.split('-').map(Number);
    const start = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const end = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;

    bookingApi.getResourceBookings(selectedResource, start, end)
      .then(res => setBookings(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedResource, currentMonth]);

  // Build calendar grid
  const [year, month] = currentMonth.split('-').map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const paddingDays = Array.from({ length: firstDayOfWeek }, () => null);
  const allDays = [...paddingDays, ...days];
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getBookingsForDay = (day: number) => {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return bookings.filter(b => b.date === dateStr);
  };

  const statusBgColor = (s: string) => {
    const map: Record<string, string> = {
      PENDING: '#fff3e0', APPROVED: '#e8f5e9', REJECTED: '#ffebee', CANCELLED: '#f5f5f5',
    };
    return map[s] || '#f5f5f5';
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700,  mb: 3  }}>📅 Resource Calendar</Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField select label="Select Resource" value={selectedResource}
          onChange={e => setSelectedResource(e.target.value)} size="small" sx={{ minWidth: 250 }}>
          {resources.map(r => <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>)}
        </TextField>
        <TextField type="month" value={currentMonth} onChange={e => setCurrentMonth(e.target.value)}
          size="small" slotProps={{ inputLabel: { shrink: true } }} label="Month" />
      </Box>

      {!selectedResource ? (
        <Typography color="text.secondary" sx={{ textAlign: "center", py: 8 }}>
          Select a resource to view its booking calendar
        </Typography>
      ) : loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress /></Box>
      ) : (
        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Grid container>
              {weekDays.map(day => (
                <Grid size={12 / 7} key={day}>
                  <Box sx={{ p: 1, textAlign: 'center', fontWeight: 700, bgcolor: '#f5f7fb', border: '1px solid #eee' }}>
                    <Typography variant="caption">{day}</Typography>
                  </Box>
                </Grid>
              ))}
              {allDays.map((day, i) => (
                <Grid size={12 / 7} key={i}>
                  <Box sx={{
                    minHeight: 100, p: 0.5, border: '1px solid #eee',
                    bgcolor: day ? '#fff' : '#fafafa',
                  }}>
                    {day && (
                      <>
                        <Typography variant="caption" sx={{ fontWeight: 600,  ml: 0.5  }}>{day}</Typography>
                        {getBookingsForDay(day).map(b => (
                          <Box key={b.id} sx={{
                            mt: 0.5, p: 0.5, borderRadius: 1, fontSize: 10,
                            bgcolor: statusBgColor(b.status),
                            borderLeft: `3px solid ${b.status === 'APPROVED' ? '#4caf50' : b.status === 'PENDING' ? '#ff9800' : '#f44336'}`,
                          }}>
                            <Typography variant="caption" sx={{ fontSize: 10, fontWeight: 600 }}>
                              {b.startTime}-{b.endTime}
                            </Typography>
                            <Typography variant="caption" sx={{ display: "block", fontSize: 9 }}>
                              {b.purpose?.substring(0, 20)}
                            </Typography>
                          </Box>
                        ))}
                      </>
                    )}
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default ResourceCalendarPage;






