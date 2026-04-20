import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { analyticsApi, bookingApi, ticketApi } from '../services/api';
import {
  Box, Grid, Card, CardContent, Typography, CircularProgress,
} from '@mui/material';
import { MeetingRoom, EventNote, BugReport, People } from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a'];

const DashboardPage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [analytics, setAnalytics] = useState<any>(null);
  const [myBookings, setMyBookings] = useState<any[]>([]);
  const [myTickets, setMyTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        if (isAdmin) {
          const res = await analyticsApi.get();
          setAnalytics(res.data);
        }
        const [bRes, tRes] = await Promise.all([
          bookingApi.getMine().catch(() => ({ data: [] })),
          ticketApi.getMine().catch(() => ({ data: [] })),
        ]);
        setMyBookings(bRes.data);
        setMyTickets(tRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [isAdmin]);

  if (loading) return <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress /></Box>;

  const statCards = isAdmin && analytics ? [
    { label: 'Resources', value: analytics.totalResources, icon: <MeetingRoom />, color: '#667eea' },
    { label: 'Bookings', value: analytics.totalBookings, icon: <EventNote />, color: '#764ba2' },
    { label: 'Tickets', value: analytics.totalTickets, icon: <BugReport />, color: '#f093fb' },
    { label: 'Users', value: analytics.totalUsers, icon: <People />, color: '#4facfe' },
  ] : [
    { label: 'My Bookings', value: myBookings.length, icon: <EventNote />, color: '#667eea' },
    { label: 'Pending', value: myBookings.filter(b => b.status === 'PENDING').length, icon: <EventNote />, color: '#ffa726' },
    { label: 'My Tickets', value: myTickets.length, icon: <BugReport />, color: '#764ba2' },
    { label: 'Open Tickets', value: myTickets.filter(t => t.status === 'OPEN').length, icon: <BugReport />, color: '#f093fb' },
  ];

  const ticketStatusData = analytics ? Object.entries(analytics.ticketsByStatus || {}).map(
    ([name, value]) => ({ name, value })
  ) : [];

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700,  mb: 3  }}>
        Welcome back, {user?.name} 👋
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((card, i) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{
                  width: 48, height: 48, borderRadius: 2, display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  background: `${card.color}20`, color: card.color,
                }}>
                  {card.icon}
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>{card.value}</Typography>
                  <Typography variant="body2" color="text.secondary">{card.label}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {isAdmin && analytics && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Card sx={{ borderRadius: 3, p: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600,  mb: 2  }}>Most Booked Resources</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.mostBookedResources || []}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#667eea" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ borderRadius: 3, p: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600,  mb: 2  }}>Tickets by Status</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={ticketStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%"
                    outerRadius={100} label>
                    {ticketStatusData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default DashboardPage;




