import React from 'react';
import { useTranslation } from 'react-i18next';
import './CompanyFooter.scss';

interface CompanyFooterProps {
  showCompanyInfo?: boolean;
}

const CompanyFooter = ({ 
  showCompanyInfo = true 
}: CompanyFooterProps) => {
  const { t } = useTranslation();

  return (
    <footer className="company-footer">
      <div className="company-footer__container">
        <div className="company-footer__content">
          {showCompanyInfo && (
            <div className="company-footer__company-info">
              <div className="company-footer__logo">
                <span className="company-footer__logo-icon">🏢</span>
                <span className="company-footer__company-name">Your Company</span>
              </div>
              <p className="company-footer__description">
                Empowering businesses with innovative solutions
              </p>
            </div>
          )}
          
          <div className="company-footer__links">
            <div className="company-footer__link-group">
              <h4 className="company-footer__link-title">Support</h4>
              <a href="/help" className="company-footer__link">Help Center</a>
              <a href="/contact" className="company-footer__link">Contact Us</a>
              <a href="/documentation" className="company-footer__link">Documentation</a>
            </div>
            
            <div className="company-footer__link-group">
              <h4 className="company-footer__link-title">Company</h4>
              <a href="/about" className="company-footer__link">About Us</a>
              <a href="/careers" className="company-footer__link">Careers</a>
              <a href="/news" className="company-footer__link">News</a>
            </div>
            
            <div className="company-footer__link-group">
              <h4 className="company-footer__link-title">Legal</h4>
              <a href="/privacy" className="company-footer__link">Privacy Policy</a>
              <a href="/terms" className="company-footer__link">Terms of Service</a>
              <a href="/security" className="company-footer__link">Security</a>
            </div>
          </div>
        </div>
        
        <div className="company-footer__bottom">
          <div className="company-footer__copyright">
            <p>&copy; 2024 Your Company. All rights reserved.</p>
          </div>
          <div className="company-footer__social">
            <a href="#" className="company-footer__social-link" aria-label="Facebook">
              📘
            </a>
            <a href="#" className="company-footer__social-link" aria-label="Twitter">
              🐦
            </a>
            <a href="#" className="company-footer__social-link" aria-label="LinkedIn">
              💼
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default CompanyFooter;
