import type { NormalizedSiteTheme } from "./theme-contrast";

export function themeVariableEntries(theme: NormalizedSiteTheme) {
  return {
    "--accent": theme.accent,
    "--accent-alt": theme.accentAlt,
    "--background": theme.background,
    "--foreground": theme.foreground,
    "--muted": theme.muted,
    "--line": theme.line,
    "--panel": theme.panel,
    "--panel-strong": theme.panelStrong,
    "--ink": theme.ink,
    "--light-accent": theme.light.accent,
    "--light-accent-alt": theme.light.accentAlt,
    "--light-background": theme.light.background,
    "--light-foreground": theme.light.foreground,
    "--light-muted": theme.light.muted,
    "--light-line": theme.light.line,
    "--light-panel": theme.light.panel,
    "--light-panel-strong": theme.light.panelStrong,
    "--light-ink": theme.light.ink
  };
}

export function applyThemeVariables(theme: NormalizedSiteTheme, target: HTMLElement = document.documentElement) {
  Object.entries(themeVariableEntries(theme)).forEach(([property, value]) => {
    target.style.setProperty(property, value);
  });
}
