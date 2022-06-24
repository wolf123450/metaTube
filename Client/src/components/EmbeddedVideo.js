import { Card, CardContent, Divider, LinearProgress, makeStyles, Paper, Typography, Box } from '@material-ui/core'
import Skeleton from '@material-ui/lab/Skeleton';

import React from 'react'
import ReactPlayer from "react-player"
import {useParams} from 'react-router-dom';

function EmbeddedVideo(props) {
    // const { } = props;
    const {videoId} = useParams();

    if (false) {
        return (
            <Card className={"root"}>
                <CardContent>
                    <LinearProgress></LinearProgress>
                </CardContent>
            </Card>
        )
    }
    var loading = false;
    return (
        <Card className={"card"}>
            <CardContent>
                {loading ?
                    <Skeleton className={"video"} variant="rect" />
                    : <ReactPlayer className={"video"} controls="true"
                        url={"https://www.youtube.com/watch?v=" + videoId}
                    />}

                <Paper elevation='2' className="section">
                    <Box display='flex' >
                        <Box margin={1}>
                            <Skeleton className={"skeleton left"} variant="circle" width={40} height={40} />
                        </Box>
                        <Box
                            margin={1}
                            width='100%'
                            display="flex"
                            flexDirection="column"
                            justifyContent="center"
                        >
                            <Skeleton className={"skeleton right"} variant="rect" width='100%' height='1em'>
                                <Typography>.</Typography>
                            </Skeleton>
                        </Box>
                    </Box>
                    <Divider />
                    <Skeleton className={"skeleton"} />
                    <Skeleton className={"skeleton"} />
                    <Skeleton className={"skeleton"} />
                </Paper>
            </CardContent>
        </Card>

    )
}



export default EmbeddedVideo