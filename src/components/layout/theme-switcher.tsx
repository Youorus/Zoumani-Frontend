"use client";

import { useTheme } from "@/lib/theme/theme-provider";
import { brandThemes } from "@/lib/theme/themes";

import { Button } from "@/components/ui/button";
import { MoonIcon, SunIcon } from "@/components/ui/icons";

export function ThemeSwitcher() {
  const { brand, colorScheme, setBrand, setColorScheme } = useTheme();

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="flex items-center gap-2 rounded-full border border-border bg-surface p-1">
        {brandThemes.map((theme) => (
          <Button
            key={theme.id}
            type="button"
            variant={brand === theme.id ? "primary" : "ghost"}
            size="sm"
            onClick={() => setBrand(theme.id)}
          >
            {theme.label}
          </Button>
        ))}
      </div>

      <div className="flex items-center gap-2 rounded-full border border-border bg-surface p-1">
        <Button
          type="button"
          variant={colorScheme === "light" ? "secondary" : "ghost"}
          size="sm"
          leadingIcon={<SunIcon className="size-4" />}
          onClick={() => setColorScheme("light")}
        >
          Light
        </Button>
        <Button
          type="button"
          variant={colorScheme === "dark" ? "secondary" : "ghost"}
          size="sm"
          leadingIcon={<MoonIcon className="size-4" />}
          onClick={() => setColorScheme("dark")}
        >
          Dark
        </Button>
      </div>
    </div>
  );
}
