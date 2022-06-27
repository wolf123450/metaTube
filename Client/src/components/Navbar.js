
import { useTheme } from '@emotion/react';
import { AppBar, Toolbar, Typography, CssBaseline, Chip, Button } from '@mui/material'
import { Link } from "react-router-dom";


function Navbar() {
  var theme = useTheme();
  return (
    <AppBar className={"Navbar"} position="static">
      <Toolbar>
        <Typography variant="h4" className={"logo"} color={theme.palette.primary.main}>
          OmniTube
        </Typography>
        <div className={"navlinks"}>
          <Link to="/Video" className={"link"}>
            <Button variant='outlined'>
              Video
            </Button>
          </Link>
          <Link to="/VideoList" className={"link"}>
            <Button variant='outlined'>
              Video Links
            </Button>
          </Link>
        </div>
      </Toolbar>
    </AppBar>
  );
}


export default Navbar