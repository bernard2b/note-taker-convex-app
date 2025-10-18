import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

type NoteItemProps = {
  id: Id<"notes">;
  userId: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
};

export function NoteItem({
  id,
  userId,
  title,
  content,
  createdAt,
  updatedAt,
}: NoteItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [editContent, setEditContent] = useState(content);
  const [isDeleting, setIsDeleting] = useState(false);

  const updateNote = useMutation(api.notes.updateNote);
  const deleteNote = useMutation(api.notes.deleteNote);

  const handleSave = async () => {
    if (!editTitle.trim() || !editContent.trim()) return;

    try {
      await updateNote({
        userId,
        noteId: id,
        title: editTitle.trim(),
        content: editContent.trim(),
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update note:", error);
    }
  };

  const handleCancel = () => {
    setEditTitle(title);
    setEditContent(content);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this note?")) return;

    setIsDeleting(true);
    try {
      await deleteNote({ userId, noteId: id });
    } catch (error) {
      console.error("Failed to delete note:", error);
      setIsDeleting(false);
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  const contentPreview =
    content.length > 100 ? content.substring(0, 100) + "..." : content;

  if (isDeleting) {
    return (
      <div className="bg-gray-100 rounded-lg border border-gray-300 p-6 opacity-50">
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600" />
          <span className="ml-3 text-gray-600">Deleting...</span>
        </div>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="bg-white rounded-lg border-2 border-blue-500 p-6 shadow-md">
        <div className="space-y-4">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="Note title"
            className="w-full px-3 py-2 text-xl font-semibold border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
            autoFocus
          />
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            placeholder="Note content"
            rows={6}
            className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none resize-none"
          />
          <div className="flex items-center justify-between pt-2">
            <div className="text-sm text-gray-500">
              Created {formatDate(createdAt)}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => void handleSave()}
                disabled={!editTitle.trim() || !editContent.trim()}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-all cursor-pointer group hover:border-gray-300">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors flex-1 pr-4">
          {title}
        </h3>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            aria-label="Edit note"
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
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              void handleDelete();
            }}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            aria-label="Delete note"
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
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>

      <p className="text-gray-600 mb-4 line-clamp-2">{contentPreview}</p>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-4 text-gray-500">
          <span className="flex items-center gap-1">
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
            {formatDate(updatedAt)}
          </span>
          {createdAt !== updatedAt && (
            <span className="text-xs text-gray-400">
              (edited)
            </span>
          )}
        </div>
        <div className="text-xs text-gray-400">
          {new Date(updatedAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    </div>
  );
}

