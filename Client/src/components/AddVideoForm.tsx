import React from "react";
import {
  Button,
  Card,
  CardContent,
  Container,
  createTheme,
  Grid,
  LinearProgress,
  makeStyles,
  TextField,
  ThemeProvider,
} from "@mui/material";

import { useNavigate } from "react-router-dom";
import EmbeddedVideo from "./EmbeddedVideo";
import TagList from "./TagList";

//TODO: Move skeleton here.
const AddVideoForm: React.FC = () => {
  let navigate = useNavigate();

  const [tagList, setTagList] = React.useState<string[]>([]);
  const [videoLink, setVideoLink] = React.useState("");
  const [videoId, setVideoId] = React.useState("");

  const tagListChanged = (newTagList: string[]) => {
    // let tempTagList = [];
    // filterTags && (tempTagList = filterTags.concat([newTagValue]));
    setTagList(newTagList);
  };

  const parseYoutubeLink = (url: string) => {
    const VID_REGEX: RegExp =
      /(?:youtube(?:-nocookie)?\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const matches: RegExpMatchArray | null = url.match(VID_REGEX);

    const id: string = matches ? matches[1] : "";
    return id;
  };

  const addVideo = ({ id: videoId, tags: taglist }: Video) => {
    fetch("/api/addVideo", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": "token-value",
      },
      mode: "cors",
      body: JSON.stringify({ id: videoId, tags: tagList }),
    });
  };

  const onSubmitClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    const id = parseYoutubeLink(videoLink);
    addVideo({ id, tags: tagList });
    navigate("/Video/" + id);
  };

  //TODO: add endpoint on server, do databinding/add state for link field
  return (
    <Card className={"card"}>
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={11}>
            <TextField
              label="Paste Link Here"
              id="link-input"
              variant="outlined"
              value={videoLink}
              onChange={(event) => {
                setVideoLink(event.target.value);
              }}
              fullWidth
            />
          </Grid>
          <Grid
            item
            xs={1}
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Button variant="contained" onClick={onSubmitClick}>
              Submit
            </Button>
          </Grid>
          <Grid item xs={12}>
            <TagList
              sx={{ ml: 1, flex: "1", lineHeight: "normal" }}
              tagList={tagList}
              tagListChanged={tagListChanged}
              canDelete
            ></TagList>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default AddVideoForm;
