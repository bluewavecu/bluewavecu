import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const MAX_ID_DOCUMENT_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Map<string, string>([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

const uploadsRoot = path.join(process.cwd(), "public", "uploads", "id-documents");

function validateImageFile(file: File) {
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    throw new Error("Upload JPG, PNG, or WEBP photos only.");
  }

  if (file.size > MAX_ID_DOCUMENT_BYTES) {
    throw new Error("Each ID photo must be 5 MB or smaller.");
  }
}

function getPhotoPaths(userId: string, submissionId: string, side: "front" | "back", extension: string) {
  const relativeDir = path.posix.join("uploads", "id-documents", userId, submissionId);
  const filename = `${side}.${extension}`;

  return {
    absolutePath: path.join(uploadsRoot, userId, submissionId, filename),
    publicPath: `/${relativeDir}/${filename}`,
  };
}

export async function saveIdDocumentPhoto(params: {
  userId: string;
  submissionId: string;
  side: "front" | "back";
  file: File;
}) {
  validateImageFile(params.file);

  const extension = ALLOWED_MIME_TYPES.get(params.file.type)!;
  const buffer = Buffer.from(await params.file.arrayBuffer());
  const { absolutePath, publicPath } = getPhotoPaths(
    params.userId,
    params.submissionId,
    params.side,
    extension,
  );

  await mkdir(path.dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, buffer);

  return publicPath;
}
