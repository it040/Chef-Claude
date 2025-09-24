import React, { useState } from 'react';
import { Container, Paper, Box, Typography, TextField, Button, Alert, Stack } from '@mui/material';
import { contactAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Contact = () => {
  const { user, isAuthenticated } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [status, setStatus] = useState({ type: 'idle', msg: '' });

  React.useEffect(() => {
    if (isAuthenticated && user) {
      setForm((f) => ({ ...f, name: user.name || f.name, email: user.email || f.email }));
    }
  }, [isAuthenticated, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: 'loading', msg: '' });
    try {
      const payload = {
        name: form.name?.trim(),
        email: form.email?.trim(),
        message: form.message?.trim(),
      };
      if (form.phone && form.phone.trim().length > 0) {
        payload.phone = form.phone.trim();
      }
      const res = await contactAPI.send(payload);
      if (res.success) {
        setStatus({ type: 'success', msg: res.message });
        setForm({ name: isAuthenticated ? (user?.name || '') : '', email: isAuthenticated ? (user?.email || '') : '', phone: '', message: '' });
      } else {
        const serverErrors = Array.isArray(res.errors) ? res.errors.map((e) => e.param + ': ' + e.msg).join(' | ') : '';
        setStatus({ type: 'error', msg: serverErrors || res.message || 'Failed to send' });
      }
    } catch (err) {
      const serverErrors = Array.isArray(err?.errors) ? err.errors.map((e) => e.param + ': ' + e.msg).join(' | ') : '';
      setStatus({ type: 'error', msg: serverErrors || err?.message || 'Failed to send' });
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Paper elevation={2} sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
          Contact Us
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Have a question or feedback? Send us a message and we’ll get back within 1–2 business days.
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField label="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <TextField label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required disabled={isAuthenticated} helperText={isAuthenticated ? 'Using your account email' : ''} />
            <TextField label="Phone (optional)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <TextField label="Message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required multiline minRows={4} />
            <Button type="submit" variant="contained" disabled={status.type === 'loading'} sx={{ textTransform: 'none' }}>
              {status.type === 'loading' ? 'Sending…' : 'Send message'}
            </Button>
            {status.type !== 'idle' && status.msg && (
              <Alert severity={status.type === 'success' ? 'success' : 'error'}>{status.msg}</Alert>
            )}
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
};

export default Contact;
