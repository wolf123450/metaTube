const express = require('express')
const app = express()
const port = 4000

app.get('/api/videos', (req, res) => {
  var vids = ['PysVc2GzNKY', 'bjQ6PacPGEQ', 'k19jPvLeans', 'ug50zmP9I7s']
  res.json(vids || []);
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})