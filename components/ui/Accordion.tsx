"use client";

import { useId, useState } from "react";

import { IconChevronDown } from "@/components/ui/Icons";

interface AccordionItemProps {
  question: string;
  answer: string;
}

export function AccordionItem({ question, answer }: AccordionItemProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const buttonId = useId();

  return (
    <div className="border-b border-leather/20">
      <h3>
        <button
          type="button"
          id={buttonId}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((value) => !value)}
          className="flex w-full items-center justify-between gap-4 py-4 text-left font-sans text-[0.98rem] font-semibold text-charcoal transition hover:text-brand"
        >
          <span>{question}</span>
          <IconChevronDown
            className={`shrink-0 text-copper transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>
      </h3>
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        hidden={!open}
        className="pb-5 pr-8 text-[0.92rem] leading-relaxed text-charcoal-muted"
      >
        {answer}
      </div>
    </div>
  );
}
