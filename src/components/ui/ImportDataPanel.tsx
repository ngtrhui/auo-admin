'use client';

import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import FileUpload from '@/components/ui/FileUpload';
import SlidePanel from '@/components/ui/SlidePanel';
import Table from '@/components/ui/Table';
import {
  DEFAULT_IMPORT_FILE_EXTENSIONS,
  DEFAULT_MAX_IMPORT_FILE_SIZE,
  IMPORT_EMPTY_STATE_IMAGES,
} from '@/constants/import';
import {
  buildSpreadsheetFile,
  parseSpreadsheetFile,
  getSpreadsheetRowStats,
  type SpreadsheetRow,
} from '@/utils/parseSpreadsheet';
import { formatNumber } from '@/utils/format';
import { cn } from '@/utils/classNames';

export type ImportPreviewColumn = {
  key: string;
  label: string;
};

export type ImportDataPanelProps = {
  open: boolean;
  onClose: () => void;
  onImport: (file: File) => void | Promise<void>;
  isImporting?: boolean;
  title?: string;
  allowedExtensions?: readonly string[];
  maxFileSize?: number;
  previewColumns?: readonly ImportPreviewColumn[];
  /** null = hợp lệ; string = message lỗi dòng */
  validateRow?: (row: SpreadsheetRow) => string | null;
};

type ImportPreviewStatBoxProps = {
  label: string;
  value: number;
  variant: 'primary' | 'green' | 'coral';
};

function ImportPreviewStatBox({ label, value, variant }: ImportPreviewStatBoxProps) {
  const variantClasses = {
    primary: 'border-primary/20 bg-primary-light/40 text-primary',
    green: 'border-green/20 bg-green/10 text-green',
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

export default function ImportDataPanel({
  open,
  onClose,
  onImport,
  isImporting = false,
  title = 'Nhập dữ liệu',
  allowedExtensions = DEFAULT_IMPORT_FILE_EXTENSIONS,
  maxFileSize = DEFAULT_MAX_IMPORT_FILE_SIZE,
  previewColumns: previewColumnConfig,
  validateRow,
}: ImportDataPanelProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewRows, setPreviewRows] = useState<SpreadsheetRow[]>([]);
  const [previewHeaders, setPreviewHeaders] = useState<string[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  const handleFileChange = async (file: File | null) => {
    setSelectedFile(file);

    if (!file) {
      setPreviewRows([]);
      setPreviewHeaders([]);
      setParseError(null);
      setIsParsing(false);
      return;
    }

    setIsParsing(true);
    setParseError(null);

    try {
      const parsed = await parseSpreadsheetFile(file);

      if (previewColumnConfig?.length) {
        const requiredKeys = previewColumnConfig.map((col) => col.key);
        const missingKeys = requiredKeys.filter((key) => !parsed.headers.includes(key));

        if (missingKeys.length > 0) {
          setPreviewHeaders([]);
          setPreviewRows([]);
          setParseError(`File thiếu cột: ${missingKeys.join(', ')}`);
          return;
        }
      }

      setPreviewHeaders(parsed.headers);
      setPreviewRows(parsed.rows);
    } catch {
      setPreviewHeaders([]);
      setPreviewRows([]);
      setParseError('Không thể đọc file. Vui lòng kiểm tra định dạng và thử lại.');
    } finally {
      setIsParsing(false);
    }
  };

  const statsHeaderKeys = useMemo(
    () => previewColumnConfig?.map((col) => col.key) ?? previewHeaders,
    [previewColumnConfig, previewHeaders],
  );

  const rowErrorMap = useMemo(() => {
    if (!validateRow) return null;
    const map = new WeakMap<SpreadsheetRow, string | null>();
    for (const row of previewRows) {
      map.set(row, validateRow(row));
    }
    return map;
  }, [previewRows, validateRow]);

  const tableColumns = useMemo(() => {
    const columns = previewColumnConfig?.length
      ? previewColumnConfig.map((col) => ({
          key: col.key,
          label: col.label,
        }))
      : previewHeaders.map((header) => ({
          key: header,
          label: header,
        }));

    const dataColumns = columns.map((col) => ({
      key: col.key,
      label: col.label,
      align: 'left' as const,
      headerClassName: 'text-left [&>span]:justify-start',
      render: (row: SpreadsheetRow) => {
        const error = rowErrorMap?.get(row) ?? null;
        return (
          <span className={cn('text-sm', error ? 'text-coral' : 'text-black')}>
            {row[col.key] || '-'}
          </span>
        );
      },
    }));

    if (!validateRow) return dataColumns;

    return [
      ...dataColumns,
      {
        key: '__error',
        label: 'Lỗi',
        align: 'left' as const,
        headerClassName: 'text-left [&>span]:justify-start',
        render: (row: SpreadsheetRow) => {
          const error = rowErrorMap?.get(row) ?? null;
          if (!error) return <span className="text-sm text-gray">-</span>;
          return <span className="text-sm text-coral">{error}</span>;
        },
      },
    ];
  }, [previewColumnConfig, previewHeaders, rowErrorMap, validateRow]);

  const rowStats = useMemo(
    () =>
      getSpreadsheetRowStats(
        previewRows,
        statsHeaderKeys,
        validateRow ? (row) => validateRow(row) === null : undefined,
      ),
    [previewRows, statsHeaderKeys, validateRow],
  );

  const showPreviewStats = selectedFile && !parseError;
  const hasNoValidRows = Boolean(validateRow) && rowStats.validRows === 0;

  const resetForm = () => {
    setSelectedFile(null);
    setPreviewRows([]);
    setPreviewHeaders([]);
    setParseError(null);
    setIsParsing(false);
  };

  const handleClose = () => {
    if (isImporting) return;
    resetForm();
    onClose();
  };

  const handleStartImport = () => {
    if (!selectedFile || isImporting || isParsing || parseError || hasNoValidRows) return;

    const fileToImport = validateRow
      ? buildSpreadsheetFile(
          statsHeaderKeys,
          previewRows.filter((row) => validateRow(row) === null),
          selectedFile.name,
        )
      : selectedFile;

    void Promise.resolve(onImport(fileToImport))
      .then(() => {
        resetForm();
      })
      .catch(() => undefined);
  };

  return (
    <SlidePanel
      isOpen={open}
      onClose={handleClose}
      title={title}
      width="3xl"
      contentClassName="flex h-full min-h-0 flex-col overflow-hidden p-4 sm:p-6"
      footer={
        <div className="flex items-center justify-end gap-3 px-4 py-4 sm:px-6">
          <Button
            type="button"
            variant="outline"
            className="border-gray/40 border text-black"
            disabled={isImporting}
            onClick={handleClose}
          >
            Đóng
          </Button>
          <Button
            type="button"
            variant="green"
            loading={isImporting}
            disabled={!selectedFile || isParsing || !!parseError || isImporting || hasNoValidRows}
            onClick={handleStartImport}
          >
            Bắt đầu nhập
          </Button>
        </div>
      }
    >
      <div className="flex h-full min-h-0 flex-col gap-6">
        <FileUpload
          value={selectedFile}
          onChange={(file) => {
            void handleFileChange(file);
          }}
          allowedExtensions={allowedExtensions}
          maxFileSize={maxFileSize}
          disabled={isImporting}
          className="shrink-0"
        />

        <div className="flex min-h-0 flex-1 flex-col">
          <div className="mb-3 flex shrink-0 items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-black">Xem trước dữ liệu</h3>
          </div>

          {showPreviewStats ? (
            <div className="mb-4 grid shrink-0 grid-cols-1 gap-3 sm:grid-cols-3">
              <ImportPreviewStatBox
                label="Tổng số dòng"
                value={isParsing ? 0 : rowStats.totalRows}
                variant="primary"
              />
              <ImportPreviewStatBox
                label="Dòng hợp lệ"
                value={isParsing ? 0 : rowStats.validRows}
                variant="green"
              />
              <ImportPreviewStatBox
                label="Dòng không hợp lệ"
                value={isParsing ? 0 : rowStats.invalidRows}
                variant="coral"
              />
            </div>
          ) : null}

          <div className="min-h-0 flex-1">
            {!selectedFile ? (
              <EmptyState
                imageSrc={IMPORT_EMPTY_STATE_IMAGES.noFile}
                title="Chưa có file"
                description="Tải file lên để xem trước nội dung"
              />
            ) : parseError ? (
              <div className="flex h-full items-center justify-center rounded-xl border border-coral/30 bg-coral/5 px-4 py-6 text-center text-sm text-coral">
                {parseError}
              </div>
            ) : !isParsing && previewRows.length === 0 ? (
              <EmptyState
                imageSrc={IMPORT_EMPTY_STATE_IMAGES.noRecords}
                title="Không có dữ liệu"
                description="File không chứa bản ghi nào để xem trước"
              />
            ) : (
              <Table
                columns={tableColumns}
                data={previewRows}
                isLoading={isParsing}
                getRowClassName={(row) => (rowErrorMap?.get(row) ? 'bg-coral/5' : '')}
                scrollContainerClassName="h-full"
                tableClassName="w-full"
                tableCellClassName="px-4 py-3 align-middle"
              />
            )}
          </div>
        </div>
      </div>
    </SlidePanel>
  );
}
