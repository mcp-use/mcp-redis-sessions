import { MCPServer, text, widget, object } from "mcp-use/server";
import { RedisSessionStore, RedisStreamManager } from "mcp-use/server";
import { createClient } from "redis";
import { z } from "zod";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

const redisClient = createClient({ url: REDIS_URL });
redisClient.on("error", (err) => console.error("Redis error:", err));
await redisClient.connect();

const sessionStore = new RedisSessionStore({
  client: redisClient,
  prefix: "mcp:session:",
  defaultTTL: 3600,
});

const streamManager = new RedisStreamManager({ client: redisClient });

const server = new MCPServer({
  name: "redis-sessions",
  title: "Redis Sessions",
  version: "1.0.0",
  description: "Redis-backed session persistence and distributed notifications",
  baseUrl: process.env.MCP_URL || "http://localhost:3000",
  sessionStore,
  streamManager,
});

server.tool(
  {
    name: "session-info",
    description:
      "Display current session details, active session count, and Redis connection status",
    schema: z.object({}),
    widget: {
      name: "session-panel",
      invoking: "Loading session info...",
      invoked: "Session info ready",
    },
  },
  async (_params, ctx) => {
    const sessionId = ctx.session?.sessionId ?? "unknown";
    const activeSessions = server.getActiveSessions().length;
    const redisConnected = redisClient.isOpen;

    return widget({
      props: { sessionId, activeSessions, redisConnected },
      output: text(
        `Session: ${sessionId.slice(0, 8)}… | Active: ${activeSessions} | Redis: ${redisConnected ? "connected" : "disconnected"}`
      ),
    });
  }
);

server.tool(
  {
    name: "broadcast",
    description: "Broadcast a message to all connected sessions",
    schema: z.object({
      message: z.string().describe("Message to broadcast"),
    }),
  },
  async ({ message }) => {
    const sessions = server.getActiveSessions();

    await server.sendNotification("custom/broadcast", {
      message,
      timestamp: new Date().toISOString(),
    });

    return text(
      `Broadcasted "${message}" to ${sessions.length} session${sessions.length !== 1 ? "s" : ""}`
    );
  }
);

server.tool(
  {
    name: "set-preference",
    description: "Set a user preference (stored in widget state)",
    schema: z.object({
      key: z.string().describe("Preference key"),
      value: z.string().describe("Preference value"),
    }),
  },
  async ({ key, value }) => {
    return text(`Preference "${key}" set to "${value}"`);
  }
);

server.tool(
  {
    name: "ping-redis",
    description: "Test the Redis connection with a PING command",
    schema: z.object({}),
  },
  async () => {
    try {
      const result = await redisClient.ping();
      return text(result);
    } catch (err: any) {
      return text(`Redis error: ${err.message ?? "connection failed"}`);
    }
  }
);

process.on("SIGTERM", async () => {
  await redisClient.quit();
  process.exit(0);
});

server.listen().then(() => console.log("Redis Sessions running"));
