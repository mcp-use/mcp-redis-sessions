import { z } from "zod";

export const propSchema = z.object({
  sessionId: z.string(),
  activeSessions: z.number(),
  redisConnected: z.boolean(),
});

export type SessionPanelProps = z.infer<typeof propSchema>;
