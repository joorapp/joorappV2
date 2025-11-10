import React from 'react';
import { useTranslation } from 'react-i18next';
import './Footer.scss';

interface FooterProps {
  showCopyright?: boolean;
  showVersion?: boolean;
}

const Footer: React.FC<FooterProps> = ({ 
  showCopyright = true, 
  showVersion = true 
}) => {
  const { t } = useTranslation();

  return (
    <footer className="footer">
      <div className="footer__container">
        <div className="footer__content">
          {showCopyright && (
            <div className="footer__copyright">
              <p>&copy; 2024 JoorApp. All rights reserved.</p>
            </div>
          )}
          
          <div className="footer__links">
            <a href="/privacy" className="footer__link">
              Privacy Policy
            </a>
            <a href="/terms" className="footer__link">
              Terms of Service
            </a>
            <a href="/support" className="footer__link">
              Support
            </a>
          </div>
          
          {showVersion && (
            <div className="footer__version">
              <span>v1.0.0</span>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
