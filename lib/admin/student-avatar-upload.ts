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

export function validateAvatarUploadFile(file: File): { ok: true } | { ok: false; error: string } {
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
