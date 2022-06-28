const express = require('express')
const app = express()
const port = 4000
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

var vids =
  [
    {
      id: 'PysVc2GzNKY',
      tags: ["Star Wars", "Paulogia"]
    },
    {
      id: 'bjQ6PacPGEQ',
      tags: ["Overwatch", "Tracer", "Videogames"]
    },
    {
      id: 'k19jPvLeans',
      tags: ["Elden Ring", "Demigod", "Videogames"]
    },
    {
      id: 'ug50zmP9I7s',
      tags: ["Fishing", "Hi Res", "Ocean"]
    }
  ];

app.get('/api/videos', (req, res) => {

  res.json(vids || []);
})

app.post('/api/videos', (req, res) => {
  let filterTags = req.body;
  if (filterTags.length == 0) {
    res.json(vids || []);
  } else {

    //Once we have a DB, this should hit the DB and the DB will filter.
    //Currently returns all video that have any tags in filter tags.
    //Possibly in future add any/all or and/or options, so users can choose.
    let filteredVids = vids.filter(
      (value) => {
        for (const tag of filterTags) {
          if (value.tags.includes(tag)) {
            return true;
          }
        }
        return false;
      })
    res.json(filteredVids || [])
  }
})

app.get('/api/addTag', (req, res) => {

  let videoId = req.query.videoId;
  let tag = req.query.tag;

  if (videoId && tag) {
    let vid = vids.find((elem) => (elem.id === videoId));
    vid.tags.push(tag);
    console.log(vid);
  }
  res.sendStatus(204);
})

app.get('/api/tags/:videoId', (req, res) => {

  let vid = vids.find((elem) => (elem.id === req.params.videoId));
  res.json(vid || { id: "Not Found", tags: [] });
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})