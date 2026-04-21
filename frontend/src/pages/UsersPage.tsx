import React, { useEffect, useState, useCallback, useRef } from 'react';
import { authApi } from '../services/api';
import {
  Box, Typography, CircularProgress, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Chip, MenuItem, TextField, Avatar, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button,
  InputAdornment,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';

const ROLES = ['USER', 'ADMIN', 'TECHNICIAN'];
const ROLE_FILTER_OPTIONS = ['ALL', 'ADMIN', 'TECHNICIAN', 'USER'];

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Search & filter state
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const loadUsers = useCallback(async (search?: string, role?: string) => {
    setLoading(true);
    try {
      const res = await authApi.getUsers(search, role);
      setUsers(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  // Initial load
  useEffect(() => { loadUsers(); }, [loadUsers]);

  // Reload when searchQuery or roleFilter changes
  useEffect(() => {
    loadUsers(searchQuery, roleFilter);
  }, [searchQuery, roleFilter, loadUsers]);

  // Debounced search input handler
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setSearchQuery(value);
    }, 300);
  };

  const handleRoleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRoleFilter(e.target.value);
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await authApi.updateRole(userId, newRole);
      loadUsers(searchQuery, roleFilter);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update role');
    }
  };

  const handleDeleteClick = (user: any) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    setDeleting(true);
    try {
      await authApi.deleteUser(userToDelete.id);
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
    } catch (err: any) {
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      const message = err.response?.data?.message || 'Failed to delete user';
      setError(message);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await authApi.exportUsers(searchQuery, roleFilter);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      const filename = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
      a.setAttribute('download', filename);
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError('Failed to export users to CSV');
    } finally {
      setExporting(false);
    }
  };

  const roleColor = (r: string) => {
    const map: Record<string, any> = { ADMIN: 'error', TECHNICIAN: 'warning', USER: 'primary' };
    return map[r] || 'default';
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>User Management</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {/* Search & Filter Controls */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          id="user-search-input"
          size="small"
          placeholder="Search by name or email..."
          value={searchInput}
          onChange={handleSearchChange}
          sx={{ minWidth: 280, flex: 1, maxWidth: 400 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'grey.500' }} />
                </InputAdornment>
              ),
            },
          }}
        />
        <TextField
          id="user-role-filter"
          select
          size="small"
          label="Filter by Role"
          value={roleFilter}
          onChange={handleRoleFilterChange}
          sx={{ minWidth: 160 }}
        >
          {ROLE_FILTER_OPTIONS.map(r => (
            <MenuItem key={r} value={r}>
              {r === 'ALL' ? 'All Roles' : r.charAt(0) + r.slice(1).toLowerCase()}
            </MenuItem>
          ))}
        </TextField>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          variant="outlined"
          startIcon={exporting ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
          onClick={handleExport}
          disabled={exporting || loading}
          sx={{ height: 40 }}
        >
          {exporting ? 'Exporting...' : 'Export to CSV'}
        </Button>
      </Box>

      {/* Loading Indicator */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f7fb' }}>
                <TableCell><strong>User</strong></TableCell>
                <TableCell><strong>Email</strong></TableCell>
                <TableCell><strong>Current Role</strong></TableCell>
                <TableCell><strong>Change Role</strong></TableCell>
                <TableCell><strong>Joined</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                    <Typography variant="body1">No users found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                users.map(u => (
                  <TableRow key={u.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: '#667eea', fontSize: 14 }}>
                          {u.name?.charAt(0)}
                        </Avatar>
                        {u.name}
                      </Box>
                    </TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell><Chip label={u.role} size="small" color={roleColor(u.role)} /></TableCell>
                    <TableCell>
                      <TextField select size="small" value={u.role}
                        onChange={e => handleRoleChange(u.id, e.target.value)} sx={{ minWidth: 130 }}>
                        {ROLES.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
                      </TextField>
                    </TableCell>
                    <TableCell>{new Date(u.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Tooltip title={u.role === 'ADMIN' ? 'Cannot delete admin users' : 'Delete user'}>
                        <span>
                          <IconButton
                            id={`delete-user-${u.id}`}
                            size="small"
                            disabled={u.role === 'ADMIN'}
                            onClick={() => handleDeleteClick(u)}
                            sx={{
                              color: u.role === 'ADMIN' ? 'grey.400' : 'error.main',
                              '&:hover': {
                                backgroundColor: u.role === 'ADMIN' ? 'transparent' : 'error.light',
                                color: u.role === 'ADMIN' ? 'grey.400' : 'white',
                              },
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
      >
        <DialogTitle id="delete-dialog-title" sx={{ color: 'error.main', fontWeight: 700 }}>
          Delete User
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete user <strong>{userToDelete?.name}</strong>? This will permanently remove all their bookings, tickets, comments, and notifications.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleDeleteCancel} disabled={deleting}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={16} color="inherit" /> : <DeleteIcon />}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UsersPage;
