import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Link,
  ImageList,
  ImageListItem,
  ImageListItemBar,
} from "@mui/material";
import SearchBar from "./SearchBar";
import { useParams, useSearchParams } from "react-router-dom";

/**
 * Yields a list of videos from the /api/videos endpoint.
 */
const VideoList: React.FC = () => {
  const safeParse: (value: string) => Array<string> = (JsonString) => {
    // If we run into any problems parsing the json string, then return empty array
    let parsedObject = [];
    try {
      parsedObject = JSON.parse(JsonString || "[]");
    } catch (error) {}
    return parsedObject;
  };
  const [params, setSearchParams] = useSearchParams();
  const [videos, setVideos] = useState<Video[]>([]);
  const [filterTags, setFilterTags] = useState<string[]>(
    safeParse(params.has("filterTags") ? params.get("filterTags")! : "[]")
  );
  // const [filterTags, setFilterTags] = useState<string[]>(
  //   JSON.parse(params.has("filterTags") ? params.get("filterTags")! : "[]")
  // );

  useEffect(() => {
    setFilterTags(safeParse(params.has("filterTags") ? params.get("filterTags")! : "[]"));
  }, [params]);

  useEffect(() => {
    setSearchParams({ filterTags: JSON.stringify(filterTags) });
    const loadTagList = async () => {
      const response = await fetch(
        `/api/videos?filterTags=${JSON.stringify(filterTags)}`
      );
      const json = await response.json();
      setVideos(json);
    };
    loadTagList();
  }, [filterTags]);
  //TODO: map a list of 'thumbnails' to skeleton elements
  return (
    <Card className={"card"}>
      <CardContent>
        <ImageList cols={3} gap={2}>
          <ImageListItem key="Subheader" cols={3}>
            <SearchBar filterTags={filterTags} setFilterTags={setFilterTags} />
          </ImageListItem>
          {videos &&
            videos.map((videoId) => (
              <ImageListItem key={videoId.id} sx={{ margin: 2 }}>
                <Link
                  href={"Video/" + videoId.id}
                  sx={{
                    textAlign: "center",
                    display: "inline-table",
                    position: "relative",
                  }}
                >
                  <img
                    className={"thumbnail"}
                    src={
                      "https://img.youtube.com/vi/" +
                      videoId.id +
                      "/mqdefault.jpg"
                    }
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
  );
};

export default VideoList;
