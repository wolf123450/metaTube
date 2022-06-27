import * as React from 'react';
import {Paper, InputBase, Divider, IconButton, Card} from '@mui/material';

import SearchIcon from '@mui/icons-material/Search';

function SearchBar() {
  return (
    <Paper
      component="form"
      className="section"
      elevation='2'
      sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: "auto" }}
    >
      <InputBase
        sx={{ ml: 1, flex: 1 }}
        placeholder="Search Videos"
        inputProps={{ 'aria-label': 'search videos' }}
      />
      <IconButton type="submit" sx={{ p: '10px' }} aria-label="search">
        <SearchIcon />
      </IconButton>
    </Paper>
  );
}

export default SearchBar