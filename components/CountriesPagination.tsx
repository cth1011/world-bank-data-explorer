"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { usePagination } from "@/hooks/use-pagination";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface CountriesPaginationProps {
  totalPages: number;
  currentPage: number;
}

export function CountriesPagination({
  totalPages,
  currentPage,
}: CountriesPaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const paginationRange = usePagination({
    currentPage,
    totalPages,
    siblingCount: 1,
  });

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  if (currentPage === 0 || totalPages < 2) {
    return null;
  }

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href={createPageURL(currentPage - 1)}
            aria-disabled={currentPage <= 1}
            className={
              currentPage <= 1
                ? "pointer-events-none text-muted-foreground"
                : undefined
            }
          />
        </PaginationItem>

        {paginationRange.map((pageNumber, index) => {
          if (pageNumber === "...") {
            return (
              <PaginationItem key={`ellipsis-${index}`}>
                <PaginationEllipsis />
              </PaginationItem>
            );
          }
          return (
            <PaginationItem key={pageNumber}>
              <PaginationLink
                href={createPageURL(pageNumber)}
                isActive={currentPage === pageNumber}
              >
                {pageNumber}
              </PaginationLink>
            </PaginationItem>
          );
        })}

        <PaginationItem>
          <PaginationNext
            href={createPageURL(currentPage + 1)}
            aria-disabled={currentPage >= totalPages}
            className={
              currentPage >= totalPages
                ? "pointer-events-none text-muted-foreground"
                : undefined
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
