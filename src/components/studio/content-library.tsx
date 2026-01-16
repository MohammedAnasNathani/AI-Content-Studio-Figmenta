"use client";

import { useContentStore } from "@/lib/store";
import { PLATFORM_CONFIG, GeneratedContent } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Copy, Trash2, LayoutGrid, Sparkles } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export function ContentLibrary() {
  const { generatedContents, deleteContent, setActiveTab } = useContentStore();

  const handleCopy = (content: GeneratedContent) => {
    const fullText = content.text + "\n\n" + content.hashtags.map(h => `#${h}`).join(" ");
    navigator.clipboard.writeText(fullText);
    toast.success("Copied to clipboard!");
  };

  const handleDelete = (id: string) => {
    deleteContent(id);
    toast.success("Content deleted");
  };

  const groupedContents = generatedContents.reduce((acc, content) => {
    if (!acc[content.platform]) {
      acc[content.platform] = [];
    }
    acc[content.platform].push(content);
    return acc;
  }, {} as Record<string, GeneratedContent[]>);

  if (generatedContents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-center space-y-6">
        <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <LayoutGrid className="w-10 h-10 text-white/20 group-hover:text-pink-400 transition-colors" />
        </div>
        <div className="space-y-2 max-w-sm mx-auto">
          <h3 className="text-xl font-medium text-white">Library Empty</h3>
          <p className="text-white/40">
            Generate content to start building your personal brand archive.
          </p>
        </div>
        <Button
          onClick={() => setActiveTab("generate")}
          className="bg-white text-black hover:bg-white/90 rounded-full px-8"
        >
          Start Creating
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(Object.keys(PLATFORM_CONFIG) as Array<keyof typeof PLATFORM_CONFIG>).map((platform, i) => {
          const config = PLATFORM_CONFIG[platform];
          const count = groupedContents[platform]?.length || 0;
          return (
            <motion.div
              key={platform}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] p-5 rounded-2xl relative overflow-hidden group hover:bg-white/[0.06] transition-all shadow-xl"
            >
              <div className="relative z-10 flex flex-col items-center">
                <span className="text-2xl mb-2 opacity-80 group-hover:scale-110 transition-transform">{config.icon}</span>
                <p className="text-3xl font-bold text-white tracking-tight">{count}</p>
                <p className="text-xs font-medium text-white/40 uppercase tracking-widest mt-1">{config.label}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Masonry Grid */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <LayoutGrid className="w-5 h-5 text-pink-400" />
          <h2 className="text-xl font-bold text-white">Recent Creations</h2>
        </div>
        
        <ScrollArea className="h-[calc(100vh-400px)] pr-4 -mr-4">
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6">
            <AnimatePresence mode="popLayout">
              {generatedContents.map((content, i) => {
                const platformConfig = PLATFORM_CONFIG[content.platform];
                return (
                  <motion.div
                    key={content.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                    transition={{ delay: i * 0.05 }}
                    className="break-inside-avoid mb-6"
                  >
                    <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-5 hover:shadow-[0_0_40px_rgba(236,72,153,0.1)] hover:border-pink-500/30 transition-all duration-300 group">
                      {/* Card Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <span className="p-1.5 bg-white/5 rounded-lg text-lg">
                            {platformConfig.icon}
                          </span>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px] h-5 border-white/10 uppercase tracking-wider",
                              content.status === "draft" && "text-white/40 bg-white/5",
                              content.status === "scheduled" && "text-blue-300 bg-blue-500/10 border-blue-500/20",
                              content.status === "published" && "text-emerald-300 bg-emerald-500/10 border-emerald-500/20"
                            )}
                          >
                            {content.status}
                          </Badge>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleCopy(content)}
                            className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(content.id)}
                            className="p-1.5 rounded-lg hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Content Body */}
                      <div className="space-y-3">
                        <div className="relative">
                          <p className="text-sm leading-relaxed text-white/80 whitespace-pre-wrap font-sans">
                            {content.text}
                          </p>
                          <div className="absolute top-0 right-0 -mt-1 -mr-1">
                            <Sparkles className="w-3 h-3 text-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                          </div>
                        </div>

                        {/* Hashtags */}
                        {content.hashtags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-2">
                            {content.hashtags.map((tag, idx) => (
                              <span key={idx} className="text-xs text-pink-400 hover:text-pink-300 transition-colors cursor-pointer">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-white/30 uppercase tracking-widest font-medium">
                        <span>{formatDistanceToNow(new Date(content.created_at), { addSuffix: true })}</span>
                        <span>{content.tone}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
