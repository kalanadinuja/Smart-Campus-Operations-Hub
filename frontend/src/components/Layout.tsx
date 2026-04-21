import React, { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import {
  AppBar, Toolbar, Typography, Drawer, List, ListItemButton,
  ListItemIcon, ListItemText, IconButton, Badge, Box, Avatar,
  Menu, MenuItem, Divider, Popover, Button, Chip,
  Select, FormControl, InputLabel,
} from '@mui/material';
import {
  Dashboard, MeetingRoom, EventNote, BugReport, Notifications,
  People, BarChart, CalendarMonth, Menu as MenuIcon, Logout,
} from '@mui/icons-material';

const DRAWER_WIDTH = 240;

const Layout: React.FC = () => {
  const { user, logout, isAdmin, isTechnician } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead, filterParams, setFilterParams } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifAnchor, setNotifAnchor] = useState<null | HTMLElement>(null);
  
  const handleFilterChange = (field: string, value: any) => {
    let newParams = { ...filterParams };
    
    if (field === 'type') {
      if (value === 'ALL') {
        delete newParams.type;
      } else {
        newParams.type = [value];
      }
    } else if (field === 'read') {
      if (value === 'ALL') {
        delete newParams.read;
      } else {
        newParams.read = value === 'READ';
      }
    } else if (field === 'date') {
      if (value === 'ALL') {
        delete newParams.from;
      } else if (value === '7DAYS') {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        newParams.from = d.toISOString();
      } else if (value === '30DAYS') {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        newParams.from = d.toISOString();
      }
    }
    
    setFilterParams(newParams);
  };

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard', roles: ['USER', 'ADMIN', 'TECHNICIAN'] },
    { text: 'Resources', icon: <MeetingRoom />, path: '/resources', roles: ['USER', 'ADMIN', 'TECHNICIAN'] },
    { text: 'My Bookings', icon: <EventNote />, path: '/bookings', roles: ['USER'] },
    { text: 'All Bookings', icon: <EventNote />, path: '/bookings/all', roles: ['ADMIN'] },
    { text: 'My Tickets', icon: <BugReport />, path: '/tickets', roles: ['USER'] },
    { text: 'All Tickets', icon: <BugReport />, path: '/tickets/all', roles: ['ADMIN'] },
    { text: 'Assigned Tickets', icon: <BugReport />, path: '/tickets/assigned', roles: ['TECHNICIAN'] },
    { text: 'Calendar', icon: <CalendarMonth />, path: '/calendar', roles: ['USER', 'ADMIN', 'TECHNICIAN'] },
    { text: 'Analytics', icon: <BarChart />, path: '/analytics', roles: ['ADMIN'] },
    { text: 'Users', icon: <People />, path: '/users', roles: ['ADMIN'] },
  ];

  const filteredMenuItems = menuItems.filter(
    (item) => user && item.roles.includes(user.role)
  );

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box>
        <Box sx={{ p: 2, textAlign: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700 }}>
            🏫 Smart Campus
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
            Operations Hub
          </Typography>
        </Box>
        <List>
          {filteredMenuItems.map((item) => (
            <ListItemButton
              key={item.path}
              selected={location.pathname === item.path}
              onClick={() => { navigate(item.path); setMobileOpen(false); }}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: 'rgba(102,126,234,0.12)',
                  borderRight: '3px solid #667eea',
                },
              }}
            >
              <ListItemIcon sx={{ color: location.pathname === item.path ? '#667eea' : 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          ))}
        </List>
      </Box>

      <Box sx={{ flexGrow: 1 }} />
      <Divider />
      
      <Box sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.02)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar 
            src={user?.picture || undefined} 
            sx={{ width: 40, height: 40, mr: 1.5, bgcolor: '#667eea', fontSize: 16 }}
          >
            {!user?.picture && user?.name?.charAt(0)?.toUpperCase()}
          </Avatar>
          <Box sx={{ overflow: 'hidden' }}>
            <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600 }}>
              {user?.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
              {user?.email}
            </Typography>
          </Box>
        </Box>
        <Button 
          fullWidth 
          variant="outlined" 
          startIcon={<Logout />} 
          size="small"
          onClick={() => { logout(); navigate('/login'); }}
          sx={{ 
            color: 'text.secondary', 
            borderColor: 'divider',
            '&:hover': {
              borderColor: 'error.main',
              color: 'error.main',
              bgcolor: 'error.50'
            }
          }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f7fb' }}>
      {/* Sidebar */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: DRAWER_WIDTH } }}
      >
        {drawerContent}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Main content */}
      <Box sx={{ flexGrow: 1, ml: { md: `${DRAWER_WIDTH}px` }, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AppBar position="sticky" sx={{ background: '#fff', color: '#333', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <Toolbar>
            <IconButton sx={{ display: { md: 'none' }, mr: 1 }} onClick={() => setMobileOpen(true)}>
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
              {filteredMenuItems.find(i => i.path === location.pathname)?.text || 'Smart Campus'}
            </Typography>

            {/* Notification Bell */}
            <IconButton onClick={(e) => setNotifAnchor(e.currentTarget)}>
              <Badge badgeContent={unreadCount} color="error">
                <Notifications />
              </Badge>
            </IconButton>
            <Popover
              open={Boolean(notifAnchor)}
              anchorEl={notifAnchor}
              onClose={() => setNotifAnchor(null)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <Box sx={{ width: 360, maxHeight: 400, overflow: 'auto' }}>
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Notifications</Typography>
                  {unreadCount > 0 && (
                    <Button size="small" onClick={markAllAsRead}>Mark all read</Button>
                  )}
                </Box>
                <Box sx={{ px: 2, pb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <FormControl size="small" sx={{ minWidth: 100 }}>
                    <InputLabel>Type</InputLabel>
                    <Select
                      label="Type"
                      value={filterParams.type ? filterParams.type[0] : 'ALL'}
                      onChange={(e) => handleFilterChange('type', e.target.value)}
                    >
                      <MenuItem value="ALL">All</MenuItem>
                      <MenuItem value="BOOKING_APPROVED">Approved</MenuItem>
                      <MenuItem value="BOOKING_REJECTED">Rejected</MenuItem>
                      <MenuItem value="TICKET_STATUS_CHANGE">Ticket Status</MenuItem>
                      <MenuItem value="TICKET_COMMENT">Comments</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl size="small" sx={{ minWidth: 100 }}>
                    <InputLabel>Status</InputLabel>
                    <Select
                      label="Status"
                      value={filterParams.read === undefined ? 'ALL' : (filterParams.read ? 'READ' : 'UNREAD')}
                      onChange={(e) => handleFilterChange('read', e.target.value)}
                    >
                      <MenuItem value="ALL">All</MenuItem>
                      <MenuItem value="READ">Read</MenuItem>
                      <MenuItem value="UNREAD">Unread</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl size="small" sx={{ minWidth: 100 }}>
                    <InputLabel>Date</InputLabel>
                    <Select
                      label="Date"
                      value={!filterParams.from ? 'ALL' : (new Date().getTime() - new Date(filterParams.from).getTime() > 10 * 24 * 60 * 60 * 1000 ? '30DAYS' : '7DAYS')}
                      onChange={(e) => handleFilterChange('date', e.target.value)}
                    >
                      <MenuItem value="ALL">All Time</MenuItem>
                      <MenuItem value="7DAYS">Last 7 Days</MenuItem>
                      <MenuItem value="30DAYS">Last 30 Days</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Divider />
                {notifications.length === 0 ? (
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography color="text.secondary">No notifications</Typography>
                  </Box>
                ) : (
                  notifications.slice(0, 10).map((n) => (
                    <Box
                      key={n.id}
                      sx={{
                        p: 2, cursor: 'pointer', '&:hover': { bgcolor: '#f5f5f5' },
                        bgcolor: n.read ? 'inherit' : 'rgba(102,126,234,0.05)',
                        borderBottom: '1px solid #eee',
                      }}
                      onClick={() => { markAsRead(n.id); setNotifAnchor(null); }}
                    >
                      <Typography variant="body2">{n.message}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(n.createdAt).toLocaleString()}
                      </Typography>
                    </Box>
                  ))
                )}
              </Box>
            </Popover>
          </Toolbar>
        </AppBar>

        <Box sx={{ p: 3, flexGrow: 1 }}>
          <Outlet />
        </Box>

        {/* Footer */}
        <Box component="footer" sx={{ 
          py: 3, px: 4, 
          bgcolor: '#fff', 
          color: 'text.secondary', 
          display: 'flex', 
          flexWrap: 'wrap', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          borderTop: '1px solid #eaeaea' 
        }}>
          <Typography variant="body2">
            © {new Date().getFullYear()} Smart Campus Operations Hub – SLIIT
          </Typography>
          <Typography variant="body2">
            Contact: support@smartcampus.lk | Version 1.0
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;

