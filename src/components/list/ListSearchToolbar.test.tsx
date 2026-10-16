import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ListSearchToolbar from '@/components/list/ListSearchToolbar';

describe('ListSearchToolbar', () => {
  it('renders normalized create/refresh labels and wires search', async () => {
    const user = userEvent.setup();
    const onSearchChange = jest.fn();
    const onCreate = jest.fn();
    const onRefresh = jest.fn();

    render(
      <ListSearchToolbar
        search="ha"
        onSearchChange={onSearchChange}
        onCreate={onCreate}
        onRefresh={onRefresh}
        isRefreshing={false}
      />,
    );

    expect(screen.getByRole('button', { name: 'Thêm mới' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Làm mới' })).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText('Tìm kiếm...'), 'n');
    expect(onSearchChange).toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Thêm mới' }));
    await user.click(screen.getByRole('button', { name: 'Làm mới' }));

    expect(onCreate).toHaveBeenCalledTimes(1);
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it('renders domain filter children before search', () => {
    render(
      <ListSearchToolbar
        search=""
        onSearchChange={jest.fn()}
      >
        <div>Status filter</div>
      </ListSearchToolbar>,
    );

    expect(screen.getByText('Status filter')).toBeInTheDocument();
  });

  it('hides search when hideSearch is true', () => {
    render(
      <ListSearchToolbar
        hideSearch
        onCreate={jest.fn()}
      />,
    );

    expect(screen.queryByPlaceholderText('Tìm kiếm...')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Thêm mới' })).toBeInTheDocument();
  });

  it('disables actions while busy', () => {
    render(
      <ListSearchToolbar
        search=""
        onSearchChange={jest.fn()}
        onCreate={jest.fn()}
        onRefresh={jest.fn()}
        isDisabled
        isRefreshing
      />,
    );

    expect(screen.getByRole('button', { name: 'Thêm mới' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Làm mới' })).toBeDisabled();
  });

  it('keeps search and up to four actions on one desktop row', () => {
    const { container } = render(
      <ListSearchToolbar
        search=""
        onSearchChange={jest.fn()}
        onCreate={jest.fn()}
        onRefresh={jest.fn()}
        trailing={
          <>
            <button type="button">Tải xuống</button>
            <button type="button">Tải lên</button>
          </>
        }
      />,
    );

    expect(container.firstChild).toHaveClass('lg:flex-row');
    expect(container.firstChild).toHaveClass('lg:justify-end');
    expect(container.firstChild).not.toHaveClass('flex-col');
  });

  it('moves actions under search when there are more than four buttons', () => {
    const { container } = render(
      <ListSearchToolbar
        search=""
        onSearchChange={jest.fn()}
        onCreate={jest.fn()}
        trailing={
          <>
            <button type="button">Một</button>
            <button type="button">Hai</button>
            <button type="button">Ba</button>
            <button type="button">Bốn</button>
          </>
        }
      />,
    );

    expect(container.firstChild).toHaveClass('flex-col');
  });

  it('keeps a select, search, and few actions on one desktop row', () => {
    const { container } = render(
      <ListSearchToolbar
        search=""
        onSearchChange={jest.fn()}
        onRefresh={jest.fn()}
      >
        <div>Trạng thái</div>
      </ListSearchToolbar>,
    );

    expect(container.firstChild).toHaveClass('lg:flex-row');
    expect(container.firstChild).toHaveClass('lg:justify-end');
    expect(container.firstChild).not.toHaveClass('flex-col');
  });

  it('moves actions under filters when a select is paired with extra buttons', () => {
    const { container } = render(
      <ListSearchToolbar
        search=""
        onSearchChange={jest.fn()}
        onCreate={jest.fn()}
        onRefresh={jest.fn()}
        trailing={
          <>
            <button type="button">Tải xuống</button>
            <button type="button">Tải lên</button>
            <button type="button">Xóa bộ lọc</button>
          </>
        }
      >
        <div>Chọn danh mục</div>
      </ListSearchToolbar>,
    );

    expect(container.firstChild).toHaveClass('flex-col');
    const actions = container.querySelector('.list-toolbar-actions');
    expect(actions).toHaveClass('justify-end');
    expect(actions).toHaveTextContent('Thêm mới');
    expect(actions).toHaveTextContent('Tải lên');
    expect(actions).not.toHaveTextContent('Tìm kiếm');
  });
});
