import React from "react";
import type { PaginationDto } from "@/types";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface PaginationControlsProps {
  pagination: PaginationDto;
  onPageChange: (page: number) => void;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({ pagination, onPageChange }) => {
  const getPaginationItems = () => {
    const { page, totalPages } = pagination;
    const items: (string | number)[] = [];
    const siblingCount = 1;

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(i);
      }
      return items;
    }

    items.push(1);

    if (page > siblingCount + 2) {
      items.push("...");
    }

    const startPage = Math.max(2, page - siblingCount);
    const endPage = Math.min(totalPages - 1, page + siblingCount);

    for (let i = startPage; i <= endPage; i++) {
      items.push(i);
    }

    if (page < totalPages - siblingCount - 1) {
      items.push("...");
    }

    items.push(totalPages);

    return items;
  };

  if (pagination.totalPages <= 1) {
    return null;
  }

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (pagination.page > 1) onPageChange(pagination.page - 1);
            }}
            aria-disabled={pagination.page <= 1}
            className={pagination.page <= 1 ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>
        {getPaginationItems().map((item, index) =>
          typeof item === "number" ? (
            <PaginationItem key={index}>
              <PaginationLink
                isActive={item === pagination.page}
                onClick={(e) => {
                  e.preventDefault();
                  onPageChange(item);
                }}
              >
                {item}
              </PaginationLink>
            </PaginationItem>
          ) : (
            <PaginationItem key={index}>
              <PaginationEllipsis />
            </PaginationItem>
          ),
        )}
        <PaginationItem>
          <PaginationNext
            onClick={(e) => {
              e.preventDefault();
              if (pagination.page < pagination.totalPages) {
                onPageChange(pagination.page + 1);
              }
            }}
            aria-disabled={pagination.page >= pagination.totalPages}
            className={
              pagination.page >= pagination.totalPages ? "pointer-events-none opacity-50" : ""
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default PaginationControls;
