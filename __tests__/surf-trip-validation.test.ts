import { describe, expect, it } from "vitest";

import {
  adminSurfTripFormSchema,
  tripRegistrationAdminSchema,
  tripRegistrationStatusUpdateSchema,
} from "@/lib/validations/surf-trip";

describe("adminSurfTripFormSchema", () => {
  const base = {
    title: "Trip X",
    destination: "Fernando de Noronha",
    trip_date: "2026-08-10",
    description: "",
    spots_total: 12,
    cover_url: "",
  };

  it("aceita payload válido", () => {
    const r = adminSurfTripFormSchema.safeParse(base);
    expect(r.success).toBe(true);
  });

  it("rejeita título vazio", () => {
    const r = adminSurfTripFormSchema.safeParse({ ...base, title: "  " });
    expect(r.success).toBe(false);
  });

  it("aceita vagas como string numérica", () => {
    const r = adminSurfTripFormSchema.safeParse({ ...base, spots_total: "5" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.spots_total).toBe(5);
    }
  });

  it("trim em cover_url opcional", () => {
    const r = adminSurfTripFormSchema.safeParse({
      ...base,
      cover_url: "  https://example.com/x  ",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.cover_url).toBe("https://example.com/x");
    }
  });
});

describe("tripRegistrationAdminSchema", () => {
  it("aceita inscrição válida", () => {
    const r = tripRegistrationAdminSchema.safeParse({
      trip_id: "00000000-0000-4000-8000-000000000001",
      student_id: "00000000-0000-4000-8000-000000000002",
      status: "interested",
    });
    expect(r.success).toBe(true);
  });

  it("rejeita uuid inválido", () => {
    const r = tripRegistrationAdminSchema.safeParse({
      trip_id: "nope",
      student_id: "00000000-0000-4000-8000-000000000002",
      status: "confirmed",
    });
    expect(r.success).toBe(false);
  });
});

describe("tripRegistrationStatusUpdateSchema", () => {
  it("aceita status válido", () => {
    const r = tripRegistrationStatusUpdateSchema.safeParse({ status: "cancelled" });
    expect(r.success).toBe(true);
  });
});
