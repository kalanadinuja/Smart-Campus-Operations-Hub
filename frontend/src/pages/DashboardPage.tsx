import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { analyticsApi, bookingApi, ticketApi } from '../services/api';
import {
  Box, Grid, Card, CardContent, Typography, CircularProgress, Fade,
} from '@mui/material';
import { MeetingRoom, EventNote, BugReport, People } from '@mui/icons-material';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a'];

// Custom tooltip for bar chart (shows count)
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <Box sx={{ bgcolor: 'white', p: 1, borderRadius: 2, boxShadow: 3, borderLeft: `4px solid ${payload[0].fill}` }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>{label}</Typography>
        <Typography variant="body2">Bookings: {payload[0].value}</Typography>
      </Box>
    );
  }
  return null;
};

// Helper: animate counting numbers
const useCountUp = (target: number, duration = 800) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
};

// Animated stat card component
const AnimatedStatCard: React.FC<{ label: string; value: number; icon: React.ReactNode; color: string; delay: number }> = ({ label, value, icon, color, delay }) => {
  const animatedValue = useCountUp(value);
  return (
    <Fade in timeout={delay}>
      <Card
        sx={{
          borderRadius: 3,
          background: `linear-gradient(135deg, ${color}10 0%, white 100%)`,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-6px)',
            boxShadow: '0 12px 30px rgba(0,0,0,0.15)',
          },
        }}
      >
        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: `${color}20`,
              color: color,
            }}
          >
            {icon}
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: color }}>
              {animatedValue}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {label}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Fade>
  );
};

const DashboardPage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [analytics, setAnalytics] = useState<any>(null);
  const [myBookings, setMyBookings] = useState<any[]>([]);
  const [myTickets, setMyTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [welcomeVisible, setWelcomeVisible] = useState(false);

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
        setTimeout(() => setWelcomeVisible(true), 100);
      }
    };
    loadData();
  }, [isAdmin]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Build stat cards based on role
  let statCards: Array<{ label: string; value: number; icon: React.ReactNode; color: string }> = [];
  if (isAdmin && analytics) {
    statCards = [
      { label: 'Resources', value: analytics.totalResources, icon: <MeetingRoom />, color: '#667eea' },
      { label: 'Bookings', value: analytics.totalBookings, icon: <EventNote />, color: '#764ba2' },
      { label: 'Tickets', value: analytics.totalTickets, icon: <BugReport />, color: '#f093fb' },
      { label: 'Users', value: analytics.totalUsers, icon: <People />, color: '#4facfe' },
    ];
  } else {
    statCards = [
      { label: 'My Bookings', value: myBookings.length, icon: <EventNote />, color: '#667eea' },
      { label: 'Pending', value: myBookings.filter(b => b.status === 'PENDING').length, icon: <EventNote />, color: '#ffa726' },
      { label: 'My Tickets', value: myTickets.length, icon: <BugReport />, color: '#764ba2' },
      { label: 'Open Tickets', value: myTickets.filter(t => t.status === 'OPEN').length, icon: <BugReport />, color: '#f093fb' },
    ];
  }

  const ticketStatusData = analytics
    ? Object.entries(analytics.ticketsByStatus || {}).map(([name, value]) => ({ name, value }))
    : [];

  return (
    <Box>
      <Fade in={welcomeVisible} timeout={800}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            mb: 3,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
          }}
        >
          Welcome back, {user?.name} 👋
        </Typography>
      </Fade>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((card, idx) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={idx}>
            <AnimatedStatCard
              label={card.label}
              value={card.value}
              icon={card.icon}
              color={card.color}
              delay={idx * 100}
            />
          </Grid>
        ))}
      </Grid>

      {isAdmin && analytics && (
        <Fade in timeout={600}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 8 }}>
              <Card
                sx={{
                  borderRadius: 4,
                  background: 'linear-gradient(145deg, #ffffff 0%, #f8faff 100%)',
                  p: 2,
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'scale(1.01)' },
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, pl: 1 }}>
                  📊 Most Booked Resources
                </Typography>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart
                    data={analytics.mostBookedResources || []}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <XAxis dataKey="name" tick={{ fill: '#555' }} />
                    <YAxis tick={{ fill: '#555' }} tickFormatter={(value) => Number.isInteger(value) ? value : ''} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="count"
                      fill="#667eea"
                      radius={[8, 8, 0, 0]}
                      animationDuration={1200}
                      animationEasing="ease-out"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card
                sx={{
                  borderRadius: 4,
                  background: 'linear-gradient(145deg, #ffffff 0%, #f8faff 100%)',
                  p: 2,
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'scale(1.01)' },
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, pl: 1 }}>
                  🥧 Tickets by Status
                </Typography>
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      data={ticketStatusData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                      labelLine={false}
                      animationDuration={1000}
                      animationEasing="ease-out"
                    >
                      {ticketStatusData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="white" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Grid>
          </Grid>
        </Fade>
      )}
    </Box>
  );
};

export default DashboardPage;