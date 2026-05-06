import { describe, expect, it } from "vitest";

import { studentTripRegistrationUpsertSchema } from "@/lib/validations/student-trip";

describe("studentTripRegistrationUpsertSchema", () => {
  it("aceita interesse em trip válida", () => {
    const r = studentTripRegistrationUpsertSchema.safeParse({
      tripId: "00000000-0000-4000-8000-000000000099",
      status: "interested",
    });
    expect(r.success).toBe(true);
  });

  it("rejeita uuid inválido", () => {
    const r = studentTripRegistrationUpsertSchema.safeParse({
      tripId: "nope",
      status: "confirmed",
    });
    expect(r.success).toBe(false);
  });
});
