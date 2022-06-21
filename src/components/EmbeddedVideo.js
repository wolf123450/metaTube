import { Card, CardContent, Divider, LinearProgress, makeStyles, Paper, Typography, Box} from '@material-ui/core'
import Skeleton from '@material-ui/lab/Skeleton';

import React from 'react'
import ReactPlayer from "react-player"

const useStyles = makeStyles({
    root: {
        minWidth: 275,
        backgroundColor: '#555555',
        marginTop: "3rem",
        marginBottom: "3rem",
    },
    bullet: {
        display: 'inline-block',
        margin: '0 2px',
        transform: 'scale(0.8)',
    },
    title: {
        fontSize: 24,
    },
    left: {
        display: 'inline',
        textAlign: 'left',
        float: 'left'
    },
    right: {
        display: 'inline',
        float: 'right',
        textAlign: 'right',
        verticalAlign: 'middle',
    },
    section: {
        marginBottom: 12,
        padding: 10,
    },
    skeleton: {
        marginLeft: 15,
    },
    video: {
        marginLeft: 'auto',
        marginRight: 'auto',
        marginTop: '3rem',
        marginBottom: '3rem'
    },
    avatar: {
        
    },
});

function EmbeddedVideo(props) {
    // const { } = props;
    const classes = useStyles();
    if (false) {
        return (
            <Card className={classes.root}>
                <CardContent>
                    <LinearProgress></LinearProgress>
                </CardContent>
            </Card>
        )
    }
    return (
        <Card className={classes.root}>
            <CardContent>
                    <Skeleton className={classes.video} variant="rect"> 
                        <ReactPlayer  controls="true" light="true"
                          url="https://www.youtube.com/watch?v=ug50zmP9I7s"
                        />
                    </Skeleton>
            
            <Paper elevation='2' className={classes.section}>
                <Box display='flex' >
                    <Box margin={1}>
                        <Skeleton className={classes.skeleton + ' ' + classes.left} variant="circle" width={40} height={40} />
                    </Box>
                    <Box width='100%'>
                        <Skeleton className={classes.skeleton + ' ' + classes.right} variant="rect" width='100%' height = '1em'>
                            <Typography>.</Typography>
                        </Skeleton>
                    </Box>
                </Box>
                <Divider/>
                <Skeleton className={classes.skeleton}/>
                <Skeleton className={classes.skeleton}/>
                <Skeleton className={classes.skeleton}/>
            </Paper>
            </CardContent>
        </Card>

    )
}



export default EmbeddedVideo