import { ImageResponse } from "next/og";
import { getSiteContent } from "@/lib/content";

export const size = {
  width: 1200,
  height: 630
};

export const contentType = "image/png";

export default async function Image() {
  const content = await getSiteContent();

  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "flex-end",
          background: `radial-gradient(circle at 20% 20%, ${content.theme.accent}66, transparent 340px), linear-gradient(135deg, ${content.theme.background}, #060b18)`,
          color: "#eef3ff",
          display: "flex",
          height: "100%",
          padding: 70,
          width: "100%"
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ color: content.theme.accent, fontSize: 30, letterSpacing: 6, textTransform: "uppercase" }}>
            Curriculum Vitae
          </div>
          <div style={{ fontSize: 88, fontWeight: 800, letterSpacing: -4, lineHeight: 0.92 }}>
            {content.cv.fullName}
          </div>
          <div style={{ color: "#c9d7ff", fontSize: 42, maxWidth: 900 }}>{content.cv.headline}</div>
        </div>
      </div>
    ),
    size
  );
}
