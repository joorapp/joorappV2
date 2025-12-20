import React from 'react';
import { useTranslation } from 'react-i18next';
import './SuperAdminFooter.scss';

interface SuperAdminFooterProps {
  showSystemInfo?: boolean;
}

const SuperAdminFooter = ({ 
  showSystemInfo = true 
}: SuperAdminFooterProps) => {
  const { t } = useTranslation();

  return (
    <footer className="superadmin-footer">
      <div className="superadmin-footer__container">
        <div className="superadmin-footer__content">
          {showSystemInfo && (
            <div className="superadmin-footer__system-info">
              <div className="superadmin-footer__logo">
                <span className="superadmin-footer__logo-icon">👑</span>
                <span className="superadmin-footer__system-name">JoorApp Admin</span>
              </div>
              <p className="superadmin-footer__description">
                Advanced administration and management system
              </p>
            </div>
          )}
          
          <div className="superadmin-footer__links">
            <div className="superadmin-footer__link-group">
              <h4 className="superadmin-footer__link-title">Administration</h4>
              <a href="/admin/users" className="superadmin-footer__link">User Management</a>
              <a href="/admin/companies" className="superadmin-footer__link">Company Management</a>
              <a href="/admin/system" className="superadmin-footer__link">System Settings</a>
            </div>
            
            <div className="superadmin-footer__link-group">
              <h4 className="superadmin-footer__link-title">Security</h4>
              <a href="/admin/security" className="superadmin-footer__link">Security Center</a>
              <a href="/admin/audit" className="superadmin-footer__link">Audit Logs</a>
              <a href="/admin/backup" className="superadmin-footer__link">Backup & Recovery</a>
            </div>
            
            <div className="superadmin-footer__link-group">
              <h4 className="superadmin-footer__link-title">Support</h4>
              <a href="/admin/support" className="superadmin-footer__link">Admin Support</a>
              <a href="/admin/documentation" className="superadmin-footer__link">Documentation</a>
              <a href="/admin/contact" className="superadmin-footer__link">Contact</a>
            </div>
          </div>
        </div>
        
        <div className="superadmin-footer__bottom">
          <div className="superadmin-footer__copyright">
            <p>&copy; 2024 JoorApp. All rights reserved. | Admin Portal</p>
          </div>
          <div className="superadmin-footer__status">
            <span className="superadmin-footer__status-indicator"></span>
            <span className="superadmin-footer__status-text">System Online</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default SuperAdminFooter;
