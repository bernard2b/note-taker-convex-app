import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const addLog = mutation({
  args: {
    type: v.union(
      v.literal("query"),
      v.literal("mutation"),
      v.literal("subscription"),
      v.literal("error"),
    ),
    operation: v.string(),
    data: v.any(),
    executionTime: v.optional(v.number()),
    userId: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const now = Date.now();

    await ctx.db.insert("logs", {
      type: args.type,
      operation: args.operation,
      userId: args.userId,
      data: args.data,
      timestamp: now,
      executionTime: args.executionTime,
    });

    // Auto-cleanup: keep only the last 100 logs
    const allLogs = await ctx.db
      .query("logs")
      .withIndex("by_timestamp")
      .order("desc")
      .collect();

    if (allLogs.length > 100) {
      const logsToDelete = allLogs.slice(100);
      for (const log of logsToDelete) {
        await ctx.db.delete(log._id);
      }
    }

    return null;
  },
});

export const getLogs = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("logs"),
      _creationTime: v.number(),
      type: v.union(
        v.literal("query"),
        v.literal("mutation"),
        v.literal("subscription"),
        v.literal("error"),
      ),
      operation: v.string(),
      userId: v.optional(v.string()),
      data: v.any(),
      timestamp: v.number(),
      executionTime: v.optional(v.number()),
    }),
  ),
  handler: async (ctx, _args) => {
    const logs = await ctx.db
      .query("logs")
      .withIndex("by_timestamp")
      .order("desc")
      .take(100);

    return logs;
  },
});

export const getStats = query({
  args: {},
  returns: v.object({
    totalQueries: v.number(),
    totalMutations: v.number(),
    averageExecutionTime: v.number(),
    activeConnections: v.number(),
  }),
  handler: async (ctx, _args) => {
    const allLogs = await ctx.db
      .query("logs")
      .withIndex("by_timestamp")
      .order("desc")
      .take(100);

    let totalQueries = 0;
    let totalMutations = 0;
    let totalExecutionTime = 0;
    let executionTimeCount = 0;

    for (const log of allLogs) {
      if (log.type === "query") {
        totalQueries++;
      } else if (log.type === "mutation") {
        totalMutations++;
      }

      if (log.executionTime !== undefined) {
        totalExecutionTime += log.executionTime;
        executionTimeCount++;
      }
    }

    const averageExecutionTime =
      executionTimeCount > 0 ? totalExecutionTime / executionTimeCount : 0;

    // Get active connections from users table (users active in last 5 minutes)
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    const allUsers = await ctx.db.query("users").collect();
    const activeUsers = allUsers.filter(
      (user) => user.lastActive >= fiveMinutesAgo,
    );
    const activeConnections = activeUsers.length;

    return {
      totalQueries,
      totalMutations,
      averageExecutionTime,
      activeConnections,
    };
  },
});

export const clearLogs = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx, _args) => {
    const allLogs = await ctx.db.query("logs").collect();

    for (const log of allLogs) {
      await ctx.db.delete(log._id);
    }

    await ctx.db.insert("logs", {
      type: "mutation" as const,
      operation: "logs.clearLogs",
      userId: undefined,
      data: { message: "All logs cleared", deletedCount: allLogs.length },
      timestamp: Date.now(),
      executionTime: undefined,
    });

    return null;
  },
});
