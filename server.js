import express from "express"
import axios from "axios"
import { createClient } from "redis"
import colors from "colors"

const PORT = 5000
const REDIS_PORT = 6379

const client = createClient({
    socket: {
        host: "localhost",
        port: REDIS_PORT,
    },
})

client.on("error", (err) => console.log("Redis Client Error", err))
await client.connect()

const app = express()
app.use(express.json())

app.get("/", (req, res) => {
    res.status(200).json({
        message: `The express server is working on the browser`,
    })
})

// Set response
const setResponse = (username, repos) => {
    return `<h2>${username} has ${repos} Github repos</h2>`
}

// Make request to Github for data
const getRepos = async (req, res, next) => {
    try {
        console.log("Fetching Data...")
        const { username } = req.params

        const response = await axios.get(
            `https://api.github.com/users/${username}`
        )

        const data = response.data
        const repos = data.public_repos

        // Set data to Redis
        await client.set(username, repos)

        res.send(setResponse(username, repos))
    } catch (error) {
        console.error(error)
        res.status(500).send("Server Error")
    }
}

// Cache middleware
const cache = async (req, res, next) => {
    try {
        const { username } = req.params

        const data = await client.get(username)

        if (data !== null) {
            console.log("Data retrieved from cache")
            res.send(setResponse(username, data))
        } else {
            next()
        }
    } catch (error) {
        console.error("Cache error:", error)
        next()
    }
}

app.get("/repos/:username", cache, getRepos)

app.listen(PORT, () => {
    console.log(
        `Server is running at PORT: ${PORT}\nRedis is running at PORT : ${REDIS_PORT}`
            .cyan.underline
    )
})
