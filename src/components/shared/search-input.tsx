"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface SearchInputProps
  extends React.ComponentProps<typeof Input> {
  onValueChange?: (value: string) => void;
  debounceMs?: number;
}

export function SearchInput({
  className,
  onValueChange,
  debounceMs = 300,
  ...props
}: SearchInputProps) {
  const defaultValue = typeof props.defaultValue === "string" ? props.defaultValue : "";
  const [value, setValue] = React.useState(defaultValue);

  React.useEffect(() => {
    if (!onValueChange) return;
    const timer = setTimeout(() => onValueChange(value), debounceMs);
    return () => clearTimeout(timer);
  }, [value, debounceMs, onValueChange]);

  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="pl-9"
        {...props}
      />
    </div>
  );
}