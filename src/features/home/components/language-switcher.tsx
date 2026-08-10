"use client";

import { Check, ChevronDown } from "lucide-react";
import { useEffect } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils/cn";

import type { HomeContent, HomeLanguage } from "./home-content";

function FrenchFlag() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 16" className="h-4 w-6 overflow-hidden rounded-[3px] shadow-sm">
      <path fill="#1B3B8F" d="M0 0h8v16H0z" />
      <path fill="#FFF" d="M8 0h8v16H8z" />
      <path fill="#ED2939" d="M16 0h8v16h-8z" />
    </svg>
  );
}

function BritishFlag() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 16" className="h-4 w-6 overflow-hidden rounded-[3px] shadow-sm">
      <path fill="#173B7A" d="M0 0h24v16H0z" />
      <path stroke="#FFF" strokeWidth="4" d="m0 0 24 16M24 0 0 16" />
      <path stroke="#C8102E" strokeWidth="2" d="m0 0 24 16M24 0 0 16" />
      <path fill="#FFF" d="M9 0h6v16H9zM0 5h24v6H0z" />
      <path fill="#C8102E" d="M10 0h4v16h-4zM0 6h24v4H0z" />
    </svg>
  );
}

const languages = [
  { code: "fr", shortLabel: "FR", label: "Français", Flag: FrenchFlag },
  { code: "en", shortLabel: "EN", label: "English", Flag: BritishFlag },
] as const;

interface LanguageSwitcherProps {
  copy: HomeContent["language"];
  inverse?: boolean;
  language: HomeLanguage;
  onLanguageChange: (language: HomeLanguage) => void;
}

export function LanguageSwitcher({
  copy,
  inverse = false,
  language,
  onLanguageChange,
}: LanguageSwitcherProps) {
  const selectedLanguage = languages.find((item) => item.code === language) ?? languages[0];
  const SelectedFlag = selectedLanguage.Flag;

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "focus-ring inline-flex h-11 items-center gap-2 rounded-full px-3 text-sm font-semibold transition-colors",
            inverse
              ? "text-inverse-foreground hover:bg-hero-glass"
              : "border border-border text-foreground hover:bg-muted",
          )}
          aria-label={copy.triggerLabel}
        >
          <SelectedFlag />
          {selectedLanguage.shortLabel}
          <ChevronDown className="size-3.5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44">
        <DropdownMenuLabel>{copy.menuLabel}</DropdownMenuLabel>
        {languages.map(({ code, label, Flag }) => (
          <DropdownMenuItem
            key={code}
            onSelect={() => onLanguageChange(code)}
            className="cursor-pointer"
          >
            <Flag />
            <span>{label}</span>
            {language === code ? <Check className="ml-auto size-4 text-primary" /> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
