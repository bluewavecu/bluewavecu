import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

const CONTENT_TYPES = new Map<string, string>([
  ["jpg", "image/jpeg"],
  ["jpeg", "image/jpeg"],
  ["png", "image/png"],
  ["webp", "image/webp"],
  ["gif", "image/gif"],
  ["bmp", "image/bmp"],
  ["heic", "image/heic"],
  ["heif", "image/heif"],
  ["avif", "image/avif"],
  ["tiff", "image/tiff"],
]);

export function getUploadContentType(filePath: string) {
  const extension = path.extname(filePath).slice(1).toLowerCase();
  return CONTENT_TYPES.get(extension) ?? "application/octet-stream";
}

export async function serveUploadFile(absolutePath: string) {
  const buffer = await readFile(absolutePath);

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": getUploadContentType(absolutePath),
      "Cache-Control": "private, max-age=3600",
    },
  });
}
