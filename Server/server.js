const express = require('express')
const app = express()
const port = 4000

app.get('/api/videos', (req, res) => {
  var vids = [
    {
      id: 'PysVc2GzNKY',
      tags: ["Star Wars", "Paulogia"]
    },
    {
      id: 'bjQ6PacPGEQ',
      tags: ["Overwatch", "Tracer"]
    },
    {
      id: 'k19jPvLeans',
      tags: ["Elden Ring", "Demigod"]
    },
    {
      id: 'ug50zmP9I7s',
      tags: ["Fishing", "Hi Res"]
    }
  ]
  res.json(vids || []);
})

app.get('/api/tags/:videoId', (req, res) => {
  var vids =
    [
      {
        id: 'PysVc2GzNKY',
        tags: ["Star Wars", "Paulogia"]
      },
      {
        id: 'bjQ6PacPGEQ',
        tags: ["Overwatch", "Tracer"]
      },
      {
        id: 'k19jPvLeans',
        tags: ["Elden Ring", "Demigod"]
      },
      {
        id: 'ug50zmP9I7s',
        tags: ["Fishing", "Hi Res"]
      }
    ]
  var vid = vids.find((elem) => (elem.id === req.params.videoId));
  res.json(vid || {id: "Not Found", tags: []});
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})