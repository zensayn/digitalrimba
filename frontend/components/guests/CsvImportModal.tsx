"use client";

import { DragEvent, useMemo, useState } from "react";
import type { CsvGuestPreview } from "./types";

export const MOCK_CSV_FIXTURE = `name,phone,tag
Alya Rahman,0812000001,family
Bima Prasetya,0812000002,vip
Citra Lestari,0812000003,friend
Dimas Putra,0812000004,vendor
Eka Maharani,0812000005,family
Farah Anindya,0812000006,vip`;

type CsvImportModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (file: File) => Promise<void>;
};

export function CsvImportModal({ isOpen, onClose, onConfirm }: CsvImportModalProps) {
  const fixturePreview = useMemo(() => parseCsvPreview(MOCK_CSV_FIXTURE), []);
  const [file, setFile] = useState<File | null>(null);
  const [previewRows, setPreviewRows] = useState<CsvGuestPreview[]>(fixturePreview);
  const [isImporting, setIsImporting] = useState(false);

  if (!isOpen) {
    return null;
  }

  async function readFile(nextFile: File) {
    const text = await nextFile.text();
    setFile(nextFile);
    setPreviewRows(parseCsvPreview(text));
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile) {
      void readFile(droppedFile);
    }
  }

  async function handleConfirm() {
    const importFile =
      file ??
      new File([MOCK_CSV_FIXTURE], "mock-guests.csv", {
        type: "text/csv",
      });

    setIsImporting(true);
    try {
      await onConfirm(importFile);
      onClose();
    } finally {
      setIsImporting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0a0a]/45 p-4">
      <section className="w-full max-w-3xl rounded-[18px] border border-[#0a0a0a]/10 bg-[#fffaf0] p-5 shadow-[0_24px_80px_rgba(10,10,10,0.24)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#1a3a3a]">
              CSV Import
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-[#0a0a0a]">Preview guest rows</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-[10px] border border-[#0a0a0a]/15 px-3 py-2 text-sm font-semibold"
          >
            Close
          </button>
        </div>

        <label
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleDrop}
          className="mt-5 flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-[16px] border border-dashed border-[#1a3a3a]/35 bg-[#faf5e8] px-5 text-center"
        >
          <span className="text-sm font-semibold text-[#0a0a0a]">
            Drop CSV here or choose file
          </span>
          <span className="mt-2 text-xs text-[#6a6a6a]">
            Required columns: name, phone, tag. Unknown columns are ignored.
          </span>
          <input
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(event) => {
              const selectedFile = event.target.files?.[0];
              if (selectedFile) {
                void readFile(selectedFile);
              }
            }}
          />
        </label>

        <div className="mt-5 overflow-hidden rounded-[14px] border border-[#0a0a0a]/10">
          <table className="w-full border-collapse bg-white text-sm">
            <thead className="bg-[#1a3a3a] text-[#fffaf0]">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Name</th>
                <th className="px-4 py-3 text-left font-semibold">Phone</th>
                <th className="px-4 py-3 text-left font-semibold">Tag</th>
              </tr>
            </thead>
            <tbody data-testid="csv-preview-table">
              {previewRows.slice(0, 5).map((row, index) => (
                <tr key={`${row.phone}-${index}`} className="border-t border-[#0a0a0a]/10">
                  <td className="px-4 py-3">{row.name}</td>
                  <td className="px-4 py-3">{row.phone}</td>
                  <td className="px-4 py-3">{row.tag}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-5 flex items-center justify-between gap-4">
          <p className="text-xs text-[#6a6a6a]">
            Showing exactly {previewRows.slice(0, 5).length} preview rows.
          </p>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isImporting}
            className="h-11 rounded-[12px] bg-[#0a0a0a] px-5 text-sm font-semibold text-white disabled:bg-[#e5e5e5] disabled:text-[#6a6a6a]"
          >
            {isImporting ? "Importing" : "Confirm"}
          </button>
        </div>
      </section>
    </div>
  );
}

function parseCsvPreview(csvText: string): CsvGuestPreview[] {
  const lines = csvText
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .filter(Boolean);

  const header = lines[0]?.split(",").map((column) => column.trim().toLowerCase()) ?? [];
  const nameIndex = header.indexOf("name");
  const phoneIndex = header.indexOf("phone");
  const tagIndex = header.indexOf("tag");

  return lines.slice(1).map((line) => {
    const cells = line.split(",").map((cell) => cell.trim());
    return {
      name: nameIndex >= 0 ? cells[nameIndex] ?? "" : "",
      phone: phoneIndex >= 0 ? cells[phoneIndex] ?? "" : "",
      tag: tagIndex >= 0 ? cells[tagIndex] ?? "" : "",
    };
  });
}
