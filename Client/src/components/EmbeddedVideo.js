import { Card, CardContent, Divider, LinearProgress, makeStyles, Paper, Typography, Box, Chip, Stack, Autocomplete, TextField, Icon, Grid, InputBase } from '@mui/material'
import AddCircleIcon from '@mui/icons-material/AddCircle';
import Skeleton from '@mui/lab/Skeleton';
import Enumerable from 'linq';
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


    // const tagListChanged = (event) => {
    //     videoData && videoData.tags.length >= 0 && (videoData.tags = videoData.tags.concat([newTagValue]));
    //     setVideoData({ id: videoData.id, tags: videoData.tags });
    //     //Hit the endpoint to add a tag to a videoId
    //     fetch(`/api/addTag?videoId=${videoId}&tag=${newTagValue}`);
    // };
    const tagListChanged = (newTagList) => {
        if (newTagList.length > videoData.tags.length) {
            let difference = Enumerable
                .from(newTagList) //Start with newTagList
                .where((item) => { return !videoData.tags.includes(item) }) // Where item not in videoData.tags
                .toArray();
            for (let item of difference) {
                fetch(`/api/addTag?videoId=${videoId}&tag=${item}`);
            }
        }
        setVideoData({ id: videoData.id, tags: newTagList })
    };

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
                    tagList={videoData.tags}
                    tagListChanged={tagListChanged} />
            </CardContent>
        </Card>

    )
}



export default EmbeddedVideo