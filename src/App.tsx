import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { LoginScreen, UserSwitcher } from "./components/Auth";

export default function App() {
  const [username, setUsername] = useState<string | null>(null);

  const loginDemoUser = useMutation(api.auth.loginDemoUser);
  const logoutUser = useMutation(api.auth.logoutUser);
  const currentUser = useQuery(
    api.auth.getCurrentUser,
    username ? { username } : "skip",
  );
  const activeUsers = useQuery(api.auth.getActiveUsers) ?? [];

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
    <>
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Note Taker</h1>
          </div>
          <UserSwitcher
            currentUser={currentUser}
            activeUsers={activeUsers}
            onSwitchUser={handleSwitchUser}
            onLogout={handleLogout}
          />
        </div>
      </header>
      <main className="p-8 flex flex-col gap-16">
        <Content userId={username} />
      </main>
    </>
  );
}

function Content({ userId }: { userId: string }) {
  const notes = useQuery(api.notes.listNotes, { userId }) ?? [];

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900">Your Notes</h2>
        <p className="text-gray-600 mt-2">
          Welcome back! You have {notes.length} note{notes.length !== 1 ? "s" : ""}
        </p>
      </div>

      {notes.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
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
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No notes yet
          </h3>
          <p className="text-gray-600">Create your first note to get started!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {notes.map((note) => (
            <div
              key={note._id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {note.title}
              </h3>
              <p className="text-gray-600 mb-4">{note.content}</p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>
                  Updated: {new Date(note.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
