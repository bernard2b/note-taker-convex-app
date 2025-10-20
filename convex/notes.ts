import { query, mutation, MutationCtx } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

// Helper function to update user's lastActive timestamp
async function updateUserActivity(ctx: MutationCtx, userId: string) {
  const user = await ctx.db
    .query("users")
    .withIndex("by_username", (q) => q.eq("username", userId))
    .unique();

  if (user) {
    await ctx.db.patch(user._id, { lastActive: Date.now() });
  }
}

export const listNotes = query({
  args: {
    workspace: v.string(),
  },
  returns: v.array(
    v.object({
      _id: v.id("notes"),
      _creationTime: v.number(),
      userId: v.string(),
      workspace: v.string(),
      title: v.string(),
      content: v.string(),
      createdAt: v.number(),
      updatedAt: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    const notes = await ctx.db
      .query("notes")
      .withIndex("by_workspace", (q) => q.eq("workspace", args.workspace))
      .order("desc")
      .collect();

    return notes.sort((a, b) => b.updatedAt - a.updatedAt);
  },
});

export const searchNotes = query({
  args: {
    workspace: v.string(),
    searchString: v.string(),
  },
  returns: v.array(
    v.object({
      _id: v.id("notes"),
      _creationTime: v.number(),
      userId: v.string(),
      workspace: v.string(),
      title: v.string(),
      content: v.string(),
      createdAt: v.number(),
      updatedAt: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    const searchLower = args.searchString.toLowerCase().trim();

    const allNotes = await ctx.db
      .query("notes")
      .withIndex("by_workspace", (q) => q.eq("workspace", args.workspace))
      .collect();

    const matchingNotes = allNotes.filter(
      (note) =>
        note.title.toLowerCase().includes(searchLower) ||
        note.content.toLowerCase().includes(searchLower),
    );

    return matchingNotes.sort((a, b) => b.updatedAt - a.updatedAt);
  },
});

export const createNote = mutation({
  args: {
    userId: v.string(),
    workspace: v.string(),
    title: v.string(),
    content: v.string(),
  },
  returns: v.object({
    _id: v.id("notes"),
    _creationTime: v.number(),
    userId: v.string(),
    workspace: v.string(),
    title: v.string(),
    content: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),
  handler: async (ctx, args) => {
    const startTime = Date.now();

    // Update user's lastActive timestamp
    await updateUserActivity(ctx, args.userId);

    const now = Date.now();
    const noteId = await ctx.db.insert("notes", {
      userId: args.userId,
      workspace: args.workspace,
      title: args.title,
      content: args.content,
      createdAt: now,
      updatedAt: now,
    });

    const note = await ctx.db.get(noteId);
    if (!note) {
      throw new Error("Failed to create note");
    }

    const executionTime = Date.now() - startTime;

    // Log the operation
    await ctx.scheduler.runAfter(0, api.logs.addLog, {
      type: "mutation",
      operation: "notes.createNote",
      userId: args.userId,
      data: {
        noteId: note._id,
        title: args.title,
        contentLength: args.content.length,
      },
      executionTime,
    });

    return note;
  },
});

export const updateNote = mutation({
  args: {
    userId: v.string(),
    workspace: v.string(),
    noteId: v.id("notes"),
    title: v.string(),
    content: v.string(),
  },
  returns: v.object({
    _id: v.id("notes"),
    _creationTime: v.number(),
    userId: v.string(),
    workspace: v.string(),
    title: v.string(),
    content: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),
  handler: async (ctx, args) => {
    const startTime = Date.now();

    // Update user's lastActive timestamp
    await updateUserActivity(ctx, args.userId);

    const existingNote = await ctx.db.get(args.noteId);
    if (!existingNote) {
      throw new Error("Note not found");
    }

    // Check if user is in the same workspace as the note
    if (existingNote.workspace !== args.workspace) {
      throw new Error("Unauthorized: Note belongs to a different workspace");
    }

    const now = Date.now();
    await ctx.db.patch(args.noteId, {
      title: args.title,
      content: args.content,
      updatedAt: now,
    });

    const updatedNote = await ctx.db.get(args.noteId);
    if (!updatedNote) {
      throw new Error("Failed to update note");
    }

    const executionTime = Date.now() - startTime;

    // Log the operation
    await ctx.scheduler.runAfter(0, api.logs.addLog, {
      type: "mutation",
      operation: "notes.updateNote",
      userId: args.userId,
      data: {
        noteId: args.noteId,
        title: args.title,
        contentLength: args.content.length,
        previousTitle: existingNote.title,
      },
      executionTime,
    });

    return updatedNote;
  },
});

export const deleteNote = mutation({
  args: {
    userId: v.string(),
    workspace: v.string(),
    noteId: v.id("notes"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const startTime = Date.now();

    // Update user's lastActive timestamp
    await updateUserActivity(ctx, args.userId);

    const existingNote = await ctx.db.get(args.noteId);
    if (!existingNote) {
      throw new Error("Note not found");
    }

    // Check if user is in the same workspace as the note
    if (existingNote.workspace !== args.workspace) {
      throw new Error("Unauthorized: Note belongs to a different workspace");
    }

    await ctx.db.delete(args.noteId);

    const executionTime = Date.now() - startTime;

    // Log the operation
    await ctx.scheduler.runAfter(0, api.logs.addLog, {
      type: "mutation",
      operation: "notes.deleteNote",
      userId: args.userId,
      data: {
        noteId: args.noteId,
        deletedTitle: existingNote.title,
        deletedContentLength: existingNote.content.length,
      },
      executionTime,
    });

    return null;
  },
});
