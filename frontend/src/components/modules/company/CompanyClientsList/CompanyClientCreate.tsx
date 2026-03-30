import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Card,
  CardBody,
  Col,
  Input,
  InputGroup,
  InputGroupText,
  Label,
  Nav,
  NavItem,
  NavLink,
  Table,
  Row,
} from 'reactstrap';
import Breadcrumbs from '../../../common/Breadcrumbs/Breadcrumbs';
import CompanyAdminService from '../../../../core/service/CompanyAdminService';
import { showErrorToast, showSuccessToast } from '../../../../core/utils/toast';

type CustomerType = 'SUPPLIER' | 'INDIVIDUAL';
type CreateTabId = 'otherDetails' | 'address' | 'contactPersons' | 'remarks';
type ContactPersonForm = {
  id: string;
  salutation: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
  workPhoneCode: string;
  workPhone: string;
  mobileCode: string;
  mobile: string;
};

type ClientFormSnapshot = {
  customerType: CustomerType;
  primarySalutation: string;
  primaryFirstName: string;
  primaryLastName: string;
  companyName: string;
  displayName: string;
  currency: 'AED';
  emailAddress: string;
  customerNumber: string;
  phoneCountryCode: string;
  phoneWork: string;
  phoneMobile: string;
  customerLanguage: string;
  taxRate: string;
  companyId: string;
  paymentTerms: 'dueOnReceipt';
  enablePortal: boolean;
  billingAttention: string;
  billingCountryRegion: string;
  billingStreet1: string;
  billingStreet2: string;
  billingCity: string;
  billingState: string;
  billingZipCode: string;
  billingPhoneCode: string;
  billingPhone: string;
  billingFaxNumber: string;
  shippingAttention: string;
  shippingCountryRegion: string;
  shippingStreet1: string;
  shippingStreet2: string;
  shippingCity: string;
  shippingState: string;
  shippingZipCode: string;
  shippingPhoneCode: string;
  shippingPhone: string;
  shippingFaxNumber: string;
  contactPersons: ContactPersonForm[];
  remarksText: string;
  documentNames: string[];
};

const normalizeContactPersons = (contactPersons: ContactPersonForm[]) =>
  contactPersons.map((person) => ({
    salutation: person.salutation,
    firstName: person.firstName.trim(),
    lastName: person.lastName.trim(),
    emailAddress: person.emailAddress.trim(),
    workPhoneCode: person.workPhoneCode,
    workPhone: person.workPhone.trim(),
    mobileCode: person.mobileCode,
    mobile: person.mobile.trim(),
  }));

const buildClientRequestPayload = (form: ClientFormSnapshot) => {
  const name =
    form.companyName.trim() ||
    [form.primaryFirstName.trim(), form.primaryLastName.trim()].filter(Boolean).join(' ') ||
    form.displayName.trim();
  const phone = form.phoneMobile.trim()
    ? `${form.phoneCountryCode}${form.phoneMobile.trim()}`
    : `${form.phoneCountryCode}${form.phoneWork.trim()}`;

  return {
    name,
    email: form.emailAddress.trim(),
    phone,
    isActive: true,
    clientMetadata: {
      customerType: form.customerType,
      primaryContact: {
        salutation: form.primarySalutation,
        firstName: form.primaryFirstName.trim(),
        lastName: form.primaryLastName.trim(),
      },
      displayName: form.displayName,
      currency: form.currency,
      customerNumber: form.customerNumber,
      phone: {
        countryCode: form.phoneCountryCode,
        work: form.phoneWork.trim(),
        mobile: form.phoneMobile.trim(),
      },
      customerLanguage: form.customerLanguage,
      otherDetails: {
        taxRate: form.taxRate,
        companyId: form.companyId.trim(),
        paymentTerms: form.paymentTerms,
        enablePortal: form.enablePortal,
        documents: form.documentNames,
      },
      address: {
        billing: {
          attention: form.billingAttention.trim(),
          countryRegion: form.billingCountryRegion,
          street1: form.billingStreet1.trim(),
          street2: form.billingStreet2.trim(),
          city: form.billingCity.trim(),
          state: form.billingState,
          zipCode: form.billingZipCode.trim(),
          phoneCode: form.billingPhoneCode,
          phone: form.billingPhone.trim(),
          faxNumber: form.billingFaxNumber.trim(),
        },
        shipping: {
          attention: form.shippingAttention.trim(),
          countryRegion: form.shippingCountryRegion,
          street1: form.shippingStreet1.trim(),
          street2: form.shippingStreet2.trim(),
          city: form.shippingCity.trim(),
          state: form.shippingState,
          zipCode: form.shippingZipCode.trim(),
          phoneCode: form.shippingPhoneCode,
          phone: form.shippingPhone.trim(),
          faxNumber: form.shippingFaxNumber.trim(),
        },
      },
      contactPersons: normalizeContactPersons(form.contactPersons),
      remarks: form.remarksText.trim(),
    },
  };
};

const CompanyClientCreate = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [customerType, setCustomerType] = useState<CustomerType>('SUPPLIER');
  const [primarySalutation, setPrimarySalutation] = useState('');
  const [primaryFirstName, setPrimaryFirstName] = useState('');
  const [primaryLastName, setPrimaryLastName] = useState('');

  const [companyName, setCompanyName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [currency, setCurrency] = useState<'AED'>('AED');
  const [emailAddress, setEmailAddress] = useState('');
  const [customerNumber] = useState('CUS-00003');
  const [phoneCountryCode, setPhoneCountryCode] = useState('+358');
  const [phoneWork, setPhoneWork] = useState('');
  const [phoneMobile, setPhoneMobile] = useState('');
  const [customerLanguage, setCustomerLanguage] = useState('English');

  const [activeTab, setActiveTab] = useState<CreateTabId>('otherDetails');
  const [taxRate, setTaxRate] = useState('');

  const [companyId, setCompanyId] = useState('');
  const [paymentTerms, setPaymentTerms] = useState<'dueOnReceipt'>('dueOnReceipt');
  const [enablePortal, setEnablePortal] = useState(false);

  // Billing / Shipping address
  const [billingAttention, setBillingAttention] = useState('');
  const [billingCountryRegion, setBillingCountryRegion] = useState('');
  const [billingStreet1, setBillingStreet1] = useState('Street 1');
  const [billingStreet2, setBillingStreet2] = useState('Street 2');
  const [billingCity, setBillingCity] = useState('');
  const [billingState, setBillingState] = useState('');
  const [billingZipCode, setBillingZipCode] = useState('');
  const [billingPhoneCode, setBillingPhoneCode] = useState('+358');
  const [billingPhone, setBillingPhone] = useState('');
  const [billingFaxNumber, setBillingFaxNumber] = useState('');

  const [shippingAttention, setShippingAttention] = useState('');
  const [shippingCountryRegion, setShippingCountryRegion] = useState('');
  const [shippingStreet1, setShippingStreet1] = useState('Street 1');
  const [shippingStreet2, setShippingStreet2] = useState('Street 2');
  const [shippingCity, setShippingCity] = useState('');
  const [shippingState, setShippingState] = useState('');
  const [shippingZipCode, setShippingZipCode] = useState('');
  const [shippingPhoneCode, setShippingPhoneCode] = useState('+358');
  const [shippingPhone, setShippingPhone] = useState('');
  const [shippingFaxNumber, setShippingFaxNumber] = useState('');

  const emptyContactPerson = (): ContactPersonForm => ({
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    salutation: 'Mr',
    firstName: '',
    lastName: '',
    emailAddress: '',
    workPhoneCode: '+358',
    workPhone: '',
    mobileCode: '+358',
    mobile: '',
  });

  const [contactPersons, setContactPersons] = useState<ContactPersonForm[]>([emptyContactPerson(), emptyContactPerson()]);

  const [remarksText, setRemarksText] = useState('');
  const [documentNames, setDocumentNames] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const tabs: Array<{ id: CreateTabId; label: string }> = useMemo(
    () => [
      { id: 'otherDetails', label: t('CompanyClientsList.otherDetails') },
      { id: 'address', label: t('Common.address') },
      { id: 'contactPersons', label: t('CompanyClientsList.contactPersons') },
      { id: 'remarks', label: t('CompanyClientsList.remarks') },
    ],
    [t]
  );

  const getFormSnapshot = (): ClientFormSnapshot => ({
    customerType,
    primarySalutation,
    primaryFirstName,
    primaryLastName,
    companyName,
    displayName,
    currency,
    emailAddress,
    customerNumber,
    phoneCountryCode,
    phoneWork,
    phoneMobile,
    customerLanguage,
    taxRate,
    companyId,
    paymentTerms,
    enablePortal,
    billingAttention,
    billingCountryRegion,
    billingStreet1,
    billingStreet2,
    billingCity,
    billingState,
    billingZipCode,
    billingPhoneCode,
    billingPhone,
    billingFaxNumber,
    shippingAttention,
    shippingCountryRegion,
    shippingStreet1,
    shippingStreet2,
    shippingCity,
    shippingState,
    shippingZipCode,
    shippingPhoneCode,
    shippingPhone,
    shippingFaxNumber,
    contactPersons,
    remarksText,
    documentNames,
  });

  const handleSaveClient = async () => {
    const payload = buildClientRequestPayload(getFormSnapshot());

    if (!payload.name || !payload.email || !payload.phone) {
      showErrorToast('Please fill name, email, and phone before saving.');
      return;
    }

    console.log('createClient payload:', payload);
    return;

    setIsSubmitting(true);
    try {
      const response = await CompanyAdminService.createClient(payload);
      const successMessage = response?.data?.message || t('Common.savedSuccessfully');
      showSuccessToast(successMessage);
      navigate('/company/clients');
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        'Failed to create client. Please check the form and try again.';
      showErrorToast(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Breadcrumbs
        title={t('CompanyClientsList.newCustomer')}
        breadcrumbItem={t('CompanyClientsList.newCustomer')}
        link="/company/clients"
        breadcrumbParent={t('CompanyClientsList.clients')}
      />
      <Card className="shadow-none">
        <CardBody className="p-4">
          {/* Top fields */}
          <Row className="g-3">
            {/* Customer Type */}
            <Col xs="12">
              <Row className="align-items-center g-3">
                <Col md="3">
                  <span className="d-inline-flex align-items-center gap-2">
                    {t('CompanyClientsList.customerType')}
                    <i className="bx bx-info-circle" aria-hidden />
                  </span>
                </Col>
                <Col md="9">
                  <div className="d-flex align-items-center gap-4">
                    <label className="form-check-inline d-inline-flex align-items-center gap-2 mb-0">
                      <Input
                        type="radio"
                        name="customerType"
                        checked={customerType === 'SUPPLIER'}
                        onChange={() => setCustomerType('SUPPLIER')}
                      />
                      <span>{t('CompanyClientsList.supplier')}</span>
                    </label>
                    <label className="form-check-inline d-inline-flex align-items-center gap-2 mb-0">
                      <Input
                        type="radio"
                        name="customerType"
                        checked={customerType === 'INDIVIDUAL'}
                        onChange={() => setCustomerType('INDIVIDUAL')}
                      />
                      <span>{t('CompanyClientsList.individual')}</span>
                    </label>
                  </div>
                </Col>
              </Row>
            </Col>

            {/* Primary Contact */}
            <Col xs="12">
              <Row className="align-items-center g-3">
                <Col md="3">
                  <span className="d-inline-flex align-items-center gap-2">
                    {t('CompanyClientsList.primaryContact')}
                    <i className="bx bx-info-circle" aria-hidden />
                  </span>
                </Col>
                <Col md="9">
                  <Row className="g-2">
                    <Col xs="3" sm="2">
                      <Input
                        type="select"
                        value={primarySalutation}
                        onChange={(e) => setPrimarySalutation(e.target.value)}
                        aria-label={t('CompanyClientsList.salutation')}
                      >
                        <option value="">{t('Common.select')}</option>
                        <option value="Mr">{t('CompanyClientsList.mr')}</option>
                        <option value="Ms">{t('CompanyClientsList.ms')}</option>
                      </Input>
                    </Col>
                    <Col xs="4" sm="3">
                      <Input
                        type="text"
                        value={primaryFirstName}
                        onChange={(e) => setPrimaryFirstName(e.target.value)}
                        placeholder={t('CompanyClientsList.firstName')}
                      />
                    </Col>
                    <Col xs="4" sm="3">
                      <Input
                        type="text"
                        value={primaryLastName}
                        onChange={(e) => setPrimaryLastName(e.target.value)}
                        placeholder={t('CompanyClientsList.lastName')}
                      />
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Col>

            {/* Company Name */}
            <Col xs="12">
              <Row className="align-items-center g-3">
                <Col md="3">
                  {t('CompanyClientsList.companyName')}
                </Col>
                <Col md="6">
                  <Input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                </Col>
              </Row>
            </Col>

            {/* Display Name */}
            <Col xs="12">
              <Row className="align-items-center g-3">
                <Col md="3">
                  <span className="d-inline-flex align-items-center gap-2">
                    {t('CompanyClientsList.displayName')}
                    <span className="text-danger">*</span>
                    <i className="bx bx-info-circle" aria-hidden />
                  </span>
                </Col>
                <Col md="6">
                  <Input type="select" value={displayName} onChange={(e) => setDisplayName(e.target.value)}>
                    <option value="">{t('CompanyClientsList.displayNamePlaceholder')}</option>
                  </Input>
                </Col>
              </Row>
            </Col>

            {/* Currency */}
            <Col xs="12">
              <Row className="align-items-center g-3">
                <Col md="3">
                  {t('Common.currency')}
                </Col>
                <Col md="6">
                  <Input type="select" value={currency} onChange={(e) => setCurrency(e.target.value as 'AED')}>
                    <option value="AED">{t('CompanyClientsList.currencyAedUae')}</option>
                  </Input>
                  <small className="text-muted d-block mt-1">{t('CompanyClientsList.currencyHelper')}</small>
                </Col>
              </Row>
            </Col>

            {/* Email Address */}
            <Col xs="12">
              <Row className="align-items-center g-3">
                <Col md="3">
                  <span className="d-inline-flex align-items-center gap-2">
                    {t('Common.email')}
                    <i className="bx bx-info-circle" aria-hidden />
                  </span>
                </Col>
                <Col md="6">
                  <Input type="email" value={emailAddress} onChange={(e) => setEmailAddress(e.target.value)} />
                </Col>
              </Row>
            </Col>

            {/* Customer Number */}
            <Col xs="12">
              <Row className="align-items-center g-3">
                <Col md="3">
                  <span className="d-inline-flex align-items-center gap-2">
                    {t('CompanyClientsList.customerNumber')}
                    <span className="text-danger">*</span>
                    <i className="bx bx-info-circle" aria-hidden />
                  </span>
                </Col>
                <Col md="6">
                  <InputGroup>
                    <Input value={customerNumber} readOnly />
                    <InputGroupText className="bg-white">
                      <i className="bx bx-cog text-primary" aria-hidden />
                    </InputGroupText>
                  </InputGroup>
                </Col>
              </Row>
            </Col>

            {/* Phone */}
            <Col xs="12">
              <Row className="align-items-center g-3">
                <Col md="3">
                  <span className="d-inline-flex align-items-center gap-2">
                    {t('Common.phone')}
                    <i className="bx bx-info-circle" aria-hidden />
                  </span>
                </Col>
                <Col md="6">
                  <Row className="g-2">
                    <Col md="6">
                      <InputGroup>
                        <Input
                          type="select"
                          value={phoneCountryCode}
                          onChange={(e) => setPhoneCountryCode(e.target.value)}
                          className="w-auto"
                        >
                          <option value="+971">+971</option>
                          <option value="+358">+358</option>
                        </Input>
                        <Input
                          className="w-50"
                          type="text"
                          value={phoneWork}
                          onChange={(e) => setPhoneWork(e.target.value)}
                          placeholder={t('CompanyClientsList.workPhone')}
                        />
                      </InputGroup>
                    </Col>
                    <Col md="6">
                      <InputGroup>
                        <Input type="select" value={phoneCountryCode} onChange={(e) => setPhoneCountryCode(e.target.value)} className="w-auto">
                          <option value={phoneCountryCode}>{phoneCountryCode}</option>
                        </Input>
                        <Input
                          className="w-50"
                          type="text"
                          value={phoneMobile}
                          onChange={(e) => setPhoneMobile(e.target.value)}
                          placeholder={t('CompanyClientsList.mobile')}
                        />
                      </InputGroup>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Col>

            {/* Customer Language */}
            <Col xs="12">
              <Row className="align-items-center g-3">
                <Col md="3">
                  <span className="d-inline-flex align-items-center gap-2">
                    {t('CompanyClientsList.customerLanguage')}
                    <i className="bx bx-info-circle" aria-hidden />
                  </span>
                </Col>
                <Col md="6">
                  <Input type="select" value={customerLanguage} onChange={(e) => setCustomerLanguage(e.target.value)}>
                    <option value="English">{t('CompanyClientsList.english')}</option>
                  </Input>
                </Col>
              </Row>
            </Col>
          </Row>

          {/* Tabs */}
          <Nav tabs className="mt-4">
            {tabs.map((tab) => (
              <NavItem key={tab.id}>
                <NavLink
                  href="#"
                  active={activeTab === tab.id}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveTab(tab.id);
                  }}
                >
                  {tab.label}
                </NavLink>
              </NavItem>
            ))}
          </Nav>

          <div className="mt-3">
            {activeTab === 'otherDetails' ? (
              <>
                <Row className="align-items-center g-3">
                  <Col md="3">
                    <span className="d-inline-flex align-items-center gap-2">
                      {t('CompanyClientsList.taxRate')}
                      <i className="bx bx-info-circle" aria-hidden />
                    </span>
                  </Col>
                  <Col md="6">
                    <Input type="select" value={taxRate} onChange={(e) => setTaxRate(e.target.value)}>
                      <option value="">{t('CompanyClientsList.selectTax')}</option>
                    </Input>
                    <small className="text-muted d-block mt-1">{t('CompanyClientsList.taxRateHint')}</small>
                  </Col>
                </Row>

                <Row className="align-items-end g-3 mt-2">
                  <Col md="3">
                    <span className="d-inline-flex align-items-center gap-2">
                      {t('CompanyClientsList.companyId')}
                      <i className="bx bx-info-circle" aria-hidden />
                    </span>
                  </Col>
                  <Col md="6">
                    <Input type="text" value={companyId} onChange={(e) => setCompanyId(e.target.value)} />
                  </Col>
                </Row>

                <Row className="align-items-end g-3 mt-2">
                  <Col md="3">
                    <span className="d-inline-flex align-items-center gap-2">
                      {t('CompanyClientsList.paymentTerms')}
                    </span>
                  </Col>
                  <Col md="6">
                    <Input
                      type="select"
                      value={paymentTerms}
                      onChange={(e) => setPaymentTerms(e.target.value as 'dueOnReceipt')}
                    >
                      <option value="dueOnReceipt">{t('CompanyClientsList.dueOnReceipt')}</option>
                    </Input>
                  </Col>
                </Row>

                <Row className="align-items-center g-3 mt-2">
                  <Col md="3">
                    <span className="d-inline-flex align-items-center gap-2">
                      {t('CompanyClientsList.enablePortal')}
                      <i className="bx bx-info-circle" aria-hidden />
                    </span>
                  </Col>
                  <Col md="6">
                    <div className="d-flex align-items-center gap-2">
                      <Input
                        id="enablePortal"
                        type="checkbox"
                        checked={enablePortal}
                        onChange={(e) => setEnablePortal(e.target.checked)}
                        className="m-0"
                      />
                      <Label htmlFor="enablePortal" check className="mb-0">
                        {t('CompanyClientsList.allowPortalAccessToCustomer')}
                      </Label>
                    </div>
                  </Col>
                </Row>

                <Row className="align-items-center g-3 mt-2">
                  <Col md="3">
                    <span className="d-inline-flex align-items-center gap-2">
                      {t('CompanyClientsList.documents')}
                    </span>
                  </Col>
                  <Col md="6">
                    <input
                      id="client-documents"
                      type="file"
                      multiple
                      className="d-none"
                      onChange={(e) => {
                        const names = Array.from(e.target.files || []).map((file) => file.name);
                        setDocumentNames(names);
                      }}
                    />

                    <div className="d-flex flex-column gap-2">
                      <Label
                        htmlFor="client-documents"
                        role="button"
                        className="btn btn-light border rounded-2 text-primary d-flex align-items-center justify-content-center gap-2"
                      >
                        <i className="bx bx-upload" aria-hidden />
                        {t('CompanyClientsList.uploadFile')}
                      </Label>
                      <small className="text-muted">{t('CompanyClientsList.documentsHint')}</small>
                    </div>
                  </Col>
                </Row>

                <div className="mt-3">
                  <Button color="link" className="p-0 text-decoration-none">
                    {t('CompanyClientsList.addMoreDetails')}
                  </Button>
                </div>

                <div className="mt-4">
                  <p className="text-muted mb-0">
                    {t('CompanyClientsList.customerOwnerPrefix')}{' '}
                    <a href="#" className="text-decoration-none">
                      {t('CompanyClientsList.learnMore')}
                    </a>
                  </p>
                </div>
              </>
            ) : activeTab === 'address' ? (
              <Row className="g-4">
                <Col md="6">
                  <h5 className="mb-3">{t('CompanyClientsList.billingAddress')}</h5>

                  <Label className="form-label fw-semibold mb-2">{t('CompanyClientsList.attention')}</Label>
                  <Input value={billingAttention} onChange={(e) => setBillingAttention(e.target.value)} className="mb-3" />

                  <Label className="form-label fw-semibold mb-2">{t('CompanyClientsList.countryRegion')}</Label>
                  <Input
                    type="select"
                    value={billingCountryRegion}
                    onChange={(e) => setBillingCountryRegion(e.target.value)}
                    className="mb-3"
                  >
                    <option value="">{t('CompanyClientsList.selectOrTypeToAdd')}</option>
                  </Input>

                  <Label className="form-label fw-semibold mb-2">{t('Common.address')}</Label>
                  <Input
                    value={billingStreet1}
                    onChange={(e) => setBillingStreet1(e.target.value)}
                    placeholder={t('CompanyClientsList.street1')}
                    className="mb-2"
                  />
                  <Input
                    value={billingStreet2}
                    onChange={(e) => setBillingStreet2(e.target.value)}
                    placeholder={t('CompanyClientsList.street2')}
                    className="mb-3"
                  />

                  <Label className="form-label fw-semibold mb-2">{t('CompanyClientsList.city')}</Label>
                  <Input value={billingCity} onChange={(e) => setBillingCity(e.target.value)} className="mb-3" />

                  <Label className="form-label fw-semibold mb-2">{t('CompanyClientsList.state')}</Label>
                  <Input type="select" value={billingState} onChange={(e) => setBillingState(e.target.value)} className="mb-3">
                    <option value="">{t('CompanyClientsList.selectOrTypeToAdd')}</option>
                  </Input>

                  <Label className="form-label fw-semibold mb-2">{t('CompanyClientsList.zipCode')}</Label>
                  <Input value={billingZipCode} onChange={(e) => setBillingZipCode(e.target.value)} className="mb-3" />

                  <Label className="form-label fw-semibold mb-2">{t('Common.phone')}</Label>
                  <InputGroup className="mb-3">
                    <Input type="select" value={billingPhoneCode} onChange={(e) => setBillingPhoneCode(e.target.value)} className="w-auto">
                      <option value="+358">+358</option>
                      <option value="+971">+971</option>
                    </Input>
                    <Input value={billingPhone} onChange={(e) => setBillingPhone(e.target.value)} />
                  </InputGroup>

                  <Label className="form-label fw-semibold mb-2">{t('CompanyClientsList.faxNumber')}</Label>
                  <Input value={billingFaxNumber} onChange={(e) => setBillingFaxNumber(e.target.value)} />
                </Col>

                <Col md="6">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <h5 className="mb-0">{t('CompanyClientsList.shippingAddress')}</h5>
                    <Button
                      color="link"
                      className="p-0 text-primary text-decoration-none"
                      type="button"
                      onClick={() => {
                        setShippingAttention(billingAttention);
                        setShippingCountryRegion(billingCountryRegion);
                        setShippingStreet1(billingStreet1);
                        setShippingStreet2(billingStreet2);
                        setShippingCity(billingCity);
                        setShippingState(billingState);
                        setShippingZipCode(billingZipCode);
                        setShippingPhoneCode(billingPhoneCode);
                        setShippingPhone(billingPhone);
                        setShippingFaxNumber(billingFaxNumber);
                      }}
                    >
                      <i className="bx bx-copy me-1" aria-hidden /> {t('CompanyClientsList.copyBillingAddress')}
                    </Button>
                  </div>

                  <Label className="form-label fw-semibold mb-2">{t('CompanyClientsList.attention')}</Label>
                  <Input value={shippingAttention} onChange={(e) => setShippingAttention(e.target.value)} className="mb-3" />

                  <Label className="form-label fw-semibold mb-2">{t('CompanyClientsList.countryRegion')}</Label>
                  <Input
                    type="select"
                    value={shippingCountryRegion}
                    onChange={(e) => setShippingCountryRegion(e.target.value)}
                    className="mb-3"
                  >
                    <option value="">{t('CompanyClientsList.selectOrTypeToAdd')}</option>
                  </Input>

                  <Label className="form-label fw-semibold mb-2">{t('Common.address')}</Label>
                  <Input
                    value={shippingStreet1}
                    onChange={(e) => setShippingStreet1(e.target.value)}
                    placeholder={t('CompanyClientsList.street1')}
                    className="mb-2"
                  />
                  <Input
                    value={shippingStreet2}
                    onChange={(e) => setShippingStreet2(e.target.value)}
                    placeholder={t('CompanyClientsList.street2')}
                    className="mb-3"
                  />

                  <Label className="form-label fw-semibold mb-2">{t('CompanyClientsList.city')}</Label>
                  <Input value={shippingCity} onChange={(e) => setShippingCity(e.target.value)} className="mb-3" />

                  <Label className="form-label fw-semibold mb-2">{t('CompanyClientsList.state')}</Label>
                  <Input type="select" value={shippingState} onChange={(e) => setShippingState(e.target.value)} className="mb-3">
                    <option value="">{t('CompanyClientsList.selectOrTypeToAdd')}</option>
                  </Input>

                  <Label className="form-label fw-semibold mb-2">{t('CompanyClientsList.zipCode')}</Label>
                  <Input value={shippingZipCode} onChange={(e) => setShippingZipCode(e.target.value)} className="mb-3" />

                  <Label className="form-label fw-semibold mb-2">{t('Common.phone')}</Label>
                  <InputGroup className="mb-3">
                    <Input type="select" value={shippingPhoneCode} onChange={(e) => setShippingPhoneCode(e.target.value)} className="w-auto">
                      <option value="+358">+358</option>
                      <option value="+971">+971</option>
                    </Input>
                    <Input value={shippingPhone} onChange={(e) => setShippingPhone(e.target.value)} />
                  </InputGroup>

                  <Label className="form-label fw-semibold mb-2">{t('CompanyClientsList.faxNumber')}</Label>
                  <Input value={shippingFaxNumber} onChange={(e) => setShippingFaxNumber(e.target.value)} />
                </Col>
              </Row>
            ) : activeTab === 'contactPersons' ? (
              <>
                <div className="table-responsive">
                  <Table className="table-nowrap align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="text-uppercase">{t('CompanyClientsList.salutation')}</th>
                        <th className="text-uppercase">{t('CompanyClientsList.firstName')}</th>
                        <th className="text-uppercase">{t('CompanyClientsList.lastName')}</th>
                        <th className="text-uppercase">{t('CompanyClientsList.emailAddress')}</th>
                        <th className="text-uppercase">{t('CompanyClientsList.workPhone')}</th>
                        <th className="text-uppercase">{t('CompanyClientsList.mobile')}</th>
                        <th className="text-end" />
                      </tr>
                    </thead>
                    <tbody>
                      {contactPersons.map((p) => (
                        <tr key={p.id}>
                          <td>
                            <Input type="select" value={p.salutation} onChange={(e) => {
                              const next = contactPersons.map((x) => (x.id === p.id ? { ...x, salutation: e.target.value } : x));
                              setContactPersons(next);
                            }}>
                              <option value="Mr">{t('CompanyClientsList.mr')}</option>
                              <option value="Ms">{t('CompanyClientsList.ms')}</option>
                            </Input>
                          </td>
                          <td>
                            <Input value={p.firstName} onChange={(e) => {
                              const next = contactPersons.map((x) => (x.id === p.id ? { ...x, firstName: e.target.value } : x));
                              setContactPersons(next);
                            }} />
                          </td>
                          <td>
                            <Input value={p.lastName} onChange={(e) => {
                              const next = contactPersons.map((x) => (x.id === p.id ? { ...x, lastName: e.target.value } : x));
                              setContactPersons(next);
                            }} />
                          </td>
                          <td>
                            <Input
                              type="email"
                              value={p.emailAddress}
                              onChange={(e) => {
                                const next = contactPersons.map((x) => (x.id === p.id ? { ...x, emailAddress: e.target.value } : x));
                                setContactPersons(next);
                              }}
                            />
                          </td>
                          <td>
                            <InputGroup>
                              <Input type="select" value={p.workPhoneCode} onChange={(e) => {
                                const next = contactPersons.map((x) => (x.id === p.id ? { ...x, workPhoneCode: e.target.value } : x));
                                setContactPersons(next);
                              }} className="w-auto">
                                <option value="+358">+358</option>
                                <option value="+971">+971</option>
                              </Input>
                              <Input className="w-50" value={p.workPhone} onChange={(e) => {
                                const next = contactPersons.map((x) => (x.id === p.id ? { ...x, workPhone: e.target.value } : x));
                                setContactPersons(next);
                              }} />
                            </InputGroup>
                          </td>
                          <td>
                            <InputGroup>
                              <Input type="select" value={p.mobileCode} onChange={(e) => {
                                const next = contactPersons.map((x) => (x.id === p.id ? { ...x, mobileCode: e.target.value } : x));
                                setContactPersons(next);
                              }} className="w-auto">
                                <option value="+358">+358</option>
                                <option value="+971">+971</option>
                              </Input>
                              <Input className="w-50" value={p.mobile} onChange={(e) => {
                                const next = contactPersons.map((x) => (x.id === p.id ? { ...x, mobile: e.target.value } : x));
                                setContactPersons(next);
                              }} />
                            </InputGroup>
                          </td>
                          <td className="text-end">
                            <Button
                              color="link"
                              className="p-0 text-danger"
                              type="button"
                              disabled={contactPersons.length <= 1}
                              onClick={() => setContactPersons((prev) => prev.filter((x) => x.id !== p.id))}
                            >
                              <i className="bx bx-trash fs-18" aria-hidden />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>

                <div className="mt-3">
                  <Button
                    color="light"
                    className="border w-auto d-flex align-items-center justify-content-start gap-2"
                    type="button"
                    onClick={() => setContactPersons((prev) => [...prev, emptyContactPerson()])}
                  >
                    <i className="bx bx-plus" aria-hidden />
                    {t('CompanyClientsList.addContactPerson')}
                  </Button>
                </div>
              </>
            ) : (
              <Row className="g-3">
                <Col xs="12">
                  <Label className="form-label fw-semibold mb-2">{t('CompanyClientsList.remarks')}</Label>
                  <Input
                    type="textarea"
                    rows={5}
                    value={remarksText}
                    onChange={(e) => setRemarksText(e.target.value)}
                  />
                </Col>
              </Row>
            )}
          </div>

          {/* Footer buttons */}
          <div className="position-sticky bottom-0 bg-white border-top pt-3 mt-4">
            <div className="d-flex gap-2">
              <Button color="primary" type="button" onClick={handleSaveClient} disabled={isSubmitting}>
                {isSubmitting ? t('Common.loading') || 'Loading...' : t('Common.save')}
              </Button>
              <Button
                color="secondary"
                outline
                type="button"
                onClick={() => navigate('/company/clients')}
              >
                {t('Common.cancel')}
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </>
  );
};

export default CompanyClientCreate;
