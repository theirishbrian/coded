"use client";

export function PrintSnapshotButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex min-h-11 items-center rounded-sm bg-[#d3ef8b] px-4 py-2 text-sm font-semibold text-[#111315] hover:bg-[#e2f6ac]"
    >
      Print or save as PDF
    </button>
  );
}
