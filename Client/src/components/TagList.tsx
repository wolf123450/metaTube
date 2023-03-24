import * as React from "react";
import {
  Paper,
  InputBase,
  Chip,
  Stack,
  Autocomplete,
  TextField,
  Icon,
  Grid,
} from "@mui/material";
import { Theme } from "@mui/material/styles";
import { SxProps } from "@mui/system";
import Skeleton from "@mui/lab/Skeleton";
import AddCircleIcon from "@mui/icons-material/AddCircle";

type TagListProps = {
  tagList: string[],
  tagListChanged: (tagList: string[]) => void,
  canDelete?: any,
  sx?: SxProps<Theme>,
  tagLinks?: boolean
};

const TagList: React.FC<TagListProps> = ({
  tagList,
  tagListChanged,
  canDelete,
  sx,
  tagLinks
}) => {
  const [newTagValue, setNewTagValue] = React.useState("");

  const newTagValueChanged: React.ChangeEventHandler = (event) => {
    setNewTagValue((event.target as HTMLTextAreaElement).value);
  };

  const addNewTag: (event: any) => void = (event) => {
    let tempTagList: string[] = [];
    tagList && (tempTagList = tagList.concat([newTagValue]));
    tagListChanged(tempTagList);
  };

  const deleteTag: (tag: string) => (event: any) => void = (tag) => (event) => {
    let tempTagList = [];
    tempTagList = tagList.filter((value) => {
      return value != tag;
    });
    // tagList && (tempTagList = tagList.concat([newTagValue]));
    tagListChanged(tempTagList);
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (event) => {
    if (event.key == "Enter") {
      console.log(event);
      addNewTag("");
    }
  };

  return (
    <Paper elevation={2} className="section" sx={sx}>
      <Grid container spacing={2}>
        {tagList?.length >= 0 ? (
          tagList.map((tag) => (
            <Grid item xs={"auto"} key={tag}>
              <Chip
                label={tag}
                onDelete={canDelete ? deleteTag(tag) : undefined}
                {... tagLinks ? {component:"a", href:`/VideoList?filterTags=["${tag}"]`, clickable:true}:{}}
              />
            </Grid>
          ))
        ) : (
          <Skeleton variant="rectangular" width={"auto"} height={32} />
        )}
        <Grid item xs={"auto"}>
          <Chip //TODO make each of these optionally a link to the videolist with a query for that tag
            label={
              <TextField
                label="Add Tag"
                id="outlined-basic"
                size="small"
                margin="none"
                sx={{ padding: "0", height: "65px" }} // 65px might not be correct in all cases, was hand selected to fit line within chip.
                variant="standard"
                value={newTagValue}
                onChange={newTagValueChanged}
                onKeyDown={onKeyDown}
              />
            }
            onDelete={addNewTag}
            deleteIcon={<AddCircleIcon />}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default TagList;
