/**
 * Company clients – Dashboard layout: left sidebar client list, right panel client details.
 */

import { useState, useMemo, useEffect, type MouseEvent } from 'react';
import './CompanyClientsList.scss';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardBody,
  Row,
  Col,
  Button,
  Badge,
  Input,
  InputGroup,
  InputGroupText,
  Nav,
  NavItem,
  NavLink,
  Table,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
} from 'reactstrap';
import Breadcrumbs from '../../../common/Breadcrumbs/Breadcrumbs';
import Pagination from '../../../common/Pagination/Pagination';
import { showInfoToast } from '../../../../core/utils/toast';
import { STATUS } from '../../../../core/constants/constantValues';
import CompanyClientOverview from './CompanyClientOverview';
import CompanyClientTransactions from './CompanyClientTransactions';

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

// TODO: Replace with real API data for transactions/payments.
// Kept for reference until transactions API wiring is completed.
const DUMMY_PAYMENTS = [
  {
    id: 'CP-2001',
    clientName: 'Arabtec Construction',
    projectName: 'Residential Tower – Phase 2',
    invoiceNumber: 'INV-2026-010',
    dueDate: '2026-03-20T00:00:00.000Z',
    amount: 60000,
    currency: 'AED',
    projectCost: 60000,
    paidAmount: 15000,
    balanceAmount: 45000,
    status: 'PENDING',
  },
  {
    id: 'CP-2002',
    clientName: 'Arabtec Construction',
    projectName: 'Commercial Plaza – Block A',
    invoiceNumber: 'INV-2026-011',
    dueDate: '2026-02-25T00:00:00.000Z',
    amount: 85000,
    currency: 'AED',
    projectCost: 85000,
    paidAmount: 85000,
    balanceAmount: 0,
    status: 'COMPLETED',
  },
  {
    id: 'CP-2003',
    clientName: 'ALEC Engineering and Contracting',
    projectName: 'Airport Expansion – Civil Works',
    invoiceNumber: 'INV-2026-020',
    dueDate: '2026-03-05T00:00:00.000Z',
    amount: 125000,
    currency: 'AED',
    projectCost: 125000,
    paidAmount: 75000,
    balanceAmount: 50000,
    status: 'PENDING',
  },
  {
    id: 'CP-2004',
    clientName: 'ALEC Engineering and Contracting',
    projectName: 'Industrial Facility – Mechanical',
    invoiceNumber: 'INV-2026-021',
    dueDate: '2026-02-15T00:00:00.000Z',
    amount: 98000,
    currency: 'AED',
    projectCost: 98000,
    paidAmount: 98000,
    balanceAmount: 0,
    status: 'COMPLETED',
  },
  {
    id: 'CP-2005',
    clientName: 'Al Naboodah Construction Group',
    projectName: 'Highway Infrastructure Package',
    invoiceNumber: 'INV-2026-030',
    dueDate: '2026-02-01T00:00:00.000Z',
    amount: 220000,
    currency: 'AED',
    projectCost: 220000,
    paidAmount: 140000,
    balanceAmount: 80000,
    status: 'OVERDUE',
  },
  {
    id: 'CP-2006',
    clientName: 'Al Naboodah Construction Group',
    projectName: 'Urban Development – Package 3',
    invoiceNumber: 'INV-2026-031',
    dueDate: '2026-03-12T00:00:00.000Z',
    amount: 74000,
    currency: 'AED',
    projectCost: 74000,
    paidAmount: 25000,
    balanceAmount: 49000,
    status: 'PENDING',
  },
  {
    id: 'CP-2007',
    clientName: 'Dutco Construction Company',
    projectName: 'Logistics Park – Warehouses',
    invoiceNumber: 'INV-2026-040',
    dueDate: '2026-03-05T00:00:00.000Z',
    amount: 91000,
    currency: 'AED',
    projectCost: 91000,
    paidAmount: 45000,
    balanceAmount: 46000,
    status: 'OVERDUE',
  },
  {
    id: 'CP-2008',
    clientName: 'Dutco Construction Company',
    projectName: 'Infrastructure – Phase 1',
    invoiceNumber: 'INV-2026-041',
    dueDate: '2026-02-10T00:00:00.000Z',
    amount: 67000,
    currency: 'AED',
    projectCost: 67000,
    paidAmount: 67000,
    balanceAmount: 0,
    status: 'COMPLETED',
  },
  {
    id: 'CP-2009',
    clientName: 'Emaar Properties PJSC',
    projectName: 'Residential Complex – Towers',
    invoiceNumber: 'INV-2026-050',
    dueDate: '2026-03-18T00:00:00.000Z',
    amount: 132000,
    currency: 'AED',
    projectCost: 132000,
    paidAmount: 60000,
    balanceAmount: 72000,
    status: 'PENDING',
  },
  {
    id: 'CP-2010',
    clientName: 'Al Jaber Construction Group',
    projectName: 'Mixed-Use Development – Package 1',
    invoiceNumber: 'INV-2026-060',
    dueDate: '2026-03-10T00:00:00.000Z',
    amount: 156000,
    currency: 'AED',
    projectCost: 156000,
    paidAmount: 156000,
    balanceAmount: 0,
    status: 'COMPLETED',
  },
  {
    id: 'CP-2011',
    clientName: 'Nakheel PJSC',
    projectName: 'Palm Jumeirah – Retail Zone',
    invoiceNumber: 'INV-2026-061',
    dueDate: '2026-02-28T00:00:00.000Z',
    amount: 192000,
    currency: 'AED',
    projectCost: 192000,
    paidAmount: 80000,
    balanceAmount: 112000,
    status: 'PENDING',
  },
  {
    id: 'CP-2012',
    clientName: 'Damac Properties',
    projectName: 'Luxury Residence – Tower B',
    invoiceNumber: 'INV-2026-070',
    dueDate: '2026-02-05T00:00:00.000Z',
    amount: 118000,
    currency: 'AED',
    projectCost: 118000,
    paidAmount: 30000,
    balanceAmount: 88000,
    status: 'OVERDUE',
  },
  {
    id: 'CP-2013',
    clientName: 'Khansaheb Civil Engineering LLC',
    projectName: 'Roadworks & Utilities – Phase 2',
    invoiceNumber: 'INV-2026-080',
    dueDate: '2026-03-22T00:00:00.000Z',
    amount: 74000,
    currency: 'AED',
    projectCost: 74000,
    paidAmount: 52000,
    balanceAmount: 22000,
    status: 'PENDING',
  },
  {
    id: 'CP-2014',
    clientName: 'Sobha Realty',
    projectName: 'Residential Complex – Block 4',
    invoiceNumber: 'INV-2026-090',
    dueDate: '2026-02-12T00:00:00.000Z',
    amount: 166000,
    currency: 'AED',
    projectCost: 166000,
    paidAmount: 90000,
    balanceAmount: 76000,
    status: 'OVERDUE',
  },
];
void DUMMY_PAYMENTS;

const INITIAL_CLIENTS: Client[] = [
  {
    id: '1001',
    name: 'Arabtec Construction',
    email: 'projects@arabtec.ae',
    phone: '+971 4 333 3000',
    buildingAddress: 'Arabtec Tower',
    streetAddress: 'Sheikh Zayed Road',
    country: 'UAE',
    state: 'Dubai',
    city: 'Dubai',
    postalCode: '12345',
    description: 'Major UAE contractor; known for Burj Khalifa and landmark projects. Civil, MEP and building construction.',
    type: STATUS.GENERAL,
    status: 'New',
    createdAt: '2026-02-10T00:00:00.000Z',
    updatedAt: '2026-02-10T00:00:00.000Z',
    totalAmount: 240000.00,
  },
  {
    id: '1002',
    name: 'ALEC Engineering and Contracting',
    email: 'info@alec.ae',
    phone: '+971 4 809 0000',
    buildingAddress: 'ALEC Headquarters',
    streetAddress: 'Dubai Investments Park',
    country: 'UAE',
    state: 'Dubai',
    city: 'Dubai',
    postalCode: '54321',
    description: 'Dubai-based contractor; completed Dubai International Airport Terminal 3 and major commercial projects.',
    type: STATUS.GENERAL,
    status: 'COMPLETED',
    createdAt: '2026-02-22T00:00:00.000Z',
    updatedAt: '2026-02-22T00:00:00.000Z',
    totalAmount: 120000.00,
  },
  {
    id: '1003',
    name: 'Al Naboodah Construction Group',
    email: 'enquiries@alnaboodah.ae',
    phone: '+971 4 880 0000',
    buildingAddress: 'Al Naboodah Building',
    streetAddress: 'Al Quoz Industrial Area',
    country: 'UAE',
    state: 'Dubai',
    city: 'Dubai',
    postalCode: '67890',
    description: 'Established since 1960s. Specializes in civil engineering, MEP and infrastructure.',
    type: STATUS.SUPPLIER,
    status: 'OVERDUE',
    createdAt: '2026-02-22T00:00:00.000Z',
    updatedAt: '2026-02-22T00:00:00.000Z',
    totalAmount: 700000.00,
  },
  {
    id: '1004',
    name: 'Dutco Construction Company',
    email: 'contact@dutco.ae',
    phone: '+971 4 347 0000',
    buildingAddress: 'Dutco House',
    streetAddress: 'Jebel Ali',
    country: 'UAE',
    state: 'Dubai',
    city: 'Dubai',
    postalCode: '98765',
    description: 'One of the largest construction companies in UAE; infrastructure, building and civil works.',
    type: STATUS.GENERAL,
    status: 'PENDING',
    createdAt: '2026-02-25T00:00:00.000Z',
    updatedAt: '2026-02-25T00:00:00.000Z',
    totalAmount: 870000.00,
  },
  {
    id: '1005',
    name: 'Al Jaber Construction Group',
    email: 'info@aljaber.ae',
    phone: '+971 4 880 0000',
    buildingAddress: 'Al Jaber Building',
    streetAddress: 'Al Quoz Industrial Area',
    country: 'UAE',
    state: 'Dubai',
    city: 'Dubai',
    postalCode: '67890',
    description: 'Established since 1960s. Specializes in civil engineering, MEP and infrastructure.',
    type: STATUS.SUPPLIER,
    status: 'COMPLETED',
    createdAt: '2026-02-22T00:00:00.000Z',
    updatedAt: '2026-02-22T00:00:00.000Z',
    totalAmount: 700000.00,
  },
  {
    id: '1006',
    name: 'Nakheel PJSC',
    email: 'customercare@nakheel.com',
    phone: '+971 4 390 3333',
    buildingAddress: 'Nakheel Sales Centre',
    streetAddress: 'King Salman Bin Abdul Aziz Al Saud Street, Al Sufouh 2',
    country: 'UAE',
    state: 'Dubai',
    city: 'Dubai',
    postalCode: '00000',
    description: 'Dubai-based master developer; Palm Jumeirah, Deira Islands, Ibn Battuta and other landmark projects.',
    type: STATUS.GENERAL,
    status: 'PENDING',
    createdAt: '2026-02-18T00:00:00.000Z',
    updatedAt: '2026-02-18T00:00:00.000Z',
    totalAmount: 520000.00,
  },
  {
    id: '1007',
    name: 'Emaar Properties PJSC',
    email: 'customer.service@emaar.ae',
    phone: '+971 4 366 1688',
    buildingAddress: 'Emaar Square',
    streetAddress: 'Building 4, Downtown Dubai',
    country: 'UAE',
    state: 'Dubai',
    city: 'Dubai',
    postalCode: '00000',
    description: 'Global developer; Burj Khalifa, Dubai Mall, Downtown Dubai and international real estate.',
    type: STATUS.GENERAL,
    status: 'COMPLETED',
    createdAt: '2026-01-15T00:00:00.000Z',
    updatedAt: '2026-02-20T00:00:00.000Z',
    totalAmount: 980000.00,
  },
  {
    id: '1008',
    name: 'Damac Properties',
    email: 'info@damacproperties.com',
    phone: '+971 4 373 2000',
    buildingAddress: 'Damac Towers',
    streetAddress: 'Dubai Marina',
    country: 'UAE',
    state: 'Dubai',
    city: 'Dubai',
    postalCode: '00000',
    description: 'Luxury developer; residential and commercial projects in Dubai and key international markets.',
    type: STATUS.GENERAL,
    status: 'NEW',
    createdAt: '2026-02-28T00:00:00.000Z',
    updatedAt: '2026-02-28T00:00:00.000Z',
    totalAmount: 450000.00,
  },
  {
    id: '1009',
    name: 'Khansaheb Civil Engineering LLC',
    email: 'enquiries@khansaheb.ae',
    phone: '+971 4 337 5555',
    buildingAddress: 'Khansaheb Building',
    streetAddress: 'Al Quoz Industrial Area 3',
    country: 'UAE',
    state: 'Dubai',
    city: 'Dubai',
    postalCode: '00000',
    description: 'Civil engineering and construction; infrastructure, buildings and MEP across UAE and region.',
    type: STATUS.SUPPLIER,
    status: 'PENDING',
    createdAt: '2026-02-12T00:00:00.000Z',
    updatedAt: '2026-02-12T00:00:00.000Z',
    totalAmount: 610000.00,
  },
  {
    id: '1010',
    name: 'Sobha Realty',
    email: 'info@sobharealty.com',
    phone: '+971 4 378 8888',
    buildingAddress: 'Sobha Hartland',
    streetAddress: 'Mohammed Bin Rashid City',
    country: 'UAE',
    state: 'Dubai',
    city: 'Dubai',
    postalCode: '00000',
    description: 'Developer of Sobha Hartland and other residential and mixed-use projects in Dubai.',
    type: STATUS.GENERAL,
    status: 'OVERDUE',
    createdAt: '2026-02-05T00:00:00.000Z',
    updatedAt: '2026-02-05T00:00:00.000Z',
    totalAmount: 380000.00,
  },
];

const ITEMS_PER_PAGE = 10;

type CustomerViewId = 'all' | 'active' | 'crm' | 'duplicate' | 'inactive' | 'portal';

const DEFAULT_CUSTOMER_VIEWS: CustomerViewId[] = [
  'all',
  'active',
  'crm',
  'duplicate',
  'inactive',
  'portal',
];

const customerViewLabelKey = (id: CustomerViewId): string => {
  const keys: Record<CustomerViewId, string> = {
    all: 'CompanyClientsList.allCustomers',
    active: 'CompanyClientsList.viewActiveCustomers',
    crm: 'CompanyClientsList.viewCrmCustomers',
    duplicate: 'CompanyClientsList.viewDuplicateCustomers',
    inactive: 'CompanyClientsList.viewInactiveCustomers',
    portal: 'CompanyClientsList.viewCustomerPortalEnabled',
  };
  return keys[id];
};

const getInitials = (name: string): string => {
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
};

const getAvatarColor = (name: string): string => {
  const colors = ['bg-primary', 'bg-success', 'bg-info', 'bg-warning', 'bg-danger', 'bg-secondary', 'bg-dark', 'bg-light text-dark'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

const formatAedAmount = (amount: number) =>
  `AED${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
void formatAedAmount;

const CompanyClientsList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchTerm] = useState('');
  const [clients] = useState<Client[]>(INITIAL_CLIENTS);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [activeDetailTab, setActiveDetailTab] = useState<'overview' | 'comments' | 'transactions' | 'mails' | 'statement'>('overview');
  /** Full-width table list first; split sidebar + detail after a client is opened. */
  const [listScreen, setListScreen] = useState<'browse' | 'detail'>('browse');
  const [customerViewPickerOpen, setCustomerViewPickerOpen] = useState(false);
  const [selectedCustomerView, setSelectedCustomerView] = useState<CustomerViewId>('active');
  const [favoritedCustomerViews, setFavoritedCustomerViews] = useState<Set<CustomerViewId>>(
    () => new Set<CustomerViewId>(['active'])
  );
  const [viewPickerFavoritesOpen, setViewPickerFavoritesOpen] = useState(true);
  const [viewPickerDefaultFiltersOpen, setViewPickerDefaultFiltersOpen] = useState(true);
  const [viewPickerSearch, setViewPickerSearch] = useState('');
  const handleSelectClient = (client: Client) => {
    const fresh = clients.find((c) => c.id === client.id) ?? client;
    setSelectedClient(fresh);
  };

  const clientsMatchingView = useMemo(() => {
    switch (selectedCustomerView) {
      case 'all':
      case 'portal':
        return clients;
      case 'active':
        return clients.filter((c) => c.status !== 'OVERDUE');
      case 'inactive':
        return clients.filter((c) => c.status === 'OVERDUE' || c.status === 'PENDING');
      case 'crm':
        return clients.filter((c) => c.type === STATUS.GENERAL);
      case 'duplicate': {
        const dups = clients.filter((c, _i, arr) => arr.filter((x) => x.name === c.name).length > 1);
        return dups.length > 0 ? dups : clients;
      }
      default:
        return clients;
    }
  }, [clients, selectedCustomerView]);

  const filteredClients = useMemo(() => {
    if (!searchTerm.trim()) return clientsMatchingView;
    const term = searchTerm.toLowerCase();
    return clientsMatchingView.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term) ||
        (c.phone && c.phone.includes(term))
    );
  }, [clientsMatchingView, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredClients.length / ITEMS_PER_PAGE));
  const paginatedClients = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredClients.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredClients, currentPage]);

  /** Keep detail panel bound to latest row data from `clients` after list updates. */
  const displayClient = useMemo(() => {
    if (!selectedClient) return null;
    return clients.find((c) => c.id === selectedClient.id) ?? selectedClient;
  }, [clients, selectedClient]);

  useEffect(() => {
    if (filteredClients.length === 0) {
      setSelectedClient(null);
      return;
    }
    if (selectedClient && !filteredClients.some((c) => c.id === selectedClient.id)) {
      setSelectedClient(null);
    }
  }, [filteredClients, selectedClient]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCustomerView]);

  useEffect(() => {
    setActiveDetailTab('overview');
  }, [selectedClient?.id]);

  const pickerSearchMatches = (id: CustomerViewId) => {
    const q = viewPickerSearch.trim().toLowerCase();
    if (!q) return true;
    return t(customerViewLabelKey(id)).toLowerCase().includes(q);
  };

  const favoriteViewsInOrder = DEFAULT_CUSTOMER_VIEWS.filter(
    (id) => favoritedCustomerViews.has(id) && pickerSearchMatches(id)
  );

  const defaultFilterViewsVisible = DEFAULT_CUSTOMER_VIEWS.filter((id) => pickerSearchMatches(id));

  const toggleFavoriteCustomerView = (id: CustomerViewId, e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFavoritedCustomerViews((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectCustomerView = (id: CustomerViewId) => {
    setSelectedCustomerView(id);
    setCustomerViewPickerOpen(false);
    setViewPickerSearch('');
  };

  const handleNewCustomViewClick = () => {
    setCustomerViewPickerOpen(false);
    showInfoToast(t('CompanyClientsList.newCustomViewComingSoon'));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge color="success">{t('Common.statusCompleted')}</Badge>;
      case 'OVERDUE':
        return <Badge color="danger">{t('Common.statusOverdue')}</Badge>;
      case 'PENDING':
        return <Badge color="warning">{t('Common.StatusPending')}</Badge>;
      case 'New':
      case 'NEW':
        return <Badge color="info">{t('Common.statusNew')}</Badge>;
      default:
        return <Badge color="secondary">{status}</Badge>;
    }
  };

  return (
    <>
      <Breadcrumbs
        title={t('CompanyClientsList.pageTitle')}
        breadcrumbItem={t('CompanyClientsList.newClients')}
        link="/company/clients"
        breadcrumbParent={t('CompanyClientsList.clients')}
      />
      <div className="company-clients-sidebar--joor company-clients-sidebar--fullpage mb-3">
        {listScreen === 'browse' ? (
          <div className="card">
            <div className="card-body p-0">

              <div className="clients-table-toolbar">
                <Dropdown
                  isOpen={customerViewPickerOpen}
                  toggle={() => setCustomerViewPickerOpen((o) => !o)}
                  className="clients-view-picker"
                >
                  <DropdownToggle
                    tag="button"
                    type="button"
                    caret={false}
                    className="clients-view-picker__trigger"
                  >
                    <span className="clients-view-picker__trigger-label">{t(customerViewLabelKey(selectedCustomerView))}</span>
                    <i
                      className={`bx ms-2 clients-view-picker__trigger-chevron ${customerViewPickerOpen ? 'bx-chevron-up' : 'bx-chevron-down'}`}
                      aria-hidden
                    />
                  </DropdownToggle>
                  <DropdownMenu className="clients-view-picker__menu" flip>
                    <div className="clients-view-picker__search-wrap">
                      <InputGroup size="sm" className="clients-view-picker__search">
                        <InputGroupText className="clients-view-picker__search-icon">
                          <i className="bx bx-search" aria-hidden />
                        </InputGroupText>
                        <Input
                          type="search"
                          value={viewPickerSearch}
                          onChange={(e) => setViewPickerSearch(e.target.value)}
                          placeholder={t('CompanyClientsList.viewPickerSearchPlaceholder')}
                          onClick={(e) => e.stopPropagation()}
                          aria-label={t('CompanyClientsList.viewPickerSearchPlaceholder')}
                        />
                      </InputGroup>
                    </div>

                    {favoriteViewsInOrder.length > 0 && (
                      <div className="clients-view-picker__section">
                        <button
                          type="button"
                          className="clients-view-picker__section-head"
                          onClick={() => setViewPickerFavoritesOpen((o) => !o)}
                        >
                          <i
                            className={`bx me-2 ${viewPickerFavoritesOpen ? 'bx-chevron-down' : 'bx-chevron-right'}`}
                            aria-hidden
                          />
                          <span className="clients-view-picker__section-title">{t('CompanyClientsList.favoritesSection')}</span>
                          <Badge pill color="primary" className="clients-view-picker__section-count ms-auto">
                            {favoritedCustomerViews.size}
                          </Badge>
                        </button>
                        {viewPickerFavoritesOpen && (
                          <div className="clients-view-picker__section-body">
                            {favoriteViewsInOrder.map((id) => (
                              <div key={`fav-${id}`} className="clients-view-picker__row">
                                <button
                                  type="button"
                                  className="clients-view-picker__row-main"
                                  onClick={() => selectCustomerView(id)}
                                >
                                  {t(customerViewLabelKey(id))}
                                </button>
                                <button
                                  type="button"
                                  className="clients-view-picker__star-btn clients-view-picker__star-btn--on"
                                  aria-pressed="true"
                                  aria-label={t('CompanyClientsList.toggleFavoriteForView', {
                                    name: t(customerViewLabelKey(id)),
                                  })}
                                  onClick={(e) => toggleFavoriteCustomerView(id, e)}
                                >
                                  <i className="bx bxs-star" aria-hidden />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="clients-view-picker__section">
                      <button
                        type="button"
                        className="clients-view-picker__section-head clients-view-picker__section-head--filters"
                        onClick={() => setViewPickerDefaultFiltersOpen((o) => !o)}
                      >
                        <i
                          className={`bx me-2 ${viewPickerDefaultFiltersOpen ? 'bx-chevron-down' : 'bx-chevron-right'}`}
                          aria-hidden
                        />
                        <span className="clients-view-picker__section-title">{t('CompanyClientsList.defaultFiltersSection')}</span>
                        <Badge pill color="primary" className="clients-view-picker__section-count ms-auto">
                          {DEFAULT_CUSTOMER_VIEWS.length}
                        </Badge>
                      </button>
                      {viewPickerDefaultFiltersOpen && (
                        <div className="clients-view-picker__section-body">
                          {defaultFilterViewsVisible.map((id) => {
                            const isSelected = selectedCustomerView === id;
                            const isFav = favoritedCustomerViews.has(id);
                            return (
                              <div key={id} className="clients-view-picker__row">
                                <button
                                  type="button"
                                  className={`clients-view-picker__row-main ${isSelected ? 'is-active' : ''}`}
                                  onClick={() => selectCustomerView(id)}
                                >
                                  {t(customerViewLabelKey(id))}
                                </button>
                                <button
                                  type="button"
                                  className={`clients-view-picker__star-btn ${isFav ? 'clients-view-picker__star-btn--on' : ''}`}
                                  aria-pressed={isFav}
                                  aria-label={t('CompanyClientsList.toggleFavoriteForView', {
                                    name: t(customerViewLabelKey(id)),
                                  })}
                                  onClick={(e) => toggleFavoriteCustomerView(id, e)}
                                >
                                  <i className={`bx ${isFav ? 'bxs-star' : 'bx-star'}`} aria-hidden />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div className="clients-view-picker__footer">
                      <button type="button" className="clients-view-picker__new-view" onClick={handleNewCustomViewClick}>
                        <span className="clients-view-picker__new-view-icon" aria-hidden>
                          <i className="bx bx-plus" />
                        </span>
                        {t('CompanyClientsList.newCustomView')}
                      </button>
                    </div>
                  </DropdownMenu>
                </Dropdown>
                <div className="clients-toolbar-actions">
                <Button color="primary" className="btn-rounded waves-effect d-inline-flex align-items-center waves-light btn btn-primary" onClick={() => navigate('/company/clients/create')}>
                    <i className="bx bx-plus me-1" />
                    {t('CompanyClientsList.newBtn')}
                  </Button>
                </div>
              </div>
              {paginatedClients.length > 0 ? (
                <Table responsive className="clients-data-table mb-0">
                  <thead>
                    <tr>
                      <th className="clients-th-filter-check">
                        <span className="visually-hidden">{t('CompanyClientsList.selectAllOnPage')}</span>
                        <Input type="checkbox" className="clients-table-checkbox" disabled aria-hidden />
                      </th>
                      <th className="clients-th-name">
                          {t('CompanyClientsList.companyName')}
                      </th>
                      <th>{t('Common.email')}</th>
                      <th>{t('CompanyClientsList.workPhone')}</th>
                      <th>{t('Common.status')}</th>
                      <th className="text-end">{t('CompanyClientsList.receivablesBcy')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedClients.map((client) => {
                      const isSelected = selectedClient?.id === client.id;
                      return (
                        <tr
                          key={client.id}
                          role="button"
                          tabIndex={0}
                          className={`clients-table-row ${isSelected ? 'clients-table-row--selected' : ''}`}
                          onClick={() => {
                            handleSelectClient(client);
                            setListScreen('detail');
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleSelectClient(client);
                              setListScreen('detail');
                            }
                          }}
                        >
                          <td onClick={(e) => e.stopPropagation()}>
                            <Input type="checkbox" className="clients-table-checkbox" disabled aria-hidden />
                          </td>
                          <td className="clients-td-company">
                            <div className="d-flex align-items-center gap-2 min-w-0">
                              <div className="avatar-xs flex-shrink-0">
                                <span className={`avatar-title rounded-circle ${getAvatarColor(client.name)}`}>
                                  {getInitials(client.name)}
                                </span>
                              </div>
                              <span className="clients-name-link text-truncate" title={client.name}>
                                {client.name}
                              </span>
                            </div>
                          </td>
                          <td className="clients-td-email text-truncate" title={client.email}>
                            {client.email}
                          </td>
                          <td>{client.phone}</td>
                          <td>{getStatusBadge(client.status)}</td>
                          <td className="text-end text-nowrap">
                            ₹ {client.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              ) : (
                <div className="clients-table-empty flex-grow-1">
                  <p className="text-muted mb-0">{t('NewClients.noClientsFound')}</p>
                </div>
              )}
              <div className="p-3 bg-white">
                <Pagination
                  className="mt-2"
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredClients.length}
                  itemsPerPage={ITEMS_PER_PAGE}
                  onPageChange={setCurrentPage}
                />
              </div>
            </div>
          </div>
        ) : (
          <>

            <Row>
              <Col lg="4" md="5" className="mb-3">
                <Card className="h-100 venu">
                  <CardBody className="p-0">
                    <div className="p-3 border-bottom">
                      <div className="clients-table-toolbar_small">
                        <Dropdown
                          isOpen={customerViewPickerOpen}
                          toggle={() => setCustomerViewPickerOpen((o) => !o)}
                          className="clients-view-picker"
                        >
                          <DropdownToggle
                            tag="button"
                            type="button"
                            caret={false}
                            className="clients-view-picker__trigger"
                          >
                            <span className="clients-view-picker__trigger-label">{t(customerViewLabelKey(selectedCustomerView))}</span>
                            <i
                              className={`bx ms-2 fs-18 clients-view-picker__trigger-chevron ${customerViewPickerOpen ? 'bx-chevron-up' : 'bx-chevron-down'}`}
                              aria-hidden
                            />
                          </DropdownToggle>
                          <DropdownMenu className="clients-view-picker__menu" flip>
                            <div className="clients-view-picker__search-wrap">
                              <InputGroup size="sm" className="clients-view-picker__search">
                                <InputGroupText className="clients-view-picker__search-icon">
                                  <i className="bx bx-search" aria-hidden />
                                </InputGroupText>
                                <Input
                                  type="search"
                                  value={viewPickerSearch}
                                  onChange={(e) => setViewPickerSearch(e.target.value)}
                                  placeholder={t('CompanyClientsList.viewPickerSearchPlaceholder')}
                                  onClick={(e) => e.stopPropagation()}
                                  aria-label={t('CompanyClientsList.viewPickerSearchPlaceholder')}
                                />
                              </InputGroup>
                            </div>

                            {favoriteViewsInOrder.length > 0 && (
                              <div className="clients-view-picker__section">
                                <button
                                  type="button"
                                  className="clients-view-picker__section-head"
                                  onClick={() => setViewPickerFavoritesOpen((o) => !o)}
                                >
                                  <i
                                    className={`bx me-2 ${viewPickerFavoritesOpen ? 'bx-chevron-down' : 'bx-chevron-right'}`}
                                    aria-hidden
                                  />
                                  <span className="clients-view-picker__section-title">{t('CompanyClientsList.favoritesSection')}</span>
                                  <Badge pill color="primary" className="clients-view-picker__section-count ms-auto">
                                    {favoritedCustomerViews.size}
                                  </Badge>
                                </button>
                                {viewPickerFavoritesOpen && (
                                  <div className="clients-view-picker__section-body">
                                    {favoriteViewsInOrder.map((id) => (
                                      <div key={`fav-${id}`} className="clients-view-picker__row">
                                        <button
                                          type="button"
                                          className="clients-view-picker__row-main"
                                          onClick={() => selectCustomerView(id)}
                                        >
                                          {t(customerViewLabelKey(id))}
                                        </button>
                                        <button
                                          type="button"
                                          className="clients-view-picker__star-btn clients-view-picker__star-btn--on"
                                          aria-pressed="true"
                                          aria-label={t('CompanyClientsList.toggleFavoriteForView', {
                                            name: t(customerViewLabelKey(id)),
                                          })}
                                          onClick={(e) => toggleFavoriteCustomerView(id, e)}
                                        >
                                          <i className="bx bxs-star" aria-hidden />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}

                            <div className="clients-view-picker__section">
                              <button
                                type="button"
                                className="clients-view-picker__section-head clients-view-picker__section-head--filters"
                                onClick={() => setViewPickerDefaultFiltersOpen((o) => !o)}
                              >
                                <i
                                  className={`bx me-2 ${viewPickerDefaultFiltersOpen ? 'bx-chevron-down' : 'bx-chevron-right'}`}
                                  aria-hidden
                                />
                                <span className="clients-view-picker__section-title">{t('CompanyClientsList.defaultFiltersSection')}</span>
                                <Badge pill color="primary" className="clients-view-picker__section-count ms-auto">
                                  {DEFAULT_CUSTOMER_VIEWS.length}
                                </Badge>
                              </button>
                              {viewPickerDefaultFiltersOpen && (
                                <div className="clients-view-picker__section-body">
                                  {defaultFilterViewsVisible.map((id) => {
                                    const isSelected = selectedCustomerView === id;
                                    const isFav = favoritedCustomerViews.has(id);
                                    return (
                                      <div key={id} className="clients-view-picker__row">
                                        <button
                                          type="button"
                                          className={`clients-view-picker__row-main ${isSelected ? 'is-active' : ''}`}
                                          onClick={() => selectCustomerView(id)}
                                        >
                                          {t(customerViewLabelKey(id))}
                                        </button>
                                        <button
                                          type="button"
                                          className={`clients-view-picker__star-btn ${isFav ? 'clients-view-picker__star-btn--on' : ''}`}
                                          aria-pressed={isFav}
                                          aria-label={t('CompanyClientsList.toggleFavoriteForView', {
                                            name: t(customerViewLabelKey(id)),
                                          })}
                                          onClick={(e) => toggleFavoriteCustomerView(id, e)}
                                        >
                                          <i className={`bx ${isFav ? 'bxs-star' : 'bx-star'}`} aria-hidden />
                                        </button>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>

                            <div className="clients-view-picker__footer">
                              <button type="button" className="clients-view-picker__new-view" onClick={handleNewCustomViewClick}>
                                <span className="clients-view-picker__new-view-icon" aria-hidden>
                                  <i className="bx bx-plus" />
                                </span>
                                {t('CompanyClientsList.newCustomView')}
                              </button>
                            </div>
                          </DropdownMenu>
                        </Dropdown>
                        <div className="clients-toolbar-actions">
                          <Button color="primary" className="btn waves-effect d-inline-flex align-items-center waves-light btn-sm btn-primary" 
                          onClick={() => navigate('/company/clients/create')}>
                            <i className="bx bx-plus fs-18" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    {paginatedClients.length > 0 ? (
                      <div className="list-group list-group-flush">
                        {paginatedClients.map((client) => {
                          const createdDate = new Date(client.createdAt);
                          const isActive = selectedClient?.id === client.id;

                          return (
                            <button
                              key={client.id}
                              type="button"
                              className={`list-group-item list-group-item-action d-flex align-items-center gap-3 ${isActive ? 'active' : ''
                                }`}
                              onClick={() => handleSelectClient(client)}
                            >
                              <div className="avatar-xs flex-shrink-0">
                                <span
                                  className={`avatar-title rounded-circle ${getAvatarColor(client.name)} ${isActive ? 'border border-2 border-white' : ''
                                    }`}
                                >
                                  {getInitials(client.name)}
                                </span>
                              </div>
                              <div className="flex-grow-1 text-start">
                                <div className="d-flex justify-content-between align-items-center">
                                  <div>
                                    <h6 className="mb-0 text-truncate">{client.name}</h6>
                                    <small className="text-muted d-block text-truncate">{client.email}</small>
                                  </div>
                                  <small className="text-muted ms-2">
                                    {createdDate.toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                    })}
                                  </small>
                                </div>
                                <div className="d-flex justify-content-between align-items-center mt-1">
                                  <small className="text-muted">₹ {client.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</small>
                                  <div>{getStatusBadge(client.status)}</div>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-muted mb-0">{t('NewClients.noClientsFound')}</p>
                      </div>
                    )}
                  </CardBody>
                </Card>
              </Col>

              <Col lg="8" md="7" className="mb-3 ps-0">
                <div className="company-clients-detail">
                  {displayClient ? (
                    <Card className="h-100 border-0 shadow-none rounded-0 d-flex flex-column detail-view-card m-0">
                      <div className="detail-header-bar detail-header-bar--compact p-3">
                        <h1 className="detail-header-title" title={displayClient.name}>
                          {displayClient.name}
                        </h1>
                        <div className="detail-header-actions">
                          <Button
                            color="secondary"
                            size="sm"
                            outline
                            className="detail-header-control detail-header-control--ghost"
                            onClick={() => navigate('/company/clients/create')}
                            type="button"
                          >
                            {t('Common.edit')}
                          </Button>
                          <Button
                            color="primary"
                            size="sm"
                            className="detail-header-control detail-header-control--primary"
                            type="button"
                            onClick={() => showInfoToast(t('CompanyClientsList.newCustomViewComingSoon'))}
                          >
                            {t('CompanyClientsList.newTransaction')}
                          </Button>
                          <button
                            type="button"
                            className="detail-header-close"
                            onClick={() => setListScreen('browse')}
                            aria-label={t('Common.close')}
                          >
                            <i className="bx bx-x" aria-hidden />
                          </button>
                        </div>
                      </div>

                      <Nav tabs className="detail-tabs">
                        <NavItem>
                          <NavLink
                            tag="button"
                            type="button"
                            className={activeDetailTab === 'overview' ? 'active' : ''}
                              onClick={() => setActiveDetailTab('overview')}
                          >
                            {t('CompanyClientsList.overview')}
                          </NavLink>
                        </NavItem>
                        
                        <NavItem>
                          <NavLink
                            tag="button"
                            type="button"
                            className={activeDetailTab === 'transactions' ? 'active' : ''}
                            onClick={() => {
                              setActiveDetailTab('transactions');
                            }}
                          >
                            {t('CompanyClientsList.transactions')}
                          </NavLink>
                        </NavItem>
                        <NavItem>
                          <NavLink
                            tag="button"
                            type="button"
                            className={activeDetailTab === 'mails' ? 'active' : ''}
                            onClick={() => setActiveDetailTab('mails')}
                          >
                            {t('CompanyClientsList.mails')}
                          </NavLink>
                        </NavItem>
                        <NavItem>
                          <NavLink
                            tag="button"
                            type="button"
                            className={activeDetailTab === 'statement' ? 'active' : ''}
                            onClick={() => setActiveDetailTab('statement')}
                          >
                            {t('CompanyClientsList.statement')}
                          </NavLink>
                        </NavItem>
                      </Nav>

                      <CardBody className="detail-card-body flex-grow-1 overflow-auto p-0">
                        {activeDetailTab === 'overview' && (
                          displayClient ? (
                            <CompanyClientOverview displayClient={displayClient} />
                          ) : (
                            <div className="detail-tab-placeholder">
                              <div className="p-3">
                                <p className="text-muted mb-0">{t('CompanyClientsList.noCustomersSelected')}</p>
                              </div>
                            </div>
                          )
                        )}

                        {activeDetailTab === 'transactions' && (
                          displayClient ? (
                            <CompanyClientTransactions displayClient={displayClient} />
                          ) : (
                            <div className="detail-tab-placeholder">
                              <div className="p-3">
                                <p className="text-muted mb-0">{t('CompanyClientsList.noCustomersSelected')}</p>
                              </div>
                            </div>
                          )
                         
                        )}

                        {activeDetailTab === 'mails' && (
                          <div className="detail-tab-placeholder">
                            <p className="text-muted mb-0">{t('CompanyClientsList.mails')}</p>
                          </div>
                        )}

                        {activeDetailTab === 'statement' && (
                          <div className="detail-tab-placeholder">
                            <p className="text-muted mb-0">{t('CompanyClientsList.statement')}</p>
                          </div>
                        )}
                      </CardBody>
                    </Card>
                  ) : (
                    <div className="detail-placeholder">
                      <h5 className="mb-2">{t('CompanyClientsList.selectClientTitle')}</h5>
                      <p className="text-muted mb-0">{t('CompanyClientsList.selectClientDescription')}</p>
                    </div>
                  )}
                </div>
              </Col>
            </Row>

          </>
        )}
      </div>
     
    </>
  );
};

export default CompanyClientsList;
