"use client";

import type { PropsWithChildren } from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

import type { BrandTheme, ColorScheme } from "./themes";

const BRAND_STORAGE_KEY = "zoumani-brand-theme";
const COLOR_SCHEME_STORAGE_KEY = "zoumani-color-scheme";

interface ThemeContextValue {
  brand: BrandTheme;
  colorScheme: ColorScheme;
  setBrand: (brand: BrandTheme) => void;
  setColorScheme: (scheme: ColorScheme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getInitialBrand(): BrandTheme {
  if (typeof window === "undefined") {
    return "zoumani";
  }

  const storedBrand = window.localStorage.getItem(BRAND_STORAGE_KEY);

  return storedBrand === "zoumani-v2" ? storedBrand : "zoumani";
}

function getInitialColorScheme(): ColorScheme {
  if (typeof window === "undefined") {
    return "system";
  }

  const storedColorScheme = window.localStorage.getItem(COLOR_SCHEME_STORAGE_KEY);

  if (storedColorScheme === "light" || storedColorScheme === "dark" || storedColorScheme === "system") {
    return storedColorScheme;
  }

  return "system";
}

function resolveSystemColorScheme() {
  if (typeof window === "undefined") {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyThemeToDocument(brand: BrandTheme, scheme: ColorScheme) {
  const rootElement = document.documentElement;

  rootElement.dataset.brand = brand;
  rootElement.dataset.colorScheme = scheme === "system" ? resolveSystemColorScheme() : scheme;
}

export function ThemeProvider({ children }: PropsWithChildren) {
  const [brand, setBrandState] = useState<BrandTheme>(getInitialBrand);
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>(getInitialColorScheme);

  useEffect(() => {
    applyThemeToDocument(brand, colorScheme);
    window.localStorage.setItem(BRAND_STORAGE_KEY, brand);
    window.localStorage.setItem(COLOR_SCHEME_STORAGE_KEY, colorScheme);

    if (colorScheme !== "system") {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyThemeToDocument(brand, "system");

    mediaQuery.addEventListener("change", onChange);

    return () => mediaQuery.removeEventListener("change", onChange);
  }, [brand, colorScheme]);

  const value = useMemo(
    () => ({
      brand,
      colorScheme,
      setBrand: setBrandState,
      setColorScheme: setColorSchemeState,
    }),
    [brand, colorScheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider.");
  }

  return context;
}
