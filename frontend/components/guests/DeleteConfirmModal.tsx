"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { TextureButton } from "@/components/ui/texture-button";
import { TrashBinMinimalistic } from "@solar-icons/react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  count?: number;
  isLoading?: boolean;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Delete Guests",
  description = "Are you sure you want to delete the selected guests? This action cannot be undone.",
  count,
  isLoading
}: DeleteConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md">
      <div className="p-8">
        <div className="flex flex-col items-center text-center">
          <div className="size-16 rounded-full bg-red-50 flex items-center justify-center mb-6 ring-8 ring-red-50/50">
            <TrashBinMinimalistic size={32} className="text-red-500" weight="BoldDuotone" />
          </div>
          
          <h2 className="text-[24px] font-bold text-bold mb-2 leading-tight">
            {title} {count && count > 1 ? `(${count})` : ""}
          </h2>
          <p className="text-[16px] text-neutral-500 leading-relaxed max-w-[320px]">
            {description}
          </p>
        </div>

        <div className="flex flex-col gap-3 mt-10">
          <TextureButton
            variant="destructive"
            onClick={onConfirm}
            className="w-full h-12 rounded-full shadow-none"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="animate-spin size-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              "Delete Permanently"
            )}
          </TextureButton>
          
          <TextureButton
            variant="minimal"
            onClick={onClose}
            className="w-full h-12 rounded-full shadow-none"
            disabled={isLoading}
          >
            Cancel
          </TextureButton>
        </div>
      </div>
    </Modal>
  );
}
