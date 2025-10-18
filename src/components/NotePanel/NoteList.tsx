import { useState, useCallback } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { NoteItem } from "./NoteItem";
import { NoteForm } from "./NoteForm";
import { SearchBar } from "./SearchBar";

type NoteListProps = {
  userId: string;
};

export function NoteList({ userId }: NoteListProps) {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Use searchNotes when searching, listNotes otherwise
  const searchResults = useQuery(
    api.notes.searchNotes,
    searchTerm ? { userId, searchString: searchTerm } : "skip"
  );
  const allNotes = useQuery(
    api.notes.listNotes,
    !searchTerm ? { userId } : "skip"
  );
  
  // Determine which notes to display
  const notes = searchTerm ? searchResults : allNotes;
  
  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

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
      {/* Search Bar */}
      <SearchBar 
        onSearch={handleSearch}
        resultCount={searchTerm ? notes?.length : undefined}
      />

      {/* Create Note Button / Form Toggle */}
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
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
      {notes && notes.length > 0 ? (
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
      ) : searchTerm && notes ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
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
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No notes found
          </h3>
          <p className="text-gray-600">
            Try adjusting your search terms
          </p>
        </div>
      ) : null}
    </div>
  );
}

