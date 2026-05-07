import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import { getSiteContent } from "@/lib/content";
import { themeCssVariables } from "@/lib/theme-contrast";
import { AutoPrint } from "@/components/cv-export/auto-print";
import { ExportToolbar } from "@/components/cv-export/export-toolbar";
import styles from "./page.module.scss";

export const dynamic = "force-dynamic";

type ExportPageProps = {
  params: Promise<{ variant: string }>;
  searchParams: Promise<{ mode?: string }>;
};

export default async function ExportPage({ params, searchParams }: ExportPageProps) {
  const { variant } = await params;
  const { mode } = await searchParams;
  if (variant !== "themed" && variant !== "executive") notFound();

  const content = await getSiteContent();
  const wallpaper = content.theme.backgroundImage || content.theme.light.backgroundImage;
  const isThemed = variant === "themed";
  const isLight = mode === "light";
  const themeVariables = themeCssVariables(content.theme) as CSSProperties;

  return (
    <main
      className={`${styles.page} ${isThemed ? styles.themed : styles.executive}`}
      data-mode={isLight ? "light" : "dark"}
      style={{
        ...themeVariables,
        ...(wallpaper ? ({ "--cv-wallpaper": `url(${wallpaper})` } as CSSProperties) : {})
      }}
    >
      <AutoPrint />
      <ExportToolbar className={styles.toolbar} />
      <article className={styles.sheet}>
        <header className={styles.header}>
          <div>
            <p>{content.cv.headline}</p>
            <h1>{content.cv.fullName}</h1>
          </div>
          <ul>
            <li>{content.cv.location || content.cv.address}</li>
            <li>{content.cv.email}</li>
            <li>{content.cv.phone}</li>
          </ul>
        </header>

        <section className={styles.summary}>
          <h2>Profile</h2>
          <p>{content.cv.summary}</p>
        </section>

        <section className={styles.experience}>
          <h2>Professional Experience</h2>
          {content.cv.experience.map((item) => (
            <article key={`${item.company}-${item.role}`}>
              <div>
                <h3>{item.company}</h3>
                <span>{item.period}</span>
              </div>
              <p>{item.role}</p>
              <ul>
                {item.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}
              </ul>
            </article>
          ))}
        </section>

        <aside className={styles.sidebar}>
          <section>
            <h2>Technical Skills</h2>
            <ul className={styles.skills}>
              {content.cv.skills.map((skill) => <li key={skill}>{skill}</li>)}
            </ul>
          </section>
          <section>
            <h2>Education</h2>
            {content.cv.education.map((item) => (
              <article key={`${item.institution}-${item.title}`}>
                <h3>{item.institution}</h3>
                <p>{item.title}</p>
                <span>{item.period}</span>
              </article>
            ))}
          </section>
        </aside>
      </article>
    </main>
  );
}
