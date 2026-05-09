/** Limites do upload de avatar (admin → bucket `avatars`). */

export const AVATAR_UPLOAD_MAX_BYTES = 2 * 1024 * 1024;

export const AVATAR_UPLOAD_ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export function mimeToAvatarExtension(mime: string): "jpg" | "png" | "webp" | null {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return null;
}

/**
 * Em Server Actions do Next.js, `formData.get("file")` pode não passar em `instanceof File`
 * no runtime do Node — usar checagem por forma (Blob) é mais confiável.
 */
export function parseFormDataImageBlob(formData: FormData, key: string): Blob | null {
  const v = formData.get(key);
  if (v === null || v === undefined) return null;
  if (typeof v === "string") return null;
  if (typeof v !== "object") return null;
  const candidate = v as Blob;
  if (typeof candidate.size !== "number" || typeof candidate.arrayBuffer !== "function") {
    return null;
  }
  return candidate;
}

export function validateAvatarUploadFile(file: Blob): { ok: true } | { ok: false; error: string } {
  if (!file || file.size === 0) {
    return { ok: false, error: "Selecione uma imagem." };
  }
  if (file.size > AVATAR_UPLOAD_MAX_BYTES) {
    return { ok: false, error: "Arquivo muito grande (máx. 2 MB)." };
  }
  if (!AVATAR_UPLOAD_ALLOWED_MIME.has(file.type)) {
    return { ok: false, error: "Use JPEG, PNG ou WebP." };
  }
  return { ok: true };
}
