import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { LoginScreen } from "./components/Auth";
import { Header, SplitLayout } from "./components/Layout";
import { NoteList } from "./components/NotePanel";
import { LogViewer } from "./components/LogPanel";

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
  return <LogViewer />;
}
