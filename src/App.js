import React, { useEffect, useState } from 'react';
import { Container, createMuiTheme, LinearProgress, makeStyles, ThemeProvider } from '@material-ui/core';
import EmbeddedVideo from './components/EmbeddedVideo.js';
import axios from 'axios';


const theme = createMuiTheme({
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
  const [demo, setDemo] = useState([]);



  if (!demo) {
    return (
      <div className="app">
        <ThemeProvider theme={theme} >
          <Container maxWidth="sm" >
            <LinearProgress></LinearProgress>
          </Container>
        </ThemeProvider>

      </div>

    )
  }

  return (
    <div className="app">
      <ThemeProvider theme={theme} >
        <Container maxWidth="md" >
          <EmbeddedVideo/>
        </Container>

      </ThemeProvider>

    </div>
  );
}

export default App;
