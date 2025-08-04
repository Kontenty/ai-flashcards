import React from "react";
import type { PaginationDto } from "@/types";

interface PaginationControlsProps {
  pagination: PaginationDto;
  onPageChange: (page: number) => void;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({ pagination, onPageChange }) => (
  <div className="flex items-center space-x-4">
    <button
      onClick={() => onPageChange(pagination.page - 1)}
      disabled={pagination.page <= 1}
      className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50"
    >
      Previous
    </button>
    <span>
      Page {pagination.page} of {pagination.totalPages}
    </span>
    <button
      onClick={() => onPageChange(pagination.page + 1)}
      disabled={pagination.page >= pagination.totalPages}
      className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50"
    >
      Next
    </button>
  </div>
);

export default PaginationControls;
