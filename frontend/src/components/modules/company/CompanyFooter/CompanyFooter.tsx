import React from 'react';
import { useTranslation } from 'react-i18next';
import { Container, Row, Col } from 'reactstrap';

interface CompanyFooterProps {
  showCompanyInfo?: boolean;
}

const CompanyFooter: React.FC<CompanyFooterProps> = () => {
  const { t } = useTranslation();

  return (
    <footer className="footer">
      <Container fluid={true}>
        <Row>
          <Col md={6}>{new Date().getFullYear()} © JoorApp.</Col>
          <Col md={6}>
            <div className="text-sm-end d-none d-sm-block">
              {t('Footer.termsOfService')}
            </div>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default CompanyFooter;
