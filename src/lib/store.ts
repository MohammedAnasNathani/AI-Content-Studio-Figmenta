import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Brand, GeneratedContent, Platform, DEFAULT_BRAND } from "./types";

interface ContentStudioState {
    // Brand
    brand: Brand;
    isEditingBrand: boolean;

    // Generated Content
    generatedContents: GeneratedContent[];
    currentContent: GeneratedContent | null;

    // UI State
    selectedPlatform: Platform;
    isGenerating: boolean;
    activeTab: "generate" | "library" | "calendar" | "brand";

    // Actions
    setBrand: (brand: Brand) => void;
    updateBrand: (updates: Partial<Brand>) => void;
    setIsEditingBrand: (editing: boolean) => void;

    addContent: (content: GeneratedContent) => void;
    updateContent: (id: string, updates: Partial<GeneratedContent>) => void;
    deleteContent: (id: string) => void;
    setCurrentContent: (content: GeneratedContent | null) => void;

    setSelectedPlatform: (platform: Platform) => void;
    setIsGenerating: (generating: boolean) => void;
    setActiveTab: (tab: ContentStudioState["activeTab"]) => void;
}

// Sample generated contents for demo
const sampleContents: GeneratedContent[] = [
    {
        id: "content-1",
        brand_id: "brand-1",
        platform: "instagram",
        content_type: "full_post",
        text: "✨ Your skin deserves a moment of luxury every day. Our new Radiance Serum combines science-backed actives with pure botanical extracts for that lit-from-within glow.\n\nPro tip: Apply on damp skin for maximum absorption 💫\n\nReady to transform your routine? Link in bio.",
        hashtags: ["skincare", "glowingskin", "luxuryskincare", "radiantskin", "selfcare", "beautyroutine", "skincareobsessed"],
        tone: "sophisticated",
        engagement_tips: ["Post between 6-9 PM", "Respond to comments within 1 hour", "Add poll sticker to stories"],
        scheduled_at: null,
        status: "draft",
        created_at: new Date().toISOString(),
    },
    {
        id: "content-2",
        brand_id: "brand-1",
        platform: "tiktok",
        content_type: "caption",
        text: "POV: Your skincare finally starts working 🪄✨ #GlowUp",
        hashtags: ["skincaretiktok", "glowup", "beautytips", "skincareroutine"],
        tone: "playful",
        engagement_tips: ["Use trending sound", "Post at peak hours", "Engage with duets"],
        scheduled_at: null,
        status: "draft",
        created_at: new Date(Date.now() - 3600000).toISOString(),
    },
];

export const useContentStore = create<ContentStudioState>()(
    persist(
        (set, get) => ({
            // Initial state
            brand: DEFAULT_BRAND,
            isEditingBrand: false,
            generatedContents: sampleContents,
            currentContent: null,
            selectedPlatform: "instagram",
            isGenerating: false,
            activeTab: "generate",

            // Actions
            setBrand: (brand) => set({ brand }),

            updateBrand: (updates) => set((state) => ({
                brand: { ...state.brand, ...updates, updated_at: new Date().toISOString() },
            })),

            setIsEditingBrand: (isEditingBrand) => set({ isEditingBrand }),

            addContent: (content) => set((state) => ({
                generatedContents: [content, ...state.generatedContents],
            })),

            updateContent: (id, updates) => set((state) => ({
                generatedContents: state.generatedContents.map((c) =>
                    c.id === id ? { ...c, ...updates } : c
                ),
            })),

            deleteContent: (id) => set((state) => ({
                generatedContents: state.generatedContents.filter((c) => c.id !== id),
                currentContent: state.currentContent?.id === id ? null : state.currentContent,
            })),

            setCurrentContent: (currentContent) => set({ currentContent }),

            setSelectedPlatform: (selectedPlatform) => set({ selectedPlatform }),
            setIsGenerating: (isGenerating) => set({ isGenerating }),
            setActiveTab: (activeTab) => set({ activeTab }),
        }),
        {
            name: "content-studio-storage",
            partialize: (state) => ({
                brand: state.brand,
                generatedContents: state.generatedContents,
                selectedPlatform: state.selectedPlatform,
                activeTab: state.activeTab,
            }),
        }
    )
);
