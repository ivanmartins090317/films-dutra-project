import { describe, expect, it } from "vitest";

import {
  parseStudentsListSearchParams,
  studentsListQueryString,
} from "@/lib/admin/students-list-params";

describe("parseStudentsListSearchParams", () => {
  it("usa valores padrão quando vazio", () => {
    const r = parseStudentsListSearchParams({});
    expect(r.q).toBe("");
    expect(r.page).toBe(1);
    expect(r.perPage).toBe(20);
    expect(r.status).toBe("all");
    expect(r.sort).toBe("name_asc");
  });

  it("interpreta filtros e paginação", () => {
    const r = parseStudentsListSearchParams({
      q: "  ana  ",
      page: "2",
      per_page: "50",
      status: "inactive",
      sort: "created_desc",
    });
    expect(r.q).toBe("ana");
    expect(r.page).toBe(2);
    expect(r.perPage).toBe(50);
    expect(r.status).toBe("inactive");
    expect(r.sort).toBe("created_desc");
  });

  it("ignora per_page inválido", () => {
    const r = parseStudentsListSearchParams({ per_page: "999" });
    expect(r.perPage).toBe(20);
  });
});

describe("studentsListQueryString", () => {
  it("monta query preservando estado", () => {
    const base = parseStudentsListSearchParams({
      q: "joão",
      page: "3",
      per_page: "10",
      status: "active",
      sort: "name_desc",
    });
    expect(studentsListQueryString(base, { page: 4 })).toBe(
      "?q=jo%C3%A3o&page=4&per_page=10&status=active&sort=name_desc"
    );
  });

  it("retorna string vazia só com defaults", () => {
    const base = parseStudentsListSearchParams({});
    expect(studentsListQueryString(base)).toBe("");
  });
});
