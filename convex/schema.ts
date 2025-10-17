import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// The schema is entirely optional.
// You can delete this file (schema.ts) and the
// app will continue to work.
// The schema provides more precise TypeScript types.
export default defineSchema({
  numbers: defineTable({
    value: v.number(),
  }),

  users: defineTable({
    username: v.string(),
    displayName: v.string(),
    lastActive: v.number(),
  }).index("by_username", ["username"]),

  notes: defineTable({
    userId: v.string(),
    title: v.string(),
    content: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user_id", ["userId"]),

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
