import type { Metadata } from "next";
import Script from "next/script";
import { getSiteContent } from "@/lib/content";
import { themeCssVariables } from "@/lib/theme-contrast";
import "./globals.scss";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getSiteContent();

  return {
    metadataBase: new URL(
      process.env.NEXTAUTH_URL ??
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
    ),
    title: `${content.cv.fullName} | CV`,
    description: content.cv.headline,
    openGraph: {
      title: `${content.cv.fullName} | CV`,
      description: content.cv.headline,
      images: ["/opengraph-image"]
    }
  };
}

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const content = await getSiteContent();

  return (
    <html
      lang="en"
      data-theme="dark"
      style={themeCssVariables(content.theme) as React.CSSProperties}
      suppressHydrationWarning
    >
      <body>
        <Script id="theme-restore" strategy="beforeInteractive">
          {`try{var t=localStorage.getItem("auto-gdl-theme");if(t==="dark"||t==="light"){document.documentElement.dataset.theme=t;document.documentElement.style.colorScheme=t;}}catch(e){}`}
        </Script>
        {children}
      </body>
    </html>
  );
}
