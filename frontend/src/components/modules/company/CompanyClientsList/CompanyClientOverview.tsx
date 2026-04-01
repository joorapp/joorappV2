import { useMemo, useState } from 'react';
import { Card, CardBody, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Label, Table, Button } from 'reactstrap';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Breadcrumbs from '../../../common/Breadcrumbs/Breadcrumbs';
import './CompanyClientsList.scss';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  buildingAddress: string;
  streetAddress: string;
  country: string;
  state: string;
  city: string;
  postalCode: string;
  description?: string;
  type: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  logo?: string | null;
  totalAmount: number;
}

type Props = {
  displayClient?: Client | null;
};

type LocationState = {
  client?: Client;
};

const formatAedAmount = (amount: number) =>
  `AED${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const INCOME_CHART_MONTHS = ['Sep 2025', 'Oct 2025', 'Nov 2025', 'Dec 2025', 'Jan 2026', 'Feb 2026', 'Mar 2026'] as const;
const INCOME_CHART_Y_LABELS = ['5K', '4K', '3K', '2K', '1K', '0'] as const;



const CompanyClientOverview = (props: Props) => {
  const { displayClient: displayClientProp } = props;
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { clientId } = useParams<{ clientId: string }>();
  const location = useLocation();

  const stateClient = (location.state as LocationState | null)?.client ?? undefined;

  const displayClient = useMemo(() => {
    const effective = displayClientProp ?? stateClient ?? null;
    if (!effective) return null;
    if (clientId && effective.id !== clientId) return null;
    return effective;
  }, [clientId, displayClientProp, stateClient]);

  const [overviewAddressOpen, setOverviewAddressOpen] = useState(true);
  const [overviewOtherOpen, setOverviewOtherOpen] = useState(true);
  const [overviewContactsOpen, setOverviewContactsOpen] = useState(true);
  const [incomeChartPeriodOpen, setIncomeChartPeriodOpen] = useState(false);

  const contactPersonFromEmail = (email: string) => {
    const local = (email.split('@')[0] || '').replace(/[._]+/g, ' ').trim();
    const display = local ? local.charAt(0).toUpperCase() + local.slice(1) : '';
    return display ? t('CompanyClientsList.mrName', { name: display }) : '';
  };

  if (!displayClient) {
    return (
      <>
        <Breadcrumbs title={t('CompanyClientsList.pageTitle')} breadcrumbItem={t('CompanyClientsList.overview')} link="/company/clients" breadcrumbParent={t('CompanyClientsList.clients')} />
        <div className="company-clients-sidebar--joor company-clients-sidebar--fullpage mb-3">
          <div className="text-center py-5">
            <p className="text-muted mb-0">{t('Common.noDataAvailable')}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
     

      <div className="company-clients-sidebar--joor company-clients-sidebar--fullpage mb-3">
        <Card className="h-100 border-0 shadow-none rounded-0 d-flex flex-column detail-view-card m-0">
         

          <CardBody className="detail-card-body flex-grow-1 overflow-auto p-0">
            <div className="overview-content">
              <div className="overview-two-col row m-0">
                <div className="overview-left col-md-5">
                  <div className="overview-contact-card">
                    <Button
                      color="light"
                      size="sm"
                      className="overview-contact-card__settings border-0 shadow-none"
                      title={t('Common.settings')}
                      type="button"
                    >
                      <i className="bx bx-cog text-secondary" aria-hidden />
                    </Button>

                    <div className="d-flex align-items-start gap-3 overview-contact-card__body">
                      <div
                        className="overview-contact-avatar overview-contact-avatar--placeholder rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                        aria-hidden
                      >
                        <i className="bx bx-user" />
                      </div>

                      <div className="flex-grow-1 min-w-0">
                        <div className="overview-contact-person-name">{contactPersonFromEmail(displayClient.email)}</div>
                        <div className="overview-contact-person-email text-truncate" title={displayClient.email}>
                          {displayClient.email}
                        </div>
                        <p className="overview-portal-warning mb-1">{t('CompanyClientsList.portalInvitationNotAccepted')}</p>
                        <a href="#reinvite" className="overview-link overview-reinvite-link">
                          {t('CompanyClientsList.reInvite')}
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="overview-section">
                    <button
                      type="button"
                      className="overview-section-toggle d-flex align-items-center justify-content-between w-100"
                      onClick={() => setOverviewAddressOpen((o) => !o)}
                    >
                      <span className="overview-section-title">{t('CompanyClientsList.address')}</span>
                      <i className={`bx ${overviewAddressOpen ? 'bx-chevron-up' : 'bx-chevron-down'} text-primary fs-18`} />
                    </button>
                    {overviewAddressOpen && (
                      <div className="overview-section-body">
                        <div className="overview-kv overview-kv--address">
                          <span className="overview-kv-address-label">{t('CompanyClientsList.billingAddress')}</span>
                          <span className="overview-kv-address-value">
                            {t('CompanyClientsList.noBillingAddress')} -{' '}
                            <a href="#new-address" className="overview-link">
                              {t('CompanyClientsList.newAddress')}
                            </a>
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="overview-section">
                    <button
                      type="button"
                      className="overview-section-toggle d-flex align-items-center justify-content-between w-100"
                      onClick={() => setOverviewOtherOpen((o) => !o)}
                    >
                      <span className="overview-section-title">{t('CompanyClientsList.otherDetails')}</span>
                      <i className={`bx ${overviewOtherOpen ? 'bx-chevron-up' : 'bx-chevron-down'} text-primary fs-18`} />
                    </button>
                    {overviewOtherOpen && (
                      <div className="overview-section-body overview-section-body--details">
                        <div className="overview-kv overview-kv--detail-row">
                          <span className="overview-kv-detail-label">{t('CompanyClientsList.customerType')}</span>
                          <span className="overview-kv-detail-value">{t('CompanyClientsList.business')}</span>
                        </div>
                        <div className="overview-kv overview-kv--detail-row">
                          <span className="overview-kv-detail-label">{t('CompanyClientsList.customerNumber')}</span>
                          <span className="overview-kv-detail-value">{`CUS-${displayClient.id}`}</span>
                        </div>
                        <div className="overview-kv overview-kv--detail-row">
                          <span className="overview-kv-detail-label">{t('CompanyClientsList.defaultCurrency')}</span>
                          <span className="overview-kv-detail-value">AED</span>
                        </div>
                        <div className="overview-kv overview-kv--detail-row">
                          <span className="overview-kv-detail-label">{t('CompanyClientsList.portalStatus')}</span>
                          <div className="overview-portal-status-block">
                            <div className="overview-portal-enabled-line">
                              <span className="portal-status-dot enabled" aria-hidden />
                              <span className="overview-portal-enabled-text">{t('CompanyClientsList.enabled')}</span>
                            </div>
                            <div className="overview-portal-contacts-sub">
                              ({t('CompanyClientsList.contactsEnabled', { count: 1, total: 1 })})
                            </div>
                          </div>
                        </div>
                        <div className="overview-kv overview-kv--detail-row">
                          <span className="overview-kv-detail-label">{t('CompanyClientsList.customerLanguage')}</span>
                          <span className="overview-kv-detail-value">{t('CompanyClientsList.english')}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="overview-section">
                    <button
                      type="button"
                      className="overview-section-toggle d-flex align-items-center justify-content-between w-100"
                      onClick={() => setOverviewContactsOpen((o) => !o)}
                    >
                      <span className="overview-section-title">{t('CompanyClientsList.contactPersons')}</span>
                      <span className="d-flex align-items-center gap-1">
                        <i className="bx bx-plus text-primary fs-18" aria-hidden />
                        <i className={`bx ${overviewContactsOpen ? 'bx-chevron-up' : 'bx-chevron-down'} text-primary fs-18`} aria-hidden />
                      </span>
                    </button>

                    {overviewContactsOpen && (
                      <div className="overview-section-body overview-section-body--contacts">
                        <div className="overview-contact-person-card">
                          <Button
                            color="light"
                            size="sm"
                            className="overview-contact-person-card__settings border-0 shadow-none"
                            title={t('Common.settings')}
                            type="button"
                          >
                            <i className="bx bx-cog text-secondary" aria-hidden />
                          </Button>

                          <div className="overview-contact-person-card__avatar" aria-hidden>
                            <i className="bx bxs-user" />
                          </div>

                          <div className="overview-contact-person-card__meta">
                            <div className="overview-contact-person-card__name text-truncate" title={displayClient.name}>
                              {contactPersonFromEmail(displayClient.email) || displayClient.name}
                            </div>
                            <div
                              className="overview-contact-person-card__line overview-contact-person-card__line--muted"
                              title={displayClient.email}
                            >
                              {displayClient.email}
                            </div>
                            <div className="overview-contact-person-card__phone">
                              <i className="bx bx-phone" aria-hidden />
                              <span className="text-truncate" title={displayClient.phone}>
                                {displayClient.phone}
                              </span>
                            </div>
                            <div
                              className="overview-contact-person-card__line overview-contact-person-card__line--portal"
                              title={t('CompanyClientsList.portalInvitationNotAccepted')}
                            >
                              {t('CompanyClientsList.portalInvitationNotAccepted')}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="overview-right p-2 col-md-7">
                  <div className="overview-block overview-block--plain">
                    <Label className="overview-label overview-label--sentence">{t('CompanyClientsList.paymentDuePeriod')}</Label>
                    <p className="overview-value overview-value--lead mb-0">{t('CompanyClientsList.dueOnReceipt')}</p>
                  </div>

                  <div className="overview-block">
                    <div className="overview-heading overview-heading--section">{t('CompanyClientsList.receivables')}</div>
                    <div className="table-responsive">
                      <Table className="overview-receivables-table mb-0">
                        <thead>
                          <tr>
                            <th>{t('CompanyClientsList.currency')}</th>
                            <th className="text-end">{t('CompanyClientsList.outstandingReceivables')}</th>
                            <th className="text-end">{t('CompanyClientsList.unusedCredits')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>{t('CompanyClientsList.currencyAedUae')}</td>
                            <td className="text-end">{formatAedAmount(displayClient.totalAmount)}</td>
                            <td className="text-end">{formatAedAmount(0)}</td>
                          </tr>
                        </tbody>
                      </Table>
                    </div>
                  </div>

                  <div className="overview-block">
                    <div className="d-flex align-items-start justify-content-between flex-wrap gap-2 mb-2">
                      <div className="overview-heading overview-heading--section mb-0">{t('CompanyClientsList.incomeAndExpense')}</div>
                      <Dropdown
                        isOpen={incomeChartPeriodOpen}
                        toggle={() => setIncomeChartPeriodOpen((o) => !o)}
                      >
                        <DropdownToggle
                          tag="button"
                          type="button"
                          caret
                          className="overview-income-period-toggle btn btn-link text-primary text-decoration-none p-0 d-inline-flex align-items-center gap-1"
                        >
                          {t('CompanyClientsList.last6Months')}
                        </DropdownToggle>
                        <DropdownMenu end>
                          <DropdownItem onClick={() => setIncomeChartPeriodOpen(false)}>
                            {t('CompanyClientsList.last6Months')}
                          </DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </div>

                    <p className="overview-chart-desc small text-muted mb-3">{t('CompanyClientsList.chartBaseCurrency')}</p>

                    <div className="overview-line-chart-wrap">
                      <div className="overview-line-chart__y-axis" aria-hidden>
                        {INCOME_CHART_Y_LABELS.map((label) => (
                          <span key={label}>{label}</span>
                        ))}
                      </div>

                      <div className="overview-line-chart__main">
                        <svg
                          className="overview-line-chart__svg"
                          viewBox="0 0 420 140"
                          preserveAspectRatio="none"
                          aria-hidden
                        >
                          {[0, 1, 2, 3, 4, 5].map((i) => (
                            <line key={i} x1="0" y1={i * 28} x2="420" y2={i * 28} className="overview-line-chart__grid-line" />
                          ))}
                          <polyline
                            className="overview-line-chart__line"
                            fill="none"
                            stroke="var(--bs-primary)"
                            strokeWidth="1.75"
                            points="0,136 70,136 140,136 210,136 280,136 350,136 420,136"
                          />
                        </svg>

                        <div className="overview-line-chart__x-labels">
                          {INCOME_CHART_MONTHS.map((m) => (
                            <span key={m}>{m}</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <p className="overview-total-income mb-0 mt-3">
                      {t('CompanyClientsList.totalIncomeLast6MonthsStyled')} — <strong>{formatAedAmount(displayClient.totalAmount)}</strong>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </>
  );
};

export default CompanyClientOverview;

