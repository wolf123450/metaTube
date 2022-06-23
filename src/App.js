import React, { useEffect, useState } from 'react';
import { Container, createTheme, LinearProgress, makeStyles, ThemeProvider } from '@material-ui/core';

import Main from './components/Main.js';
import Navbar from './components/Navbar.js';


const theme = createTheme({
  palette: {
    type: 'dark',
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

const styles = makeStyles({
  root: {
    backgroundColor: '#111111',
  },
})

function App() {
  const classes = styles();


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
