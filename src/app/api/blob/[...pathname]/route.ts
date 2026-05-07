import { get } from "@vercel/blob";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ pathname: string[] }> }) {
  const { pathname } = await params;
  const blobPath = pathname.map(decodeURIComponent).join("/");

  if (!blobPath || (!blobPath.startsWith("assets/") && !blobPath.startsWith("cv/"))) {
    return new Response("Not found", { status: 404 });
  }

  const result = await get(blobPath, { access: "private", useCache: false });

  if (!result || result.statusCode !== 200) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(result.stream, {
    headers: {
      "Cache-Control": blobPath.startsWith("assets/")
        ? "private, max-age=0, no-cache, no-store, must-revalidate"
        : "private, max-age=0, no-store",
      "Content-Disposition": blobPath.startsWith("cv/")
        ? `attachment; filename="${blobPath.split("/").at(-1) ?? "cv.pdf"}"`
        : result.blob.contentDisposition,
      "Content-Type": result.blob.contentType
    }
  });
}
