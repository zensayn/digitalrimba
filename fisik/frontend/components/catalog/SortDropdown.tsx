"use client";

import { IconChevronUp } from "@tabler/icons-react";
import { SortOrder } from "./types";

interface SortDropdownProps {
  value: SortOrder;
  onChange: (v: SortOrder) => void;
  label: string;
  options: Record<SortOrder, string>;
}

export default function SortDropdown({
  value,
  onChange,
  label,
  options,
}: SortDropdownProps) {
  return (
    <label className="relative inline-flex items-center h-11 rounded-full border border-[#e5e7eb] bg-white pl-4 pr-10 cursor-pointer text-sm font-poppins text-[#212121] focus-within:border-[#346739] transition-colors duration-200">
      <span className="text-[#93939f] mr-2 hidden sm:inline">{label}:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SortOrder)}
        aria-label={label}
        className="appearance-none bg-transparent outline-none cursor-pointer pr-1"
      >
        <option value="popular">{options.popular}</option>
        <option value="nameAsc">{options.nameAsc}</option>
        <option value="nameDesc">{options.nameDesc}</option>
      </select>
      <IconChevronUp
        size={14}
        aria-hidden="true"
        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#93939f] pointer-events-none rotate-180"
      />
    </label>
  );
}
