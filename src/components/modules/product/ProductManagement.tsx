"use client";

import ListPageLayout from "@/components/list/ListPageLayout";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { Pagination } from "@/components/ui/Pagination";
import ProductFormDialog from "./ProductFormDialog";
import ProductListFilters from "./ProductListFilters";
import ProductTable from "./ProductTable";
import { useProductCatalog } from "@/hooks/useProductCatalog";
import { useProductEditor } from "@/hooks/useProductEditor";

export default function ProductManagement() {
  const catalog = useProductCatalog();
  const editor = useProductEditor({
    products: catalog.products,
    setProducts: catalog.setProducts,
    onCreated: () => {
      catalog.setSearch("");
      catalog.setCategoryFilter("all");
      catalog.setCurrentPage(1);
    },
  });

  return (
    <>
      <ListPageLayout
        filters={
          <ProductListFilters
            search={catalog.search}
            category={catalog.categoryFilter}
            yarnId={catalog.yarnFilter}
            patternId={catalog.patternFilter}
            yarns={catalog.yarns}
            patterns={catalog.patterns}
            onSearchChange={(value) => {
              catalog.setSearch(value);
              catalog.setCurrentPage(1);
            }}
            onApplyFilters={catalog.applyFilters}
            onClearFilters={catalog.clearFilters}
            onAdd={editor.openCreateDialog}
            hasActiveFilters={catalog.hasActiveFilters}
          />
        }
        table={
          catalog.pageItems.length > 0 ? (
            <ProductTable
              groups={catalog.pageItems}
              onSelect={editor.openEditDialog}
              onDelete={editor.setGroupToDelete}
            />
          ) : (
            <div className="flex min-h-28 flex-1 items-center justify-center px-4 text-center text-sm text-gray">
              Không có sản phẩm phù hợp với bộ lọc hiện tại.
            </div>
          )
        }
        pagination={
          <Pagination
            currentPage={catalog.currentPage}
            totalPages={catalog.totalPages}
            onPageChange={catalog.setCurrentPage}
            pageSize={catalog.pageSize}
            onPageSizeChange={(size) => {
              catalog.setPageSize(size);
              catalog.setCurrentPage(1);
            }}
            totalItems={catalog.totalItems}
          />
        }
      />
      <ProductFormDialog
        open={editor.isDialogOpen}
        form={editor.form}
        onChange={editor.setForm}
        onClose={editor.closeDialog}
        onSubmit={editor.handleSubmit}
        isEditing={editor.editingGroup !== null}
        yarns={catalog.yarns}
        patterns={catalog.patterns}
      />
      <ConfirmDialog
        open={editor.groupToDelete !== null}
        title="Xóa nhóm sản phẩm"
        message={`Bạn có chắc chắn muốn xóa nhóm "${editor.groupToDelete?.name ?? ""}" và toàn bộ danh mục bên trong không?`}
        confirmText="Xóa"
        onConfirm={editor.handleDeleteGroup}
        onCancel={() => editor.setGroupToDelete(null)}
      />
    </>
  );
}
