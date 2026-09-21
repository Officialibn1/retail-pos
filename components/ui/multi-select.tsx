"use client";

import * as React from "react";
import { X, ChevronsUpDown, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "./input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Item, ItemContent, ItemMedia, ItemTitle } from "@/components/ui/item";

export interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = "Select items...",
  disabled = false,
  className,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");

  const toggle = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  const remove = (optionValue: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value.filter((v) => v !== optionValue));
  };

  const selectedLabels = value
    .map((v) => options.find((o) => o.value === v)?.label)
    .filter(Boolean) as string[];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        type="button"
        disabled={disabled}
        aria-expanded={open}
        role="combobox"
        className={cn(
          "flex w-full min-h-9 h-auto items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
          "hover:bg-accent hover:text-accent-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "font-normal text-left",
          !value.length && "text-muted-foreground",
          className,
        )}>
        <div className="flex flex-wrap gap-1 flex-1 min-w-0">
          {selectedLabels.length > 0 ? (
            selectedLabels.map((label, i) => (
              <Badge
                key={value[i]}
                variant="secondary"
                className="text-xs gap-1 pr-1">
                <span className="truncate max-w-[160px]">{label}</span>
                <span
                  role="button"
                  aria-label={`Remove ${label}`}
                  tabIndex={0}
                  onClick={(e) => remove(value[i], e)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onChange(value.filter((v) => v !== value[i]));
                    }
                  }}
                  className="ml-0.5 rounded-full hover:bg-muted cursor-pointer p-0.5">
                  <X className="h-3 w-3" />
                </span>
              </Badge>
            ))
          ) : (
            <span>{placeholder}</span>
          )}
        </div>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader className="pr-6">
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search..."
          />
        </DialogHeader>

        <ScrollArea className=" space-y-1.5 max-h-80 ">
          {options
            .filter((o) =>
              o.label.toLowerCase().includes(searchTerm.toLowerCase()),
            )
            .map((option) => (
              <Item
                variant="muted"
                size="sm"
                key={option.value}
                onClick={() => toggle(option.value)}
                className="cursor-pointer">
                <ItemMedia>
                  <CheckCheck
                    className={cn(
                      "mr-2 size-4",
                      value.includes(option.value)
                        ? "opacity-100"
                        : "opacity-0",
                    )}
                  />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>{option.label}</ItemTitle>
                </ItemContent>
              </Item>
            ))}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
