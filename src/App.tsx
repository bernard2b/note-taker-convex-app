import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { LoginScreen } from "./components/Auth";
import { Header, SplitLayout } from "./components/Layout";
import { NoteList } from "./components/NotePanel";

export default function App() {
  const [username, setUsername] = useState<string | null>(null);

  const loginDemoUser = useMutation(api.auth.loginDemoUser);
  const logoutUser = useMutation(api.auth.logoutUser);
  const currentUser = useQuery(
    api.auth.getCurrentUser,
    username ? { username } : "skip",
  );
  const activeUsers = useQuery(api.auth.getActiveUsers) ?? [];
  const stats = useQuery(api.logs.getStats);

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  const handleLogin = async (newUsername: string) => {
    await loginDemoUser({ username: newUsername });
    setUsername(newUsername);
    localStorage.setItem("username", newUsername);
  };

  const handleLogout = async () => {
    if (username) {
      await logoutUser({ username });
    }
    setUsername(null);
    localStorage.removeItem("username");
  };

  const handleSwitchUser = async (newUsername: string) => {
    await loginDemoUser({ username: newUsername });
    setUsername(newUsername);
    localStorage.setItem("username", newUsername);
  };

  if (!username || !currentUser) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-50">
      <Header
        currentUser={currentUser}
        activeUsers={activeUsers}
        stats={stats}
        isConnected={true}
        onSwitchUser={handleSwitchUser}
        onLogout={handleLogout}
      />
      <div className="flex-1 overflow-hidden">
        <SplitLayout
          left={<NotesPanel userId={username} />}
          right={<LogsPanel />}
        />
      </div>
    </div>
  );
}

function NotesPanel({ userId }: { userId: string }) {
  return (
    <div className="h-full bg-white p-6 overflow-auto">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Your Notes</h2>
          <p className="text-gray-600 mt-1">
            Manage and organize your thoughts
          </p>
        </div>

        <NoteList userId={userId} />
      </div>
    </div>
  );
}

function LogsPanel() {
  const logs = useQuery(api.logs.getLogs) ?? [];

  return (
    <div className="h-full bg-gray-50 p-6 overflow-auto">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Activity Logs</h2>
          <p className="text-gray-600 mt-1">Recent operations and events</p>
        </div>

        {logs.length === 0 ? (
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
            <p className="text-gray-600">Activity will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <div
                key={log._id}
                className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          log.type === "error"
                            ? "bg-red-100 text-red-800"
                            : log.type === "mutation"
                              ? "bg-blue-100 text-blue-800"
                              : log.type === "query"
                                ? "bg-green-100 text-green-800"
                                : "bg-purple-100 text-purple-800"
                        }`}
                      >
                        {log.type}
                      </span>
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {log.operation}
                      </span>
                    </div>
                    {log.userId && (
                      <p className="text-xs text-gray-500">User: {log.userId}</p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-gray-500">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </p>
                    {log.executionTime && (
                      <p className="text-xs text-gray-400">{log.executionTime}ms</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
