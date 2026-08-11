"use client";

import { Command } from "cmdk";
import { Check, ChevronDown, MapPin, Search } from "lucide-react";
import { useId, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

import { Popover, PopoverContent, PopoverTrigger } from "./popover";

export interface ComboboxOption {
  value: string;
  label: string;
  description?: string;
  keywords?: readonly string[];
  /**
   * Ce qui s'affiche dans la pastille de gauche.
   *
   * Un drapeau, une initiale, une icône. À défaut, le repère de lieu —
   * qui reste le bon symbole pour ce à quoi ce composant a d'abord servi.
   */
  icon?: ReactNode;
  /** Ce qui s'affiche à gauche du libellé une fois l'option choisie. */
  triggerIcon?: ReactNode;
}

interface ComboboxProps {
  ariaLabel: string;
  emptyText: string;
  groupLabel?: string;
  onSearchValueChange?: (value: string) => void;
  onValueChange: (value: string) => void;
  options: readonly ComboboxOption[];
  placeholder: string;
  searchPlaceholder: string;
  value?: string;
  className?: string;
}

export function Combobox({
  ariaLabel,
  className,
  emptyText,
  groupLabel,
  onSearchValueChange,
  onValueChange,
  options,
  placeholder,
  searchPlaceholder,
  value,
}: ComboboxProps) {
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const selectedOption = options.find((option) => option.value === value);

  function updateSearch(nextValue: string) {
    setSearchValue(nextValue);
    onSearchValueChange?.(nextValue);
  }

  function updateOpen(nextOpen: boolean) {
    setOpen(nextOpen);

    if (!nextOpen) {
      updateSearch("");
    }
  }

  return (
    <Popover open={open} onOpenChange={updateOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-label={ariaLabel}
          aria-controls={listId}
          aria-expanded={open}
          aria-haspopup="listbox"
          className={cn(
            "focus-visible:outline-none mt-1 flex w-full min-w-0 items-center justify-between gap-2 text-left text-sm font-bold text-marketing-panel-foreground",
            className,
          )}
        >
          <span className="flex min-w-0 items-center gap-2">
            {selectedOption?.triggerIcon ?? selectedOption?.icon ?? null}
            <span
              className={cn(
                "truncate",
                !selectedOption && "text-marketing-panel-muted-foreground",
              )}
            >
              {selectedOption?.label ?? placeholder}
            </span>
          </span>
          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-marketing-panel-muted-foreground transition-transform",
              open && "rotate-180",
            )}
            aria-hidden="true"
          />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        sideOffset={12}
        className="w-[var(--radix-popover-trigger-width)] min-w-[18rem] overflow-hidden border-marketing-panel-border bg-marketing-panel p-0 text-marketing-panel-foreground shadow-[0_24px_60px_-24px_rgb(52_24_7_/_0.45)]"
      >
        <Command className="flex w-full flex-col bg-marketing-panel" loop>
          <div className="flex items-center gap-3 border-b border-marketing-panel-border px-4">
            <Search className="size-4 shrink-0 text-primary" aria-hidden="true" />
            <Command.Input
              value={searchValue}
              onValueChange={updateSearch}
              placeholder={searchPlaceholder}
              className="h-12 min-w-0 flex-1 bg-transparent text-sm text-marketing-panel-foreground outline-none placeholder:text-marketing-panel-muted-foreground"
            />
          </div>

          <Command.List id={listId} className="max-h-72 overflow-y-auto overscroll-contain p-2">
            <Command.Empty className="px-3 py-8 text-center text-sm text-marketing-panel-muted-foreground">
              {emptyText}
            </Command.Empty>
            <Command.Group
              heading={groupLabel}
              className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:text-[0.68rem] [&_[cmdk-group-heading]]:font-bold [&_[cmdk-group-heading]]:tracking-[0.12em] [&_[cmdk-group-heading]]:text-marketing-panel-muted-foreground [&_[cmdk-group-heading]]:uppercase"
            >
              {options.map((option) => (
                <Command.Item
                  key={option.value}
                  value={option.value}
                  keywords={[option.label, option.description ?? "", ...(option.keywords ?? [])]}
                  onSelect={() => {
                    onValueChange(option.value);
                    updateOpen(false);
                  }}
                  className="group flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm outline-none transition-colors data-[selected=true]:bg-primary/10"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary transition-colors group-data-[selected=true]:bg-primary group-data-[selected=true]:text-primary-foreground">
                    {option.icon ?? <MapPin className="size-4" aria-hidden="true" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-bold">{option.label}</span>
                    {option.description ? (
                      <span className="mt-0.5 block truncate text-xs text-marketing-panel-muted-foreground">
                        {option.description}
                      </span>
                    ) : null}
                  </span>
                  <Check
                    className={cn(
                      "size-4 shrink-0 text-primary transition-opacity",
                      option.value === value ? "opacity-100" : "opacity-0",
                    )}
                    aria-hidden="true"
                  />
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
