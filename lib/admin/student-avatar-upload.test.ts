import { describe, expect, it } from "vitest";

import {
  AVATAR_UPLOAD_MAX_BYTES,
  mimeToAvatarExtension,
  validateAvatarUploadFile,
} from "@/lib/admin/student-avatar-upload";

describe("validateAvatarUploadFile", () => {
  it("rejeita vazio", () => {
    const f = new File([], "x.png", { type: "image/png" });
    const r = validateAvatarUploadFile(f);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/selecione/i);
  });

  it("rejeita tipo inválido", () => {
    const f = new File([new Uint8Array([1, 2])], "x.gif", { type: "image/gif" });
    Object.defineProperty(f, "size", { value: 100 });
    const r = validateAvatarUploadFile(f);
    expect(r.ok).toBe(false);
  });

  it("rejeita arquivo grande", () => {
    const f = new File([new Uint8Array([1])], "x.png", { type: "image/png" });
    Object.defineProperty(f, "size", { value: AVATAR_UPLOAD_MAX_BYTES + 1 });
    const r = validateAvatarUploadFile(f);
    expect(r.ok).toBe(false);
  });

  it("aceita png pequeno", () => {
    const f = new File([new Uint8Array([1, 2])], "x.png", { type: "image/png" });
    expect(validateAvatarUploadFile(f).ok).toBe(true);
  });
});

describe("mimeToAvatarExtension", () => {
  it("mapeia tipos conhecidos", () => {
    expect(mimeToAvatarExtension("image/jpeg")).toBe("jpg");
    expect(mimeToAvatarExtension("image/png")).toBe("png");
    expect(mimeToAvatarExtension("image/webp")).toBe("webp");
    expect(mimeToAvatarExtension("image/gif")).toBeNull();
  });
});
