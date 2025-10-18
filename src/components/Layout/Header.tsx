import { UserSwitcher } from "../Auth";

type User = {
  _id: string;
  username: string;
  displayName: string;
  lastActive: number;
};

type Stats = {
  totalQueries: number;
  totalMutations: number;
  averageExecutionTime: number;
  activeConnections: number;
};

type HeaderProps = {
  currentUser: User;
  activeUsers: Array<User>;
  stats?: Stats;
  isConnected: boolean;
  onSwitchUser: (username: string) => void | Promise<void>;
  onLogout: () => void | Promise<void>;
};

export function Header({
  currentUser,
  activeUsers,
  stats,
  isConnected,
  onSwitchUser,
  onLogout,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto gap-4">
          {/* Left: App Title and Description */}
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex-shrink-0">
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
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-gray-900 truncate">
                Note Taker
              </h1>
              <p className="text-xs text-gray-500 hidden sm:block">
                Real-time collaborative note-taking
              </p>
            </div>
          </div>

          {/* Center: Stats Summary (hidden on small screens) */}
          {stats && (
            <div className="hidden md:flex items-center gap-4 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
              <StatItem
                icon={
                  <svg
                    className="w-4 h-4"
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
                }
                label="Queries"
                value={stats.totalQueries}
              />
              <div className="w-px h-6 bg-gray-300" />
              <StatItem
                icon={
                  <svg
                    className="w-4 h-4"
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
                }
                label="Mutations"
                value={stats.totalMutations}
              />
              <div className="w-px h-6 bg-gray-300" />
              <StatItem
                icon={
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                }
                label="Avg Time"
                value={`${stats.averageExecutionTime.toFixed(1)}ms`}
              />
            </div>
          )}

          {/* Right: Connection Status and User Switcher */}
          <div className="flex items-center gap-4">
            {/* Connection Status */}
            <ConnectionStatus isConnected={isConnected} />

            {/* User Switcher */}
            <UserSwitcher
              currentUser={currentUser}
              activeUsers={activeUsers}
              onSwitchUser={onSwitchUser}
              onLogout={onLogout}
            />
          </div>
        </div>
      </div>
    </header>
  );
}

function StatItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="text-gray-400">{icon}</div>
      <div>
        <div className="text-xs font-medium text-gray-500">{label}</div>
        <div className="text-sm font-semibold text-gray-900">{value}</div>
      </div>
    </div>
  );
}

function ConnectionStatus({ isConnected }: { isConnected: boolean }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
      <div className="relative">
        <div
          className={`w-2 h-2 rounded-full ${
            isConnected ? "bg-green-500" : "bg-red-500"
          }`}
        />
        {isConnected && (
          <div className="absolute inset-0 w-2 h-2 rounded-full bg-green-500 animate-ping opacity-75" />
        )}
      </div>
      <span className="text-xs font-medium text-gray-700 hidden sm:inline">
        {isConnected ? "Connected" : "Disconnected"}
      </span>
    </div>
  );
}

