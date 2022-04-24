import express from 'express'
import ytdl from 'ytdl-core'

import fs from 'fs'
import yts from 'yt-search'

export const API = express.Router()

API.get("/", async (req, res) => {
    res.status(200).json("You can use API to get data from youtube")
})

/** @method get video info */
API.get("/info", async (req, res) => {
    // example: http://localhost:8888/api/info?id=dQw4w9WgXcQ
    let { id } = req.query
    try {
        /** @var {object} info dữ liệu thông tin của video */
        let info = await ytdl.getInfo(id)
        // fs.writeFile("exampleData.json", info, err => err && console.log(err))
        res.status(200).json(info)
    } catch (e) {

    }
})

/** @method post : tìm kiếm video */
API.post("/search", async (req, res) => {
    // type gồm 3 dạng: keyword, videoId, playlistId
    let { keyword, quantity, type } = req.body
    console.log("Search by keyword: ", keyword)
    try {
        const results = await yts(keyword)
        // Tìm video theo ID: const video = await yts({ videoId: '_4Vt0UGwmgQ' })
        // Tìm playlist theo ID: const plist = await yts({ listId: 'PL7k0JFoxwvTbKL8kjGI_CaV31QxCGf1vJ' })
        const videos = results.videos.slice(0, quantity)
        res.status(200).json(videos)
    } catch (err) {
        console.log(err)
    }
})

/** @get source media and download to server, send to client [test] */
API.get("/download", async (req, res) => {
    // example: localhost:8888/api/download?id=N-MeunQr8gk
    let { id } = req.query
    ytdl(id).pipe(fs.createWriteStream('temp.mp4'))
        .on("finish", () => {
            res.status(200).download("temp.mp4")
        })
})

/** @get stream media url */
API.get("/stream", async (req, res) => {
    let { id, type } = req.query // example: localhost:8888/api/stream?id=N-MeunQr8gk&type=audio
    console.log(`Get media stream url: ${id}, type: ${type}`)
    try {
        if (type === "audio") {
            let videoInfo = await ytdl.getInfo(id)
            let source = videoInfo?.formats
            // GET AUDIO STREAM URL:
            // Dữ liệu trả về phụ thuộc vào itag của item, có thể tham khảo youtube itag trên google
            let result = source.find(item => item.itag === 251)
            res.status(200).redirect(result.url)
        } if (type === "video") {
            let videoInfo = await ytdl.getInfo(id)
            let source = videoInfo?.formats
            // GET VIDEO STREAM URL:
            // Dữ liệu trả về phụ thuộc vào itag của item
            let result = source.find(item => item.itag === 251)
            res.status(200).download(result.url)
        }
    } catch (err) {
        console.log(err)
    }
})

export default API