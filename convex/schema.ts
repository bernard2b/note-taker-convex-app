import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Database schema for the Note Taker application
 * Defines tables for users, notes, and activity logs
 */
export default defineSchema({
  users: defineTable({
    username: v.string(),
    displayName: v.string(),
    workspace: v.string(),
    lastActive: v.number(),
  })
    .index("by_username", ["username"])
    .index("by_workspace", ["workspace"]),

  notes: defineTable({
    userId: v.string(),
    workspace: v.string(),
    title: v.string(),
    content: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_id", ["userId"])
    .index("by_workspace", ["workspace"]),

  logs: defineTable({
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
  }).index("by_timestamp", ["timestamp"]),
});
