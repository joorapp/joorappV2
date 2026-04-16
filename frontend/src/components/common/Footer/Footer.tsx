import { useTranslation } from 'react-i18next';
import './Footer.scss';

interface FooterProps {
  showCopyright?: boolean;
  showVersion?: boolean;
}

const Footer = ({ 
  showCopyright = true, 
  showVersion = true 
}: FooterProps) => {
  const { t } = useTranslation();

  return (
    <footer className="footer">
      <div className="footer__container">
        <div className="footer__content">
          {showCopyright && (
            <div className="footer__copyright">
              <p>{t('Footer.copyrightText')}</p>
            </div>
          )}
          
          <div className="footer__links">
            <a href="/privacy" className="footer__link">
              {t('Footer.privacyPolicy')}
            </a>
            <a href="/terms" className="footer__link">
              {t('Footer.termsOfService')}
            </a>
            <a href="/support" className="footer__link">
              {t('Footer.support')}
            </a>
          </div>
          
          {showVersion && (
            <div className="footer__version">
              <span>{t('Footer.version')}</span>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
