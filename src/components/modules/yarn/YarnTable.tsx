"use client";

import Table from "@/components/ui/Table";
import { useYarnColumns } from "@/hooks/useYarnColumns";
import type { Yarn } from "./yarn.types";

interface YarnTableProps {
  yarns: Yarn[];
  onEdit: (yarn: Yarn) => void;
  onDelete: (yarn: Yarn) => void;
}

export default function YarnTable({
  yarns,
  onEdit,
  onDelete,
}: YarnTableProps) {
  const columns = useYarnColumns({ onEdit, onDelete });

  return (
    <div className="min-h-0 flex-1">
      <Table
        columns={columns}
        data={yarns}
        tableClassName="w-full"
        scrollContainerClassName="h-full"
      />
    </div>
  );
}
