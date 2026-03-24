import {
  McpUseProvider,
  useCallTool,
  useWidget,
  type WidgetMetadata,
} from "mcp-use/react";
import React, { useCallback, useState } from "react";
import "../styles.css";
import { propSchema, type SessionPanelProps } from "./types";

export const widgetMetadata: WidgetMetadata = {
  description: "Session dashboard with Redis status and broadcast controls",
  props: propSchema,
  exposeAsTool: false,
  metadata: {
    prefersBorder: true,
    invoking: "Loading session info...",
    invoked: "Session info ready",
  },
};

function StatusDot({ connected }: { connected: boolean }) {
  return (
    <span
      className={`inline-block w-2.5 h-2.5 rounded-full ${
        connected
          ? "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.4)]"
          : "bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.4)]"
      }`}
    />
  );
}

type PreferencesState = { preferences: Record<string, string> };

const SessionPanel: React.FC = () => {
  const { props, isPending, sendFollowUpMessage, state, setState } =
    useWidget<SessionPanelProps, PreferencesState>();

  const { callTool: broadcast, isPending: isBroadcasting } =
    useCallTool("broadcast");

  const [broadcastMsg, setBroadcastMsg] = useState("");
  const [prefKey, setPrefKey] = useState("");
  const [prefValue, setPrefValue] = useState("");

  const preferences = state?.preferences ?? {};

  const handleBroadcast = useCallback(() => {
    if (!broadcastMsg.trim()) return;
    broadcast({ message: broadcastMsg.trim() });
    setBroadcastMsg("");
  }, [broadcast, broadcastMsg]);

  const handleSetPreference = useCallback(() => {
    if (!prefKey.trim()) return;
    const updated = { ...preferences, [prefKey.trim()]: prefValue.trim() };
    setState({ preferences: updated });
    setPrefKey("");
    setPrefValue("");
  }, [preferences, prefKey, prefValue, setState]);

  if (isPending) {
    return (
      <McpUseProvider autoSize>
        <div className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-5 w-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Loading session info...
            </span>
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-10 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse"
              />
            ))}
          </div>
        </div>
      </McpUseProvider>
    );
  }

  const sessionId = props?.sessionId ?? "unknown";
  const activeSessions = props?.activeSessions ?? 0;
  const redisConnected = props?.redisConnected ?? false;

  return (
    <McpUseProvider autoSize>
      <div className="flex flex-col">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Session Dashboard
          </h3>
          <button
            onClick={() =>
              sendFollowUpMessage("Show me the current session info")
            }
            className="px-2.5 py-1 text-xs font-medium rounded-md border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Refresh
          </button>
        </div>

        <div className="p-4 space-y-5">
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3">
              <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                Session ID
              </p>
              <p
                className="text-xs font-mono text-gray-900 dark:text-gray-100 truncate"
                title={sessionId}
              >
                {sessionId.length > 12
                  ? `${sessionId.slice(0, 12)}…`
                  : sessionId}
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3">
              <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                Active Sessions
              </p>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-gray-900 dark:text-gray-100 tabular-nums">
                  {activeSessions}
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  live
                </span>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3">
              <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                Redis
              </p>
              <div className="flex items-center gap-2">
                <StatusDot connected={redisConnected} />
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  {redisConnected ? "Connected" : "Disconnected"}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Broadcast
            </h4>
            <div className="flex gap-2">
              <input
                type="text"
                value={broadcastMsg}
                onChange={(e) => setBroadcastMsg(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleBroadcast();
                }}
                placeholder="Type a message to broadcast..."
                className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
              <button
                onClick={handleBroadcast}
                disabled={!broadcastMsg.trim() || isBroadcasting}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {isBroadcasting ? (
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  "Send"
                )}
              </button>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Preferences
            </h4>
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              {Object.keys(preferences).length > 0 && (
                <table className="w-full">
                  <tbody>
                    {Object.entries(preferences).map(([key, value]) => (
                      <tr
                        key={key}
                        className="border-b border-gray-100 dark:border-gray-700/50 last:border-0"
                      >
                        <td className="px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300">
                          {key}
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400">
                          {value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              <div className="flex gap-2 p-2 border-t border-gray-100 dark:border-gray-700/50">
                <input
                  type="text"
                  value={prefKey}
                  onChange={(e) => setPrefKey(e.target.value)}
                  placeholder="Key"
                  className="flex-1 px-2 py-1 text-xs rounded border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
                <input
                  type="text"
                  value={prefValue}
                  onChange={(e) => setPrefValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSetPreference();
                  }}
                  placeholder="Value"
                  className="flex-1 px-2 py-1 text-xs rounded border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
                <button
                  onClick={handleSetPreference}
                  disabled={!prefKey.trim()}
                  className="px-2.5 py-1 text-xs font-medium rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Set
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </McpUseProvider>
  );
};

export default SessionPanel;
