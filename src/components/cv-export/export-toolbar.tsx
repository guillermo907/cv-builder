"use client";

import Link from "next/link";

type ExportToolbarProps = {
  className: string;
};

export function ExportToolbar({ className }: ExportToolbarProps) {
  return (
    <div className={className}>
      <button type="button" onClick={() => window.print()}>
        Save as PDF
      </button>
      <Link href="/">Back to CV</Link>
    </div>
  );
}
