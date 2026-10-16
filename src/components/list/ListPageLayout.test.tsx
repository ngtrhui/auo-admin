import { render, screen } from '@testing-library/react';

import ListPageLayout from '@/components/list/ListPageLayout';

describe('ListPageLayout', () => {
  it('renders header, filters, table, and pagination slots', () => {
    render(
      <ListPageLayout
        header={<h1>Districts</h1>}
        filters={<div>Filters</div>}
        table={<div>Table body</div>}
        pagination={<div>Pagination footer</div>}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Districts' })).toBeInTheDocument();
    expect(screen.getByText('Filters')).toBeInTheDocument();
    expect(screen.getByText('Table body')).toBeInTheDocument();
    expect(screen.getByText('Pagination footer')).toBeInTheDocument();
  });

  it('omits the pagination footer when pagination is undefined', () => {
    const { container } = render(<ListPageLayout table={<div>Table only</div>} />);

    expect(screen.getByText('Table only')).toBeInTheDocument();
    expect(container.querySelector('.border-t')).toBeNull();
  });

  it('fills remaining viewport height so the table can grow', () => {
    const { container } = render(<ListPageLayout table={<div>Table only</div>} />);

    expect(container.firstChild).toHaveClass('h-full', 'min-h-0', 'flex-1', 'overflow-hidden');
  });

  it('still renders an empty pagination slot wrapper when pagination is nullish content that is provided', () => {
    render(
      <ListPageLayout
        table={<div>Table</div>}
        pagination={<nav aria-label="list-pagination">Pages</nav>}
      />,
    );

    expect(screen.getByRole('navigation', { name: 'list-pagination' })).toBeInTheDocument();
  });
});
