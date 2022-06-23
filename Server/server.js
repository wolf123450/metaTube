const express = require('express')
const app = express()
const port = 4000

app.get('/api/videos', (req, res) => {
    var vids = ['Video1', 'Video2', 'Video3']
  res.json(vids || []);
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})