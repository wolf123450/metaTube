import * as React from 'react';
import { Paper, InputBase, Divider, IconButton, Card } from '@mui/material';

import SearchIcon from '@mui/icons-material/Search';
import TagList from './TagList';
import { useParams } from 'react-router-dom';

function SearchBar({ filterTags, setFilterTags }) {
    const { videoId } = useParams();

    //Lifted state for taglist
    const [newTagValue, setNewTagValue] = React.useState("Add Search Tag");

    const tagListChanged = (event) => {
        let tempTagList = [];
        filterTags && (tempTagList = filterTags.concat([newTagValue]));
        setFilterTags(tempTagList);
    };

    const newTagValueChanged = (event) => { setNewTagValue(event.target.value) }
    return (
        <Paper
            
            className="section"
            elevation='2'
            sx={{  display: 'flex', alignItems: 'center', width: "auto" }}
        >

            <TagList
                sx={{ ml: 1, flex: "1", lineHeight:"normal"}}
                newTagValue={newTagValue}
                tagList={filterTags}
                newTagValueChanged={newTagValueChanged}
                tagListChanged={tagListChanged} />

            <IconButton  aria-label="search">
                <SearchIcon />
            </IconButton>
        </Paper>
    );
}

export default SearchBar