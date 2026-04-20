import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ticketApi, commentApi, authApi } from '../services/api';
import {
  Box, Card, CardContent, Typography, Chip, Button, TextField,
  CircularProgress, Divider, Alert, Dialog, DialogTitle,
  DialogContent, DialogActions, MenuItem, Avatar, IconButton,
} from '@mui/material';
import { Edit, Delete, Send } from '@mui/icons-material';

const TicketDetailPage: React.FC = () => {
  const { id } = useParams();
  const { user, isAdmin, isTechnician } = useAuth();
  const [ticket, setTicket] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [assignDialog, setAssignDialog] = useState(false);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [selectedTech, setSelectedTech] = useState('');
  const [statusDialog, setStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [resNotes, setResNotes] = useState('');

  const loadData = async () => {
    if (!id) return;
    try {
      const [tRes, cRes] = await Promise.all([
        ticketApi.getById(id),
        commentApi.getByTicket(id),
      ]);
      setTicket(tRes.data);
      setComments(cRes.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, [id]);

  const handleAddComment = async () => {
    if (!newComment.trim() || !id) return;
    try {
      await commentApi.create(id, newComment);
      setNewComment('');
      loadData();
    } catch (err: any) { setError(err.response?.data?.message || 'Failed'); }
  };

  const handleUpdateComment = async () => {
    if (!editingComment) return;
    try {
      await commentApi.update(editingComment.id, editingComment.text);
      setEditingComment(null);
      loadData();
    } catch (err: any) { setError(err.response?.data?.message || 'Failed'); }
  };

  const handleDeleteComment = async (commentId: string) => {
    try { await commentApi.delete(commentId); loadData(); }
    catch (err: any) { setError(err.response?.data?.message || 'Failed'); }
  };

  const handleAssign = async () => {
    if (!id || !selectedTech) return;
    try { await ticketApi.assign(id, selectedTech); setAssignDialog(false); loadData(); }
    catch (err: any) { setError(err.response?.data?.message || 'Failed'); }
  };

  const handleStatusUpdate = async () => {
    if (!id || !newStatus) return;
    try { await ticketApi.updateStatus(id, newStatus, resNotes); setStatusDialog(false); loadData(); }
    catch (err: any) { setError(err.response?.data?.message || 'Failed'); }
  };

  const openAssignDialog = async () => {
    try {
      const res = await authApi.getUsers();
      setTechnicians(res.data.filter((u: any) => u.role === 'TECHNICIAN'));
      setAssignDialog(true);
    } catch (err) { setError('Failed to load technicians'); }
  };

  if (loading) return <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress /></Box>;
  if (!ticket) return <Typography>Ticket not found</Typography>;

  const priorityColor: Record<string, any> = { LOW: 'info', MEDIUM: 'warning', HIGH: 'error', URGENT: 'error' };
  const statusColor: Record<string, any> = { OPEN: 'warning', IN_PROGRESS: 'info', RESOLVED: 'success', CLOSED: 'default', REJECTED: 'error' };

  return (
    <Box sx={{ maxWidth: 800, mx: "auto" }}>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      <Card sx={{ borderRadius: 3, mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip label={ticket.priority} color={priorityColor[ticket.priority]} />
              <Chip label={ticket.status.replace('_', ' ')} color={statusColor[ticket.status]} variant="outlined" />
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {isAdmin && <Button size="small" variant="outlined" onClick={openAssignDialog}>Assign</Button>}
              {(isAdmin || isTechnician) && (
                <Button size="small" variant="outlined" onClick={() => setStatusDialog(true)}>Update Status</Button>
              )}
            </Box>
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>{ticket.category}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            📍 {ticket.resourceName} | 👤 {ticket.userName} | 🕐 {new Date(ticket.createdAt).toLocaleString()}
          </Typography>
          {ticket.assignedTechnicianName && (
            <Typography variant="body2" sx={{ mt: 0.5 }}>🔧 Assigned to: <strong>{ticket.assignedTechnicianName}</strong></Typography>
          )}
          <Divider sx={{ my: 2 }} />
          <Typography variant="body1">{ticket.description}</Typography>
          {ticket.resolutionNotes && (
            <Box sx={{ mt: 2, p: 2, bgcolor: '#f0f7f0', borderRadius: 2 }}>
              <Typography variant="subtitle2" color="success.main">Resolution Notes:</Typography>
              <Typography variant="body2">{ticket.resolutionNotes}</Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Comments Section */}
      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600,  mb: 2  }}>Comments ({comments.length})</Typography>
          {comments.map(c => (
            <Box key={c.id} sx={{ mb: 2, p: 2, bgcolor: '#f5f7fb', borderRadius: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ width: 28, height: 28, fontSize: 12, bgcolor: '#667eea' }}>
                    {c.userName?.charAt(0)}
                  </Avatar>
                  <Typography variant="subtitle2">{c.userName}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(c.createdAt).toLocaleString()}
                  </Typography>
                </Box>
                {user?.id === c.userId && (
                  <Box>
                    <IconButton size="small" onClick={() => setEditingComment(c)}><Edit fontSize="small" /></IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDeleteComment(c.id)}><Delete fontSize="small" /></IconButton>
                  </Box>
                )}
              </Box>
              <Typography variant="body2" sx={{ mt: 1 }}>{c.text}</Typography>
            </Box>
          ))}
          {/* Add comment */}
          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
            <TextField fullWidth size="small" placeholder="Add a comment..." value={newComment}
              onChange={e => setNewComment(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleAddComment()} />
            <IconButton color="primary" onClick={handleAddComment}><Send /></IconButton>
          </Box>
        </CardContent>
      </Card>

      {/* Assign Dialog */}
      <Dialog open={assignDialog} onClose={() => setAssignDialog(false)}>
        <DialogTitle>Assign Technician</DialogTitle>
        <DialogContent>
          <TextField fullWidth select label="Technician" value={selectedTech}
            onChange={e => setSelectedTech(e.target.value)} sx={{ mt: 1 }}>
            {technicians.map(t => <MenuItem key={t.id} value={t.id}>{t.name} ({t.email})</MenuItem>)}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAssign}>Assign</Button>
        </DialogActions>
      </Dialog>

      {/* Status Dialog */}
      <Dialog open={statusDialog} onClose={() => setStatusDialog(false)}>
        <DialogTitle>Update Status</DialogTitle>
        <DialogContent>
          <TextField fullWidth select label="New Status" value={newStatus}
            onChange={e => setNewStatus(e.target.value)} sx={{ mt: 1, mb: 2 }}>
            {['IN_PROGRESS', 'RESOLVED', 'CLOSED'].map(s =>
              <MenuItem key={s} value={s}>{s.replace('_', ' ')}</MenuItem>)}
          </TextField>
          <TextField fullWidth label="Resolution Notes" multiline rows={3} value={resNotes}
            onChange={e => setResNotes(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleStatusUpdate}>Update</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Comment Dialog */}
      <Dialog open={Boolean(editingComment)} onClose={() => setEditingComment(null)}>
        <DialogTitle>Edit Comment</DialogTitle>
        <DialogContent>
          <TextField fullWidth multiline rows={3} value={editingComment?.text || ''}
            onChange={e => setEditingComment({ ...editingComment, text: e.target.value })} sx={{ mt: 1 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingComment(null)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdateComment}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TicketDetailPage;



