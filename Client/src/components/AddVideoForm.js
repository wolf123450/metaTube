import React from 'react'
import { Button, Card, CardContent, Container, createTheme, Grid, LinearProgress, makeStyles, TextField, ThemeProvider } from '@mui/material';


import EmbeddedVideo from './EmbeddedVideo.js';
import TagList from './TagList.js';

//TODO: Move skeleton here.
function AddVideoForm(props) {

    const [tagList, setTagList] = React.useState([]);

    const tagListChanged = (newTagList) => {
        // let tempTagList = [];
        // filterTags && (tempTagList = filterTags.concat([newTagValue]));
        setTagList(newTagList);
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
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={1} sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                        <Button variant="contained">Submit</Button>
                    </Grid>
                    <Grid item xs={12}>
                        <TagList
                            sx={{ ml: 1, flex: "1", lineHeight: "normal" }}
                            tagList={tagList}
                            tagListChanged={tagListChanged}
                            canDelete></TagList>
                    </Grid>
                </Grid>

            </CardContent>
        </Card>
    )
}

export default AddVideoForm