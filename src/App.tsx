import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { LoginScreen } from "./components/Auth";
import { Header, SplitLayout } from "./components/Layout";
import { NoteList } from "./components/NotePanel";
import { LogViewer } from "./components/LogPanel";

export default function App() {
  const [username, setUsername] = useState<string | null>(null);
  const [workspace, setWorkspace] = useState<string | null>(null);

  const loginDemoUser = useMutation(api.auth.loginDemoUser);
  const logoutUser = useMutation(api.auth.logoutUser);
  const currentUser = useQuery(
    api.auth.getCurrentUser,
    username ? { username } : "skip",
  );
  const activeUsers = useQuery(
    api.auth.getActiveUsers,
    workspace ? { workspace } : "skip",
  ) ?? [];
  const stats = useQuery(api.logs.getStats);

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    const storedWorkspace = localStorage.getItem("workspace");
    if (storedUsername && storedWorkspace) {
      setUsername(storedUsername);
      setWorkspace(storedWorkspace);
      // Update user's lastActive timestamp on session restore
      void loginDemoUser({ username: storedUsername, workspace: storedWorkspace });
    }
  }, [loginDemoUser]);

  const handleLogin = async (newUsername: string, newWorkspace: string) => {
    await loginDemoUser({ username: newUsername, workspace: newWorkspace });
    setUsername(newUsername);
    setWorkspace(newWorkspace);
    localStorage.setItem("username", newUsername);
    localStorage.setItem("workspace", newWorkspace);
  };

  const handleLogout = async () => {
    if (username) {
      await logoutUser({ username });
    }
    setUsername(null);
    setWorkspace(null);
    localStorage.removeItem("username");
    localStorage.removeItem("workspace");
  };

  const handleSwitchUser = async (newUsername: string) => {
    if (!workspace) return;
    await loginDemoUser({ username: newUsername, workspace });
    setUsername(newUsername);
    localStorage.setItem("username", newUsername);
  };

  if (!username || !workspace || !currentUser) {
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
          left={<NotesPanel userId={username} workspace={workspace} />}
          right={<LogsPanel />}
        />
      </div>
    </div>
  );
}

function NotesPanel({ userId, workspace }: { userId: string; workspace: string }) {
  return (
    <div className="h-full bg-white p-6 overflow-auto">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Team Notes</h2>
              <p className="text-gray-600 mt-1">
                Collaborative workspace: <span className="font-medium text-blue-600">{workspace}</span>
              </p>
            </div>
            <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              <svg className="w-4 h-4 inline-block mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
              Shared
            </div>
          </div>
        </div>

        <NoteList userId={userId} workspace={workspace} />
      </div>
    </div>
  );
}

function LogsPanel() {
  return <LogViewer />;
}
