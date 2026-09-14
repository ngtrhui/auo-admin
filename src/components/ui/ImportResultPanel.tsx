'use client';

import { Button } from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import SlidePanel from '@/components/ui/SlidePanel';
import Table from '@/components/ui/Table';
import { IMPORT_EMPTY_STATE_IMAGES } from '@/constants/import';
import type {
  JobRoleSkippedRow,
  SeoKeywordSkippedRow,
  TaxonomyImportResult,
  TaxonomySkippedRow,
} from '@/types/taxonomy-import-export';
import { cn } from '@/utils/classNames';
import { formatNumber } from '@/utils/format';

export type ImportResultVariant = 'localized-name' | 'job-role' | 'seo-keyword';

type ImportResultPanelProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  result: TaxonomyImportResult | null;
  variant: ImportResultVariant;
};

type StatBoxProps = {
  label: string;
  value: number;
  variant: 'primary' | 'green' | 'blue' | 'coral';
};

function StatBox({ label, value, variant }: StatBoxProps) {
  const variantClasses = {
    primary: 'border-primary/20 bg-primary-light/40 text-primary',
    green: 'border-green/20 bg-green/10 text-green',
    blue: 'border-blue/20 bg-blue/10 text-blue',
    coral: 'border-coral/20 bg-coral/10 text-coral',
  };

  return (
    <div
      className={cn(
        'flex min-w-0 flex-1 flex-col rounded-xl border px-4 py-3',
        variantClasses[variant],
      )}
    >
      <span className="text-xs font-medium text-gray">{label}</span>
      <span className="mt-1 text-2xl font-bold text-black">{formatNumber(value)}</span>
    </div>
  );
}

function formatLocalizedName(name?: TaxonomySkippedRow['name']): string {
  if (!name) return '-';
  const parts = [name.vi, name.en, name.ko].filter(Boolean);
  return parts.length > 0 ? parts.join(' / ') : '-';
}

export default function ImportResultPanel({
  open,
  onClose,
  title = 'Kết quả nhập dữ liệu',
  result,
  variant,
}: ImportResultPanelProps) {
  const skippedColumns =
    variant === 'seo-keyword'
      ? [
          { key: 'row', label: 'Dòng', render: (row: SeoKeywordSkippedRow) => row.row },
          {
            key: 'keyword',
            label: 'Từ khóa',
            render: (row: SeoKeywordSkippedRow) => row.keyword || '-',
          },
          {
            key: 'secondaryKeyword',
            label: 'Từ khóa phụ',
            render: (row: SeoKeywordSkippedRow) => row.secondaryKeyword || '-',
          },
          { key: 'slug', label: 'Slug', render: (row: SeoKeywordSkippedRow) => row.slug || '-' },
          { key: 'reason', label: 'Lý do', render: (row: SeoKeywordSkippedRow) => row.reason },
        ]
      : variant === 'job-role'
        ? [
            { key: 'row', label: 'Dòng', render: (row: JobRoleSkippedRow) => row.row },
            {
              key: 'name',
              label: 'Tên',
              render: (row: JobRoleSkippedRow) => formatLocalizedName(row.name),
            },
            {
              key: 'categoryViName',
              label: 'Danh mục (VI)',
              render: (row: JobRoleSkippedRow) => row.categoryViName || '-',
            },
            { key: 'reason', label: 'Lý do', render: (row: JobRoleSkippedRow) => row.reason },
          ]
        : [
            { key: 'row', label: 'Dòng', render: (row: TaxonomySkippedRow) => row.row },
            {
              key: 'name',
              label: 'Tên',
              render: (row: TaxonomySkippedRow) => formatLocalizedName(row.name),
            },
            { key: 'reason', label: 'Lý do', render: (row: TaxonomySkippedRow) => row.reason },
          ];

  const tableColumns = skippedColumns.map((col) => ({
    key: col.key,
    label: col.label,
    align: 'left' as const,
    headerClassName: 'text-left [&>span]:justify-start',
    render: col.render,
  }));

  const skippedRows = result?.skippedRows ?? [];

  return (
    <SlidePanel
      isOpen={open}
      onClose={onClose}
      title={title}
      width="3xl"
      contentClassName="flex h-full min-h-0 flex-col overflow-hidden p-4 sm:p-6"
      footer={
        <div className="flex items-center justify-end gap-3 px-4 py-4 sm:px-6">
          <Button
            type="button"
            variant="green"
            onClick={onClose}
          >
            Đóng
          </Button>
        </div>
      }
    >
      {result ? (
        <div className="flex h-full min-h-0 flex-col gap-6">
          <div className="grid shrink-0 grid-cols-2 gap-3 sm:grid-cols-4">
            <StatBox
              label="Tổng số dòng"
              value={result.totalRows}
              variant="primary"
            />
            <StatBox
              label="Tạo mới"
              value={result.created}
              variant="green"
            />
            <StatBox
              label="Cập nhật"
              value={result.updated}
              variant="blue"
            />
            <StatBox
              label="Bỏ qua"
              value={result.skipped}
              variant="coral"
            />
          </div>

          <div className="flex min-h-0 flex-1 flex-col">
            <h3 className="mb-3 shrink-0 text-sm font-semibold text-black">
              Dòng bị bỏ qua ({formatNumber(skippedRows.length)})
            </h3>

            <div className="min-h-0 flex-1">
              {skippedRows.length === 0 ? (
                <EmptyState
                  imageSrc={IMPORT_EMPTY_STATE_IMAGES.noRecords}
                  title="Không có dòng bị bỏ qua"
                  description="Tất cả dòng hợp lệ đã được xử lý thành công"
                />
              ) : (
                <Table
                  columns={tableColumns}
                  data={skippedRows}
                  scrollContainerClassName="h-full"
                  tableClassName="w-full"
                  tableCellClassName="px-4 py-3 align-middle"
                />
              )}
            </div>
          </div>
        </div>
      ) : null}
    </SlidePanel>
  );
}
