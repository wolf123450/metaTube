import React, { useEffect } from 'react';
import { Card, CardContent, Link, ImageList, ImageListItem, ImageListItemBar, ListSubheader } from '@mui/material'

/**
 * Yields a list of videos from the /api/videos endpoint.
 */
function VideoList(props) {
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
                        <ImageListItem key={videoId.id} >
                            <Link href={"Video/" + videoId.id}
                                sx={{
                                    textAlign: 'center',
                                    display: 'inline-table',
                                    position: 'relative'
                                }}
                            >

                                <img
                                    className={"thumbnail"}
                                    src={"https://img.youtube.com/vi/" + videoId.id + "/mqdefault.jpg"}
                                    alt=""
                                />
                                <ImageListItemBar
                                    title={videoId.id}
                                    subtitle={videoId.tags.join(", ")}
                                />
                            </Link>
                        </ImageListItem>

                    ))}
                </ImageList>
            </CardContent>
        </Card>
    )
}

export default VideoList