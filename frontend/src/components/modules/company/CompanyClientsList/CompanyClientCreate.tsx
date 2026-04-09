import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Card,
  CardBody,
  Col,
  FormFeedback,
  Input,
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
type CreateTabId = 'address' | 'contactPersons' | 'remarks';
type ContactPersonForm = {
  id: string;
  salutation: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
  workPhone: string;
  mobile: string;
};

type ContactPersonField = keyof Omit<ContactPersonForm, 'id'>;

type ClientFormSnapshot = {
  customerType: CustomerType;
  primarySalutation: string;
  primaryFirstName: string;
  primaryLastName: string;
  companyName: string;
  emailAddress: string;
  phoneWork: string;
  phoneMobile: string;
  billingCountryRegion: string;
  billingAddress: string;
  billingCity: string;
  billingState: string;
  billingZipCode: string;
  billingPhone: string;
  contactPersons: ContactPersonForm[];
  remarksText: string;
};

type ClientFieldErrorKey =
  | 'primarySalutation'
  | 'primaryFirstName'
  | 'primaryLastName'
  | 'companyName'
  | 'emailAddress'
  | 'phoneWork'
  | 'phoneMobile'
  | 'billingAddress'
  | 'billingCountryRegion'
  | 'billingState'
  | 'billingCity'
  | 'billingZipCode'
  | 'billingPhone';

type ClientFieldErrors = Partial<Record<ClientFieldErrorKey, string>>;
type ContactPersonRowErrors = Partial<Record<ContactPersonField, string>>;
type ContactPersonErrors = Record<string, ContactPersonRowErrors>;

const normalizeContactPersons = (contactPersons: ContactPersonForm[]) =>
  contactPersons.map((person) => ({
    salutation: person.salutation,
    firstName: person.firstName.trim(),
    lastName: person.lastName.trim(),
    emailAddress: person.emailAddress.trim(),
    workPhone: person.workPhone.trim(),
    mobile: person.mobile.trim(),
  }));

const buildClientRequestPayload = (form: ClientFormSnapshot) => {
  const name =
    form.companyName.trim() ||
    [form.primaryFirstName.trim(), form.primaryLastName.trim()].filter(Boolean).join(' ');
  const phone = form.phoneMobile.trim()
    ? form.phoneMobile.trim()
    : form.phoneWork.trim();

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
      phone: {
        // countryCode intentionally removed for now.
        work: form.phoneWork.trim(),
        mobile: form.phoneMobile.trim(),
      },
      address: {
        billing: {
          countryRegion: form.billingCountryRegion,
          street1: form.billingAddress.trim(),
          city: form.billingCity.trim(),
          state: form.billingState,
          zipCode: form.billingZipCode.trim(),
          // phoneCode intentionally removed for now.
          phone: form.billingPhone.trim(),
        },
      },
      contactPersons: normalizeContactPersons(form.contactPersons),
      remarks: form.remarksText.trim(),
    },
  };
};

interface CreatedClientData {
  id?: string;
  name?: string;
}

interface CompanyClientCreateProps {
  embedded?: boolean;
  onCancel?: () => void;
  onSuccess?: (createdClient?: CreatedClientData) => void;
}

const CompanyClientCreate = ({ embedded = false, onCancel, onSuccess }: CompanyClientCreateProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [customerType, setCustomerType] = useState<CustomerType>('SUPPLIER');
  const [primarySalutation, setPrimarySalutation] = useState('');
  const [primaryFirstName, setPrimaryFirstName] = useState('');
  const [primaryLastName, setPrimaryLastName] = useState('');

  const [companyName, setCompanyName] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [phoneWork, setPhoneWork] = useState('');
  const [phoneMobile, setPhoneMobile] = useState('');

  const [activeTab, setActiveTab] = useState<CreateTabId>('address');

  // Billing / Shipping address
  const [billingCountryRegion, setBillingCountryRegion] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [billingCity, setBillingCity] = useState('');
  const [billingState, setBillingState] = useState('');
  const [billingZipCode, setBillingZipCode] = useState('');
  const [billingPhone, setBillingPhone] = useState('');

  const emptyContactPerson = (): ContactPersonForm => ({
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    salutation: 'Mr',
    firstName: '',
    lastName: '',
    emailAddress: '',
    workPhone: '',
    mobile: '',
  });

  const [contactPersons, setContactPersons] = useState<ContactPersonForm[]>([emptyContactPerson()]);

  const [remarksText, setRemarksText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<ClientFieldErrors>({});
  const [contactPersonErrors, setContactPersonErrors] = useState<ContactPersonErrors>({});

  const tabs: Array<{ id: CreateTabId; label: string }> = useMemo(
    () => [
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
    emailAddress,
    phoneWork,
    phoneMobile,
    billingCountryRegion,
    billingAddress,
    billingCity,
    billingState,
    billingZipCode,
    billingPhone,
    contactPersons,
    remarksText,
  });

  const clearFieldError = (field: ClientFieldErrorKey) => {
    if (!formErrors[field]) {
      return;
    }
    setFormErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleContactPersonChange = (
    personId: string,
    field: ContactPersonField,
    value: string
  ) => {
    setContactPersons((prev) =>
      prev.map((person) =>
        person.id === personId ? { ...person, [field]: value } : person
      )
    );

    if (contactPersonErrors[personId]?.[field]) {
      setContactPersonErrors((prev) => {
        const next = { ...prev };
        const rowErrors = { ...(next[personId] || {}) };
        delete rowErrors[field];
        if (Object.keys(rowErrors).length === 0) {
          delete next[personId];
        } else {
          next[personId] = rowErrors;
        }
        return next;
      });
    }
  };

  const handleSaveClient = async () => {
    const requiredMessage = t('Validation.fieldRequired');
    const nextFormErrors: ClientFieldErrors = {};
    const nextContactErrors: ContactPersonErrors = {};

    if (!primarySalutation.trim()) nextFormErrors.primarySalutation = requiredMessage;
    if (!primaryFirstName.trim()) nextFormErrors.primaryFirstName = requiredMessage;
    if (!primaryLastName.trim()) nextFormErrors.primaryLastName = requiredMessage;
    if (!companyName.trim()) nextFormErrors.companyName = requiredMessage;
    if (!emailAddress.trim()) nextFormErrors.emailAddress = requiredMessage;
    if (!phoneWork.trim()) nextFormErrors.phoneWork = requiredMessage;
    if (!phoneMobile.trim()) nextFormErrors.phoneMobile = requiredMessage;
    if (!billingAddress.trim()) nextFormErrors.billingAddress = requiredMessage;
    if (!billingCountryRegion.trim()) nextFormErrors.billingCountryRegion = requiredMessage;
    if (!billingState.trim()) nextFormErrors.billingState = requiredMessage;
    if (!billingCity.trim()) nextFormErrors.billingCity = requiredMessage;
    if (!billingZipCode.trim()) nextFormErrors.billingZipCode = requiredMessage;
    if (!billingPhone.trim()) nextFormErrors.billingPhone = requiredMessage;

    contactPersons.forEach((person) => {
      const rowErrors: ContactPersonRowErrors = {};
      if (!person.salutation.trim()) rowErrors.salutation = requiredMessage;
      if (!person.firstName.trim()) rowErrors.firstName = requiredMessage;
      if (!person.lastName.trim()) rowErrors.lastName = requiredMessage;
      if (!person.emailAddress.trim()) rowErrors.emailAddress = requiredMessage;
      if (!person.workPhone.trim()) rowErrors.workPhone = requiredMessage;
      if (!person.mobile.trim()) rowErrors.mobile = requiredMessage;

      if (Object.keys(rowErrors).length > 0) {
        nextContactErrors[person.id] = rowErrors;
      }
    });

    setFormErrors(nextFormErrors);
    setContactPersonErrors(nextContactErrors);

    const hasFieldErrors = Object.keys(nextFormErrors).length > 0;
    const hasContactErrors = Object.keys(nextContactErrors).length > 0;
    if (hasContactErrors || hasFieldErrors) {
      if (hasContactErrors) {
        setActiveTab('contactPersons');
      } else if (
        nextFormErrors.billingAddress ||
        nextFormErrors.billingCountryRegion ||
        nextFormErrors.billingState ||
        nextFormErrors.billingCity ||
        nextFormErrors.billingZipCode ||
        nextFormErrors.billingPhone
      ) {
        setActiveTab('address');
      }
      return;
    }

    const payload = buildClientRequestPayload(getFormSnapshot());

    console.log('createClient payload:', payload);
    // return;

    setIsSubmitting(true);
    try {
      const response = await CompanyAdminService.createClient(payload);
      const successMessage = response?.data?.message || t('Common.savedSuccessfully');
      showSuccessToast(successMessage);
      const createdClient = response?.data?.data as CreatedClientData | undefined;
      if (onSuccess) {
        onSuccess(createdClient);
      } else {
        navigate('/company/clients');
      }
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
      {!embedded && (
        <Breadcrumbs
          title={t('CompanyClientsList.newCustomer')}
          breadcrumbItem={t('CompanyClientsList.newCustomer')}
          link="/company/clients"
          breadcrumbParent={t('CompanyClientsList.clients')}
        />
      )}
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
                        onChange={(e) => {
                          setPrimarySalutation(e.target.value);
                          clearFieldError('primarySalutation');
                        }}
                        invalid={!!formErrors.primarySalutation}
                        aria-label={t('CompanyClientsList.salutation')}
                      >
                        <option value="">{t('Common.select')}</option>
                        <option value="Mr">{t('CompanyClientsList.mr')}</option>
                        <option value="Ms">{t('CompanyClientsList.ms')}</option>
                      </Input>
                      {formErrors.primarySalutation && (
                        <FormFeedback>{formErrors.primarySalutation}</FormFeedback>
                      )}
                    </Col>
                    <Col xs="4" sm="3">
                      <Input
                        type="text"
                        value={primaryFirstName}
                        onChange={(e) => {
                          setPrimaryFirstName(e.target.value);
                          clearFieldError('primaryFirstName');
                        }}
                        invalid={!!formErrors.primaryFirstName}
                        placeholder={t('CompanyClientsList.firstName')}
                      />
                      {formErrors.primaryFirstName && (
                        <FormFeedback>{formErrors.primaryFirstName}</FormFeedback>
                      )}
                    </Col>
                    <Col xs="4" sm="3">
                      <Input
                        type="text"
                        value={primaryLastName}
                        onChange={(e) => {
                          setPrimaryLastName(e.target.value);
                          clearFieldError('primaryLastName');
                        }}
                        invalid={!!formErrors.primaryLastName}
                        placeholder={t('CompanyClientsList.lastName')}
                      />
                      {formErrors.primaryLastName && (
                        <FormFeedback>{formErrors.primaryLastName}</FormFeedback>
                      )}
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
                  <Input
                    type="text"
                    value={companyName}
                    onChange={(e) => {
                      setCompanyName(e.target.value);
                      clearFieldError('companyName');
                    }}
                    invalid={!!formErrors.companyName}
                  />
                  {formErrors.companyName && (
                    <FormFeedback>{formErrors.companyName}</FormFeedback>
                  )}
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
                  <Input
                    type="email"
                    value={emailAddress}
                    onChange={(e) => {
                      setEmailAddress(e.target.value);
                      clearFieldError('emailAddress');
                    }}
                    invalid={!!formErrors.emailAddress}
                  />
                  {formErrors.emailAddress && (
                    <FormFeedback>{formErrors.emailAddress}</FormFeedback>
                  )}
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
                      <Input
                        type="text"
                        value={phoneWork}
                        onChange={(e) => {
                          setPhoneWork(e.target.value);
                          clearFieldError('phoneWork');
                        }}
                        invalid={!!formErrors.phoneWork}
                        placeholder={t('CompanyClientsList.workPhone')}
                      />
                      {formErrors.phoneWork && (
                        <FormFeedback>{formErrors.phoneWork}</FormFeedback>
                      )}
                    </Col>
                    <Col md="6">
                      <Input
                        type="text"
                        value={phoneMobile}
                        onChange={(e) => {
                          setPhoneMobile(e.target.value);
                          clearFieldError('phoneMobile');
                        }}
                        invalid={!!formErrors.phoneMobile}
                        placeholder={t('CompanyClientsList.mobile')}
                      />
                      {formErrors.phoneMobile && (
                        <FormFeedback>{formErrors.phoneMobile}</FormFeedback>
                      )}
                    </Col>
                  </Row>
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
            {activeTab === 'address' ? (
              <Row className="g-4">
                <Col md="12">
                  <h5 className="mb-3">{t('CompanyClientsList.billingAddress')}</h5>

                  <Row className="g-3">
                    <Col md="6">
                      <Label className="form-label fw-semibold mb-2">{t('Common.address')}</Label>
                      <Input
                        value={billingAddress}
                        onChange={(e) => {
                          setBillingAddress(e.target.value);
                          clearFieldError('billingAddress');
                        }}
                        invalid={!!formErrors.billingAddress}
                        placeholder={t('CompanyClientsList.street1')}
                      />
                      {formErrors.billingAddress && (
                        <FormFeedback>{formErrors.billingAddress}</FormFeedback>
                      )}
                    </Col>

                    <Col md="6">
                      <Label className="form-label fw-semibold mb-2">{t('CompanyClientsList.country')}</Label>
                      <Input
                        type="text"
                        value={billingCountryRegion}
                        onChange={(e) => {
                          setBillingCountryRegion(e.target.value);
                          clearFieldError('billingCountryRegion');
                        }}
                        invalid={!!formErrors.billingCountryRegion}
                      />
                      {formErrors.billingCountryRegion && (
                        <FormFeedback>{formErrors.billingCountryRegion}</FormFeedback>
                      )}
                    </Col>

                    <Col md="6">
                      <Label className="form-label fw-semibold mb-2">{t('CompanyClientsList.state')}</Label>
                      <Input
                        type="text"
                        value={billingState}
                        onChange={(e) => {
                          setBillingState(e.target.value);
                          clearFieldError('billingState');
                        }}
                        invalid={!!formErrors.billingState}
                      />
                      {formErrors.billingState && (
                        <FormFeedback>{formErrors.billingState}</FormFeedback>
                      )}
                    </Col>

                    <Col md="6">
                      <Label className="form-label fw-semibold mb-2">{t('CompanyClientsList.city')}</Label>
                      <Input
                        value={billingCity}
                        onChange={(e) => {
                          setBillingCity(e.target.value);
                          clearFieldError('billingCity');
                        }}
                        invalid={!!formErrors.billingCity}
                      />
                      {formErrors.billingCity && (
                        <FormFeedback>{formErrors.billingCity}</FormFeedback>
                      )}
                    </Col>

                    <Col md="6">
                      <Label className="form-label fw-semibold mb-2">{t('CompanyClientsList.zipCode')}</Label>
                      <Input
                        value={billingZipCode}
                        onChange={(e) => {
                          setBillingZipCode(e.target.value);
                          clearFieldError('billingZipCode');
                        }}
                        invalid={!!formErrors.billingZipCode}
                      />
                      {formErrors.billingZipCode && (
                        <FormFeedback>{formErrors.billingZipCode}</FormFeedback>
                      )}
                    </Col>

                    <Col md="6">
                      <Label className="form-label fw-semibold mb-2">{t('Common.phone')}</Label>
                      <Input
                        value={billingPhone}
                        onChange={(e) => {
                          setBillingPhone(e.target.value);
                          clearFieldError('billingPhone');
                        }}
                        invalid={!!formErrors.billingPhone}
                      />
                      {formErrors.billingPhone && (
                        <FormFeedback>{formErrors.billingPhone}</FormFeedback>
                      )}
                    </Col>

                  </Row>
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
                            <Input
                              type="select"
                              value={p.salutation}
                              onChange={(e) => handleContactPersonChange(p.id, 'salutation', e.target.value)}
                              invalid={!!contactPersonErrors[p.id]?.salutation}
                            >
                              <option value="Mr">{t('CompanyClientsList.mr')}</option>
                              <option value="Ms">{t('CompanyClientsList.ms')}</option>
                            </Input>
                            {contactPersonErrors[p.id]?.salutation && (
                              <FormFeedback>{contactPersonErrors[p.id]?.salutation}</FormFeedback>
                            )}
                          </td>
                          <td>
                            <Input
                              value={p.firstName}
                              onChange={(e) => handleContactPersonChange(p.id, 'firstName', e.target.value)}
                              invalid={!!contactPersonErrors[p.id]?.firstName}
                            />
                            {contactPersonErrors[p.id]?.firstName && (
                              <FormFeedback>{contactPersonErrors[p.id]?.firstName}</FormFeedback>
                            )}
                          </td>
                          <td>
                            <Input
                              value={p.lastName}
                              onChange={(e) => handleContactPersonChange(p.id, 'lastName', e.target.value)}
                              invalid={!!contactPersonErrors[p.id]?.lastName}
                            />
                            {contactPersonErrors[p.id]?.lastName && (
                              <FormFeedback>{contactPersonErrors[p.id]?.lastName}</FormFeedback>
                            )}
                          </td>
                          <td>
                            <Input
                              type="email"
                              value={p.emailAddress}
                              onChange={(e) => handleContactPersonChange(p.id, 'emailAddress', e.target.value)}
                              invalid={!!contactPersonErrors[p.id]?.emailAddress}
                            />
                            {contactPersonErrors[p.id]?.emailAddress && (
                              <FormFeedback>{contactPersonErrors[p.id]?.emailAddress}</FormFeedback>
                            )}
                          </td>
                          <td>
                            <Input
                              value={p.workPhone}
                              onChange={(e) => handleContactPersonChange(p.id, 'workPhone', e.target.value)}
                              invalid={!!contactPersonErrors[p.id]?.workPhone}
                            />
                            {contactPersonErrors[p.id]?.workPhone && (
                              <FormFeedback>{contactPersonErrors[p.id]?.workPhone}</FormFeedback>
                            )}
                          </td>
                          <td>
                            <Input
                              value={p.mobile}
                              onChange={(e) => handleContactPersonChange(p.id, 'mobile', e.target.value)}
                              invalid={!!contactPersonErrors[p.id]?.mobile}
                            />
                            {contactPersonErrors[p.id]?.mobile && (
                              <FormFeedback>{contactPersonErrors[p.id]?.mobile}</FormFeedback>
                            )}
                          </td>
                          <td className="text-end">
                            <Button
                              color="link"
                              className="p-0 text-danger"
                              type="button"
                              disabled={contactPersons.length <= 1}
                              onClick={() => {
                                setContactPersons((prev) => prev.filter((x) => x.id !== p.id));
                                setContactPersonErrors((prev) => {
                                  if (!prev[p.id]) {
                                    return prev;
                                  }
                                  const next = { ...prev };
                                  delete next[p.id];
                                  return next;
                                });
                              }}
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
                onClick={() => {
                  if (onCancel) {
                    onCancel();
                    return;
                  }
                  navigate('/company/clients');
                }}
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
