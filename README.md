# Node.js Redis Caching Example

This project demonstrates how to implement Redis caching in a Node.js application using the latest Redis client library. The application fetches GitHub user data and caches the results to improve performance.

## Overview

This example showcases:
- Setting up a Redis client with the modern Node.js Redis client library
- Creating a caching middleware for Express
- Storing and retrieving data from Redis
- Error handling for Redis operations

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher recommended)
- Docker (for running Redis)

### Running Redis with Docker
Start a Redis container with the following command:
```bash
docker run --name redis-container -p 6379:6379 -d redis
```

### Install Dependencies
```bash
npm install express axios redis colors
```

### Running the Application
```bash
node server.js
```

## How It Works

### Redis Client Setup
```javascript
const client = createClient({
    socket: {
        host: "localhost",
        port: REDIS_PORT,
    },
});

client.on("error", (err) => console.log("Redis Client Error", err));
await client.connect();
```

### Caching Middleware
The application uses middleware to check if data exists in the cache before making an external API call:

```javascript
const cache = async (req, res, next) => {
    try {
        const { username } = req.params;
        const data = await client.get(username);

        if (data !== null) {
            console.log("Data retrieved from cache");
            res.send(setResponse(username, data));
        } else {
            next();
        }
    } catch (error) {
        console.error("Cache error:", error);
        next();
    }
};
```

### Storing Data in Cache
When data is fetched from the GitHub API, it's stored in Redis for future requests:

```javascript
await client.set(username, repos);
```

## Important Notes

1. The modern Redis client library uses Promises rather than callbacks.
2. Always include proper error handling for Redis operations.
3. Connect to Redis before starting your Express server to ensure the connection is established.
4. The Redis client needs the `socket` object to specify host and port in newer versions.

## API Endpoints

- `GET /` - Simple health check endpoint
- `GET /repos/:username` - Fetch GitHub repository count for a specific user (cached)

## Troubleshooting

If you encounter connection issues:
- Ensure Redis container is running: `docker ps | grep redis`
- Check Redis logs: `docker logs redis-container`
- Test direct connection: `docker exec -it redis-container redis-cli ping`

## License

MIT
