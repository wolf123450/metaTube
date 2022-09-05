import React, { useEffect, useState } from "react";
import { Container, LinearProgress } from "@mui/material";
import { createTheme, Theme, ThemeProvider } from "@mui/material/styles";

import Main from "./components/Main";
import Navbar from "./components/Navbar";

const theme: Theme = createTheme({
  palette: {
    mode: "dark",
  },
  typography: {
    fontFamily: "Roboto",
    h4: {
      fontWeight: 600,
      fontSize: 28,
      lineHeight: "2rem",
    },
    h5: {
      fontWeight: 100,
      lineHeight: "2rem",
    },
  },
});

const App: React.FC = () => {
  return (
    <div className="app">
      <ThemeProvider theme={theme}>
        <Container maxWidth="lg">
          <Navbar />
          <Main />
        </Container>
      </ThemeProvider>
    </div>
  );
};

export default App;
