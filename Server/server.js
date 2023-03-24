//const express = require('express')
import 'dotenv/config'
import {google} from 'googleapis'
// import express from 'express'
import Fastify from 'fastify'
import mongoose from './mongooseInterface.js'
import Video from './models/video.js'

// const keyauth = google.auth.fromAPIKey(process.env.YOUTUBE_API_KEY);
const youtubeData = google.youtube({version:'v3', auth:process.env.YOUTUBE_API_KEY});


// const app = express()
const fastify = Fastify({
  logger: true
})
const port = 4000
// app.use(express.json())
// app.use(express.urlencoded({ extended: true }))

//TODO move all db query logic to a service.

//Dev data, until we get a DB running. 
// var vids =
//   [
//     {
//       id: 'PysVc2GzNKY',
//       tags: ["Star Wars", "Paulogia"]
//     },
//     {
//       id: 'bjQ6PacPGEQ',
//       tags: ["Overwatch", "Tracer", "Videogames"]
//     },
//     {
//       id: 'k19jPvLeans',
//       tags: ["Elden Ring", "Demigod", "Videogames"]
//     },
//     {
//       id: 'ug50zmP9I7s',
//       tags: ["Fishing", "Hi Res", "Ocean"]
//     }
//   ];

// fastify.get('/api/videos', async (req, res) => {
//   //Return a list of all (top 10-50) videos
//   const videos = await Video.find({});
//   const mappedVids = videos.map(({ videoId, tags }) => ({ id: videoId, tags: tags }));
//   return mappedVids || [];
// })
fastify.get('/api/videos', async (req, res) => {
  //Return a list of videos that have any of the tags sent in the post body.
  console.log(req.query.filterTags);
  let filterTags = JSON.parse(req.query.filterTags) || [];

  if (filterTags.length == 0) {
    const videos = await Video.find({}).lean();
    const mappedVids = videos.map(({ videoId, tags }) => ({ id: videoId, tags: tags }));
    
    // const infos = await youtubeData.videos.list({id:mappedVids.map(({id})=>(id)), part:"snippet"});
    // console.log(JSON.stringify(infos, null, 4));


    return mappedVids || [];
  } else {
    //Currently returns all video that have any tags in filter tags. 
    //Possibly in future add any/all or and/or options, so users can choose. use {tags:{$all: filterTags}} to match all
    const videos = await Video.find({ tags: { $in: filterTags } }).lean();
    const mappedVids = videos.map(({ videoId, tags }) => ({ id: videoId, tags: tags }));

    return mappedVids || [];
  }
})

fastify.post('/api/videos', async (req, res) => {
  //Return a list of videos that have any of the tags sent in the post body.
  let filterTags = req.body;

  if (filterTags.length == 0) {
    const videos = await Video.find({}).lean();
    const mappedVids = videos.map(({ videoId, tags }) => ({ id: videoId, tags: tags }));

    return mappedVids || [];
  } else {
    //Currently returns all video that have any tags in filter tags. 
    //Possibly in future add any/all or and/or options, so users can choose. use {tags:{$all: filterTags}} to match all
    const videos = await Video.find({ tags: { $in: filterTags } }).lean();
    const mappedVids = videos.map(({ videoId, tags }) => ({ id: videoId, tags: tags }));

    return mappedVids || [];
  }
})

fastify.post('/api/addVideo', async (req, res) => {
  //Add a video to the DB
  let videoData = req.body;

  const infos = await youtubeData.videos.list({id:[videoData.id], part:"snippet"});
  // console.log(JSON.stringify(infos, null, 4));


  // const newVideo = new Video({
  //   videoId: videoData.id,
  //   title: infos.data.items[0].snippet.title,
  //   tags: [...new Set([...videoData.tags, ...infos.data.items[0].snippet.tags])]
  // })
  // await newVideo.save();
  const oldVideo = await Video.findOne({videoId:videoData.id});
  await Video.updateOne({videoId:videoData.id}, {
      videoId: videoData.id,
      title: infos.data.items[0].snippet.title,
      tags: [...new Set([...videoData.tags, ...infos.data.items[0].snippet.tags, ...oldVideo?.tags])]
    }, {upsert:true})
    // await newVideo.save();


  res.statusCode = 204;
})

fastify.get('/api/addTag', async (req, res) => {
  //Add a tag to a video, following /api/addTag?videoId=<videoId>&tag=<tag>
  //TODO make this a put post or update

  let videoId = req.query.videoId;
  let tag = req.query.tag;

  if (videoId && tag) {
    const res = await Video.updateOne({ videoId: videoId }, { $push: { tags: tag } })
    // console.log(res);
  }
  res.statusCode = 204;
})

fastify.get('/api/tags/:videoId', async (req, res) => {
  //Returns the video object for the specified videoId
  const vid = await Video.findOne({ videoId: req.params.videoId }).lean();
  return { id: vid.videoId, tags: vid.tags } || { id: "Not Found", tags: [] };
})

fastify.listen({ port: port }, (err, address) => {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  console.log(`Example app listening at http://localhost:${port}`)
})