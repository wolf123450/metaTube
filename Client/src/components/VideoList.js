import React, { useEffect } from 'react';
import { useTheme } from '@material-ui/core/styles';
import { Card, CardContent, Link, ImageList, ImageListItem, ImageListItemBar } from '@material-ui/core'
import Skeleton from '@material-ui/lab/Skeleton';

function VideoList(props) {
    const theme = useTheme();
    const [videos, setVideos] = React.useState(null);
    var loading = true;
    useEffect(() => {
        fetch('/api/videos')
            .then(result => result.json())
            .then(body => setVideos(body)
            );
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