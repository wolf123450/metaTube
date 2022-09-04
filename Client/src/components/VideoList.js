import React, { useEffect } from 'react';
import { Card, CardContent, Link, ImageList, ImageListItem, ImageListItemBar } from '@mui/material'
import SearchBar from './SearchBar';
import { useParams } from 'react-router-dom';

/**
 * Yields a list of videos from the /api/videos endpoint.
 */
function VideoList(props) {
    const params = useParams();
    const [videos, setVideos] = React.useState(null);
    const [filterTags, setFilterTags] = React.useState(params?.filterTags || []);
    console.log(params.filterTags);

    useEffect(() => {
        const loadTagList = async () => {

            const response = await fetch(`/api/videos?filterTags=${JSON.stringify(filterTags)}`);
            // fetch('/api/videos', {
            //     method: 'POST',
            //     headers: {
            //         "Content-Type": "application/json",
            //         "x-access-token": "token-value",
            //     },
            //     mode: 'cors',
            //     body: JSON.stringify(filterTags)
            // })
            const json = await response.json();
            setVideos(json);
        };
        loadTagList();
    }, [filterTags]);
    //TODO: map a list of 'thumbnails' to skeleton elements
    return (
        <Card className={"card"}>
            <CardContent>
                <ImageList cols={3} spacing={2}
                >
                    <ImageListItem key="Subheader" cols={3}>
                        <SearchBar filterTags={filterTags} setFilterTags={setFilterTags} />
                    </ImageListItem>
                    {videos && videos.map((videoId) => (
                        <ImageListItem key={videoId.id} sx={{ margin: 2 }}>
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