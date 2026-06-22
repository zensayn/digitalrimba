"use client";

import { IconSearch } from "@tabler/icons-react";

interface EmptyStateProps {
  title: string;
  description: string;
  clearLabel: string;
  onClear: () => void;
}

export default function EmptyState({
  title,
  description,
  clearLabel,
  onClear,
}: EmptyStateProps) {
  return (
    <div className="border border-dashed border-[#e5e7eb] rounded-[24px] py-16 px-6 text-center flex flex-col items-center">
      <span className="w-12 h-12 rounded-full bg-[#f2f2f2] flex items-center justify-center text-[#93939f] mb-4">
        <IconSearch size={20} />
      </span>
      <h4 className="font-poppins text-base font-medium text-[#212121] mb-1">{title}</h4>
      <p className="text-sm text-[#616161] max-w-sm font-poppins font-light mb-5">{description}</p>
      <button
        type="button"
        onClick={onClear}
        className="text-sm text-[#346739] hover:underline font-poppins font-medium"
      >
        {clearLabel}
      </button>
    </div>
  );
}
