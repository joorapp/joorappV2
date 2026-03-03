import React from 'react';
import { Link } from 'react-router-dom';

interface BreadcrumbsProps {
  title: string;
  breadcrumbItem?: string;
  link?: string;
  /** When set, used as the first breadcrumb link text (e.g. "Clients"); otherwise title is used */
  breadcrumbParent?: string;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ title, breadcrumbItem, link = '#', breadcrumbParent }) => {
  const firstCrumbText = breadcrumbParent ?? title;
  return (
    <div className="page-title-box d-sm-flex align-items-center justify-content-between">
      <h4 className="mb-sm-0 font-size-18">{title}</h4>
      <div className="page-title-right">
        <ol className="breadcrumb m-0">
          <li className="breadcrumb-item">
            <Link to={link}>{firstCrumbText}</Link>
          </li>
          <li className="breadcrumb-item active">{breadcrumbItem}</li>
        </ol>
      </div>
    </div>
  );
};

export default Breadcrumbs;

