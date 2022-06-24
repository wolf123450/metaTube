import React, { useEffect } from 'react';
import { useTheme } from '@material-ui/core/styles';
import { Card, CardContent, Divider, LinearProgress, makeStyles, Paper, Typography, Box, ImageList, ImageListItem } from '@material-ui/core'
import Skeleton from '@material-ui/lab/Skeleton';

function VideoList(props) {
    const theme = useTheme();
    const [videos, setVideos] = React.useState(null);
    var loading = true;
    useEffect(() => {
        fetch('/api/videos')
            .then(result => result.json())
            .then(body => setVideos(body));
    }, []);
    //TODO: map a list of 'thumbnails' to skeleton elements
    return (
        <Card className={"card"}>
            <CardContent>
                <ImageList cols={2}
                >
                
                    {videos && videos.map((videoId) => (
                        <ImageListItem key={videoId} >
                            <img
                                className={"thumbnail"}
                                src={"https://img.youtube.com/vi/" + videoId + "/mqdefault.jpg"}
                                alt=""
                            />
                        </ImageListItem>
                    ))}
                </ImageList>
            </CardContent>
        </Card>
    )
}

export default VideoList