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
              <h2 className="text-2xl font-bold text-gray-900">All Notes</h2>
              <p className="text-gray-600 mt-1">
                Your workspace: <span className="font-medium text-blue-600">{workspace}</span>
                <span className="text-gray-400 mx-2">•</span>
                <span className="text-sm text-gray-500">View all, edit your workspace</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                <svg className="w-4 h-4 inline-block mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Can Edit
              </div>
              <div className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
                <svg className="w-4 h-4 inline-block mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
                View All
              </div>
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
