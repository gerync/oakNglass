import { Pagination } from "react-bootstrap";

function PaginationComponent({totalPages, handlePageChange, currentPage}) {
  const paginationItems = (current, total, onClick) => {
    let items = [];

    // első elem
    items.push(
      <Pagination.Item
        key={1}
        active={current == 1}
        onClick={() => onClick(1)}
      >
        {1}
      </Pagination.Item>
    )

    // ha messze az eleje '...'
    if (current > 3) {
      items.push(<Pagination.Ellipsis key="start-ellipsis" disabled />);
    }

    // a jelenlegi oldal körüli számok
    for (let number = Math.max(2, current - 1); number <= Math.min(total - 1, current + 1); number++) {
      items.push(
        <Pagination.Item
          key={number}
          active={number == current}
          onClick={() => onClick(number)}
        >
          {number}
        </Pagination.Item>
      );
    }

    // ha messze a vége '...'
    if (current < total - 2) {
      items.push(<Pagination.Ellipsis key="end-ellipsis" disabled />);
    }

    // utolsó oldal
    if (total > 1) {
      items.push(
        <Pagination.Item key={total} active={total == current} onClick={() => onClick(total)}>
          {total}
        </Pagination.Item>
      );
    }
    return items;
  }
  return (
    <div className="d-flex justify-content-center mt-4">
      <Pagination >
        <Pagination.First onClick={() => handlePageChange(1)} disabled={currentPage === 1} />
        <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
        {paginationItems(currentPage, totalPages, handlePageChange)}
        <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
        <Pagination.Last onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} />
      </Pagination>
    </div>
  )
}

export default PaginationComponent;