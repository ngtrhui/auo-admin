"use client";

import Table from "@/components/ui/Table";
import { usePatternColumns } from "@/hooks/usePatternColumns";
import type { Pattern } from "./pattern.types";

interface PatternTableProps {
  patterns: Pattern[];
  onEdit: (pattern: Pattern) => void;
  onDelete: (pattern: Pattern) => void;
}

export default function PatternTable({
  patterns,
  onEdit,
  onDelete,
}: PatternTableProps) {
  const columns = usePatternColumns({ onEdit, onDelete });

  return (
    <div className="min-h-0 flex-1">
      <Table
        columns={columns}
        data={patterns}
        tableClassName="w-full"
        scrollContainerClassName="h-full"
      />
    </div>
  );
}
