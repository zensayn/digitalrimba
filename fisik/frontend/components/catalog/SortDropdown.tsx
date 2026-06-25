"use client";

import {
  IconChevronUp,
  IconFlame,
  IconSortAscendingLetters,
  IconSortDescendingLetters,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { SortOrder } from "./types";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";

interface SortDropdownProps {
  value: SortOrder;
  onChange: (v: SortOrder) => void;
  label: string;
  options: Record<SortOrder, string>;
  /** Extra trigger classes (e.g. `w-full` on mobile). */
  className?: string;
}

const ORDER: SortOrder[] = ["popular", "nameAsc", "nameDesc"];

const OPTION_ICONS: Record<
  SortOrder,
  React.ComponentType<{ className?: string; size?: number }>
> = {
  popular: IconFlame,
  nameAsc: IconSortAscendingLetters,
  nameDesc: IconSortDescendingLetters,
};

export default function SortDropdown({
  value,
  onChange,
  label,
  options,
  className,
}: SortDropdownProps) {
  const SelectedIcon = OPTION_ICONS[value];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={label}
        className={cn(
          "group relative inline-flex items-center h-11 rounded-full border border-[#e5e7eb] bg-white pl-4 pr-10 text-sm font-poppins text-[#212121] outline-none transition-colors duration-200 ease-out hover:border-[#212121] active:scale-[0.98] data-[state=open]:border-[#346739]",
          className
        )}
      >
        {SelectedIcon && (
          <SelectedIcon
            size={16}
            className="mr-2 text-[#93939f] shrink-0 size-4"
          />
        )}
        <span className="text-[#93939f] mr-1.5 hidden sm:inline">{label}:</span>
        <span className="truncate">{options[value]}</span>
        <IconChevronUp
          size={14}
          aria-hidden="true"
          className="absolute right-4 top-1/2 -translate-y-1/2 rotate-180 text-[#93939f] transition-transform duration-200 ease-out group-data-[state=open]:rotate-0"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="font-poppins text-[#212121] shadow-lg ring-[#e5e7eb]">
        <DropdownMenuRadioGroup
          value={value}
          onValueChange={(v) => onChange(v as SortOrder)}
        >
          {ORDER.map((key) => {
            const OptionIcon = OPTION_ICONS[key];
            return (
              <DropdownMenuRadioItem
                key={key}
                value={key}
                className="group text-[13px] text-[#212121] focus:bg-[#f2f2f2] data-[state=checked]:text-[#346739] data-[state=checked]:font-medium flex items-center gap-2"
              >
                {OptionIcon && (
                  <OptionIcon
                    size={16}
                    className="text-[#93939f] group-data-[state=checked]:text-[#346739] shrink-0 size-4"
                  />
                )}
                <span>{options[key]}</span>
              </DropdownMenuRadioItem>
            );
          })}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
