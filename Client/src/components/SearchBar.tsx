import * as React from 'react';
import { Paper, InputBase, Divider, IconButton, Card } from '@mui/material';

import SearchIcon from '@mui/icons-material/Search';
import TagList from './TagList';
import { useParams } from 'react-router-dom';

interface SearchProps {
    filterTags: string[],
    setFilterTags:  React.Dispatch<React.SetStateAction<string[]>>,
};

const SearchBar: React.FC<SearchProps> = ({ filterTags, setFilterTags}) => {
    const { videoId } = useParams();

    const tagListChanged: (newTagList:string[]) => void = (newTagList) => {
        // let tempTagList = [];
        // filterTags && (tempTagList = filterTags.concat([newTagValue]));
        setFilterTags(newTagList);
    };

    
    return (
        <Paper
            className="section"
            elevation={2}
            sx={{  display: 'flex', alignItems: 'center', width: "auto" }}
        >

            <TagList
                sx={{ ml: 1, flex: "1", lineHeight:"normal"}}
                tagList={filterTags}
                tagListChanged={tagListChanged} 
                canDelete/>

            <IconButton  aria-label="search">
                <SearchIcon />
            </IconButton>
        </Paper>
    );
}

export default SearchBar