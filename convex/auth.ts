import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const loginDemoUser = mutation({
  args: {
    username: v.string(),
  },
  returns: v.object({
    _id: v.id("users"),
    _creationTime: v.number(),
    username: v.string(),
    displayName: v.string(),
    lastActive: v.number(),
  }),
  handler: async (ctx, args) => {
    const now = Date.now();

    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .unique();

    if (existingUser) {
      await ctx.db.patch(existingUser._id, {
        lastActive: now,
      });

      const updatedUser = await ctx.db.get(existingUser._id);
      if (!updatedUser) {
        throw new Error("Failed to update user");
      }

      return updatedUser;
    }

    const userId = await ctx.db.insert("users", {
      username: args.username,
      displayName: args.username,
      lastActive: now,
    });

    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("Failed to create user");
    }

    return user;
  },
});

export const logoutUser = mutation({
  args: {
    username: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    await ctx.db.patch(user._id, {
      lastActive: fiveMinutesAgo,
    });

    return null;
  },
});

export const getCurrentUser = query({
  args: {
    username: v.string(),
  },
  returns: v.union(
    v.object({
      _id: v.id("users"),
      _creationTime: v.number(),
      username: v.string(),
      displayName: v.string(),
      lastActive: v.number(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .unique();

    return user || null;
  },
});

export const getActiveUsers = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("users"),
      _creationTime: v.number(),
      username: v.string(),
      displayName: v.string(),
      lastActive: v.number(),
    }),
  ),
  handler: async (ctx, _args) => {
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;

    const allUsers = await ctx.db.query("users").collect();

    const activeUsers = allUsers.filter(
      (user) => user.lastActive >= fiveMinutesAgo,
    );

    return activeUsers.sort((a, b) => b.lastActive - a.lastActive);
  },
});
