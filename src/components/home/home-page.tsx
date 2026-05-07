"use client";

import type { SiteContent } from "@/lib/types";
import { applyThemeVariables } from "@/lib/apply-theme-variables";
import { normalizeSiteTheme } from "@/lib/theme-contrast";
import Link from "next/link";
import { useEffect, useMemo, useSyncExternalStore } from "react";
import { ThemeModeToggle } from "./theme-mode-toggle";
import styles from "./home-page.module.scss";

type HomePageProps = {
  content: SiteContent;
};

type Locale = "en" | "es";

let localeHydrated = false;

function getStoredLocale(): Locale {
  if (typeof window === "undefined") return "es";
  if (!localeHydrated) return "es";

  const saved = window.localStorage.getItem("site-locale");
  if (saved === "en" || saved === "es") return saved;
  return window.navigator.language.toLowerCase().startsWith("es") ? "es" : "en";
}

function subscribeLocale(callback: () => void) {
  localeHydrated = true;
  window.setTimeout(callback, 0);
  window.addEventListener("storage", callback);
  window.addEventListener("site-locale-change", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("site-locale-change", callback);
  };
}

function setStoredLocale(locale: Locale) {
  window.localStorage.setItem("site-locale", locale);
  window.dispatchEvent(new Event("site-locale-change"));
}

export function HomePage({ content }: HomePageProps) {
  const locale = useSyncExternalStore<Locale>(
    subscribeLocale,
    getStoredLocale,
    () => "es",
  );
  const normalizedTheme = useMemo(() => normalizeSiteTheme(content.theme), [content.theme]);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  useEffect(() => {
    applyThemeVariables(normalizedTheme);
  }, [normalizedTheme]);

  const localized = useMemo(() => {
    if (locale !== "es") return content;

    return {
      ...content,
      siteTitle: content.locales?.es?.siteTitle ?? content.siteTitle,
      cv: {
        ...content.cv,
        ...content.locales?.es?.cv,
      },
    };
  }, [content, locale]);

  const labels =
    locale === "es"
      ? {
          skills: "Habilidades",
          experience: "Experiencia",
          education: "Educación",
          location: "Ubicación",
          contact: "Contacto",
          languageLabel: "Cambiar idioma",
          cvBuilder: "Constructor de CV",
        }
      : {
          skills: "Skills",
          experience: "Experience",
          education: "Education",
          location: "Location",
          contact: "Contact",
          languageLabel: "Change language",
          cvBuilder: "CV Builder",
        };

  const wallpaper =
    content.theme.backgroundImage || content.theme.light.backgroundImage;

  return (
    <main
      className={styles.page}
      data-banner={content.theme.bannerStyle ?? "editorial"}
      data-contrast={content.theme.contrast}
      data-theme-scope
      style={
        wallpaper
          ? ({ "--cv-wallpaper": `url(${wallpaper})` } as React.CSSProperties)
          : undefined
      }
    >
      <nav className={styles.nav}>
        <div className={styles.brand}>
          <span>{labels.cvBuilder}</span>
          <strong>{localized.siteTitle}</strong>
        </div>
        <div className={styles.navLinks}>
          <LanguageToggle
            locale={locale}
            onChange={setStoredLocale}
            label={labels.languageLabel}
          />
          <ThemeModeToggle />
          <Link href="/admin" className={styles.adminLink}>
            Admin
          </Link>
        </div>
      </nav>

      <section className={styles.hero}>
        {wallpaper ? (
          <div className={styles.wallpaperBanner} aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element -- Wallpaper can be a locally persisted data URL, so next/image is not reliable here. */}
            <img src={wallpaper} alt="" />
          </div>
        ) : null}
        <div className={styles.heroCopy}>
          <p className={styles.kicker}>{localized.cv.headline}</p>
          <h1>{localized.cv.fullName}</h1>
          <p>{localized.cv.summary}</p>
        </div>
      </section>

      <section className={styles.cvGrid}>
        <article className={styles.mainCard}>
          <div className={styles.metaRow}>
            <span>
              {labels.location}: {localized.cv.location || localized.cv.address}
            </span>
            <span>
              {labels.contact}: {localized.cv.email}{" "}
              {localized.cv.phone ? `· ${localized.cv.phone}` : ""}
            </span>
          </div>

          <h2>{labels.experience}</h2>
          <div className={styles.experienceList}>
            {localized.cv.experience.map((item, index) => (
              <article
                key={`${item.role}-${index}`}
                className={styles.experienceItem}
              >
                <h3>{item.role}</h3>
                <p>
                  {item.company} · {item.period}
                </p>
                <ul>
                  {item.highlights.map((highlight) => (
                    <li key={highlight}>{highlight}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </article>

        <aside className={styles.sideCard}>
          <h2>{labels.skills}</h2>
          <ul className={styles.skillList}>
            {localized.cv.skills.map((skill) => (
              <li key={skill}>{skill}</li>
            ))}
          </ul>

          <h2>{labels.education}</h2>
          <div className={styles.educationList}>
            {localized.cv.education.map((item) => (
              <article key={`${item.title}-${item.institution}`}>
                <h3>{item.title}</h3>
                <p>{item.institution}</p>
                <span>{item.period}</span>
              </article>
            ))}
          </div>

          {content.cvFileUrl ? (
            <a href={content.cvFileUrl} className={styles.downloadLink}>
              Download CV
            </a>
          ) : null}
          <div className={styles.generatedDownloads}>
            <span>Generate PDF from this page</span>
            <a href="/cv-export/executive" target="_blank" rel="noreferrer">
              Generate PDF file
            </a>
          </div>
        </aside>
      </section>
    </main>
  );
}

function LanguageToggle({
  locale,
  label,
  onChange,
}: {
  locale: Locale;
  label: string;
  onChange: (locale: Locale) => void;
}) {
  return (
    <button
      className={styles.languageToggle}
      type="button"
      aria-label={label}
      onClick={() => onChange(locale === "en" ? "es" : "en")}
    >
      <span className={locale === "en" ? styles.activeLanguage : undefined}>
        EN
      </span>
      <span className={locale === "es" ? styles.activeLanguage : undefined}>
        ES
      </span>
    </button>
  );
}
