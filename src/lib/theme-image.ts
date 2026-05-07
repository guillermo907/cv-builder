import { Jimp } from "jimp";

function rgbToHex(r: number, g: number, b: number) {
  return `#${[r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("")}`;
}

function intToRgba(color: number) {
  return {
    r: (color >> 24) & 255,
    g: (color >> 16) & 255,
    b: (color >> 8) & 255,
    a: color & 255
  };
}

function rgbToHsl(r: number, g: number, b: number) {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;

  if (max === min) return { h: 0, s: 0, l };

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;

  switch (max) {
    case rn:
      h = (gn - bn) / d + (gn < bn ? 6 : 0);
      break;
    case gn:
      h = (bn - rn) / d + 2;
      break;
    default:
      h = (rn - gn) / d + 4;
      break;
  }

  h /= 6;
  return { h, s, l };
}

export async function extractThemeFromImageBuffer(buffer: Buffer) {
  const image = await Jimp.read(buffer);
  image.resize({ w: 180 });

  const buckets = new Map<string, { count: number; r: number; g: number; b: number; sat: number }>();

  for (let y = 0; y < image.bitmap.height; y += 2) {
    for (let x = 0; x < image.bitmap.width; x += 2) {
      const { r, g, b, a } = intToRgba(image.getPixelColor(x, y));
      if (a < 180) continue;

      const key = `${Math.round(r / 24)}-${Math.round(g / 24)}-${Math.round(b / 24)}`;
      const hsl = rgbToHsl(r, g, b);
      const entry = buckets.get(key);

      if (entry) {
        entry.count += 1;
        entry.r += r;
        entry.g += g;
        entry.b += b;
        entry.sat += hsl.s;
      } else {
        buckets.set(key, { count: 1, r, g, b, sat: hsl.s });
      }
    }
  }

  const ranked = [...buckets.values()]
    .map((item) => ({
      ...item,
      avgR: item.r / item.count,
      avgG: item.g / item.count,
      avgB: item.b / item.count,
      avgSat: item.sat / item.count,
      score: item.count * (0.65 + item.sat / item.count)
    }))
    .sort((a, b) => b.score - a.score);

  const primary = ranked[0] ?? { avgR: 95, avgG: 141, avgB: 255, avgSat: 0.65 };
  const secondary =
    ranked.find((item) => Math.abs(item.avgSat - primary.avgSat) > 0.1) ??
    ranked[1] ??
    { avgR: 78, avgG: 213, avgB: 181 };

  const background = ranked
    .slice(0, 10)
    .reduce(
      (acc, item) => ({
        r: acc.r + item.avgR * item.count,
        g: acc.g + item.avgG * item.count,
        b: acc.b + item.avgB * item.count,
        w: acc.w + item.count
      }),
      { r: 0, g: 0, b: 0, w: 0 }
    );

  const br = background.w > 0 ? background.r / background.w : 10;
  const bg = background.w > 0 ? background.g / background.w : 16;
  const bb = background.w > 0 ? background.b / background.w : 32;

  return {
    accent: rgbToHex(primary.avgR, primary.avgG, primary.avgB),
    accentAlt: rgbToHex(secondary.avgR, secondary.avgG, secondary.avgB),
    background: rgbToHex(br * 0.28, bg * 0.28, bb * 0.35),
    lightBackground: rgbToHex(242, 246, 255)
  };
}

export async function createWallpaperDataUrl(buffer: Buffer) {
  const wallpaper = await createWallpaperBuffer(buffer);

  return `data:image/jpeg;base64,${wallpaper.toString("base64")}`;
}

export async function createWallpaperBuffer(buffer: Buffer) {
  const image = await Jimp.read(buffer);
  image.resize({ w: Math.min(1400, image.bitmap.width) });

  return image.getBuffer("image/jpeg", { quality: 72 });
}
