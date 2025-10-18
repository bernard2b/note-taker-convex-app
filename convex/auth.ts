import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

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
    const startTime = Date.now();
    const now = Date.now();

    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .unique();

    let user;
    let isNewUser = false;

    if (existingUser) {
      await ctx.db.patch(existingUser._id, {
        lastActive: now,
      });

      const updatedUser = await ctx.db.get(existingUser._id);
      if (!updatedUser) {
        throw new Error("Failed to update user");
      }
      user = updatedUser;
    } else {
      const userId = await ctx.db.insert("users", {
        username: args.username,
        displayName: args.username,
        lastActive: now,
      });

      const newUser = await ctx.db.get(userId);
      if (!newUser) {
        throw new Error("Failed to create user");
      }
      user = newUser;
      isNewUser = true;
    }

    const executionTime = Date.now() - startTime;

    // Log the operation
    await ctx.scheduler.runAfter(0, api.logs.addLog, {
      type: "mutation",
      operation: "auth.loginDemoUser",
      userId: args.username,
      data: {
        username: args.username,
        isNewUser,
      },
      executionTime,
    });

    return user;
  },
});

export const logoutUser = mutation({
  args: {
    username: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const startTime = Date.now();

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

    const executionTime = Date.now() - startTime;

    // Log the operation
    await ctx.scheduler.runAfter(0, api.logs.addLog, {
      type: "mutation",
      operation: "auth.logoutUser",
      userId: args.username,
      data: {
        username: args.username,
      },
      executionTime,
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
