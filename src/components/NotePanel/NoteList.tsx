import { useState } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { NoteItem } from "./NoteItem";
import { NoteForm } from "./NoteForm";

type NoteListProps = {
  userId: string;
};

export function NoteList({ userId }: NoteListProps) {
  const [showForm, setShowForm] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const notes = useQuery(api.notes.listNotes, { userId });
  const generateRandomNote = useAction(api.ai.generateRandomNote);

  const handleGenerateNote = async () => {
    setIsGenerating(true);
    try {
      await generateRandomNote({ userId });
    } catch (error) {
      console.error("Failed to generate note:", error);
      alert("Failed to generate note. Please check your OpenAI API key.");
    } finally {
      setIsGenerating(false);
    }
  };

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
  if (notes.length === 0 && !showForm) {
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
        <button
          onClick={() => setShowForm(true)}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg hover:scale-105 transform"
        >
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
      {/* Create Note Buttons */}
      {!showForm ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => setShowForm(true)}
            className="py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            Create New Note
          </button>
          <button
            onClick={() => void handleGenerateNote()}
            disabled={isGenerating}
            className="py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <svg
                  className="w-5 h-5 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Generating...
              </>
            ) : (
              <>
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
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
                AI Generate Note
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="animate-slide-in-up">
          <NoteForm
            userId={userId}
            onCancel={() => setShowForm(false)}
            onSuccess={() => setShowForm(false)}
          />
        </div>
      )}

      {/* Notes List */}
      {notes && notes.length > 0 && (
        notes.map((note, index) => (
          <div
            key={note._id}
            className="animate-slide-in-up"
            style={{
              animationDelay: `${(index + 1) * 50}ms`,
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
        ))
      )}
    </div>
  );
}

