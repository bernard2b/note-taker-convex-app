import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { LogEntry } from "./LogEntry";
import { LogStats } from "./LogStats";

export function LogViewer() {
  const [isPaused, setIsPaused] = useState(false);
  const [displayedLogs, setDisplayedLogs] = useState<any[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Subscribe to logs
  const liveLogs = useQuery(api.logs.getLogs);
  const clearLogs = useMutation(api.logs.clearLogs);

  // Update displayed logs when not paused
  useEffect(() => {
    if (!isPaused && liveLogs) {
      setDisplayedLogs(liveLogs);
    }
  }, [liveLogs, isPaused]);

  // Auto-scroll to bottom when logs update
  useEffect(() => {
    if (!isPaused) {
      logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [displayedLogs, isPaused]);

  const handlePauseToggle = () => {
    if (isPaused && liveLogs) {
      // Resume: update to latest logs
      setDisplayedLogs(liveLogs);
    }
    setIsPaused(!isPaused);
  };

  const handleExportLogs = () => {
    const logsText = displayedLogs
      .map((log) => {
        const timestamp = new Date(log.timestamp).toISOString();
        const user = log.userId ? ` | User: ${log.userId}` : "";
        const execTime = log.executionTime ? ` | ${log.executionTime}ms` : "";
        return `[${timestamp}] ${log.type.toUpperCase()} | ${log.operation}${user}${execTime}`;
      })
      .join("\n");

    const blob = new Blob([logsText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `logs-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClearLogs = async () => {
    if (!confirm("Are you sure you want to clear all logs?")) return;
    
    try {
      await clearLogs();
      setDisplayedLogs([]);
    } catch (error) {
      console.error("Failed to clear logs:", error);
    }
  };

  if (!displayedLogs) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-3" />
          <p className="text-gray-600">Loading logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header with Controls */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Activity Logs</h3>
            <p className="text-sm text-gray-600 mt-0.5">
              {displayedLogs.length} log{displayedLogs.length !== 1 ? "s" : ""}
              {isPaused && " (paused)"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Pause/Resume Button */}
            <button
              onClick={handlePauseToggle}
              className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium ${
                isPaused
                  ? "bg-green-100 text-green-700 hover:bg-green-200"
                  : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
              }`}
              title={isPaused ? "Resume" : "Pause"}
            >
              {isPaused ? (
                <>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Resume
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Pause
                </>
              )}
            </button>

            {/* Export Button */}
            <button
              onClick={handleExportLogs}
              disabled={displayedLogs.length === 0}
              className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              title="Export logs"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Export
            </button>

            {/* Clear Button */}
            <button
              onClick={() => void handleClearLogs()}
              disabled={displayedLogs.length === 0}
              className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center gap-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              title="Clear all logs"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Logs Container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto p-4 space-y-3"
      >
        {/* Stats Section */}
        <LogStats />

        {displayedLogs.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg border-2 border-dashed border-gray-300">
            <svg
              className="w-16 h-16 text-gray-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No logs yet</h3>
            <p className="text-gray-600">Activity logs will appear here</p>
          </div>
        ) : (
          <>
            {displayedLogs.map((log) => (
              <LogEntry
                key={log._id}
                id={log._id}
                type={log.type}
                operation={log.operation}
                userId={log.userId}
                data={log.data}
                timestamp={log.timestamp}
                executionTime={log.executionTime}
              />
            ))}
            <div ref={logsEndRef} />
          </>
        )}
      </div>
    </div>
  );
}

