import React from 'react';
import { Container, Paper, Typography } from '@mui/material';

const HomePage: React.FC = () => (
  <Container className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-8">
    <Paper className="p-8 rounded-lg shadow-lg bg-white text-center w-full max-w-md">
      <Typography variant="h4" component="h1" gutterBottom className="text-gray-800 font-bold">
        Benvenuto nell'Applicazione!
      </Typography>
      <Typography variant="body1" className="text-gray-600">
        Questa è la homepage accessibile a tutti.
      </Typography>
    </Paper>
  </Container>
);

export default HomePage;
