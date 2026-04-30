import Link from "next/link";

import type { ParsedStudentsListParams } from "@/lib/admin/students-list-params";
import { studentsListQueryString } from "@/lib/admin/students-list-params";
import { Button } from "@/components/ui/button";

interface StudentsPaginationProps {
  params: ParsedStudentsListParams;
  totalCount: number;
}

export function StudentsPagination({ params, totalCount }: StudentsPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalCount / params.perPage));
  const page = Math.min(Math.max(1, params.page), totalPages);
  const from = totalCount === 0 ? 0 : (page - 1) * params.perPage + 1;
  const to = Math.min(page * params.perPage, totalCount);

  if (totalCount === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Mostrando {from}–{to} de {totalCount}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {page <= 1 ? (
          <Button variant="outline" size="sm" type="button" disabled>
            Anterior
          </Button>
        ) : (
          <Button variant="outline" size="sm" asChild>
            <Link href={`/admin/students${studentsListQueryString(params, { page: page - 1 })}`}>
              Anterior
            </Link>
          </Button>
        )}
        <span className="text-sm tabular-nums text-muted-foreground">
          Página {page} / {totalPages}
        </span>
        {page >= totalPages ? (
          <Button variant="outline" size="sm" type="button" disabled>
            Próxima
          </Button>
        ) : (
          <Button variant="outline" size="sm" asChild>
            <Link href={`/admin/students${studentsListQueryString(params, { page: page + 1 })}`}>
              Próxima
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
