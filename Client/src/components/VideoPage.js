import React from 'react'
import { Container, createTheme, LinearProgress, makeStyles, ThemeProvider } from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';


import EmbeddedVideo from './EmbeddedVideo.js';

//TODO: Move skeleton here.
function VideoPage(props) {
    const theme = useTheme();
    return (
        <EmbeddedVideo />
    )
}

export default VideoPage