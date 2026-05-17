import type { Metadata } from "next";
import Script from "next/script";
import { getSiteContent } from "@/lib/content";
import { themeCssVariables } from "@/lib/theme-contrast";
import "./globals.scss";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getSiteContent();
  const seoTitle = content.seo?.title ?? `${content.cv.fullName} | Venue Platform`;
  const seoDescription = content.seo?.description ?? content.heroText ?? content.cv.headline;
  const ogImage = content.seo?.ogImage ?? "/opengraph-image";

  return {
    metadataBase: new URL(
      process.env.NEXTAUTH_URL ??
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
    ),
    title: seoTitle,
    description: seoDescription,
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      images: [ogImage]
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
