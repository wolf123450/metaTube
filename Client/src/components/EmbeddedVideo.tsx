import {
  Card,
  CardContent,
  LinearProgress,
  Grid,
} from "@mui/material";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import Skeleton from "@mui/lab/Skeleton";
import React, { useEffect } from "react";
import ReactPlayer from "react-player";
import { useParams } from "react-router-dom";
import TagList from "./TagList";

/**
 * Displays a video from the id at endpoint /video/:videoId
 */
const EmbeddedVideo: React.FC = () => {
  const { videoId } = useParams();
  const [videoData, setVideoData] = React.useState<Video>({ tags: [], id: "" });

  const tagListChanged: (newTagList: string[]) => void = (newTagList) => {
    if (newTagList.length > videoData.tags.length) {
      const newTags = newTagList.filter((item) => !videoData.tags.includes(item));
      for (const tag of newTags) {
        fetch(`/api/tags/${videoId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tag }),
        });
      }
    }
    setVideoData({ id: videoData.id, tags: newTagList });
  };

  useEffect(() => {
    fetch("/api/tags/" + videoId)
      .then((result) => result.json())
      .then((body) => setVideoData(body));
  }, [videoId]);
  if (false) {
    return (
      <Card className={"root"}>
        <CardContent>
          <LinearProgress></LinearProgress>
        </CardContent>
      </Card>
    );
  }

  var loading = false;
  return (
    <Card className={"card"}>
      <CardContent>
        {loading ? (
          <Skeleton className={"video"} variant="rectangular" />
        ) : (
          <div className="wrapper">
            <ReactPlayer
              className={"video"}
              controls={true}
              width="100%"
              height="100%"
              url={"https://www.youtube.com/watch?v=" + videoId}
            />
          </div>
        )}

        <TagList tagList={videoData.tags} tagListChanged={tagListChanged} tagLinks />
      </CardContent>
    </Card>
  );
};

export default EmbeddedVideo;
