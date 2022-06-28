import * as React from 'react';
import { Paper, InputBase, Chip, Stack, Autocomplete, TextField, Icon, Grid } from '@mui/material'
import Skeleton from '@mui/lab/Skeleton';
import AddCircleIcon from '@mui/icons-material/AddCircle';

function TagList({ newTagValue, tagList, newTagValueChanged, tagListChanged, sx }) {

    return (
        <Paper
            elevation='2'
            className="section"
            sx = {sx}
            >
            <Grid container spacing={2}>
                {tagList &&
                    tagList.length >= 0 ?
                    tagList.map((tag) => (
                        <Grid item xs={"auto"} key={tag}>
                            <Chip label={tag}/>
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
                            />}
                        onDelete={tagListChanged}
                        deleteIcon={<AddCircleIcon />} />
                </Grid>

            </Grid>
        </Paper>
    );
}

export default TagList