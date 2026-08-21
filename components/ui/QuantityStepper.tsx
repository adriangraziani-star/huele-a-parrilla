"use client";

import { IconMinus, IconPlus } from "@/components/ui/Icons";

interface QuantityStepperProps {
  value: number;
  minimum: number;
  step: number;
  label: string;
  productName: string;
  onChange: (value: number) => void;
  size?: "sm" | "md";
}

/**
 * Selector minimalista `− 1 kg +`.
 * Los botones llevan etiqueta accesible: no dependen solo del símbolo.
 */
export function QuantityStepper({
  value,
  minimum,
  step,
  label,
  productName,
  onChange,
  size = "md",
}: QuantityStepperProps) {
  const decrease = () => onChange(Math.round((value - step) * 100) / 100);
  const increase = () => onChange(Math.round((value + step) * 100) / 100);
  const atMinimum = value <= minimum;

  const buttonClass =
    size === "sm"
      ? "flex h-8 w-8 items-center justify-center text-charcoal transition disabled:opacity-30"
      : "flex h-10 w-10 items-center justify-center text-charcoal transition disabled:opacity-30";

  return (
    <div className="inline-flex items-center rounded-[var(--radius-field)] border border-leather/30 bg-[#fffdf9]">
      <button
        type="button"
        onClick={decrease}
        disabled={atMinimum}
        aria-label={`Disminuir cantidad de ${productName}`}
        className={`${buttonClass} rounded-l-[var(--radius-field)] hover:bg-cream`}
      >
        <IconMinus width={16} height={16} />
      </button>
      <span
        aria-live="polite"
        className={`min-w-[5.5rem] px-1 text-center font-sans font-bold tabular-nums text-charcoal ${
          size === "sm" ? "text-sm" : "text-[0.95rem]"
        }`}
      >
        {label}
      </span>
      <button
        type="button"
        onClick={increase}
        aria-label={`Aumentar cantidad de ${productName}`}
        className={`${buttonClass} rounded-r-[var(--radius-field)] hover:bg-cream`}
      >
        <IconPlus width={16} height={16} />
      </button>
    </div>
  );
}
