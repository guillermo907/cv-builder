"use client";

import { useActionState, useEffect, useMemo, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { saveThemeSettingsAction, type SaveState } from "@/app/actions/site-content";
import { applyThemeVariables } from "@/lib/apply-theme-variables";
import type { SiteContent } from "@/lib/types";
import { contrastGrade, contrastRatio, normalizeSiteTheme, readableTextColor } from "@/lib/theme-contrast";
import styles from "./admin-dashboard.module.scss";

type AdminDashboardProps = {
  initialContent: SiteContent;
  userEmail: string;
};

const initialState: SaveState = { ok: false, message: "" };
const defaultSurface = {
  wallpaperVisibility: 30,
  surfaceVisibility: 30,
  strongScrim: 88,
  mediumScrim: 56,
  borderRadius: 16,
  borderWidth: 1,
  blurStrength: 10
};
const bannerStyles = [
  {
    value: "editorial",
    title: "Editorial Frame",
    description: "Current strong glass hero with a visible image panel."
  },
  {
    value: "blurred",
    title: "Blurred Atmosphere",
    description: "Mostly blurred wallpaper, minimal image frame, and a softer overall presence."
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
  const [themeState, themeAction, savingTheme] = useActionState(saveThemeSettingsAction, initialState);
  const [themeDraft, setThemeDraft] = useState(initialContent.theme);
  const [paletteFileName, setPaletteFileName] = useState("");
  const [palettePreview, setPalettePreview] = useState("");
  const [paletteVariants, setPaletteVariants] = useState<PaletteVariantSet>({ dark: [], light: [] });
  const [selectedPalette, setSelectedPalette] = useState({ dark: 0, light: 0 });
  const surface = { ...defaultSurface, ...themeDraft.surface };
  const normalizedTheme = useMemo(() => normalizeSiteTheme(themeDraft), [themeDraft]);
  const previewWallpaper = palettePreview || themeDraft.backgroundImage || themeDraft.light.backgroundImage;

  useEffect(() => {
    applyThemeVariables(normalizedTheme);
  }, [normalizedTheme]);

  useEffect(() => {
    if (themeState.ok) {
      router.refresh();
    }
  }, [router, themeState.ok]);

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
            <h1>Theme Controls</h1>
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
            <details className={styles.card} open>
              <summary>Extract Theme From Image</summary>
              <div className={styles.cardBody}>
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
              </div>
            </details>

            <details className={styles.card} open>
              <summary>Manual Theme Settings</summary>
              <div className={styles.cardBody}>
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
                  <label>Wallpaper visibility ({surface.wallpaperVisibility}%)
                    <input type="range" name="surface.wallpaperVisibility" min={0} max={100} value={surface.wallpaperVisibility} onChange={(event) => setThemeDraft((theme) => ({ ...theme, surface: { ...defaultSurface, ...theme.surface, wallpaperVisibility: Number(event.target.value) } }))} />
                  </label>
                  <label>Surface visibility ({surface.surfaceVisibility}%)
                    <input type="range" name="surface.surfaceVisibility" min={0} max={100} value={surface.surfaceVisibility} onChange={(event) => setThemeDraft((theme) => ({ ...theme, surface: { ...defaultSurface, ...theme.surface, surfaceVisibility: Number(event.target.value) } }))} />
                  </label>
                  <label>Strong scrim ({surface.strongScrim}%)
                    <input type="range" name="surface.strongScrim" min={0} max={100} value={surface.strongScrim} onChange={(event) => setThemeDraft((theme) => ({ ...theme, surface: { ...defaultSurface, ...theme.surface, strongScrim: Number(event.target.value) } }))} />
                  </label>
                  <label>Medium scrim ({surface.mediumScrim}%)
                    <input type="range" name="surface.mediumScrim" min={0} max={100} value={surface.mediumScrim} onChange={(event) => setThemeDraft((theme) => ({ ...theme, surface: { ...defaultSurface, ...theme.surface, mediumScrim: Number(event.target.value) } }))} />
                  </label>
                  <label>Border radius ({surface.borderRadius}px)
                    <input type="range" name="surface.borderRadius" min={0} max={40} value={surface.borderRadius} onChange={(event) => setThemeDraft((theme) => ({ ...theme, surface: { ...defaultSurface, ...theme.surface, borderRadius: Number(event.target.value) } }))} />
                  </label>
                  <label>Border width ({surface.borderWidth}px)
                    <input type="range" name="surface.borderWidth" min={0} max={6} value={surface.borderWidth} onChange={(event) => setThemeDraft((theme) => ({ ...theme, surface: { ...defaultSurface, ...theme.surface, borderWidth: Number(event.target.value) } }))} />
                  </label>
                  <label>Blur strength ({surface.blurStrength}px)
                    <input type="range" name="surface.blurStrength" min={0} max={40} value={surface.blurStrength} onChange={(event) => setThemeDraft((theme) => ({ ...theme, surface: { ...defaultSurface, ...theme.surface, blurStrength: Number(event.target.value) } }))} />
                  </label>
                  <div className={styles.actions}><button type="submit" disabled={savingTheme}>{savingTheme ? "Saving..." : "Save Theme"}</button></div>
                </form>
                {themeState.message ? <p className={themeState.ok ? styles.success : styles.error}>{themeState.message}</p> : null}
              </div>
            </details>
          </aside>
        </div>
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
        <span>Live Theme Preview</span>
        <strong>{content.siteTitle}</strong>
        <p>Prueba paleta, contraste, wallpaper y estructura visual del home sin mezclar contenido heredado de otras apps.</p>
      </div>
      <div className={styles.previewSidebar}>
        {["Theme", "Contrast", "Wallpaper", "Surface", "Accent"].map((item) => (
          <i key={item}>{item}</i>
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
