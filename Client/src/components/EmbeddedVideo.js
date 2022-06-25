import { Card, CardContent, Divider, LinearProgress, makeStyles, Paper, Typography, Box, Chip, Stack } from '@mui/material'
import Skeleton from '@mui/lab/Skeleton';

import React, { useEffect } from 'react'
import ReactPlayer from "react-player"
import { useParams } from 'react-router-dom';

/**
 * Displays a video from the id at endpoint /video/:videoId
 */
function EmbeddedVideo(props) {
    // const { } = props;
    const { videoId } = useParams();
    const [tags, setTags] = React.useState(null);
    useEffect(() => {
        fetch('/api/tags/' + videoId)
            .then(result => result.json())
            .then(body => setTags(body));
    }, [videoId]);
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
                    <Stack direction="row" spacing={2}>
                        {tags &&
                            tags.tags.length > 0 ?
                            tags.tags.map((tag) => (<Chip label={tag} />)) :
                            <Skeleton variant="rectangular" width={"100%"} height={32} />}
                            <Divider orientation="vertical" flexItem />
                    </Stack>
                </Paper>
            </CardContent>
        </Card>

    )
}



export default EmbeddedVideo