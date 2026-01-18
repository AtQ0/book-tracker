"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type SortKey = "read" | "want" | "rating" | "name_asc" | "name_desc";

type Props = {
  value?: string;
  disabled?: boolean;
  className?: string;
};

const SORT_LABEL: Record<SortKey, string> = {
  read: "Most read",
  want: "Most want to read",
  rating: "Highest rated",
  name_asc: "A–Z",
  name_desc: "Z–A",
};

function isSortKey(v: unknown): v is SortKey {
  return (
    v === "read" ||
    v === "want" ||
    v === "rating" ||
    v === "name_asc" ||
    v === "name_desc"
  );
}

export default function BookSortBar({ value, disabled, className }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const appliedSort: SortKey | undefined = isSortKey(value) ? value : undefined;

  const [open, setOpen] = useState(false);
  const [draftSort, setDraftSort] = useState<SortKey | undefined>(appliedSort);

  useEffect(() => {
    setDraftSort(appliedSort);
  }, [appliedSort]);

  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    const onPointerDown = (e: PointerEvent) => {
      const t = e.target;
      if (!(t instanceof Node)) return;

      const inButton = buttonRef.current?.contains(t) ?? false;
      const inPanel = panelRef.current?.contains(t) ?? false;

      if (!inButton && !inPanel) setOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  const buttonLabel = useMemo(() => {
    if (!appliedSort) return "Sort";
    return `Sort: ${SORT_LABEL[appliedSort]}`;
  }, [appliedSort]);

  function apply() {
    const next = new URLSearchParams(searchParams.toString());

    if (!draftSort) next.delete("sort");
    else next.set("sort", draftSort);

    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
    setOpen(false);
  }

  function clearAll() {
    setDraftSort(undefined);

    const next = new URLSearchParams(searchParams.toString());
    next.delete("sort");

    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
    setOpen(false);
  }

  const draftGroupSort =
    draftSort === "name_asc" || draftSort === "name_desc"
      ? undefined
      : draftSort;

  const draftGroupName =
    draftSort === "name_asc" || draftSort === "name_desc"
      ? draftSort
      : undefined;

  return (
    <div
      className={["relative inline-block", className].filter(Boolean).join(" ")}
    >
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={[
          "inline-flex items-center gap-2 rounded-md border border-black/10 px-3 py-2",
          "text-sm font-medium text-black/80 shadow-sm hover:bg-black/5",
          "disabled:opacity-50 cursor-pointer",
        ].join(" ")}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        {buttonLabel}
        <span className="text-black/50">▾</span>
      </button>

      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Sort menu"
          className={[
            "absolute left-0 z-50 mt-2 w-[18rem] rounded-xl border border-black/10 bg-baby-powder shadow-lg",
            "overflow-hidden",
          ].join(" ")}
        >
          <div className="p-4">
            <p className="text-lg font-semibold text-black/80">Sort:</p>

            <div className="mt-2 flex items-center justify-between rounded-md border border-black/10 px-3 py-2 text-sm text-black/70">
              <span>{draftSort ? SORT_LABEL[draftSort] : "Select..."}</span>
              <span className="text-black/40">▾</span>
            </div>

            <div className="mt-3 space-y-2">
              <RadioRow
                checked={draftGroupSort === "read"}
                label="Most read"
                onChange={() => setDraftSort("read")}
              />
              <RadioRow
                checked={draftGroupSort === "want"}
                label="Most want to read"
                onChange={() => setDraftSort("want")}
              />
              <RadioRow
                checked={draftGroupSort === "rating"}
                label="Highest rated"
                onChange={() => setDraftSort("rating")}
              />
            </div>

            <div className="my-4 h-px bg-black/10" />

            <p className="text-sm font-semibold text-black/70">Name</p>
            <div className="mt-2 space-y-2">
              <RadioRow
                checked={draftGroupName === "name_asc"}
                label="A–Z"
                onChange={() => setDraftSort("name_asc")}
              />
              <RadioRow
                checked={draftGroupName === "name_desc"}
                label="Z–A"
                onChange={() => setDraftSort("name_desc")}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 border-t border-black/10">
            <button
              type="button"
              onClick={clearAll}
              className="px-4 py-3 text-sm font-medium text-black/60 hover:bg-black/5 cursor-pointer"
            >
              Clear all
            </button>
            <button
              type="button"
              onClick={apply}
              className="px-4 py-3 text-sm font-semibold text-white bg-golden-brown hover:opacity-90 cursor-pointer"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function RadioRow({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 text-sm text-black/80">
      <input
        type="radio"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 accent-golden-brown cursor-pointer"
      />
      <span>{label}</span>
    </label>
  );
}
