import React from 'react';

interface BreadcrumbsProps {
  title: string;
  breadcrumbItem?: string;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ title, breadcrumbItem }) => {
  return (
    <div className="page-title-box d-sm-flex align-items-center justify-content-between">
      <h4 className="mb-sm-0 font-size-18">{title}</h4>
      <div className="page-title-right">
        <ol className="breadcrumb m-0">
          <li className="breadcrumb-item">
            <a href="#">{breadcrumbItem || title}</a>
          </li>
        </ol>
      </div>
    </div>
  );
};

export default Breadcrumbs;

