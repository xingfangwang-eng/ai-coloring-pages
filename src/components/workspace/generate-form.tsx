"use client";

import { useCallback } from "react";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { POPULAR_TAGS } from "@/lib/prompt-engineering";
import type { Complexity } from "@/types";

interface GenerateFormProps {
  /** 受控 prompt 值 */
  prompt: string;
  /** 受控复杂度 */
  complexity: Complexity;
  onPromptChange: (v: string) => void;
  onComplexityChange: (v: Complexity) => void;
  loading: boolean;
  onGenerate: (prompt: string, complexity: Complexity) => Promise<void>;
}

export function GenerateForm({
  prompt,
  complexity,
  onPromptChange,
  onComplexityChange,
  loading,
  onGenerate,
}: GenerateFormProps) {
  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      const trimmed = prompt.trim();
      if (!trimmed) {
        toast.error("Please describe what you'd like to draw.");
        return;
      }
      await onGenerate(trimmed, complexity);
    },
    [prompt, complexity, onGenerate]
  );

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Prompt 输入区 */}
      <div className="space-y-2">
        <Label htmlFor="prompt" className="text-sm font-medium">
          Describe your coloring page
        </Label>
        <Input
          id="prompt"
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          placeholder="e.g. kitten sitting on a pumpkin, astronaut in space..."
          disabled={loading}
          className="h-11 text-base"
          maxLength={200}
        />
      </div>

      {/* 复杂度 + 生成按钮 行 */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Style / Complexity</Label>
          <Select
            value={complexity}
            onValueChange={(v) => onComplexityChange(v as Complexity)}
            disabled={loading}
          >
            <SelectTrigger className="h-11 w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="kids">🎨 Kids (bold & simple)</SelectItem>
              <SelectItem value="adults">🌸 Adults (intricate)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          type="submit"
          size="lg"
          disabled={loading || !prompt.trim()}
          className="h-11 gap-2"
        >
          {loading ? (
            <>
              <span className="inline-block size-4 animate-spin rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground" />
              AI is drawing…
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate
            </>
          )}
        </Button>
      </div>

      {/* 热门 Tag 快速填入 */}
      <div className="space-y-2">
        <div className="text-xs text-muted-foreground">
          💡 Quick start — click an idea to fill it in
        </div>
        <div className="flex flex-wrap gap-2">
          {POPULAR_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => onPromptChange(tag)}
              disabled={loading}
              className="rounded-full border bg-background px-3 py-1 text-xs text-muted-foreground transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </form>
  );
}
