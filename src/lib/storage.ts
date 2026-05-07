import { promises as fs } from "node:fs";
import path from "node:path";
import { del, put } from "@vercel/blob";

export function hasBlobStorage() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export function isVercelRuntime() {
  return Boolean(process.env.VERCEL);
}

export function shouldUseBlobStorage() {
  return hasBlobStorage() && (isVercelRuntime() || process.env.USE_BLOB_STORAGE_LOCAL === "true");
}

export function assertWritableStorage() {
  if (isVercelRuntime() && !hasBlobStorage()) {
    throw new Error("Persistent storage is not configured. Set BLOB_READ_WRITE_TOKEN in Vercel.");
  }
}

function versionedUrl(url: string) {
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}v=${Date.now()}`;
}

function blobProxyUrl(pathname: string) {
  return versionedUrl(`/api/blob/${pathname.split("/").map(encodeURIComponent).join("/")}`);
}

function blobPathFromProxyUrl(url: string) {
  const [pathOnly] = url.split("?");
  const prefix = "/api/blob/";

  if (!pathOnly.startsWith(prefix)) {
    return "";
  }

  return pathOnly
    .slice(prefix.length)
    .split("/")
    .map(decodeURIComponent)
    .join("/");
}

export async function savePublicAsset({
  body,
  contentType,
  localPath,
  pathname
}: {
  body: Buffer;
  contentType: string;
  localPath: string;
  pathname: string;
}) {
  assertWritableStorage();

  if (shouldUseBlobStorage()) {
    const blob = await put(pathname, body, {
      access: "private",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType
    });

    return blobProxyUrl(blob.pathname);
  }

  const filePath = path.join(process.cwd(), "public", localPath);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, body);

  return versionedUrl(`/${localPath}`);
}

export async function deletePublicAsset(url?: string) {
  if (!url) {
    return;
  }

  if (shouldUseBlobStorage()) {
    const pathname = blobPathFromProxyUrl(url);

    if (pathname) {
      await del(pathname);
    }

    return;
  }

  const [localUrl] = url.split("?");

  if (!localUrl.startsWith("/uploads/")) {
    return;
  }

  await fs.rm(path.join(process.cwd(), "public", localUrl), { force: true });
}
