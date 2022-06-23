import React from 'react'
import { useTheme } from '@material-ui/core/styles';
import { Card, CardContent, Divider, LinearProgress, makeStyles, Paper, Typography, Box } from '@material-ui/core'
import Skeleton from '@material-ui/lab/Skeleton';

function VideoList(props) {
    const theme = useTheme();
    var loading = true;
    //TODO: map a list of 'thumbnails' to skeleton elements
    return (
        <Card className={"card"}>
            <CardContent>
                <Skeleton className={"video"} variant="rect" />


                <Paper elevation='2' className="section">
                    <Box display='flex' >
                        <Box margin={1}>
                            <Skeleton className={"skeleton left"} variant="circle" width={40} height={40} />
                        </Box>
                        <Box width='100%'>
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

export default VideoList