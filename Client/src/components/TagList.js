import * as React from 'react';
import { Paper, InputBase, Chip, Stack, Autocomplete, TextField, Icon, Grid } from '@mui/material'
import Skeleton from '@mui/lab/Skeleton';
import AddCircleIcon from '@mui/icons-material/AddCircle';

function TagList({ tagList, tagListChanged, canDelete, sx }) {
    const [newTagValue, setNewTagValue] = React.useState("Add Tag");

    const newTagValueChanged = (event) => { setNewTagValue(event.target.value) }

    const addNewTag = (event) => {
        let tempTagList = [];
        tagList && (tempTagList = tagList.concat([newTagValue]));
        tagListChanged(tempTagList);
    };

    const deleteTag = (tag) => () => {
        let tempTagList = [];
        tempTagList = tagList.filter((value) => { return value != tag })
        // tagList && (tempTagList = tagList.concat([newTagValue]));
        tagListChanged(tempTagList);
    }

    const onKeyDown = (event) => {
        if (event.key == "Enter"){
            console.log(event);
            addNewTag("")
        }
    }

    return (
        <Paper
            elevation='2'
            className="section"
            sx={sx}
        >
            <Grid container spacing={2}>
                {tagList &&
                    tagList.length >= 0 ?
                    tagList.map((tag) => (
                        <Grid item xs={"auto"} key={tag}>
                            <Chip
                                label={tag}
                                onDelete={canDelete ? deleteTag(tag) : false } />
                        </Grid>
                    )) :
                    <Skeleton variant="rectangular" width={"auto"} height={32} />}
                <Grid item xs={"auto"}>
                    <Chip
                        label={
                            <InputBase
                                hiddenLabel
                                id="outlined-basic"
                                size="small"
                                margin='none'
                                sx={{ padding: '0' }}
                                variant="standard"
                                value={newTagValue}
                                onChange={newTagValueChanged}
                                onKeyDown={onKeyDown}
                            />}
                        onDelete={addNewTag}
                        deleteIcon={<AddCircleIcon />} />
                </Grid>

            </Grid>
        </Paper>
    );
}

export default TagList