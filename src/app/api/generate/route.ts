import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

// Initialize Gemini - use gemini-2.5-flash as per user request
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action, brand, platform, topic, platforms } = body;

        console.log(`[AI API] Action: ${action}, Topic: ${topic || "N/A"}`);

        let prompt = "";
        let result;

        switch (action) {
            case "caption":
                prompt = `You are an expert social media content creator.
        
BRAND: ${brand.name} (${brand.industry})
VOICE: ${brand.voice_description} (Tone: ${brand.tone})
TARGET: ${brand.target_audience}

Create a ${platform} caption about: "${topic}"

Requirements:
- Engaging and on-brand
- Use emojis appropriately
- Include 5-10 relevant hashtags

OUTPUT JSON ONLY (no markdown):
{"caption": "Your caption here", "hashtags": ["tag1", "tag2"]}`;
                break;

            case "hashtags":
                prompt = `Generate 15 trending hashtags for a ${brand.industry} brand post about "${topic}".
Brand: ${brand.name}

Mix: 5 popular, 5 niche, 5 brand-specific.

OUTPUT JSON ARRAY ONLY (no markdown): ["tag1", "tag2", "tag3"]`;
                break;

            case "ideas":
                prompt = `Generate 5 content ideas for ${brand.name} on ${platform}.
Voice: ${brand.voice_description}

OUTPUT JSON ARRAY ONLY (no markdown):
[{"title": "...", "description": "...", "type": "Educational"}]`;
                break;

            case "calendar":
                const platformList = platforms?.join(",") || "instagram,twitter,linkedin";
                prompt = `Create a 7-day content calendar for ${brand.name}.
Target: ${brand.target_audience}

For Monday through Sunday, suggest a platform (${platformList}), a content idea, and best posting time.

OUTPUT JSON ARRAY ONLY (no markdown):
[{"day": "Monday", "platform": "instagram", "idea": "...", "time": "9:00 AM"}]`;
                break;

            default:
                return NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }

        const response = await model.generateContent(prompt);
        const text = response.response.text();

        // Clean up the response
        const cleaned = text
            .replace(/```json\n?/g, "")
            .replace(/\n?```/g, "")
            .trim();

        console.log(`[AI API] Raw response length: ${text.length}`);

        try {
            const parsed = JSON.parse(cleaned);
            return NextResponse.json({ success: true, data: parsed });
        } catch (parseError) {
            console.error("[AI API] JSON parse error:", parseError);
            console.error("[AI API] Raw text:", cleaned.substring(0, 500));
            return NextResponse.json({
                success: false,
                error: "Failed to parse AI response",
                raw: cleaned.substring(0, 200)
            }, { status: 500 });
        }

    } catch (error: any) {
        console.error("[AI API] Generation error:", error);
        return NextResponse.json({
            success: false,
            error: error.message || "AI generation failed"
        }, { status: 500 });
    }
}
