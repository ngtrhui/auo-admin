import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ListImportExportActions from '@/components/list/ListImportExportActions';

describe('ListImportExportActions', () => {
  it('wires taxonomy import/export labels and clicks', async () => {
    const user = userEvent.setup();
    const onImport = jest.fn();
    const onExport = jest.fn();

    render(
      <ListImportExportActions
        onImport={onImport}
        onExport={onExport}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Tải xuống' }));
    await user.click(screen.getByRole('button', { name: 'Tải lên' }));

    expect(onExport).toHaveBeenCalledTimes(1);
    expect(onImport).toHaveBeenCalledTimes(1);
  });

  it('disables both actions while the list is busy', () => {
    render(
      <ListImportExportActions
        onImport={jest.fn()}
        onExport={jest.fn()}
        isDisabled
        isExporting
      />,
    );

    expect(screen.getByRole('button', { name: 'Tải xuống' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Tải lên' })).toBeDisabled();
  });
});
