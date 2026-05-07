"use client";

import Link from "next/link";
import { useState } from "react";

type ExportToolbarProps = {
  className: string;
  format: "themed-a2" | "executive";
  label?: string;
};

async function downloadThemedPdf() {
  const sheets = Array.from(document.querySelectorAll<HTMLElement>("[data-export-sheet]"));
  const page = sheets[0]?.closest<HTMLElement>("[data-mode]");

  if (sheets.length === 0) {
    window.print();
    return;
  }

  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf")
  ]);

  await document.fonts.ready;

  const previousTheme = document.documentElement.dataset.theme;
  const exportMode = page?.dataset.mode === "light" ? "light" : "dark";

  document.documentElement.dataset.theme = exportMode;
  document.documentElement.style.colorScheme = exportMode;
  page?.setAttribute("data-capturing", "true");

  try {
    const pdf = new jsPDF({
      format: "a2",
      orientation: "portrait",
      unit: "mm"
    });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    for (const [pageIndex, sheet] of sheets.entries()) {
      if (pageIndex > 0) {
        pdf.addPage("a2", "portrait");
      }

      const canvas = await html2canvas(sheet, {
        allowTaint: false,
        backgroundColor: null,
        imageTimeout: 15000,
        scale: Math.min(2, window.devicePixelRatio || 2),
        useCORS: true,
        windowHeight: sheet.scrollHeight,
        windowWidth: sheet.scrollWidth
      });

      pdf.addImage(canvas.toDataURL("image/png", 1), "PNG", 0, 0, pageWidth, pageHeight, undefined, "FAST");
    }

    pdf.save(`Guillermo-Lopez-Garcia-theme-a2-${exportMode}.pdf`);
  } finally {
    if (previousTheme === undefined) {
      delete document.documentElement.dataset.theme;
    } else {
      document.documentElement.dataset.theme = previousTheme;
    }
    document.documentElement.style.colorScheme = previousTheme ?? "";
    page?.removeAttribute("data-capturing");
  }
}

export function ExportToolbar({ className, format, label = "Save as PDF" }: ExportToolbarProps) {
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    if (format === "executive") {
      window.print();
      return;
    }

    setIsSaving(true);
    try {
      await downloadThemedPdf();
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className={className}>
      <button type="button" onClick={handleSave} disabled={isSaving}>
        {isSaving ? "Rendering PDF..." : label}
      </button>
      <Link href="/">Back to CV</Link>
    </div>
  );
}
