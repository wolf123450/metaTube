import React, { useEffect, useState } from 'react';
import { Container, LinearProgress } from '@mui/material';
import {createTheme, ThemeProvider } from '@mui/material/styles';

import Main from './components/Main.js';
import Navbar from './components/Navbar.js';


const theme = createTheme({
  palette: {
    mode: 'dark',
    background: '#111111'
  },
  typography: {
    fontFamily: [
      'Roboto'
    ],
    h4: {
      fontWeight: 600,
      fontSize: 28,
      lineHeight: '2rem',
    },
    h5: {
      fontWeight: 100,
      lineHeight: '2rem',
    },
  },
});

function App() {
  return (
    <div className="app">
        <ThemeProvider theme={theme} >
            <Container maxWidth="md" >
                <Navbar />
                <Main />
            </Container>
        </ThemeProvider>
    </div>
)
}

export default App;
