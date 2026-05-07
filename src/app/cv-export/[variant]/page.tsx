import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import { getSiteContent } from "@/lib/content";
import { getRgb, themeCssVariables } from "@/lib/theme-contrast";
import { AutoPrint } from "@/components/cv-export/auto-print";
import { ExportToolbar } from "@/components/cv-export/export-toolbar";
import type { CvContent, CvEducationItem, CvExperienceItem } from "@/lib/types";
import styles from "./page.module.scss";

export const dynamic = "force-dynamic";

const firstPageExperienceCount = 3;

type ExportPageProps = {
  params: Promise<{ variant: string }>;
  searchParams: Promise<{ mode?: string }>;
};

type CssVariableProperties = CSSProperties & Record<`--${string}`, string>;

type ExportSheetProps = {
  cv: CvContent;
  experience: CvExperienceItem[];
  education?: CvEducationItem[];
  showHeader?: boolean;
  showProfile?: boolean;
  showSidebar?: boolean;
  title?: string;
};

function ExportSheet({
  cv,
  education = [],
  experience,
  showHeader = true,
  showProfile = true,
  showSidebar = true,
  title = "Professional Experience"
}: ExportSheetProps) {
  return (
    <article className={`${styles.sheet} ${showSidebar ? "" : styles.continuationSheet}`} data-export-sheet>
      {showHeader ? (
        <header className={styles.header}>
          <div>
            <p>{cv.headline}</p>
            <h1>{cv.fullName}</h1>
          </div>
          <ul>
            <li>{cv.location || cv.address}</li>
            <li>{cv.email}</li>
            <li>{cv.phone}</li>
          </ul>
        </header>
      ) : null}

      {showProfile ? (
        <section className={styles.summary}>
          <h2>Profile</h2>
          <p>{cv.summary}</p>
        </section>
      ) : null}

      <section className={styles.experience}>
        <h2>{title}</h2>
        {experience.map((item) => (
          <article key={`${item.company}-${item.role}`} data-export-experience-item>
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

      {showSidebar ? (
        <aside className={styles.sidebar}>
          <section>
            <h2>Technical Skills</h2>
            <ul className={styles.skills}>
              {cv.skills.map((skill) => <li key={skill}>{skill}</li>)}
            </ul>
          </section>
          <section>
            <h2>Education</h2>
            {education.map((item) => (
              <article key={`${item.institution}-${item.title}`} data-export-education-item>
                <h3>{item.institution}</h3>
                <p>{item.title}</p>
                <span>{item.period}</span>
              </article>
            ))}
          </section>
        </aside>
      ) : null}
    </article>
  );
}

export default async function ExportPage({ params, searchParams }: ExportPageProps) {
  const { variant } = await params;
  const { mode } = await searchParams;
  if (variant !== "themed" && variant !== "executive") notFound();

  const content = await getSiteContent();
  const isThemed = variant === "themed";
  const isLight = mode === "light";
  const wallpaper = isLight
    ? content.theme.light.backgroundImage || content.theme.backgroundImage
    : content.theme.backgroundImage || content.theme.light.backgroundImage;
  const themeVariables = themeCssVariables(content.theme) as Record<string, string>;
  const activeThemeVariables: CssVariableProperties = {
    ...themeVariables,
    ...(isLight
      ? {
          "--accent": themeVariables["--light-accent"],
          "--accent-alt": themeVariables["--light-accent-alt"],
          "--background": themeVariables["--light-background"],
          "--foreground": themeVariables["--light-foreground"],
          "--muted": themeVariables["--light-muted"],
          "--line": themeVariables["--light-line"],
          "--panel": themeVariables["--light-panel"],
          "--panel-strong": themeVariables["--light-panel-strong"],
          "--ink": themeVariables["--light-ink"]
        }
      : {})
  };
  const accentRgb = getRgb(String(activeThemeVariables["--accent"]));
  const accentAltRgb = getRgb(String(activeThemeVariables["--accent-alt"]));
  const backgroundRgb = getRgb(String(activeThemeVariables["--background"]));
  const firstPageExperience = content.cv.experience.slice(0, firstPageExperienceCount);
  const remainingExperience = content.cv.experience.slice(firstPageExperienceCount);

  return (
    <main
      className={`${styles.page} ${isThemed ? styles.themed : styles.executive}`}
      data-format={isThemed ? "a2" : "a4"}
      data-mode={isLight ? "light" : "dark"}
      style={{
        ...activeThemeVariables,
        "--accent-rgb": `${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}`,
        "--accent-alt-rgb": `${accentAltRgb.r}, ${accentAltRgb.g}, ${accentAltRgb.b}`,
        "--background-rgb": `${backgroundRgb.r}, ${backgroundRgb.g}, ${backgroundRgb.b}`,
        ...(wallpaper ? ({ "--cv-wallpaper": `url(${wallpaper})` } as CSSProperties) : {})
      } as CssVariableProperties}
    >
      {isThemed ? null : <AutoPrint />}
      <ExportToolbar
        className={styles.toolbar}
        format={isThemed ? "themed-a2" : "executive"}
        label={isThemed ? "Save Theme A2 PDF" : "Save PDF"}
      />
      <ExportSheet
        cv={content.cv}
        education={content.cv.education}
        experience={firstPageExperience}
        showSidebar
      />
      {remainingExperience.length > 0 ? (
        <ExportSheet
          cv={content.cv}
          experience={remainingExperience}
          showHeader={false}
          showProfile={false}
          showSidebar={false}
          title="Professional Experience, continued"
        />
      ) : null}
    </main>
  );
}
