"use client";

import { useState } from "react";
import { useContentStore } from "@/lib/store";
import { Platform, PLATFORM_CONFIG, GeneratedContent } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, Copy, Check, Wand2, Hash, Lightbulb } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export function ContentGenerator() {
  const { brand, selectedPlatform, setSelectedPlatform, isGenerating, setIsGenerating, addContent } = useContentStore();
  
  const [topic, setTopic] = useState("");
  const [generatedCaption, setGeneratedCaption] = useState("");
  const [generatedHashtags, setGeneratedHashtags] = useState<string[]>([]);
  const [contentIdeas, setContentIdeas] = useState<{ title: string; description: string; type: string }[]>([]);
  const [copied, setCopied] = useState(false);
  const [activeMode, setActiveMode] = useState<"caption" | "hashtags" | "ideas">("caption");

  // API call helper
  const callAI = async (action: string, extraData = {}) => {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action,
        brand,
        platform: selectedPlatform,
        topic,
        ...extraData
      }),
    });
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || "AI generation failed");
    }
    return result.data;
  };

  const handleGenerateCaption = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic or theme");
      return;
    }

    setIsGenerating(true);
    try {
      const data = await callAI("caption");
      setGeneratedCaption(data.caption);
      setGeneratedHashtags(data.hashtags || []);
      toast.success("Caption generated!");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to generate caption");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateHashtags = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic");
      return;
    }

    setIsGenerating(true);
    try {
      const data = await callAI("hashtags");
      setGeneratedHashtags(Array.isArray(data) ? data : []);
      toast.success("Hashtags generated!");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to generate hashtags");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateIdeas = async () => {
    setIsGenerating(true);
    try {
      const data = await callAI("ideas");
      setContentIdeas(Array.isArray(data) ? data : []);
      toast.success("Content ideas generated!");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to generate ideas");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveContent = () => {
    if (!generatedCaption) return;

    const newContent: GeneratedContent = {
      id: `content-${Date.now()}`,
      brand_id: brand.id,
      platform: selectedPlatform,
      content_type: "full_post",
      text: generatedCaption,
      hashtags: generatedHashtags,
      tone: brand.tone,
      engagement_tips: [],
      scheduled_at: null,
      status: "draft",
      created_at: new Date().toISOString(),
    };

    addContent(newContent);
    toast.success("Saved to library!");
  };

  const platformConfig = PLATFORM_CONFIG[selectedPlatform];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Input Section */}
      <div className="space-y-6">
        {/* Platform Selection */}
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-zinc-100">Platform</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(PLATFORM_CONFIG) as Platform[]).map((platform) => {
                const config = PLATFORM_CONFIG[platform];
                return (
                  <Button
                    key={platform}
                    variant="outline"
                    onClick={() => setSelectedPlatform(platform)}
                    className={cn(
                      "border-zinc-700 transition-all",
                      selectedPlatform === platform
                        ? "bg-gradient-to-r from-pink-500/20 to-purple-500/20 border-pink-500/50 text-white"
                        : "text-zinc-400 hover:text-zinc-100"
                    )}
                  >
                    <span className="mr-2">{config.icon}</span>
                    {config.label}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Generation Mode */}
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-zinc-100">Generate</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button
                variant={activeMode === "caption" ? "default" : "outline"}
                onClick={() => setActiveMode("caption")}
                className={activeMode === "caption" ? "bg-pink-600 hover:bg-pink-700" : "border-zinc-700"}
              >
                <Wand2 className="w-4 h-4 mr-2" />
                Caption
              </Button>
              <Button
                variant={activeMode === "hashtags" ? "default" : "outline"}
                onClick={() => setActiveMode("hashtags")}
                className={activeMode === "hashtags" ? "bg-pink-600 hover:bg-pink-700" : "border-zinc-700"}
              >
                <Hash className="w-4 h-4 mr-2" />
                Hashtags
              </Button>
              <Button
                variant={activeMode === "ideas" ? "default" : "outline"}
                onClick={() => setActiveMode("ideas")}
                className={activeMode === "ideas" ? "bg-pink-600 hover:bg-pink-700" : "border-zinc-700"}
              >
                <Lightbulb className="w-4 h-4 mr-2" />
                Ideas
              </Button>
            </div>

            {activeMode !== "ideas" && (
              <div className="space-y-2">
                <label className="text-sm text-zinc-400">Topic or Theme</label>
                <Textarea
                  placeholder="e.g., New product launch for our hydrating serum..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="min-h-[100px] bg-zinc-800 border-zinc-700 text-zinc-100"
                />
              </div>
            )}

            <Button
              onClick={
                activeMode === "caption"
                  ? handleGenerateCaption
                  : activeMode === "hashtags"
                  ? handleGenerateHashtags
                  : handleGenerateIdeas
              }
              disabled={isGenerating || (activeMode !== "ideas" && !topic.trim())}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              {isGenerating ? "Generating..." : `Generate ${activeMode === "caption" ? "Caption" : activeMode === "hashtags" ? "Hashtags" : "Ideas"}`}
            </Button>
          </CardContent>
        </Card>

        {/* Brand Info */}
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold">
                {brand.name[0]}
              </div>
              <div>
                <p className="font-medium text-zinc-100">{brand.name}</p>
                <p className="text-xs text-zinc-500">{brand.industry} • {brand.tone}</p>
              </div>
            </div>
            <p className="text-xs text-zinc-400 line-clamp-2">{brand.voice_description}</p>
          </CardContent>
        </Card>
      </div>

      {/* Output Section */}
      <div className="space-y-6">
        {/* Generated Caption */}
        <AnimatePresence mode="wait">
          {activeMode === "caption" && generatedCaption && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-zinc-100 flex items-center gap-2">
                      <span>{platformConfig.icon}</span>
                      Generated Caption
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopy(generatedCaption)}
                        className="border-zinc-700 text-zinc-300"
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSaveContent}
                        className="bg-pink-600 hover:bg-pink-700 text-white"
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
                    <p className="text-zinc-200 whitespace-pre-wrap">{generatedCaption}</p>
                  </div>
                  
                  <div className="text-xs text-zinc-500 flex justify-between">
                    <span>{generatedCaption.length} / {platformConfig.maxLength} characters</span>
                    <span>Platform: {platformConfig.label}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Generated Hashtags */}
        {generatedHashtags.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-zinc-100">Hashtags</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(generatedHashtags.map(h => `#${h}`).join(" "))}
                    className="border-zinc-700 text-zinc-300"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {generatedHashtags.map((tag, i) => (
                    <Badge
                      key={i}
                      variant="outline"
                      className="bg-pink-500/10 text-pink-300 border-pink-500/30 cursor-pointer hover:bg-pink-500/20"
                      onClick={() => handleCopy(`#${tag}`)}
                    >
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Content Ideas */}
        <AnimatePresence mode="wait">
          {activeMode === "ideas" && contentIdeas.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-zinc-100">Content Ideas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {contentIdeas.map((idea, i) => (
                    <div
                      key={i}
                      className="p-3 bg-zinc-800/50 rounded-lg border border-zinc-700 hover:border-pink-500/30 transition-colors cursor-pointer"
                      onClick={() => {
                        setTopic(idea.title);
                        setActiveMode("caption");
                      }}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <h4 className="font-medium text-zinc-200">{idea.title}</h4>
                        <Badge variant="outline" className="text-xs text-zinc-400 border-zinc-600">
                          {idea.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-zinc-400">{idea.description}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {!generatedCaption && generatedHashtags.length === 0 && contentIdeas.length === 0 && (
          <Card className="bg-zinc-900/50 border-zinc-800 border-dashed">
            <CardContent className="py-16 text-center">
              <Sparkles className="w-12 h-12 mx-auto mb-4 text-pink-400 opacity-50" />
              <h3 className="text-lg font-medium text-zinc-300 mb-2">Ready to Create</h3>
              <p className="text-zinc-500 max-w-sm mx-auto">
                Enter a topic and click generate to create AI-powered content for your {brand.name} brand
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
