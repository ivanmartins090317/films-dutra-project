import { describe, expect, it } from "vitest";

import { adminLessonFormSchema, parseSkillsNoted } from "@/lib/validations/lesson";

describe("parseSkillsNoted", () => {
  it("splits and trims", () => {
    expect(parseSkillsNoted("cutback , tubo")).toEqual(["cutback", "tubo"]);
  });
});

describe("adminLessonFormSchema", () => {
  const base = {
    student_id: "550e8400-e29b-41d4-a716-446655440000",
    scheduled_date: "2026-05-04",
    scheduled_time: "10:00",
    duration_min: 60,
    status: "scheduled" as const,
    cancel_reason: "",
    notes: "",
    skills_noted: "",
  };

  it("accepts valid payload", () => {
    const r = adminLessonFormSchema.safeParse(base);
    expect(r.success).toBe(true);
  });

  it("requires cancel reason when cancelled", () => {
    const r = adminLessonFormSchema.safeParse({ ...base, status: "cancelled" });
    expect(r.success).toBe(false);
  });
});
