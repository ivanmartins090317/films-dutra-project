import { describe, expect, it } from "vitest";

import {
  intervalsOverlapExclusiveEnd,
  lessonOverlapsExisting,
  type LessonIntervalRow,
} from "@/lib/admin/lesson-overlap";

describe("intervalsOverlapExclusiveEnd", () => {
  it("detects overlap", () => {
    expect(intervalsOverlapExclusiveEnd(10, 20, 15, 25)).toBe(true);
    expect(intervalsOverlapExclusiveEnd(10, 20, 20, 30)).toBe(false);
  });
});

describe("lessonOverlapsExisting", () => {
  const base = new Date("2026-05-04T14:00:00.000Z").toISOString();
  const existing: LessonIntervalRow[] = [
    {
      id: "a",
      scheduled_at: base,
      duration_min: 60,
      status: "scheduled",
    },
  ];

  it("returns undefined when no clash", () => {
    const later = new Date("2026-05-04T16:00:00.000Z").toISOString();
    expect(lessonOverlapsExisting(later, 60, undefined, existing)).toBeUndefined();
  });

  it("returns row on overlap for same student list", () => {
    const overlapStart = new Date("2026-05-04T14:30:00.000Z").toISOString();
    const row = lessonOverlapsExisting(overlapStart, 60, undefined, existing);
    expect(row?.id).toBe("a");
  });

  it("ignores cancelled", () => {
    const cancelled: LessonIntervalRow[] = [
      { id: "b", scheduled_at: base, duration_min: 60, status: "cancelled" },
    ];
    expect(lessonOverlapsExisting(base, 60, undefined, cancelled)).toBeUndefined();
  });

  it("excludes id when updating same lesson", () => {
    const overlapStart = new Date("2026-05-04T14:30:00.000Z").toISOString();
    expect(lessonOverlapsExisting(overlapStart, 60, "a", existing)).toBeUndefined();
  });
});
