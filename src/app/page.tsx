"use client";

import { useContentStore } from "@/lib/store";
import { ContentGenerator } from "@/components/studio/content-generator";
import { ContentLibrary } from "@/components/studio/content-library";
import { BrandSettings } from "@/components/studio/brand-settings";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sparkles,
  Wand2,
  Calendar,
  Palette,
  LayoutGrid,
  Loader2,
  RefreshCw,
  Clock,
} from "lucide-react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
import { useRef, useState } from "react";
import { PLATFORM_CONFIG, Platform } from "@/lib/types";
import { toast } from "sonner";

type Tab = "generate" | "library" | "calendar" | "brand";

const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: "generate", label: "Generate", icon: Wand2 },
  { id: "library", label: "Library", icon: LayoutGrid },
  { id: "calendar", label: "Calendar", icon: Calendar },
  { id: "brand", label: "Brand", icon: Palette },
];

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function DockIcon({ 
  icon: Icon, 
  label, 
  isActive, 
  onClick, 
  mouseX 
}: { 
  icon: any; 
  label: string; 
  isActive: boolean; 
  onClick: () => void;
  mouseX: any;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const distance = useTransform(mouseX, (val: number) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const widthSync = useTransform(distance, [-150, 0, 150], [48, 64, 48]);
  const width = useSpring(widthSync, { mass: 0.1, stiffness: 150, damping: 12 });

  return (
    <motion.button
      ref={ref}
      style={{ width, height: width }}
      onClick={onClick}
      className={cn(
        "rounded-2xl flex items-center justify-center relative group transition-colors shrink-0",
        isActive 
          ? "bg-gradient-to-br from-pink-500 to-violet-600 shadow-[0_0_25px_rgba(236,72,153,0.5)]" 
          : "bg-white/5 hover:bg-white/10 border border-white/5"
      )}
    >
      <Icon className={cn("w-5 h-5 transition-colors", isActive ? "text-white" : "text-white/60 group-hover:text-white")} />
      <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-black/90 backdrop-blur-xl text-xs text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-white/10 shadow-xl">
        {label}
      </span>
      {isActive && (
        <span className="absolute -bottom-2.5 w-1 h-1 rounded-full bg-white shadow-[0_0_8px_white]" />
      )}
    </motion.button>
  );
}

// Content Calendar Component
function ContentCalendar() {
  const { brand } = useContentStore();
  const [isLoading, setIsLoading] = useState(false);
  const [calendarData, setCalendarData] = useState<{ day: string; platform: Platform; idea: string; time: string }[]>([]);

  const handleGenerateCalendar = async () => {
    setIsLoading(true);
    try {
      const platforms: Platform[] = ["instagram", "twitter", "linkedin", "tiktok"];
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "calendar",
          brand,
          platforms,
        }),
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.error);
      setCalendarData(result.data || []);
      toast.success("Weekly calendar generated!");
    } catch (error: any) {
      console.error("Failed to generate calendar:", error);
      toast.error(error.message || "Failed to generate calendar");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Content Calendar</h2>
          <p className="text-white/40">AI-generated weekly posting schedule for {brand.name}</p>
        </div>
        <Button 
          onClick={handleGenerateCalendar}
          disabled={isLoading}
          className="bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-600 hover:to-violet-700 text-white rounded-full px-6"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          Generate Week
        </Button>
      </div>

      {/* Calendar Grid */}
      {calendarData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-6">
          <div className="relative">
            <div className="absolute inset-0 bg-pink-500/20 blur-3xl rounded-full" />
            <Calendar className="w-20 h-20 relative text-white/20" />
          </div>
          <div className="text-center space-y-2 max-w-md">
            <h3 className="text-xl font-semibold text-white">No Calendar Yet</h3>
            <p className="text-white/40">
              Click &quot;Generate Week&quot; to create an AI-powered content schedule tailored to your brand.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3">
          {DAYS.map((day) => {
            const dayContent = calendarData.find(c => c.day.toLowerCase() === day.toLowerCase());
            const platformConfig = dayContent ? PLATFORM_CONFIG[dayContent.platform as keyof typeof PLATFORM_CONFIG] : null;
            
            return (
              <motion.div
                key={day}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-4 hover:bg-white/[0.06] transition-all min-h-[180px] flex flex-col"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-white/60 uppercase tracking-wider">{day.slice(0, 3)}</span>
                  {dayContent && (
                    <span className="text-lg">{platformConfig?.icon}</span>
                  )}
                </div>
                
                {dayContent ? (
                  <div className="flex-1 flex flex-col">
                    <Badge 
                      variant="outline" 
                      className="w-fit mb-2 text-[10px] border-white/10 text-white/60"
                    >
                      {platformConfig?.label}
                    </Badge>
                    <p className="text-sm text-white/80 flex-1 line-clamp-3">
                      {dayContent.idea}
                    </p>
                    <div className="flex items-center gap-1 mt-3 text-[10px] text-white/40">
                      <Clock className="w-3 h-3" />
                      {dayContent.time}
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <span className="text-white/20 text-sm">No post</span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Tips */}
      {calendarData.length > 0 && (
        <Card className="bg-pink-500/5 border-pink-500/20">
          <CardContent className="p-4">
            <p className="text-sm text-pink-300">
              <strong>💡 Pro tip:</strong> Regenerate to get fresh ideas, or click on a day to customize the content.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function Home() {
  const { activeTab, setActiveTab, brand } = useContentStore();
  const mouseX = useMotionValue(Infinity);

  const renderContent = () => {
    switch (activeTab) {
      case "generate":
        return <ContentGenerator />;
      case "library":
        return <ContentLibrary />;
      case "calendar":
        return <ContentCalendar />;
      case "brand":
        return <BrandSettings />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#030014] overflow-x-hidden selection:bg-pink-500/30">
      {/* Aurora Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-violet-500/15 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-pink-500/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/5 rounded-full blur-[200px]" />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#030014]/80 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-500 to-violet-600 flex items-center justify-center shadow-lg shadow-pink-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-white text-sm tracking-wide">AI CONTENT STUDIO</h1>
              <p className="text-[10px] text-white/40 tracking-wider uppercase">Figmenta / Labs</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
               <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-pink-500 to-purple-500 flex items-center justify-center text-[10px] font-bold text-white">
                    {brand.name[0]}
                  </div>
                  <span className="text-sm font-medium text-white">{brand.name}</span>
               </div>
               <Badge variant="secondary" className="bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border-amber-500/20">
                 PRO
               </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 pt-24 pb-32 max-w-7xl mx-auto px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, scale: 0.98, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 1.02, filter: "blur(10px)" }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Floating Dock Navigation */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
        <motion.div 
          onMouseMove={(e) => mouseX.set(e.pageX)}
          onMouseLeave={() => mouseX.set(Infinity)}
          className="flex items-end gap-3 px-4 py-3 rounded-[28px] bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] shadow-[0_0_60px_rgba(0,0,0,0.5)] ring-1 ring-white/5"
        >
          {TABS.map((tab) => (
            <DockIcon
              key={tab.id}
              icon={tab.icon}
              label={tab.label}
              isActive={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              mouseX={mouseX}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
}
