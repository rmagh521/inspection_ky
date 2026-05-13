"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export interface FilterConfig {
  key: string;
  label: string;
  options: string[];
  labelMap?: Record<string, string>;
}

interface FilterBarProps {
  filters: FilterConfig[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onClear: () => void;
  hasActive: boolean;
}

export function FilterBar({
  filters,
  values,
  onChange,
  onClear,
  hasActive,
}: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {filters.map((f) => (
        <Select
          key={f.key}
          value={values[f.key] ?? "__all__"}
          onValueChange={(v) => onChange(f.key, !v || v === "__all__" ? "" : v)}
        >
          <SelectTrigger className="h-8 w-auto min-w-[130px] text-xs">
            <SelectValue placeholder={f.label} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">전체 {f.label}</SelectItem>
            {f.options.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {f.labelMap?.[opt] ?? opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}
      {hasActive && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-xs"
          onClick={onClear}
        >
          <X className="mr-1 h-3 w-3" />
          초기화
        </Button>
      )}
    </div>
  );
}
