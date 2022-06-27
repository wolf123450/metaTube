import * as React from 'react';
import {Paper, InputBase, Divider, IconButton, Card} from '@mui/material';

import SearchIcon from '@mui/icons-material/Search';

function TagList({videoId, tags, tagListChanged}) {

  return (
    <Paper elevation='2' className="section">
    <Grid container spacing={2}>
        {tags &&
            tags.tags.length > 0 ?
            tags.tags.map((tag) => (
                <Grid item xs={"auto"}>
                    <Chip label={tag} />
                </Grid>
            )) :
            <Skeleton variant="rectangular" width={"100%"} height={32} />}
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
                        onChange={(event) => { setNewTagValue(event.target.value) }}
                    />}
                onDelete={
                    (event) => {
                        tags && tags.tags.length >= 0 && (tags.tags = tags.tags.concat([newTagValue]));
                        setTags({ id: tags.id, tags: tags.tags });
                        fetch(`/api/addTag?videoId=${videoId}&tag=${newTagValue}`);
                        console.log(newTagValue);
                    }
                }
                deleteIcon={<AddCircleIcon />} />
        </Grid>

    </Grid>
</Paper>
  );
}

export default TagList