import React from 'react';
import { Container, Paper, Box, Typography } from '@mui/material';

const Privacy = () => {
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Paper elevation={1} sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 800 }}>Privacy Policy</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Last updated: {new Date().toLocaleDateString()}
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="body1">
            We take your privacy seriously. Chef Claude only uses the information you provide to generate recipes and improve your
            experience. We do not sell your personal data.
          </Typography>
          <Typography variant="h6">Data we collect</Typography>
          <Typography variant="body1">
            • Account information (name, email) provided by Google for login.
            • Your inputs (ingredients, preferences) to generate recipes.
          </Typography>
          <Typography variant="h6">How we use your data</Typography>
          <Typography variant="body1">
            • To generate and personalize recipes. • To improve features and quality. • To communicate updates if you opt in.
          </Typography>
          <Typography variant="h6">Your controls</Typography>
          <Typography variant="body1">
            • You can update preferences and privacy in your Profile. • You can request deletion of your account and associated data at any time.
          </Typography>
          <Typography variant="h6">Contact</Typography>
          <Typography variant="body1">
            If you have questions, email deepvaishnav207@gmail.com or call +91 7043041707.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Privacy;
