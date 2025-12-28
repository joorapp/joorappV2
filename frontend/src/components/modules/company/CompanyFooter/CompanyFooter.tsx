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
                <span className="company-footer__company-name">{t('CompanyFooter.companyName')}</span>
              </div>
              <p className="company-footer__description">
                {t('CompanyFooter.description')}
              </p>
            </div>
          )}
          
          <div className="company-footer__links">
            <div className="company-footer__link-group">
              <h4 className="company-footer__link-title">{t('CompanyFooter.support')}</h4>
              <a href="/help" className="company-footer__link">{t('CompanyFooter.helpCenter')}</a>
              <a href="/contact" className="company-footer__link">{t('CompanyFooter.contactUs')}</a>
              <a href="/documentation" className="company-footer__link">{t('CompanyFooter.documentation')}</a>
            </div>
            
            <div className="company-footer__link-group">
              <h4 className="company-footer__link-title">{t('CompanyFooter.company')}</h4>
              <a href="/about" className="company-footer__link">{t('CompanyFooter.aboutUs')}</a>
              <a href="/careers" className="company-footer__link">{t('CompanyFooter.careers')}</a>
              <a href="/news" className="company-footer__link">{t('CompanyFooter.news')}</a>
            </div>
            
            <div className="company-footer__link-group">
              <h4 className="company-footer__link-title">{t('CompanyFooter.legal')}</h4>
              <a href="/privacy" className="company-footer__link">{t('CompanyFooter.privacyPolicy')}</a>
              <a href="/terms" className="company-footer__link">{t('CompanyFooter.termsOfService')}</a>
              <a href="/security" className="company-footer__link">{t('CompanyFooter.security')}</a>
            </div>
          </div>
        </div>
        
        <div className="company-footer__bottom">
          <div className="company-footer__copyright">
            <p>{t('CompanyFooter.copyright')}</p>
          </div>
          <div className="company-footer__social">
            <a href="#" className="company-footer__social-link" aria-label={t('CompanyFooter.facebook')}>
              📘
            </a>
            <a href="#" className="company-footer__social-link" aria-label={t('CompanyFooter.twitter')}>
              🐦
            </a>
            <a href="#" className="company-footer__social-link" aria-label={t('CompanyFooter.linkedIn')}>
              💼
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default CompanyFooter;
