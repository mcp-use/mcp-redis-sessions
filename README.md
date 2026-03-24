# Redis Sessions — Persistent sessions with Redis

<p>
  <a href="https://github.com/mcp-use/mcp-use">Built with <b>mcp-use</b></a>
  &nbsp;
  <a href="https://github.com/mcp-use/mcp-use">
    <img src="https://img.shields.io/github/stars/mcp-use/mcp-use?style=social" alt="mcp-use stars">
  </a>
</p>

Showcase of persistent server-side sessions using Redis. The session panel widget displays user preferences, visit counts, and session metadata. Cross-session broadcasting and user preference persistence via `ioredis`.

> **Note:** This template requires a running Redis instance. Set the `REDIS_URL` environment variable before starting.

## Features

- **Redis-backed sessions** — persistent state across reconnections
- **Session panel widget** — live session info with visit counter
- **Cross-session broadcast** — send messages to all connected clients
- **User preferences** — store and retrieve per-user settings
- **Redis health check** — ping Redis to verify connectivity

## Tools

| Tool | Description |
|------|-------------|
| `session-info` | Show current session details in a live panel widget |
| `broadcast` | Send a message to all connected sessions |
| `set-preference` | Store a user preference in the session |
| `ping-redis` | Check Redis connectivity |

## Available Widgets

| Widget | Preview |
|--------|---------|
| `session-panel` | *(requires Redis to render)* |

## Local development

```bash
git clone https://github.com/mcp-use/mcp-redis-sessions.git
cd mcp-redis-sessions
npm install

# Start Redis (Docker)
docker run -d -p 6379:6379 redis:alpine

# Start the server
REDIS_URL=redis://localhost:6379 npm run dev
```

## Deploy

```bash
# Set Redis URL as environment variable
npx mcp-use deploy
npx mcp-use deployments env set REDIS_URL redis://your-redis-host:6379
```

## Built with

- [mcp-use](https://github.com/mcp-use/mcp-use) — MCP server framework
- [ioredis](https://github.com/redis/ioredis) — Redis client for Node.js

## License

MIT
