"use client";

import { Trash2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { HistoryItem } from "@/types";

interface HistoryGridProps {
  items: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

export function HistoryGrid({
  items,
  onSelect,
  onDelete,
  onClearAll,
}: HistoryGridProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed bg-muted/20 p-8 text-center">
        <p className="text-sm text-muted-foreground">
          No history yet — your first generation will be saved here automatically.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          {items.length} item{items.length === 1 ? "" : "s"} total (up to 5 kept)
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="h-7 gap-1 text-xs text-destructive hover:text-destructive"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Clear all
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
        {items.map((item) => (
          <div
            key={item.id}
            className="group relative overflow-hidden rounded-lg border bg-card"
          >
            {/* 缩略图 —— 点击回填到表单 */}
            <button
              onClick={() => onSelect(item)}
              className="block w-full cursor-pointer"
              title={`Restore to form: ${item.prompt}`}
            >
              <img
                src={item.imageUrl}
                alt={item.prompt}
                className="aspect-square w-full object-cover transition group-hover:scale-105"
              />
            </button>

            {/* 悬浮操作层 */}
            <div className="pointer-events-none absolute inset-0 flex items-end bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition group-hover:opacity-100">
              <div className="pointer-events-auto flex w-full items-center justify-between gap-1 p-2">
                <span className="truncate text-[11px] font-medium text-white">
                  {item.prompt}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => onSelect(item)}
                    title="Restore"
                    className="h-6 w-6 text-white hover:bg-white/20"
                  >
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => onDelete(item.id)}
                    title="Delete"
                    className="h-6 w-6 text-white hover:bg-white/20"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* 复杂度标签 */}
            <span
              className={`absolute left-1.5 top-1.5 rounded px-1.5 py-0.5 text-[10px] font-medium ${
                item.complexity === "kids"
                  ? "bg-green-500/90 text-white"
                  : "bg-purple-500/90 text-white"
              }`}
            >
              {item.complexity === "kids" ? "Kids" : "Adults"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
