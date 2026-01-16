// Brand configuration
export interface Brand {
    id: string;
    name: string;
    industry: "beauty" | "fashion" | "luxury" | "lifestyle";
    voice_description: string;
    tone: string;
    target_audience: string;
    colors: {
        primary: string;
        secondary: string;
        accent: string;
    };
    keywords: string[];
    created_at: string;
    updated_at: string;
}

// Content types
export type Platform = "instagram" | "tiktok" | "linkedin" | "twitter";
export type ContentType = "caption" | "hashtags" | "product_description" | "story_idea" | "full_post";

export interface GeneratedContent {
    id: string;
    brand_id: string;
    platform: Platform;
    content_type: ContentType;
    text: string;
    hashtags: string[];
    tone: string;
    engagement_tips: string[];
    scheduled_at: string | null;
    status: "draft" | "scheduled" | "published";
    created_at: string;
}

export interface ContentTemplate {
    id: string;
    name: string;
    description: string;
    platform: Platform;
    content_type: ContentType;
    prompt_template: string;
}

// Platform configuration
export const PLATFORM_CONFIG: Record<Platform, { label: string; icon: string; color: string; maxLength: number }> = {
    instagram: { label: "Instagram", icon: "📸", color: "bg-gradient-to-r from-purple-500 to-pink-500", maxLength: 2200 },
    tiktok: { label: "TikTok", icon: "🎵", color: "bg-black", maxLength: 150 },
    linkedin: { label: "LinkedIn", icon: "💼", color: "bg-blue-600", maxLength: 3000 },
    twitter: { label: "Twitter/X", icon: "🐦", color: "bg-zinc-900", maxLength: 280 },
};

export const INDUSTRY_CONFIG: Record<Brand["industry"], { label: string; icon: string; keywords: string[] }> = {
    beauty: {
        label: "Beauty & Skincare",
        icon: "💄",
        keywords: ["glow", "radiant", "flawless", "self-care", "natural", "beauty routine", "skincare secrets"]
    },
    fashion: {
        label: "Fashion & Style",
        icon: "👗",
        keywords: ["chic", "effortless", "timeless", "statement piece", "elevate", "style", "trend"]
    },
    luxury: {
        label: "Luxury & Premium",
        icon: "✨",
        keywords: ["exclusive", "exquisite", "craftsmanship", "heritage", "bespoke", "refined", "prestigious"]
    },
    lifestyle: {
        label: "Lifestyle & Wellness",
        icon: "🌿",
        keywords: ["mindful", "balance", "authentic", "curated", "elevated living", "wellness journey"]
    },
};

export const TONE_OPTIONS = [
    { value: "playful", label: "Playful & Fun", description: "Light-hearted, emoji-friendly" },
    { value: "sophisticated", label: "Sophisticated", description: "Elegant, refined language" },
    { value: "empowering", label: "Empowering", description: "Motivational, inspiring" },
    { value: "educational", label: "Educational", description: "Informative, expert tone" },
    { value: "conversational", label: "Conversational", description: "Friendly, relatable" },
    { value: "luxurious", label: "Luxurious", description: "Premium, aspirational" },
];

// Default brand for demo
export const DEFAULT_BRAND: Brand = {
    id: "brand-1",
    name: "Glow Beauty",
    industry: "beauty",
    voice_description: "We speak to modern women who value both efficacy and indulgence in their skincare routine. Our voice is confident, knowledgeable, and warmly encouraging.",
    tone: "sophisticated",
    target_audience: "Women aged 25-45 who invest in premium skincare and value science-backed results with a touch of luxury",
    colors: {
        primary: "#F5E6E0",
        secondary: "#C9A698",
        accent: "#8B5A5A",
    },
    keywords: ["radiant skin", "luxury skincare", "self-care ritual", "glowing complexion", "beauty science"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
};
