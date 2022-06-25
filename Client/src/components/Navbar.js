
import { AppBar, Toolbar, Typography, CssBaseline} from '@mui/material'
import { Link } from "react-router-dom";


function Navbar() {
    return (
    <AppBar className = {"Navbar"} position="static">
      <Toolbar>
        <Typography variant="h4" className={"logo"}>
          OmniTube
        </Typography>
          <div className={"navlinks"}>
            <Link to="/Video" className={"link"}>
              Video
            </Link>
            <Link to="/VideoList" className={"link"}>
              Video Links
            </Link>
          </div>
      </Toolbar>
    </AppBar>
  );
}


export default Navbar