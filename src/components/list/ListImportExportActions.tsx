'use client';

import { HiOutlineDownload, HiOutlineUpload } from 'react-icons/hi';

import { TOOLBAR_ACTION_BUTTON_CLASS } from '@/constants/list-toolbar';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/classNames';

interface ListImportExportActionsProps {
  onImport: () => void;
  onExport: () => void;
  isExporting?: boolean;
  isDisabled?: boolean;
  exportLabel?: string;
  importLabel?: string;
}

/** Shared Tải xuống / Tải lên actions for taxonomy list toolbars. */
export default function ListImportExportActions({
  onImport,
  onExport,
  isExporting = false,
  isDisabled = false,
  exportLabel = 'Tải xuống',
  importLabel = 'Tải lên',
}: ListImportExportActionsProps) {
  return (
    <>
      <Button
        variant="outline"
        className={cn('border-gray/40 border text-black', TOOLBAR_ACTION_BUTTON_CLASS)}
        leftIcon={<HiOutlineDownload className="size-5 shrink-0" />}
        disabled={isDisabled}
        loading={isExporting}
        onClick={onExport}
        aria-label={exportLabel}
      >
        {exportLabel}
      </Button>
      <Button
        variant="green"
        className={TOOLBAR_ACTION_BUTTON_CLASS}
        leftIcon={<HiOutlineUpload className="size-5 shrink-0" />}
        disabled={isDisabled}
        onClick={onImport}
        aria-label={importLabel}
      >
        {importLabel}
      </Button>
    </>
  );
}
