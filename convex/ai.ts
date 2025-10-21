"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";
import { api } from "./_generated/api";

// Define creative note topics
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

/**
 * Generate note content using OpenAI API
 */
async function generateWithOpenAI(
  randomTopic: string,
): Promise<{ title: string; content: string; model: string; tokensUsed: number }> {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

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
    temperature: 0.8,
    max_tokens: 500,
    response_format: { type: "json_object" },
  });

  const generatedContent = response.choices[0].message.content;
  if (!generatedContent) {
    throw new Error("No content generated from OpenAI");
  }

  const parsedNote = JSON.parse(generatedContent);
  return {
    title: parsedNote.title || "Random Note",
    content: parsedNote.content || "No content generated.",
    model: "gpt-4o-mini",
    tokensUsed: response.usage?.total_tokens || 0,
  };
}

/**
 * Generate note content using Google Gemini API
 */
async function generateWithGemini(
  randomTopic: string,
): Promise<{ title: string; content: string; model: string; tokensUsed: number }> {
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });

  const model = "gemini-2.5-pro";
  const contents = [
    {
      role: "user",
      parts: [
        {
          text: `You are a creative note-taking assistant. Generate helpful, interesting, and well-structured notes. Be concise but informative.

Generate a note about ${randomTopic}. Format it as JSON with two fields: "title" (a short catchy title, max 60 characters) and "content" (detailed content, 2-4 paragraphs). Make it practical and engaging.

Return ONLY valid JSON, no additional text.`,
        },
      ],
    },
  ];

  const response = await ai.models.generateContentStream({
    model,
    contents,
  });

  let fullText = "";
  for await (const chunk of response) {
    if (chunk.text) {
      fullText += chunk.text;
    }
  }

  if (!fullText) {
    throw new Error("No content generated from Gemini");
  }

  // Extract JSON from the response (might be wrapped in markdown code blocks)
  let jsonText = fullText.trim();
  if (jsonText.startsWith("```json")) {
    jsonText = jsonText.replace(/^```json\s*/, "").replace(/\s*```$/, "");
  } else if (jsonText.startsWith("```")) {
    jsonText = jsonText.replace(/^```\s*/, "").replace(/\s*```$/, "");
  }

  const parsedNote = JSON.parse(jsonText);
  return {
    title: parsedNote.title || "Random Note",
    content: parsedNote.content || "No content generated.",
    model: "gemini-2.5-pro",
    tokensUsed: 0, // Gemini doesn't provide token usage in streaming response
  };
}

/**
 * Generate a random creative note using OpenAI or Gemini API
 * This is an ACTION (not a mutation) because:
 * 1. It calls an external API (OpenAI or Gemini)
 * 2. It's non-deterministic (generates different content each time)
 * 3. Actions can call mutations to save data
 */
export const generateRandomNote = action({
  args: {
    userId: v.string(),
    workspace: v.string(),
  },
  returns: v.object({
    title: v.string(),
    content: v.string(),
  }),
  handler: async (ctx, args) => {
    const startTime = Date.now();

    // Randomly select a topic
    const randomTopic = topics[Math.floor(Math.random() * topics.length)];

    // Determine which AI provider to use
    const useOpenAI = !!process.env.OPENAI_API_KEY;
    const useGemini = !!process.env.GEMINI_API_KEY;

    if (!useOpenAI && !useGemini) {
      throw new Error(
        "No AI API key is set. Please set either OPENAI_API_KEY or GEMINI_API_KEY environment variable. " +
          "Run: npx convex env set OPENAI_API_KEY your-api-key OR npx convex env set GEMINI_API_KEY your-api-key",
      );
    }

    try {
      // Generate content using available AI provider
      let result: { title: string; content: string; model: string; tokensUsed: number };
      
      if (useOpenAI) {
        result = await generateWithOpenAI(randomTopic);
      } else {
        result = await generateWithGemini(randomTopic);
      }

      const { title, content, model, tokensUsed } = result;

      // Use a mutation to save the generated note to the database
      // This demonstrates the ACTION -> MUTATION pattern
      const noteId = await ctx.runMutation(api.notes.createNote, {
        userId: args.userId,
        workspace: args.workspace,
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
          model,
          tokensUsed,
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
