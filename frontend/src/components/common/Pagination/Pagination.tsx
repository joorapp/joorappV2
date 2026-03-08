/**
 * @author Ananthapadmanabhan V K
 * Common Pagination component
 * Reusable pagination component using react-paginate
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import ReactPaginate from 'react-paginate';
import './Pagination.scss';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (selectedPage: number) => void;
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  className = '',
}) => {
  const { t } = useTranslation();

  const handlePageClick = (event: { selected: number }) => {
    // react-paginate uses 0-based indexing, but our API uses 1-based
    onPageChange(event.selected + 1);
  };

  // Calculate the range of items being displayed
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Don't render pagination controls if there's only one page or no items
  // But still show the info text if there are items
  if (totalItems === 0) {
    return null;
  }

  return (
    <div className={`pagination-wrapper ${className}`}>
      <div className="pagination-info">
        <span className="text-muted">
          {t('Common.showing')} {startItem} {t('Common.to')} {endItem} {t('Common.of')} {totalItems} {t('Common.results')}
        </span>
      </div>
      {totalPages > 0 && (
        <ReactPaginate
          breakLabel="..."
          nextLabel={t('Common.next')}
          onPageChange={handlePageClick}
          pageRangeDisplayed={5}
          marginPagesDisplayed={2}
          pageCount={totalPages}
          previousLabel={t('Common.previous')}
          forcePage={currentPage - 1} // Convert to 0-based for react-paginate
          containerClassName="pagination"
          pageClassName="page-item"
          pageLinkClassName="page-link"
          previousClassName="page-item"
          previousLinkClassName="page-link"
          nextClassName="page-item"
          nextLinkClassName="page-link"
          breakClassName="page-item"
          breakLinkClassName="page-link"
          activeClassName="active"
          disabledClassName="disabled"
          renderOnZeroPageCount={null}
        />
      )}
    </div>
  );
};

export default Pagination;

