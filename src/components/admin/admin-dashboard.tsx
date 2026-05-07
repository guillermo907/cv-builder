"use client";

import { useActionState, useEffect, useMemo, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  removeCvPdfAction,
  saveCvContentAction,
  saveThemeSettingsAction,
  uploadCvAction,
  type SaveState
} from "@/app/actions/site-content";
import { applyThemeVariables } from "@/lib/apply-theme-variables";
import type { CvEducationItem, CvExperienceItem, CvProjectItem, SiteContent } from "@/lib/types";
import { contrastGrade, contrastRatio, normalizeSiteTheme, readableTextColor } from "@/lib/theme-contrast";
import styles from "./admin-dashboard.module.scss";

type AdminDashboardProps = {
  initialContent: SiteContent;
  userEmail: string;
};

const initialState: SaveState = { ok: false, message: "" };
const bannerStyles = [
  {
    value: "editorial",
    title: "Editorial Frame",
    description: "Current strong glass hero with a visible image panel."
  },
  {
    value: "blurred",
    title: "Blurred Atmosphere",
    description: "Mostly blurred wallpaper, minimal image frame, softer CV presence."
  },
  {
    value: "split",
    title: "Gradient Veil",
    description: "Blurred image veil fading from visible to transparent."
  },
  {
    value: "floating",
    title: "Floating Text",
    description: "Almost no card structure; text floats over tinted wallpaper."
  }
] as const;

type PaletteVariant = {
  label: string;
  tokens: {
    accent: string;
    accentAlt: string;
    background: string;
  };
};

type PaletteVariantSet = {
  dark: PaletteVariant[];
  light: PaletteVariant[];
};

export function AdminDashboard({ initialContent, userEmail }: AdminDashboardProps) {
  const router = useRouter();
  const [uploadState, uploadAction, uploading] = useActionState(uploadCvAction, initialState);
  const [removePdfState, removePdfAction, removingPdf] = useActionState(removeCvPdfAction, initialState);
  const [cvState, cvAction, savingCv] = useActionState(saveCvContentAction, initialState);
  const [themeState, themeAction, savingTheme] = useActionState(saveThemeSettingsAction, initialState);
  const [themeDraft, setThemeDraft] = useState(initialContent.theme);
  const [experienceItems, setExperienceItems] = useState(initialContent.cv.experience);
  const [educationItems, setEducationItems] = useState(initialContent.cv.education);
  const [projectItems, setProjectItems] = useState(initialContent.cv.projects);
  const [paletteFileName, setPaletteFileName] = useState("");
  const [palettePreview, setPalettePreview] = useState("");
  const [paletteVariants, setPaletteVariants] = useState<PaletteVariantSet>({ dark: [], light: [] });
  const [selectedPalette, setSelectedPalette] = useState({ dark: 0, light: 0 });
  const normalizedTheme = useMemo(() => normalizeSiteTheme(themeDraft), [themeDraft]);
  const previewWallpaper = palettePreview || themeDraft.backgroundImage || themeDraft.light.backgroundImage;

  useEffect(() => {
    applyThemeVariables(normalizedTheme);
  }, [normalizedTheme]);

  useEffect(() => {
    if (themeState.ok || uploadState.ok || removePdfState.ok) {
      router.refresh();
    }
  }, [removePdfState.ok, router, themeState.ok, uploadState.ok]);

  useEffect(() => {
    return () => {
      if (palettePreview) {
        URL.revokeObjectURL(palettePreview);
      }
    };
  }, [palettePreview]);

  function applyPaletteVariant(mode: "dark" | "light", index: number, variants = paletteVariants) {
    const variant = variants[mode][index] ?? variants[mode][0];
    if (!variant) return;

    setSelectedPalette((current) => ({ ...current, [mode]: index }));
    setThemeDraft((current) => {
      if (mode === "dark") {
        return {
          ...current,
          accent: variant.tokens.accent,
          accentAlt: variant.tokens.accentAlt,
          background: variant.tokens.background
        };
      }

      return {
        ...current,
        light: {
          ...current.light,
          accent: variant.tokens.accent,
          accentAlt: variant.tokens.accentAlt,
          background: variant.tokens.background
        }
      };
    });
  }

  async function handlePaletteFile(file: File | null) {
    if (!file) {
      return;
    }

    setPaletteFileName(file.name);
    setPalettePreview((current) => {
      if (current) {
        URL.revokeObjectURL(current);
      }

      return URL.createObjectURL(file);
    });

    const dataUrl = await readFileAsDataUrl(file);
    const variants = await extractPaletteOptions(dataUrl);
    setPaletteVariants(variants);
    setSelectedPalette({ dark: 0, light: 0 });
    setThemeDraft((current) => ({
      ...current,
      accent: variants.dark[0]?.tokens.accent ?? current.accent,
      accentAlt: variants.dark[0]?.tokens.accentAlt ?? current.accentAlt,
      background: variants.dark[0]?.tokens.background ?? current.background,
      light: {
        ...current.light,
        accent: variants.light[0]?.tokens.accent ?? current.light.accent,
        accentAlt: variants.light[0]?.tokens.accentAlt ?? current.light.accentAlt,
        background: variants.light[0]?.tokens.background ?? current.light.background
      }
    }));
  }

  function addExperienceItem() {
    setExperienceItems((items) => [
      ...items,
      {
        role: "New role",
        company: "",
        period: "",
        highlights: [""]
      }
    ]);
  }

  function updateExperienceItem(index: number, patch: Partial<CvExperienceItem>) {
    setExperienceItems((items) =>
      items.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item))
    );
  }

  function removeExperienceItem(index: number) {
    setExperienceItems((items) => items.filter((_, itemIndex) => itemIndex !== index));
  }

  function addEducationItem() {
    setEducationItems((items) => [
      ...items,
      {
        title: "New education",
        institution: "",
        period: ""
      }
    ]);
  }

  function updateEducationItem(index: number, patch: Partial<CvEducationItem>) {
    setEducationItems((items) =>
      items.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item))
    );
  }

  function removeEducationItem(index: number) {
    setEducationItems((items) => items.filter((_, itemIndex) => itemIndex !== index));
  }

  function addProjectItem() {
    setProjectItems((items) => [
      ...items,
      {
        title: "New project",
        url: "",
        description: ""
      }
    ]);
  }

  function updateProjectItem(index: number, patch: Partial<CvProjectItem>) {
    setProjectItems((items) =>
      items.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item))
    );
  }

  function removeProjectItem(index: number) {
    setProjectItems((items) => items.filter((_, itemIndex) => itemIndex !== index));
  }

  return (
    <main
      className={styles.page}
      style={{
        "--admin-bg": normalizedTheme.background,
        "--admin-fg": normalizedTheme.foreground,
        "--admin-muted": normalizedTheme.muted,
        "--admin-line": normalizedTheme.line,
        "--admin-panel": normalizedTheme.panel,
        "--admin-panel-strong": normalizedTheme.panelStrong,
        "--accent": normalizedTheme.accent,
        "--accent-alt": normalizedTheme.accentAlt,
        "--background": normalizedTheme.background,
        "--foreground": normalizedTheme.foreground,
        "--muted": normalizedTheme.muted,
        "--line": normalizedTheme.line,
        "--panel": normalizedTheme.panel,
        "--panel-strong": normalizedTheme.panelStrong,
        "--ink": normalizedTheme.ink
      } as CSSProperties}
    >
      <section className={styles.shell}>
        <header className={styles.header}>
          <div>
            <p>Admin Panel</p>
            <h1>CV + Theme Controls</h1>
            <span>{userEmail}</span>
          </div>
          <Link href="/" className={styles.homeLink}>
            Back to Home
          </Link>
        </header>

        <ThemePreview
          content={initialContent}
          normalizedTheme={normalizedTheme}
          wallpaper={previewWallpaper}
        />

        <div className={styles.workspaceGrid}>
          <aside className={styles.themeColumn}>
            <section className={styles.card}>
              <h2>Extract Theme From Image</h2>
              <div className={styles.form}>
                <label htmlFor="themeImage">Upload image</label>
                <input
                  id="themeImage"
                  name="themeImage"
                  type="file"
                  accept="image/*"
                  form="themeSettingsForm"
                  onChange={(event) => handlePaletteFile(event.target.files?.[0] ?? null)}
                />
                {palettePreview ? (
                  <span className={styles.imagePreview}>
                    <i style={{ backgroundImage: `url(${palettePreview})` }} />
                    <strong>{paletteFileName}</strong>
                  </span>
                ) : (
                  <span className={styles.imageHint}>Preview updates immediately. Click Save Theme to persist the image and colors.</span>
                )}
              </div>
              {paletteVariants.dark.length > 0 ? (
                <div className={styles.paletteOptions}>
                  <PaletteOptions title="Dark palettes" mode="dark" variants={paletteVariants.dark} selected={selectedPalette.dark} onSelect={applyPaletteVariant} />
                  <PaletteOptions title="Light palettes" mode="light" variants={paletteVariants.light} selected={selectedPalette.light} onSelect={applyPaletteVariant} />
                </div>
              ) : null}
            </section>

            <section className={styles.card}>
              <h2>Manual Theme Settings</h2>
              <form id="themeSettingsForm" action={themeAction} className={styles.compactThemeForm}>
                <input type="hidden" name="backgroundImage" value={themeDraft.backgroundImage} />
                <input type="hidden" name="lightBackgroundImage" value={themeDraft.light.backgroundImage} />
                <input type="hidden" name="bannerStyle" value={themeDraft.bannerStyle ?? "editorial"} />
                <div className={styles.bannerStylePicker}>
                  <span>Homepage banner format</span>
                  <div>
                    {bannerStyles.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        className={(themeDraft.bannerStyle ?? "editorial") === option.value ? styles.activeBannerStyle : undefined}
                        onClick={() => setThemeDraft((theme) => ({ ...theme, bannerStyle: option.value }))}
                      >
                        <i data-banner-preview={option.value} style={{ "--preview-wallpaper": previewWallpaper ? `url(${previewWallpaper})` : "none" } as CSSProperties} />
                        <strong>{option.title}</strong>
                        <small>{option.description}</small>
                      </button>
                    ))}
                  </div>
                </div>
                <ColorField label="Accent" name="accent" value={themeDraft.accent} adjusted={normalizedTheme.accent} background={normalizedTheme.background} onChange={(value) => setThemeDraft((theme) => ({ ...theme, accent: value }))} />
                <ColorField label="Accent Alt" name="accentAlt" value={themeDraft.accentAlt} adjusted={normalizedTheme.accentAlt} background={normalizedTheme.background} onChange={(value) => setThemeDraft((theme) => ({ ...theme, accentAlt: value }))} />
                <ColorField label="Background" name="background" value={themeDraft.background} adjusted={normalizedTheme.background} background={normalizedTheme.foreground} onChange={(value) => setThemeDraft((theme) => ({ ...theme, background: value }))} />
                <label>Contrast
                  <select name="contrast" value={themeDraft.contrast} onChange={(event) => setThemeDraft((theme) => ({ ...theme, contrast: event.target.value as typeof theme.contrast }))}>
                    <option value="soft">soft</option>
                    <option value="balanced">balanced</option>
                    <option value="high">high</option>
                    <option value="editorial">editorial</option>
                  </select>
                </label>
                <ColorField label="Light Accent" name="lightAccent" value={themeDraft.light.accent} adjusted={normalizedTheme.light.accent} background={normalizedTheme.light.background} onChange={(value) => setThemeDraft((theme) => ({ ...theme, light: { ...theme.light, accent: value } }))} />
                <ColorField label="Light Accent Alt" name="lightAccentAlt" value={themeDraft.light.accentAlt} adjusted={normalizedTheme.light.accentAlt} background={normalizedTheme.light.background} onChange={(value) => setThemeDraft((theme) => ({ ...theme, light: { ...theme.light, accentAlt: value } }))} />
                <ColorField label="Light Background" name="lightBackground" value={themeDraft.light.background} adjusted={normalizedTheme.light.background} background={normalizedTheme.light.foreground} onChange={(value) => setThemeDraft((theme) => ({ ...theme, light: { ...theme.light, background: value } }))} />
                <label>Light Contrast
                  <select name="lightContrast" value={themeDraft.light.contrast} onChange={(event) => setThemeDraft((theme) => ({ ...theme, light: { ...theme.light, contrast: event.target.value as typeof theme.light.contrast } }))}>
                    <option value="soft">soft</option>
                    <option value="balanced">balanced</option>
                    <option value="high">high</option>
                    <option value="editorial">editorial</option>
                  </select>
                </label>
                <div className={styles.actions}><button type="submit" disabled={savingTheme}>{savingTheme ? "Saving..." : "Save Theme"}</button></div>
              </form>
              {themeState.message ? <p className={themeState.ok ? styles.success : styles.error}>{themeState.message}</p> : null}
            </section>
          </aside>

          <section className={styles.cvColumn}>
            <section className={styles.card}>
              <h2>Store CV PDF</h2>
              <form action={uploadAction} className={styles.form}>
                <label htmlFor="cvFile">Upload CV</label>
                <input id="cvFile" name="cvFile" type="file" accept="application/pdf,.pdf" required />
                <button type="submit" disabled={uploading}>{uploading ? "Storing PDF..." : "Upload and Store PDF"}</button>
              </form>
              {uploadState.message ? <p className={uploadState.ok ? styles.success : styles.error}>{uploadState.message}</p> : null}
              {initialContent.cvFileUrl ? (
                <form action={removePdfAction} className={styles.attachedPdf}>
                  <div>
                    <span>Attached PDF</span>
                    <strong>{initialContent.sourceFileName ?? "Stored CV PDF"}</strong>
                    <a href={initialContent.cvFileUrl}>Open current file</a>
                  </div>
                  <button type="submit" disabled={removingPdf}>
                    {removingPdf ? "Removing..." : "Remove attached PDF"}
                  </button>
                </form>
              ) : (
                <p className={styles.imageHint}>No CV PDF is currently attached, so the homepage download button stays hidden.</p>
              )}
              {removePdfState.message ? <p className={removePdfState.ok ? styles.success : styles.error}>{removePdfState.message}</p> : null}
            </section>

            <form action={cvAction} className={styles.sectionStack}>
          <details className={styles.card} open>
            <summary>Identity</summary>
            <div className={styles.formGrid}>
              <label>Full name<input name="fullName" defaultValue={initialContent.cv.fullName} /></label>
              <label>Headline<input name="headline" defaultValue={initialContent.cv.headline} /></label>
              <label>Location<input name="location" defaultValue={initialContent.cv.location} /></label>
              <label>Address<input name="address" defaultValue={initialContent.cv.address} /></label>
            </div>
          </details>

          <details className={styles.card}>
            <summary>Contact</summary>
            <div className={styles.formGrid}>
              <label>Email<input name="email" type="email" defaultValue={initialContent.cv.email} /></label>
              <label>Phone<input name="phone" defaultValue={initialContent.cv.phone} /></label>
            </div>
          </details>

          <details className={styles.card}>
            <summary>Profile Summary</summary>
            <label className={styles.fullField}>Summary<textarea name="summary" rows={6} defaultValue={initialContent.cv.summary} /></label>
          </details>

          <details className={styles.card}>
            <summary>Skills</summary>
            <label className={styles.fullField}>One skill per line<textarea name="skills" rows={7} defaultValue={initialContent.cv.skills.join("\n")} /></label>
          </details>

          <details className={styles.card}>
            <summary>Employment History</summary>
            <input type="hidden" name="experienceCount" value={experienceItems.length} />
            <div className={styles.itemStack}>
              {experienceItems.map((item, index) => (
                <details key={`${item.role}-${index}`} className={styles.nestedCard} open={index === 0}>
                  <summary>{item.role || `Experience ${index + 1}`}</summary>
                  <div className={styles.formGrid}>
                    <label>Role<input name={`experience.${index}.role`} value={item.role} onChange={(event) => updateExperienceItem(index, { role: event.target.value })} /></label>
                    <label>Company<input name={`experience.${index}.company`} value={item.company} onChange={(event) => updateExperienceItem(index, { company: event.target.value })} /></label>
                    <label>Period<input name={`experience.${index}.period`} value={item.period} onChange={(event) => updateExperienceItem(index, { period: event.target.value })} /></label>
                    <label className={styles.fullField}>Highlights<textarea name={`experience.${index}.highlights`} rows={5} value={item.highlights.join("\n")} onChange={(event) => updateExperienceItem(index, { highlights: event.target.value.split("\n") })} /></label>
                    <div className={styles.dangerActions}>
                      <button type="button" onClick={() => removeExperienceItem(index)}>Remove employment</button>
                    </div>
                  </div>
                </details>
              ))}
            </div>
            <div className={styles.inlineActions}>
              <button type="button" onClick={addExperienceItem}>Add employment</button>
            </div>
          </details>

          <details className={styles.card}>
            <summary>Education</summary>
            <input type="hidden" name="educationCount" value={educationItems.length} />
            <div className={styles.itemStack}>
              {educationItems.map((item, index) => (
                <details key={`${item.title}-${index}`} className={styles.nestedCard} open={index === 0}>
                  <summary>{item.title || `Education ${index + 1}`}</summary>
                  <div className={styles.formGrid}>
                    <label>Title<input name={`education.${index}.title`} value={item.title} onChange={(event) => updateEducationItem(index, { title: event.target.value })} /></label>
                    <label>Institution<input name={`education.${index}.institution`} value={item.institution} onChange={(event) => updateEducationItem(index, { institution: event.target.value })} /></label>
                    <label>Period<input name={`education.${index}.period`} value={item.period} onChange={(event) => updateEducationItem(index, { period: event.target.value })} /></label>
                    <div className={styles.dangerActions}>
                      <button type="button" onClick={() => removeEducationItem(index)}>Remove education</button>
                    </div>
                  </div>
                </details>
              ))}
            </div>
            <div className={styles.inlineActions}>
              <button type="button" onClick={addEducationItem}>Add education</button>
            </div>
          </details>

          <details className={styles.card}>
            <summary>Projects</summary>
            <input type="hidden" name="projectCount" value={projectItems.length} />
            <label className={styles.toggleField}>
              <input name="showProjects" type="checkbox" defaultChecked={initialContent.cv.showProjects ?? false} />
              <span>Show Projects section on homepage and generated PDF</span>
            </label>
            <div className={styles.itemStack}>
              {projectItems.map((item, index) => (
                <details key={`${item.title}-${index}`} className={styles.nestedCard} open={index === 0}>
                  <summary>{item.title || `Project ${index + 1}`}</summary>
                  <div className={styles.formGrid}>
                    <label>Project name<input name={`project.${index}.title`} value={item.title} onChange={(event) => updateProjectItem(index, { title: event.target.value })} /></label>
                    <label>Website URL<input name={`project.${index}.url`} value={item.url} onChange={(event) => updateProjectItem(index, { url: event.target.value })} /></label>
                    <label className={styles.fullField}>Description<textarea name={`project.${index}.description`} rows={4} value={item.description} onChange={(event) => updateProjectItem(index, { description: event.target.value })} /></label>
                    <div className={styles.dangerActions}>
                      <button type="button" onClick={() => removeProjectItem(index)}>Remove project</button>
                    </div>
                  </div>
                </details>
              ))}
            </div>
            <div className={styles.inlineActions}>
              <button type="button" onClick={addProjectItem}>Add project</button>
            </div>
          </details>

          <div className={styles.actions}><button type="submit" disabled={savingCv}>{savingCv ? "Saving..." : "Save CV Sections"}</button></div>
          {cvState.message ? <p className={cvState.ok ? styles.success : styles.error}>{cvState.message}</p> : null}
            </form>
          </section>
        </div>

        <section className={styles.preview}>
          <h2>Current CV data</h2>
          <p><strong>Name:</strong> {initialContent.cv.fullName}</p>
          <p><strong>Email:</strong> {initialContent.cv.email}</p>
          <p><strong>Phone:</strong> {initialContent.cv.phone}</p>
          <p><strong>Address:</strong> {initialContent.cv.address}</p>
          <p><strong>Source:</strong> {initialContent.sourceFileName ?? "Mock CV"}</p>
          {initialContent.cvFileUrl ? <p><strong>Stored PDF:</strong> <a href={initialContent.cvFileUrl}>Persistent upload</a></p> : null}
        </section>
      </section>
    </main>
  );
}

function ColorField({
  adjusted,
  background,
  label,
  name,
  onChange,
  value
}: {
  adjusted: string;
  background: string;
  label: string;
  name: string;
  onChange: (value: string) => void;
  value: string;
}) {
  const ratio = contrastRatio(adjusted, background);
  const adjustedLabel = adjusted.toLowerCase() === value.toLowerCase() ? "OK" : "Adjusted";

  return (
    <label>
      {label}
      <input type="color" name={name} value={value} onChange={(event) => onChange(event.target.value)} />
      <span className={styles.adjustedChip}>
        <i style={{ background: adjusted }} />
        {adjustedLabel}: {adjusted} · {contrastGrade(ratio)}
      </span>
    </label>
  );
}

function ThemePreview({
  content,
  normalizedTheme,
  wallpaper
}: {
  content: SiteContent;
  normalizedTheme: ReturnType<typeof normalizeSiteTheme>;
  wallpaper: string;
}) {
  const style = {
    "--preview-accent": normalizedTheme.accent,
    "--preview-accent-alt": normalizedTheme.accentAlt,
    "--preview-background": normalizedTheme.background,
    "--preview-foreground": normalizedTheme.foreground,
    "--preview-muted": normalizedTheme.muted,
    "--preview-panel": normalizedTheme.panelStrong,
    "--preview-wallpaper": wallpaper ? `url(${wallpaper})` : "none"
  } as CSSProperties;

  return (
    <section className={styles.themePreview} style={style}>
      <div className={styles.previewHero}>
        <span>{content.cv.headline}</span>
        <strong>{content.cv.fullName}</strong>
        <p>{content.cv.summary}</p>
      </div>
      <div className={styles.previewSidebar}>
        {content.cv.skills.slice(0, 5).map((skill) => (
          <i key={skill}>{skill}</i>
        ))}
      </div>
    </section>
  );
}

function PaletteOptions({
  mode,
  onSelect,
  selected,
  title,
  variants
}: {
  mode: "dark" | "light";
  onSelect: (mode: "dark" | "light", index: number) => void;
  selected: number;
  title: string;
  variants: PaletteVariant[];
}) {
  return (
    <div className={styles.paletteGroup}>
      <span>{title}</span>
      <div>
        {variants.map((variant, index) => (
          <button
            key={`${mode}-${variant.label}`}
            type="button"
            className={index === selected ? styles.activePalette : undefined}
            style={{
              "--palette-bg": variant.tokens.background,
              "--palette-fg": readableTextColor(variant.tokens.background)
            } as CSSProperties}
            onClick={() => onSelect(mode, index)}
          >
            <strong>{variant.label}</strong>
            <i style={{ background: variant.tokens.background }} />
            <i style={{ background: variant.tokens.accent }} />
            <i style={{ background: variant.tokens.accentAlt }} />
          </button>
        ))}
      </div>
    </div>
  );
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(String(reader.result ?? "")));
    reader.addEventListener("error", () => reject(new Error("Could not read image.")));
    reader.readAsDataURL(file);
  });
}

async function loadImage(dataUrl: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", () => reject(new Error("Could not load image.")));
    image.src = dataUrl;
  });
}

function rgbToHex(r: number, g: number, b: number) {
  return `#${[r, g, b]
    .map((value) => Math.max(0, Math.min(255, Math.round(value))).toString(16).padStart(2, "0"))
    .join("")}`;
}

function hslToHex(h: number, s: number, l: number) {
  const saturation = Math.max(0, Math.min(100, s)) / 100;
  const lightness = Math.max(0, Math.min(100, l)) / 100;
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const hue = ((h % 360) + 360) % 360;
  const x = chroma * (1 - Math.abs(((hue / 60) % 2) - 1));
  const match = lightness - chroma / 2;
  let red = 0;
  let green = 0;
  let blue = 0;

  if (hue < 60) {
    red = chroma;
    green = x;
  } else if (hue < 120) {
    red = x;
    green = chroma;
  } else if (hue < 180) {
    green = chroma;
    blue = x;
  } else if (hue < 240) {
    green = x;
    blue = chroma;
  } else if (hue < 300) {
    red = x;
    blue = chroma;
  } else {
    red = chroma;
    blue = x;
  }

  return rgbToHex((red + match) * 255, (green + match) * 255, (blue + match) * 255);
}

function rgbToHsl(r: number, g: number, b: number) {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const lightness = (max + min) / 2;
  const delta = max - min;

  if (delta === 0) {
    return { h: 0, s: 0, l: lightness * 100 };
  }

  const saturation = delta / (1 - Math.abs(2 * lightness - 1));
  let hue = 0;

  if (max === red) {
    hue = 60 * (((green - blue) / delta) % 6);
  } else if (max === green) {
    hue = 60 * ((blue - red) / delta + 2);
  } else {
    hue = 60 * ((red - green) / delta + 4);
  }

  return { h: (hue + 360) % 360, s: saturation * 100, l: lightness * 100 };
}

function hueDistance(a: number, b: number) {
  const distance = Math.abs((((a - b) % 360) + 360) % 360);
  return Math.min(distance, 360 - distance);
}

function shiftedHue(hue: number, shift: number) {
  return (hue + shift + 360) % 360;
}

async function extractPaletteOptions(dataUrl: string): Promise<PaletteVariantSet> {
  const image = await loadImage(dataUrl);
  const canvas = document.createElement("canvas");
  const size = 96;
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d", { willReadFrequently: true });

  if (!context) {
    return { dark: [], light: [] };
  }

  const scale = Math.max(size / image.naturalWidth, size / image.naturalHeight);
  const width = image.naturalWidth * scale;
  const height = image.naturalHeight * scale;
  context.drawImage(image, (size - width) / 2, (size - height) / 2, width, height);

  const data = context.getImageData(0, 0, size, size).data;
  const buckets = new Map<string, { count: number; h: number; s: number; l: number }>();

  for (let index = 0; index < data.length; index += 16) {
    const alpha = data[index + 3];
    if (alpha < 180) continue;

    const hsl = rgbToHsl(data[index], data[index + 1], data[index + 2]);
    if (hsl.l < 8 || hsl.l > 94 || hsl.s < 8) continue;

    const key = `${Math.round(hsl.h / 18)}-${Math.round(hsl.s / 12)}-${Math.round(hsl.l / 12)}`;
    const bucket = buckets.get(key);

    if (bucket) {
      bucket.count += 1;
      bucket.h += hsl.h;
      bucket.s += hsl.s;
      bucket.l += hsl.l;
    } else {
      buckets.set(key, { count: 1, h: hsl.h, s: hsl.s, l: hsl.l });
    }
  }

  const candidates = [...buckets.values()]
    .map((bucket) => ({
      h: bucket.h / bucket.count,
      s: bucket.s / bucket.count,
      l: bucket.l / bucket.count,
      score: bucket.count * (0.8 + bucket.s / bucket.count / 80)
    }))
    .sort((a, b) => b.score - a.score);

  const diverse = candidates.reduce<Array<{ h: number; s: number; l: number; score: number }>>((picked, candidate) => {
    if (picked.length >= 6) return picked;
    if (picked.every((item) => hueDistance(item.h, candidate.h) > 18)) {
      picked.push(candidate);
    }
    return picked;
  }, []);

  const base = diverse[0] ?? { h: 214, s: 70, l: 58, score: 1 };
  const colorSet = [
    base,
    diverse[1] ?? { ...base, h: shiftedHue(base.h, 32), s: Math.max(42, base.s - 18) },
    diverse[2] ?? { ...base, h: shiftedHue(base.h, -42), s: Math.min(88, base.s + 14) },
    diverse[3] ?? { ...base, h: shiftedHue(base.h, 118), s: Math.max(36, base.s - 28) },
    diverse[4] ?? { ...base, h: shiftedHue(base.h, 180), s: Math.min(92, base.s + 4) },
    diverse[5] ?? { ...base, h: shiftedHue(base.h, -128), s: Math.max(30, base.s - 34) }
  ];

  const moods = [
    { label: "Muted", bgShift: 0, accentShift: 0, altShift: 34, darkBgS: 26, darkBgL: 10, lightBgS: 12, lightBgL: 96, accentS: 46 },
    { label: "Editorial", bgShift: -18, accentShift: 0, altShift: 46, darkBgS: 34, darkBgL: 13, lightBgS: 16, lightBgL: 94, accentS: 58 },
    { label: "Vivid", bgShift: 28, accentShift: 4, altShift: -52, darkBgS: 48, darkBgL: 16, lightBgS: 24, lightBgL: 91, accentS: 78 },
    { label: "Deep", bgShift: 118, accentShift: 0, altShift: 180, darkBgS: 38, darkBgL: 8, lightBgS: 10, lightBgL: 97, accentS: 64 },
    { label: "Studio", bgShift: 180, accentShift: -8, altShift: 72, darkBgS: 42, darkBgL: 18, lightBgS: 20, lightBgL: 92, accentS: 70 },
    { label: "Airy", bgShift: -128, accentShift: 12, altShift: -86, darkBgS: 30, darkBgL: 22, lightBgS: 28, lightBgL: 89, accentS: 52 }
  ];

  return {
    dark: moods.map((mood, index) => {
      const source = colorSet[index];
      return {
      label: mood.label,
      tokens: {
        accent: hslToHex(shiftedHue(source.h, mood.accentShift), Math.max(mood.accentS, source.s), Math.max(46, Math.min(68, source.l + 8))),
        accentAlt: hslToHex(shiftedHue(source.h, mood.altShift), Math.max(38, Math.min(84, source.s - 8)), 62),
        background: hslToHex(shiftedHue(source.h, mood.bgShift), mood.darkBgS, mood.darkBgL)
      }
    }; }),
    light: moods.map((mood, index) => {
      const source = colorSet[index];
      return {
      label: mood.label,
      tokens: {
        accent: hslToHex(shiftedHue(source.h, mood.accentShift), Math.max(46, Math.min(82, source.s + 8)), 38),
        accentAlt: hslToHex(shiftedHue(source.h, mood.altShift), Math.max(34, Math.min(74, source.s - 14)), 34),
        background: hslToHex(shiftedHue(source.h, mood.bgShift), mood.lightBgS, mood.lightBgL)
      }
    }; })
  };
}
