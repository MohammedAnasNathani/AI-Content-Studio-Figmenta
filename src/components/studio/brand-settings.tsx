"use client";

import { useState } from "react";
import { useContentStore } from "@/lib/store";
import { INDUSTRY_CONFIG, TONE_OPTIONS, Brand } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Save, Loader2, Palette, Users, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function BrandSettings() {
  const { brand, updateBrand } = useContentStore();
  const [isSaving, setIsSaving] = useState(false);
  
  const [name, setName] = useState(brand.name);
  const [industry, setIndustry] = useState(brand.industry);
  const [voiceDescription, setVoiceDescription] = useState(brand.voice_description);
  const [tone, setTone] = useState(brand.tone);
  const [targetAudience, setTargetAudience] = useState(brand.target_audience);
  const [keywords, setKeywords] = useState(brand.keywords.join(", "));
  const [primaryColor, setPrimaryColor] = useState(brand.colors.primary);
  const [secondaryColor, setSecondaryColor] = useState(brand.colors.secondary);
  const [accentColor, setAccentColor] = useState(brand.colors.accent);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    updateBrand({
      name,
      industry,
      voice_description: voiceDescription,
      tone,
      target_audience: targetAudience,
      keywords: keywords.split(",").map(k => k.trim()).filter(Boolean),
      colors: {
        primary: primaryColor,
        secondary: secondaryColor,
        accent: accentColor,
      },
    });
    
    setIsSaving(false);
    toast.success("Brand settings saved!");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Brand Identity */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-lg text-zinc-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-pink-400" />
            Brand Identity
          </CardTitle>
          <CardDescription>Define your brand's core identity for AI-powered content</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-zinc-300">Brand Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Brand Name"
                className="bg-zinc-800 border-zinc-700 text-zinc-100"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Industry</Label>
              <Select value={industry} onValueChange={(v) => setIndustry(v as Brand["industry"])}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800">
                  {(Object.keys(INDUSTRY_CONFIG) as Brand["industry"][]).map((ind) => (
                    <SelectItem key={ind} value={ind} className="text-zinc-300 focus:bg-zinc-800">
                      <span className="flex items-center gap-2">
                        {INDUSTRY_CONFIG[ind].icon} {INDUSTRY_CONFIG[ind].label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-zinc-300">Brand Voice Description</Label>
            <Textarea
              value={voiceDescription}
              onChange={(e) => setVoiceDescription(e.target.value)}
              placeholder="Describe how your brand communicates..."
              className="min-h-[100px] bg-zinc-800 border-zinc-700 text-zinc-100 resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-zinc-300">Tone</Label>
            <div className="flex flex-wrap gap-2">
              {TONE_OPTIONS.map((option) => (
                <Badge
                  key={option.value}
                  variant="outline"
                  onClick={() => setTone(option.value)}
                  className={cn(
                    "cursor-pointer transition-all",
                    tone === option.value
                      ? "bg-pink-500/20 text-pink-300 border-pink-500/50"
                      : "text-zinc-400 border-zinc-700 hover:border-zinc-600"
                  )}
                >
                  {option.label}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-zinc-500">
              {TONE_OPTIONS.find(t => t.value === tone)?.description}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Target Audience */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-lg text-zinc-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-pink-400" />
            Target Audience
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-zinc-300">Audience Description</Label>
            <Textarea
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="Describe your ideal customer..."
              className="min-h-[80px] bg-zinc-800 border-zinc-700 text-zinc-100 resize-none"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-300">Brand Keywords (comma-separated)</Label>
            <Input
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="luxury, self-care, glow, radiant..."
              className="bg-zinc-800 border-zinc-700 text-zinc-100"
            />
          </div>
        </CardContent>
      </Card>

      {/* Brand Colors */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-lg text-zinc-100 flex items-center gap-2">
            <Palette className="w-5 h-5 text-pink-400" />
            Brand Colors
          </CardTitle>
          <CardDescription>Colors influence AI content suggestions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-zinc-300">Primary</Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-12 h-10 rounded border border-zinc-700 bg-transparent cursor-pointer"
                />
                <Input
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="flex-1 bg-zinc-800 border-zinc-700 text-zinc-100 font-mono text-sm"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Secondary</Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-12 h-10 rounded border border-zinc-700 bg-transparent cursor-pointer"
                />
                <Input
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="flex-1 bg-zinc-800 border-zinc-700 text-zinc-100 font-mono text-sm"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Accent</Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-12 h-10 rounded border border-zinc-700 bg-transparent cursor-pointer"
                />
                <Input
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="flex-1 bg-zinc-800 border-zinc-700 text-zinc-100 font-mono text-sm"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Save Brand Settings
        </Button>
      </div>
    </motion.div>
  );
}
