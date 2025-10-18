import { useState, useRef, useEffect } from "react";

type User = {
  _id: string;
  username: string;
  displayName: string;
  lastActive: number;
};

type UserSwitcherProps = {
  currentUser: User;
  activeUsers: Array<User>;
  onSwitchUser: (username: string) => void | Promise<void>;
  onLogout: () => void | Promise<void>;
};

export function UserSwitcher({
  currentUser,
  activeUsers,
  onSwitchUser,
  onLogout,
}: UserSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const otherUsers = activeUsers.filter(
    (user) => user.username !== currentUser.username,
  );

  const handleSwitchUser = (username: string) => {
    void Promise.resolve(onSwitchUser(username));
    setIsOpen(false);
  };

  const handleLogout = () => {
    void Promise.resolve(onLogout());
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
          {currentUser.displayName.charAt(0).toUpperCase()}
        </div>
        <div className="text-left">
          <div className="text-sm font-medium text-gray-900">
            {currentUser.displayName}
          </div>
          <div className="text-xs text-gray-500">@{currentUser.username}</div>
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50">
          {/* Current User Section */}
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Current User
            </p>
            <div className="mt-2 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                {currentUser.displayName.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {currentUser.displayName}
                </div>
                <div className="text-xs text-gray-500">
                  @{currentUser.username}
                </div>
              </div>
            </div>
          </div>

          {/* Other Active Users */}
          {otherUsers.length > 0 && (
            <div className="py-2 border-b border-gray-200">
              <div className="px-4 py-2">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Switch to
                </p>
              </div>
              {otherUsers.map((user) => (
                <button
                  key={user._id}
                  onClick={() => handleSwitchUser(user.username)}
                  className="w-full px-4 py-2 flex items-center gap-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white font-semibold text-sm">
                    {user.displayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left flex-1">
                    <div className="text-sm font-medium text-gray-900">
                      {user.displayName}
                    </div>
                    <div className="text-xs text-gray-500">@{user.username}</div>
                  </div>
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              ))}
            </div>
          )}

          {/* Logout Button */}
          <div className="py-2">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 flex items-center gap-3 text-red-600 hover:bg-red-50 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span className="text-sm font-medium">Log Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

