import { Card, CardContent, Divider, LinearProgress, makeStyles, Paper, Typography, Box, Chip, Stack, Autocomplete, TextField, Icon, Grid, InputBase } from '@mui/material'
import AddCircleIcon from '@mui/icons-material/AddCircle';
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
    const [newTagValue, setNewTagValue] = React.useState("Add Tag");


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
                    : <div className='wrapper'>
                        <ReactPlayer
                            className={"video"}
                            controls="true"
                            width="100%"
                            height="100%"
                            url={"https://www.youtube.com/watch?v=" + videoId}
                        />
                    </div>}

                <Paper elevation='2' className="section">
                    <Grid container spacing={2}>
                        {tags &&
                            tags.tags.length > 0 ?
                            tags.tags.map((tag) => (
                                <Grid item xs={"auto"}>
                                    <Chip label={tag} />
                                </Grid>
                            )) :
                            <Skeleton variant="rectangular" width={"100%"} height={32} />}
                        <Grid item xs={"auto"}>
                            <Chip
                                label={
                                    <InputBase
                                        hiddenLabel
                                        id="outlined-basic"
                                        size="small"
                                        margin='none'
                                        sx={{ padding: '0' }}
                                        variant="standard"
                                        value={newTagValue}
                                        onChange={(event) => { setNewTagValue(event.target.value) }}
                                    />}
                                onDelete={
                                    (event) => {
                                        tags && tags.tags.length >= 0 && (tags.tags = tags.tags.concat([newTagValue]));
                                        setTags({ id: tags.id, tags: tags.tags });
                                        fetch(`/api/addTag?videoId=${videoId}&tag=${newTagValue}`);
                                        console.log(newTagValue);
                                    }
                                }
                                deleteIcon={<AddCircleIcon />} />
                        </Grid>

                    </Grid>
                </Paper>
            </CardContent>
        </Card>

    )
}



export default EmbeddedVideo