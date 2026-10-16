import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ListPageTitleToolbar from '@/components/list/ListPageTitleToolbar';

describe('ListPageTitleToolbar', () => {
  it('renders a title row plus search/create/refresh', async () => {
    const user = userEvent.setup();
    const onSearchChange = jest.fn();
    const onCreate = jest.fn();

    render(
      <ListPageTitleToolbar
        title="Quản lý thành phố"
        description="Danh sách thành phố"
        search=""
        onSearchChange={onSearchChange}
        searchPlaceholder="Tìm kiếm thành phố..."
        onCreate={onCreate}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Quản lý thành phố' })).toBeInTheDocument();
    expect(screen.getByText('Danh sách thành phố')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Tìm kiếm thành phố...')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Thêm mới' }));
    expect(onCreate).toHaveBeenCalledTimes(1);
  });

  it('falls back to a plain toolbar when title is omitted', () => {
    render(
      <ListPageTitleToolbar
        search=""
        onSearchChange={jest.fn()}
        onRefresh={jest.fn()}
      />,
    );

    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Làm mới' })).toBeInTheDocument();
  });

  it('does not render create when onCreate is omitted (support-style toolbar)', () => {
    render(
      <ListPageTitleToolbar
        search=""
        onSearchChange={jest.fn()}
        onRefresh={jest.fn()}
        searchPlaceholder="Tìm kiếm nội dung..."
      />,
    );

    expect(screen.queryByRole('button', { name: 'Thêm mới' })).not.toBeInTheDocument();
    expect(screen.getByPlaceholderText('Tìm kiếm nội dung...')).toBeInTheDocument();
  });

  it('applies containerClassName to the title wrapper', () => {
    const { container } = render(
      <ListPageTitleToolbar
        title="Quản lý ứng viên"
        search=""
        onSearchChange={jest.fn()}
        containerClassName="xl:flex-row"
      />,
    );

    expect(container.firstChild).toHaveClass('flex-col', 'xl:flex-row');
  });

  it('stacks the title above the toolbar so controls can use the full width', () => {
    const { container } = render(
      <ListPageTitleToolbar
        title="Quản lý thành phố"
        search=""
        onSearchChange={jest.fn()}
        onCreate={jest.fn()}
      />,
    );

    expect(container.firstChild).toHaveClass('flex-col');
    expect(container.firstChild).not.toHaveClass('xl:flex-row');
  });

  it('keeps a custom create label and trailing refresh without duplicating Làm mới', () => {
    render(
      <ListPageTitleToolbar
        title="Danh sách Footer SEO"
        search=""
        onSearchChange={jest.fn()}
        onCreate={jest.fn()}
        createLabel="Thêm trang SEO"
        trailing={<button type="button">Làm mới</button>}
      />,
    );

    expect(screen.getByRole('button', { name: 'Thêm trang SEO' })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Làm mới' })).toHaveLength(1);
  });
});
