"use client";

interface RadioProps {
  name: string;
  checked: boolean;
  onChange: () => void;
}

export function Radio({ name, checked, onChange }: RadioProps) {
  return (
    <span className="relative inline-flex items-center justify-center w-4 h-4 shrink-0">
      <input
        type="radio"
        name={name}
        checked={checked}
        onChange={onChange}
        className="absolute inset-0 opacity-0 cursor-pointer"
      />
      <span
        aria-hidden="true"
        className="w-4 h-4 rounded-full border transition-colors duration-150 ease-out"
        style={{
          borderColor: checked ? "#346739" : "#d9d9dd",
          background: checked ? "#346739" : "white",
        }}
      />
      <span
        aria-hidden="true"
        className="absolute w-1.5 h-1.5 rounded-full bg-white transition-[opacity,transform] duration-150 ease-out"
        style={{
          opacity: checked ? 1 : 0,
          transform: checked ? "scale(1)" : "scale(0.5)",
        }}
      />
    </span>
  );
}

interface CheckboxProps {
  checked: boolean;
  onChange: () => void;
}

export function Checkbox({ checked, onChange }: CheckboxProps) {
  return (
    <span className="relative inline-flex items-center justify-center w-4 h-4 shrink-0">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="absolute inset-0 opacity-0 cursor-pointer"
      />
      <span
        aria-hidden="true"
        className="w-4 h-4 rounded border transition-colors duration-150 ease-out"
        style={{
          borderColor: checked ? "#346739" : "#d9d9dd",
          background: checked ? "#346739" : "white",
        }}
      />
      {checked && (
        <svg
          aria-hidden="true"
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          className="absolute"
        >
          <path
            d="M2 5l2 2 4-4"
            stroke="white"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </span>
  );
}
