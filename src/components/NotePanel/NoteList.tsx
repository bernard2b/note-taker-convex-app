import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { NoteItem } from "./NoteItem";

type NoteListProps = {
  userId: string;
};

export function NoteList({ userId }: NoteListProps) {
  // Convex useQuery provides real-time subscriptions automatically
  const notes = useQuery(api.notes.listNotes, { userId });

  // Loading state - skeleton loaders
  if (notes === undefined) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse"
          >
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-3" />
            <div className="h-4 bg-gray-200 rounded w-full mb-2" />
            <div className="h-4 bg-gray-200 rounded w-5/6 mb-4" />
            <div className="h-3 bg-gray-200 rounded w-32" />
          </div>
        ))}
      </div>
    );
  }

  // Empty state - user-friendly with helpful message
  if (notes.length === 0) {
    return (
      <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg border-2 border-dashed border-gray-300 animate-fade-in">
        <svg
          className="w-20 h-20 text-gray-400 mx-auto mb-4 animate-bounce-slow"
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
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No notes yet
        </h3>
        <p className="text-gray-600 mb-6 max-w-sm mx-auto">
          Start capturing your ideas! Create your first note to get started.
        </p>
        <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg hover:scale-105 transform">
          <span className="flex items-center gap-2">
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            Create Your First Note
          </span>
        </button>
      </div>
    );
  }

  // Notes list with animations - updates automatically via Convex real-time
  return (
    <div className="space-y-4">
      {notes.map((note, index) => (
        <div
          key={note._id}
          className="animate-slide-in-up"
          style={{
            animationDelay: `${index * 50}ms`,
            animationFillMode: "backwards",
          }}
        >
          <NoteItem
            id={note._id}
            userId={userId}
            title={note.title}
            content={note.content}
            createdAt={note.createdAt}
            updatedAt={note.updatedAt}
          />
        </div>
      ))}
    </div>
  );
}

