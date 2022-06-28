import { Card, CardContent, Divider, LinearProgress, makeStyles, Paper, Typography, Box, Chip, Stack, Autocomplete, TextField, Icon, Grid, InputBase } from '@mui/material'
import AddCircleIcon from '@mui/icons-material/AddCircle';
import Skeleton from '@mui/lab/Skeleton';

import React, { useEffect } from 'react'
import ReactPlayer from "react-player"
import { useParams } from 'react-router-dom';
import TagList from './TagList';

/**
 * Displays a video from the id at endpoint /video/:videoId
 */
function EmbeddedVideo(props) {
    // const { } = props;
    const { videoId } = useParams();
    const [videoData, setVideoData] = React.useState({});

    //Lifted state for taglist
    const [newTagValue, setNewTagValue] = React.useState("Add Tag");

    const tagListChanged = (event) => {
        videoData && videoData.tags.length >= 0 && (videoData.tags = videoData.tags.concat([newTagValue]));
        setVideoData({ id: videoData.id, tags: videoData.tags });
        //Hit the endpoint to add a tag to a videoId
        fetch(`/api/addTag?videoId=${videoId}&tag=${newTagValue}`);
    };

    const newTagValueChanged = (event) => { setNewTagValue(event.target.value) }

    useEffect(() => {
        fetch('/api/tags/' + videoId)
            .then(result => result.json())
            .then(body => setVideoData(body));
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

                <TagList
                    newTagValue={newTagValue}
                    tagList={videoData.tags}
                    newTagValueChanged={newTagValueChanged}
                    tagListChanged={tagListChanged} />
            </CardContent>
        </Card>

    )
}



export default EmbeddedVideo