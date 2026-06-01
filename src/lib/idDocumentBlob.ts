import { list, put } from "@vercel/blob";
import { getUploadContentType } from "@/lib/mediaServe";

export function hasBlobStorage() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim());
}

export function getIdDocumentBlobPathname(
  userId: string,
  submissionId: string,
  side: "front" | "back",
  extension: string,
) {
  return `id-documents/${userId}/${submissionId}/${side}.${extension}`;
}

export async function saveIdDocumentToBlob(params: {
  userId: string;
  submissionId: string;
  side: "front" | "back";
  extension: string;
  buffer: Buffer;
  contentType: string;
}) {
  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();

  if (!token) {
    throw new Error(
      "ID document storage is not configured. Set BLOB_READ_WRITE_TOKEN in production.",
    );
  }

  const pathname = getIdDocumentBlobPathname(
    params.userId,
    params.submissionId,
    params.side,
    params.extension,
  );

  await put(pathname, params.buffer, {
    access: "public",
    contentType: params.contentType,
    token,
    addRandomSuffix: false,
  });

  return pathname;
}

export async function readIdDocumentFromBlob(pathname: string) {
  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();

  if (!token) {
    return null;
  }

  const { blobs } = await list({
    prefix: pathname,
    limit: 10,
    token,
  });

  const blob = blobs.find((entry) => entry.pathname === pathname);

  if (!blob) {
    return null;
  }

  const response = await fetch(blob.downloadUrl);

  if (!response.ok) {
    return null;
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const contentType =
    response.headers.get("content-type") ??
    getUploadContentType(pathname);

  return { buffer, contentType };
}
