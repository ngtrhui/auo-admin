import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderHook } from '@testing-library/react';

import { TooltipProvider } from '@/components/ui/Tooltip';
import { useActionColumn } from '@/hooks/list/useActionColumn';

type Row = { id: string; name: string };

function renderActionCell(
  params: Parameters<typeof useActionColumn<Row>>[0],
  row: Row = { id: '1', name: 'Item' },
) {
  const { result } = renderHook(() => useActionColumn<Row>(params));
  const column = result.current;

  render(<TooltipProvider delayDuration={0}>{column.render?.(row)}</TooltipProvider>);

  return column;
}

describe('useActionColumn', () => {
  it('renders edit and delete buttons with default tooltips/aria-labels', () => {
    renderActionCell({
      onEdit: jest.fn(),
      onDelete: jest.fn(),
    });

    expect(screen.getByRole('button', { name: 'Chỉnh sửa' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Xóa' })).toBeInTheDocument();
  });

  it('calls onEdit and onDelete with the row', async () => {
    const user = userEvent.setup();
    const onEdit = jest.fn();
    const onDelete = jest.fn();
    const row = { id: '42', name: 'District' };

    renderActionCell({ onEdit, onDelete }, row);

    await user.click(screen.getByRole('button', { name: 'Chỉnh sửa' }));
    await user.click(screen.getByRole('button', { name: 'Xóa' }));

    expect(onEdit).toHaveBeenCalledWith(row);
    expect(onDelete).toHaveBeenCalledWith(row);
  });

  it('omits missing actions', () => {
    renderActionCell({ onEdit: jest.fn() });

    expect(screen.getByRole('button', { name: 'Chỉnh sửa' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Xóa' })).not.toBeInTheDocument();
  });

  it('disables both actions when isDisabled is true', () => {
    renderActionCell({
      onEdit: jest.fn(),
      onDelete: jest.fn(),
      isDisabled: true,
    });

    expect(screen.getByRole('button', { name: 'Chỉnh sửa' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Xóa' })).toBeDisabled();
  });


  it('uses the shared actions column key and label by default', () => {
    const { result } = renderHook(() =>
      useActionColumn<Row>({ onEdit: jest.fn(), onDelete: jest.fn() }),
    );

    expect(result.current.key).toBe('actions');
    expect(result.current.label).toBe('Hoạt động');
  });
});
