"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { Brand, Platform, PLATFORM_CONFIG, INDUSTRY_CONFIG } from "@/lib/types";

// Initialize Gemini on the server side
// Uses gemini-2.5-flash as requested by user
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

async function generateWithAI(prompt: string): Promise<string> {
    try {
        console.log(`[AI] Generating with model: gemini-2.5-flash. Key length: ${(process.env.GEMINI_API_KEY || "").length}`);
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("AI GENERATION ERROR:", error);
        // Log the full error object for Vercel logs
        console.dir(error, { depth: null });
        throw error;
    }
}

export async function generateCaptionAction(
    brand: Brand,
    platform: Platform,
    topic: string,
    includeHashtags: boolean = true
): Promise<{ caption: string; hashtags: string[] }> {
    const platformConfig = PLATFORM_CONFIG[platform];
    const industryConfig = INDUSTRY_CONFIG[brand.industry];

    const prompt = `You are an expert social media content creator.
  
BRAND: ${brand.name} (${industryConfig.label})
VOICE: ${brand.voice_description} (Tone: ${brand.tone})
TARGET: ${brand.target_audience}

TASK: Write a ${platformConfig.label} caption about: "${topic}"

RULES:
- Max ${platformConfig.maxLength} chars
- Match ${brand.tone} tone
- Use emojis
${includeHashtags ? "- Add 5-10 relevant hashtags" : ""}

OUTPUT JSON ONLY:
{
  "caption": "...",
  "hashtags": ["..."]
}`;

    try {
        const text = await generateWithAI(prompt);
        const cleaned = text.replace(/```json\n?|\n?```/g, "").trim();
        return JSON.parse(cleaned);
    } catch (e) {
        console.error("Caption Error:", e);
        return { caption: "Error generating caption. Please check logs.", hashtags: [] };
    }
}

export async function generateHashtagsAction(
    brand: Brand,
    platform: Platform,
    topic: string
): Promise<string[]> {
    const prompt = `Generate 15 trending hashtags for a ${brand.industry} brand post about "${topic}".
  Brand: ${brand.name}
  
  Mix: 5 popular, 5 niche, 5 brand-specific.
  
  OUTPUT JSON ARRAY ONLY: ["tag1", "tag2"]`;

    try {
        const text = await generateWithAI(prompt);
        const cleaned = text.replace(/```json\n?|\n?```/g, "").trim();
        return JSON.parse(cleaned);
    } catch (e) {
        console.error("Hashtag Error:", e);
        return [];
    }
}

export async function generateIdeasAction(
    brand: Brand,
    platform: Platform
): Promise<{ title: string; description: string; type: string }[]> {
    const prompt = `Generate 5 structured content ideas for ${brand.name} on ${PLATFORM_CONFIG[platform].label}.
  Voice: ${brand.voice_description}
  
  OUTPUT JSON ARRAY ONLY:
  [ { "title": "...", "description": "...", "type": "Educational/Viral/Promo" } ]`;

    try {
        const text = await generateWithAI(prompt);
        const cleaned = text.replace(/```json\n?|\n?```/g, "").trim();
        return JSON.parse(cleaned);
    } catch (e) {
        console.error("Idea Error:", e);
        return [];
    }
}

export async function generateCalendarAction(
    brand: Brand,
    platforms: Platform[]
): Promise<{ day: string; platform: Platform; idea: string; time: string }[]> {
    const prompt = `Create a 7-day content calendar for ${brand.name}.
  Target Audience: ${brand.target_audience}
  
  For each day (Mon-Sun), pick a platform (${platforms.join(",")}), a topic, and a time.
  
  OUTPUT JSON ARRAY ONLY:
  [ { "day": "Monday", "platform": "instagram", "idea": "...", "time": "9:00 AM" } ]`;

    try {
        const text = await generateWithAI(prompt);
        const cleaned = text.replace(/```json\n?|\n?```/g, "").trim();
        return JSON.parse(cleaned);
    } catch (e) {
        console.error("Calendar Error:", e);
        return [];
    }
}
