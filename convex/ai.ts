"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import OpenAI from "openai";
import { api } from "./_generated/api";

/**
 * Generate a random creative note using OpenAI API
 * This is an ACTION (not a mutation) because:
 * 1. It calls an external API (OpenAI)
 * 2. It's non-deterministic (generates different content each time)
 * 3. Actions can call mutations to save data
 */
export const generateRandomNote = action({
  args: {
    userId: v.string(),
  },
  returns: v.object({
    title: v.string(),
    content: v.string(),
  }),
  handler: async (ctx, args) => {
    const startTime = Date.now();

    // Check if API key is set BEFORE trying to create the client
    if (!process.env.OPENAI_API_KEY) {
      throw new Error(
        "OPENAI_API_KEY environment variable is not set. Please run: npx convex env set OPENAI_API_KEY your-api-key",
      );
    }

    // Initialize OpenAI client inside the handler
    // This ensures the API key is accessed at runtime, not at module load time
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Define creative note topics and styles
    const topics = [
      "a productivity tip",
      "a motivational quote with explanation",
      "a creative writing prompt",
      "a fun fact about science",
      "a mindfulness exercise",
      "a life hack for daily routine",
      "a book recommendation with summary",
      "a recipe for a simple dish",
      "a travel destination with highlights",
      "a coding best practice",
    ];

    // Randomly select a topic
    const randomTopic = topics[Math.floor(Math.random() * topics.length)];

    try {
      // Call OpenAI API to generate creative content
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a creative note-taking assistant. Generate helpful, interesting, and well-structured notes. Be concise but informative.",
          },
          {
            role: "user",
            content: `Generate a note about ${randomTopic}. Format it as JSON with two fields: "title" (a short catchy title, max 60 characters) and "content" (detailed content, 2-4 paragraphs). Make it practical and engaging.`,
          },
        ],
        temperature: 0.8, // Higher temperature for more creativity
        max_tokens: 500,
        response_format: { type: "json_object" },
      });

      // Parse the generated content
      const generatedContent = response.choices[0].message.content;
      if (!generatedContent) {
        throw new Error("No content generated from OpenAI");
      }

      const parsedNote = JSON.parse(generatedContent);
      const title = parsedNote.title || "Random Note";
      const content = parsedNote.content || "No content generated.";

      // Use a mutation to save the generated note to the database
      // This demonstrates the ACTION -> MUTATION pattern
      const noteId = await ctx.runMutation(api.notes.createNote, {
        userId: args.userId,
        title,
        content,
      });

      const executionTime = Date.now() - startTime;

      // Log the AI generation action
      await ctx.runMutation(api.logs.addLog, {
        type: "mutation",
        operation: "ai.generateRandomNote",
        userId: args.userId,
        data: {
          noteId,
          topic: randomTopic,
          model: "gpt-4o-mini",
          tokensUsed: response.usage?.total_tokens || 0,
        },
        executionTime,
      });

      return {
        title,
        content,
      };
    } catch (error) {
      // Log errors
      await ctx.runMutation(api.logs.addLog, {
        type: "error",
        operation: "ai.generateRandomNote",
        userId: args.userId,
        data: {
          error: error instanceof Error ? error.message : "Unknown error",
          topic: randomTopic,
        },
        executionTime: Date.now() - startTime,
      });

      throw new Error(
        `Failed to generate note: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  },
});
