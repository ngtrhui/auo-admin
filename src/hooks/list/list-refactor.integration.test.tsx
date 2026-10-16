import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useMemo, useState } from 'react';

import ListPageLayout from '@/components/list/ListPageLayout';
import ListSearchToolbar from '@/components/list/ListSearchToolbar';
import { TooltipProvider } from '@/components/ui/Tooltip';
import { createColumnHelper } from '@/hooks/list/createColumnHelper';
import { useActionColumn } from '@/hooks/list/useActionColumn';
import { useClientPagination } from '@/hooks/list/useClientPagination';
import { useListColumns } from '@/hooks/list/useListColumns';
import { resolveListPagination } from '@/utils/list-pagination';

type Location = {
  id: string;
  cityName: string;
  status: 'ACTIVE' | 'INACTIVE';
};

const ALL_ITEMS: Location[] = Array.from({ length: 12 }, (_, i) => ({
  id: String(i + 1),
  cityName: i % 2 === 0 ? `Hà Nội ${i + 1}` : `Đà Nẵng ${i + 1}`,
  status: i % 3 === 0 ? 'INACTIVE' : 'ACTIVE',
}));

/**
 * Mirrors the post-refactor client-list pattern used by picked-locations /
 * employee-levels: filter → client paginate → typed columns + action column.
 */
function ClientListHarness() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [edited, setEdited] = useState<string | null>(null);
  const [deleted, setDeleted] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return ALL_ITEMS;
    return ALL_ITEMS.filter((item) => item.cityName.toLowerCase().includes(keyword));
  }, [search]);

  const { pageItems, totalItems, totalPages } = useClientPagination(filtered, page, 5);

  const actions = useActionColumn<Location>({
    onEdit: (item) => setEdited(item.cityName),
    onDelete: (item) => setDeleted(item.cityName),
  });

  const col = createColumnHelper<Location>();
  const columns = useListColumns(
    () => [
      col.text('cityName', 'Thành phố'),
      col.display('status', {
        label: 'Trạng thái',
        render: (row) => row.status,
      }),
      actions,
    ],
    [actions],
  );

  return (
    <TooltipProvider delayDuration={0}>
      <ListPageLayout
        header={<h1>Picked locations</h1>}
        filters={
          <ListSearchToolbar
            search={search}
            onSearchChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
            searchPlaceholder="Tìm thành phố..."
          />
        }
        table={
          <table>
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={String(column.key)}>{column.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageItems.map((row) => (
                <tr key={row.id}>
                  {columns.map((column) => (
                    <td key={String(column.key)}>{column.render?.(row)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        }
        pagination={
          <div>
            <span data-testid="totals">
              {totalItems} items / {totalPages} pages
            </span>
            <button
              type="button"
              onClick={() => setPage(2)}
            >
              Next page
            </button>
            {edited ? <span data-testid="edited">{edited}</span> : null}
            {deleted ? <span data-testid="deleted">{deleted}</span> : null}
          </div>
        }
      />
    </TooltipProvider>
  );
}

describe('list refactor integration', () => {
  it('filters, paginates, and wires edit/delete through shared primitives', async () => {
    const user = userEvent.setup();
    render(<ClientListHarness />);

    expect(screen.getByRole('heading', { name: 'Picked locations' })).toBeInTheDocument();
    expect(screen.getByTestId('totals')).toHaveTextContent('12 items / 3 pages');
    expect(screen.getByText('Hà Nội 1')).toBeInTheDocument();
    expect(screen.queryByText('Hà Nội 11')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Next page' }));
    expect(screen.getByText('Đà Nẵng 6')).toBeInTheDocument();
    expect(screen.getByText('Hà Nội 7')).toBeInTheDocument();
    expect(screen.queryByText('Hà Nội 1')).not.toBeInTheDocument();

    await user.clear(screen.getByPlaceholderText('Tìm thành phố...'));
    await user.type(screen.getByPlaceholderText('Tìm thành phố...'), 'Đà Nẵng');

    expect(screen.getByTestId('totals')).toHaveTextContent('6 items / 2 pages');
    expect(screen.getByText('Đà Nẵng 2')).toBeInTheDocument();
    expect(screen.queryByText('Hà Nội 1')).not.toBeInTheDocument();

    const editButtons = screen.getAllByRole('button', { name: 'Chỉnh sửa' });
    const deleteButtons = screen.getAllByRole('button', { name: 'Xóa' });

    await user.click(editButtons[0]);
    await user.click(deleteButtons[0]);

    expect(screen.getByTestId('edited')).toHaveTextContent('Đà Nẵng 2');
    expect(screen.getByTestId('deleted')).toHaveTextContent('Đà Nẵng 2');
  });

  it('keeps server pagination totals when API metadata exists', () => {
    expect(
      resolveListPagination(
        true,
        {
          totalElements: 100,
          page: 1,
          perPage: 20,
          totalPages: 5,
          hasNextPage: true,
          hasPreviousPage: false,
        },
        20,
        20,
      ),
    ).toEqual({ totalPages: 5, totalItems: 100 });
  });
});
