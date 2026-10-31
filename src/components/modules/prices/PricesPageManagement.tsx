"use client";

import PillowPriceList from "@/components/modules/prices/PillowPriceList";
import ListPageLayout from "@/components/list/ListPageLayout";
import PriceManagementToolbar from "@/components/modules/prices/PriceManagementToolbar";
import PriceTable from "@/components/modules/prices/PriceTable";
import { usePriceManagement } from "@/hooks/usePriceManagement";

export default function PricesPageManagement() {
  const prices = usePriceManagement();

  return (
    <ListPageLayout
      header={
        <PriceManagementToolbar
          isDefault={prices.isDefault}
          isDirty={prices.isDirty}
          isReady={prices.isReady}
          onReset={prices.resetToDefaults}
          onSave={prices.handleSave}
        />
      }
      // filters={
      //   <PriceListFilters
      //     search={prices.search}
      //     categories={prices.categories}
      //     categoryFilter={prices.categoryFilter}
      //     onSearchChange={prices.setSearch}
      //     onCategoryChange={prices.setCategoryFilter}
      //   />
      // }
      table={
        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
          <div className="overflow-hidden rounded-xl border border-slate-200">
            {prices.visibleProducts.length > 0 ? (
              <PriceTable
                products={prices.visibleProducts}
                materials={prices.materials}
                draft={prices.draft}
                isReady={prices.isReady}
                onPriceChange={prices.updateProductPrice}
                onMaterialGroupReorder={prices.reorderMaterialGroups}
                onProductReorder={prices.reorderProductRows}
              />
            ) : (
              <div className="flex min-h-36 flex-col items-center justify-center px-5 text-center">
                <p className="text-sm font-semibold text-slate-700">
                  Không tìm thấy nhóm sản phẩm
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Thử đổi bộ lọc hoặc thêm sản phẩm trong danh mục sản phẩm.
                </p>
              </div>
            )}
          </div>

          <PillowPriceList
            visiblePillows={prices.visiblePillows}
            draft={prices.draft}
            isReady={prices.isReady}
            onPriceChange={prices.updatePillowPrice}
          />

          {!prices.isReady && (
            <p
              aria-live="polite"
              className="mt-4 text-center text-xs text-slate-400"
            >
              Đang tải bảng giá đã lưu...
            </p>
          )}
        </div>
      }
    />
  );
}
