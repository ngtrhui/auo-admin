import { createColumnHelper } from '@/hooks/list/createColumnHelper';

type Row = {
  id: string;
  name: string;
  order: number;
  meta?: { label: string };
};

describe('createColumnHelper', () => {
  const col = createColumnHelper<Row>();

  it('builds an accessor column that renders the field value by default', () => {
    const column = col.accessor('name', { label: 'Name' });
    const row: Row = { id: '1', name: 'Hà Nội', order: 1 };

    expect(column.key).toBe('name');
    expect(column.label).toBe('Name');
    expect(column.render?.(row)).toBe('Hà Nội');
  });

  it('passes value and row into a custom accessor render', () => {
    const column = col.accessor('order', {
      label: 'Order',
      render: (value, row) => `${row.name}:${value}`,
    });

    expect(column.render?.({ id: '1', name: 'City', order: 3 })).toBe('City:3');
  });

  it('builds a display column for non-field keys like actions', () => {
    const column = col.display('actions', {
      label: 'Hoạt động',
      render: () => 'actions-cell',
    });

    expect(column.key).toBe('actions');
    expect(column.render?.({ id: '1', name: 'x', order: 0 })).toBe('actions-cell');
  });

  it('builds a left-aligned text column with shared header classes', () => {
    const column = col.text('name', 'Tên');

    expect(column.align).toBe('left');
    expect(column.headerClassName).toContain('text-left');
    expect(column.render?.({ id: '1', name: 'Slug', order: 0 })).toBe('Slug');
  });

  it('returns null for nullish default accessor values', () => {
    const column = col.accessor('name', { label: 'Name' });

    expect(column.render?.({ id: '1', name: null as unknown as string, order: 0 })).toBeNull();
  });
});
