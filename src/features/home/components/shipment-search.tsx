"use client";

import {
  ArrowLeftRight,
  CircleCheck,
  MapPin,
  Package,
  Search,
  ShieldCheck,
} from "lucide-react";
import type { FormEvent, ReactNode } from "react";
import { startTransition, useState } from "react";

import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils/cn";

import type { HomeContent } from "./home-content";

const guaranteeIcons = [
  CircleCheck,
  ShieldCheck,
  ShieldCheck,
  CircleCheck,
] as const;

const cityOptions: readonly ComboboxOption[] = [
  { value: "paris", label: "Paris, France", description: "Paris Charles-de-Gaulle · CDG" },
  { value: "lyon", label: "Lyon, France", description: "Lyon-Saint Exupéry · LYS" },
  { value: "bruxelles", label: "Bruxelles, Belgique", description: "Brussels Airport · BRU" },
  { value: "abidjan", label: "Abidjan, Côte d'Ivoire", description: "Félix-Houphouët-Boigny · ABJ" },
  { value: "dakar", label: "Dakar, Sénégal", description: "Blaise-Diagne · DSS" },
  { value: "douala", label: "Douala, Cameroun", description: "Aéroport international · DLA" },
  { value: "bamako", label: "Bamako, Mali", description: "Modibo-Keïta · BKO" },
  { value: "conakry", label: "Conakry, Guinée", description: "Ahmed-Sékou-Touré · CKY" },
  { value: "cotonou", label: "Cotonou, Bénin", description: "Bernardin-Gantin · COO" },
  { value: "casablanca", label: "Casablanca, Maroc", description: "Mohammed-V · CMN" },
  { value: "nairobi", label: "Nairobi, Kenya", description: "Jomo-Kenyatta · NBO" },
] as const;

interface SearchFieldProps {
  icon: typeof MapPin;
  label: string;
  children: ReactNode;
  className?: string;
}

function SearchField({ icon: Icon, label, children, className }: SearchFieldProps) {
  return (
    <div
      className={cn(
        "flex min-h-19 items-center gap-3 rounded-xl border border-marketing-panel-border bg-marketing-panel px-4 transition-colors focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/12",
        className,
      )}
    >
      <Icon className="size-6 shrink-0 text-primary" aria-hidden="true" />
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-medium text-marketing-panel-muted-foreground">{label}</span>
        {children}
      </span>
    </div>
  );
}

interface ShipmentSearchProps {
  className?: string;
  copy: HomeContent["search"];
}

export function ShipmentSearch({ className, copy }: ShipmentSearchProps) {
  const [departure, setDeparture] = useState("paris");
  const [destination, setDestination] = useState("abidjan");
  const [weight, setWeight] = useState("1");
  const { toast } = useToast();
  const selectedWeight = copy.weightOptions.find((option) => option.value === weight);
  const departureLabel = cityOptions.find((option) => option.value === departure)?.label ?? departure;
  const destinationLabel = cityOptions.find((option) => option.value === destination)?.label ?? destination;

  function swapLocations() {
    startTransition(() => {
      setDeparture(destination);
      setDestination(departure);
    });
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    toast({
      variant: "success",
      title: copy.toastTitle,
      description: `${departureLabel} → ${destinationLabel}. ${copy.toastDescription}`,
    });
  }

  return (
    <div
      id="search"
      className={cn("relative z-30 mx-auto w-full max-w-[1492px] px-4 sm:px-8 lg:px-12", className)}
    >
      <form
        onSubmit={submitSearch}
        className="overflow-hidden rounded-[1.35rem] bg-marketing-panel text-marketing-panel-foreground shadow-[0_28px_70px_-34px_rgb(13_6_2_/_0.7)] [color-scheme:light]"
      >
        <div className="flex h-12 items-center border-b border-marketing-panel-border">
          <div className="flex h-full w-full items-center justify-center gap-2 px-4 text-sm font-bold text-primary sm:max-w-[255px]">
            <Package className="size-5" />
            {copy.title}
          </div>
        </div>

        <div className="p-4 sm:p-5">
          <div className="grid items-center gap-3 lg:grid-cols-[1.3fr_1.3fr_.72fr_1.08fr]">
            <SearchField icon={MapPin} label={copy.departureLabel}>
              <Combobox
                value={departure}
                ariaLabel={copy.departureAriaLabel}
                emptyText={copy.cityEmptyText}
                groupLabel={copy.citySuggestionsLabel}
                onValueChange={setDeparture}
                options={cityOptions}
                placeholder={copy.cityPlaceholder}
                searchPlaceholder={copy.citySearchPlaceholder}
              />
            </SearchField>

            <div className="relative">
              <button
                type="button"
                onClick={swapLocations}
                aria-label={copy.swapLabel}
                className="focus-ring absolute top-1/2 -left-[1.65rem] z-10 hidden size-10 -translate-y-1/2 place-items-center rounded-full bg-primary text-primary-foreground shadow-soft lg:grid"
              >
                <ArrowLeftRight className="size-4" />
              </button>
              <SearchField icon={MapPin} label={copy.destinationLabel}>
                <Combobox
                  value={destination}
                  ariaLabel={copy.destinationAriaLabel}
                  emptyText={copy.cityEmptyText}
                  groupLabel={copy.citySuggestionsLabel}
                  onValueChange={setDestination}
                  options={cityOptions}
                  placeholder={copy.cityPlaceholder}
                  searchPlaceholder={copy.citySearchPlaceholder}
                />
              </SearchField>
            </div>

            <SearchField icon={Package} label={copy.weightLabel}>
              <Select value={weight} onValueChange={setWeight}>
                <SelectTrigger
                  aria-label={copy.weightLabel}
                  className="mt-1 h-auto rounded-none border-0 bg-transparent p-0 font-bold text-marketing-panel-foreground shadow-none focus-visible:ring-0"
                >
                  <span>{selectedWeight?.label ?? copy.weightOptions[0]?.label}</span>
                </SelectTrigger>
                <SelectContent
                  align="start"
                  sideOffset={12}
                  className="min-w-[14rem] border-marketing-panel-border bg-marketing-panel text-marketing-panel-foreground shadow-[0_24px_60px_-24px_rgb(52_24_7_/_0.45)]"
                >
                  {copy.weightOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="py-3 text-marketing-panel-foreground data-[highlighted]:bg-primary/10 data-[state=checked]:text-primary"
                    >
                      <span className="flex min-w-36 items-baseline justify-between gap-5">
                        <span className="font-bold">{option.label}</span>
                        <span className="text-xs font-normal text-marketing-panel-muted-foreground">
                          {option.description}
                        </span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </SearchField>

            <button
              type="submit"
              className="focus-ring inline-flex min-h-16 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground shadow-soft transition-transform hover:-translate-y-0.5 hover:bg-primary/92 lg:min-h-16"
            >
              <Search className="size-5" />
              {copy.submitLabel}
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-marketing-panel-muted-foreground lg:gap-x-7">
            {copy.guarantees.map((label, index) => {
              const Icon = guaranteeIcons[index] ?? CircleCheck;

              return (
                <div key={label} className="flex items-center gap-2">
                  <Icon className="size-4 text-warning" />
                  <span>{label}</span>
                  {index < copy.guarantees.length - 1 ? (
                    <span className="ml-3 hidden text-warning lg:inline" aria-hidden="true">•</span>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </form>
    </div>
  );
}
