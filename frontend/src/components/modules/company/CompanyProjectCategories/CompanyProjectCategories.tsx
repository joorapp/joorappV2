import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Card,
  CardBody,
  Row,
  Col,
  Table,
  Button,
  Input,
  InputGroup,
  Badge,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Label,
  FormFeedback,
} from 'reactstrap';
import Breadcrumbs from '../../../common/Breadcrumbs/Breadcrumbs';
import { STATUS } from '../../../../core/constants/constantValues';
import { validateRequired } from '../../../../core/utils/Utils';
import { showSuccessToast } from '../../../../core/utils/toast';

interface ProjectCategory {
  id: string;
  name: string;
  description?: string;
  status: string;
}

const CompanyProjectCategories = () => {
  const { t } = useTranslation();

  const [projectCategories, setProjectCategories] = useState<ProjectCategory[]>([
    {
      id: 'PC-001',
      name: 'Residential Villa',
      description: 'Standalone residential villa projects',
      status: STATUS.ACTIVE,
    },
    {
      id: 'PC-002',
      name: 'Commercial Project',
      description: 'Commercial buildings and office projects',
      status: STATUS.ACTIVE,
    },
    {
      id: 'PC-003',
      name: 'Industrial Project',
      description: 'Industrial facilities and factory projects',
      status: STATUS.ACTIVE,
    },
    {
      id: 'PC-004',
      name: 'Apartment Bldg',
      description: 'Multi-unit apartment building projects',
      status: STATUS.ACTIVE,
    },
    {
      id: 'PC-005',
      name: 'Hotel Project',
      description: 'Hotel and hospitality projects',
      status: STATUS.ACTIVE,
    },
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  type NewCategoryForm = {
    name: string;
    description: string;
    status: string;
  };

  type NewCategoryFormField = keyof NewCategoryForm;

  const [newCategory, setNewCategory] = useState<NewCategoryForm>({
    name: '',
    description: '',
    status: STATUS.ACTIVE,
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<NewCategoryFormField, string>>>({});

  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return projectCategories;
    const term = searchTerm.toLowerCase();
    return projectCategories.filter(
      (category) =>
        category.name.toLowerCase().includes(term) ||
        (category.description && category.description.toLowerCase().includes(term))
    );
  }, [projectCategories, searchTerm]);

  const handleToggleStatus = (category: ProjectCategory) => {
    setProjectCategories((prev) =>
      prev.map((item) =>
        item.id === category.id
          ? {
              ...item,
              status: item.status === STATUS.ACTIVE ? STATUS.INACTIVE : STATUS.ACTIVE,
            }
          : item
      )
    );
  };

  const handleOpenCreateModal = () => {
    setNewCategory({
      name: '',
      description: '',
      status: STATUS.ACTIVE,
    });
    setFormErrors({});
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleNewCategoryChange = (field: NewCategoryFormField, value: string) => {
    setNewCategory((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field] !== undefined) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleCreateCategory = () => {
    const nameValidation = validateRequired(newCategory.name, 'name');
    const errors: { name?: string } = {};
    if (!nameValidation.isValid) {
      errors.name = nameValidation.errorMessage ?? '';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const newId = String(Date.now());
    const created: ProjectCategory = {
      id: newId,
      name: newCategory.name.trim(),
      description: newCategory.description.trim() || undefined,
      status: newCategory.status,
    };
    setProjectCategories((prev) => [created, ...prev]);
    showSuccessToast(t('CompanyProjectCategories.createdSuccessfully'));
    setIsCreateModalOpen(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case STATUS.ACTIVE:
        return <Badge color="success">{t('Common.StatusActive')}</Badge>;
      case STATUS.INACTIVE:
        return <Badge color="secondary">{t('Common.StatusInactive')}</Badge>;
      default:
        return <Badge color="light">{status}</Badge>;
    }
  };

  return (
    <>
      <Breadcrumbs
        title={t('CompanyProjectCategories.pageTitle')}
        breadcrumbItem={t('CompanyProjectCategories.breadcrumbItem')}
        breadcrumbParent={t('CompanyProjectCategories.breadcrumbParent')}
        link="/company/projects/categories"
      />

      <Row>
        <Col lg="12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <InputGroup className="search-input-group">
              <Input
                type="text"
                placeholder={t('Common.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
            <Button
              color="primary"
              className="btn-rounded waves-effect d-inline-flex align-items-center waves-light"
              onClick={handleOpenCreateModal}
            >
              <i className="bx bx-plus me-1" />
              {t('CompanyProjectCategories.addProjectCategory')}
            </Button>
          </div>

          <Card>
            <CardBody className="p-0">
              <div className="table-responsive">
                <Table className="table-nowrap mb-0 align-middle">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: '80px' }}>{t('CompanyProjectCategories.table.id')}</th>
                      <th>{t('CompanyProjectCategories.table.name')}</th>
                      <th>{t('CompanyProjectCategories.table.description')}</th>
                      <th style={{ width: '140px' }}>
                        {t('CompanyProjectCategories.table.status')}
                      </th>
                      <th style={{ width: '150px' }}>
                        {t('CompanyProjectCategories.table.actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCategories.length > 0 ? (
                      filteredCategories.map((category) => (
                        <tr key={category.id}>
                          <td>{category.id}</td>
                          <td>{category.name}</td>
                          <td className="text-truncate" style={{ maxWidth: 320 }}>
                            {category.description || '—'}
                          </td>
                          <td>{getStatusBadge(category.status)}</td>
                          <td>
                            <div className="d-flex align-items-center gap-1">
                              <input
                                type="checkbox"
                                className="switch switch-success"
                                id={`project-category-status-${category.id}`}
                                checked={category.status === STATUS.ACTIVE}
                                onChange={() => handleToggleStatus(category)}
                              />
                              <label htmlFor={`project-category-status-${category.id}`} />
                              <Button
                                color="outline-secondary"
                                className="btn-sm border-0"
                                title={t('Common.edit')}
                              >
                                <i className="mdi mdi-pencil"></i>
                              </Button>
                              <Button
                                color="outline-danger"
                                className="btn-sm border-0"
                                title={t('Common.delete')}
                              >
                                <i className="mdi mdi-delete"></i>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="text-center py-4">
                          <p className="text-muted mb-0">
                            {t('CompanyProjectCategories.noProjectCategoriesFound')}
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Modal isOpen={isCreateModalOpen} toggle={handleCloseCreateModal} centered>
        <ModalHeader toggle={handleCloseCreateModal}>
          {t('CompanyProjectCategories.addProjectCategory')}
        </ModalHeader>
        <ModalBody>
          <Row>
            <Col md="12" className="mb-3">
              <Label className="form-label fw-semibold">
                {t('CompanyProjectCategories.fields.name')}{' '}
                <span className="text-danger">*</span>
              </Label>
              <Input
                value={newCategory.name}
                onChange={(e) => handleNewCategoryChange('name', e.target.value)}
                invalid={!!formErrors.name}
                placeholder={t('CompanyProjectCategories.placeholders.name')}
              />
              {formErrors.name && <FormFeedback>{t(formErrors.name)}</FormFeedback>}
            </Col>
            <Col md="12" className="mb-3">
              <Label className="form-label fw-semibold">
                {t('CompanyProjectCategories.fields.description')}
              </Label>
              <Input
                type="textarea"
                rows={3}
                value={newCategory.description}
                onChange={(e) => handleNewCategoryChange('description', e.target.value)}
                placeholder={t('CompanyProjectCategories.placeholders.description')}
              />
            </Col>
            <Col md="12">
              <Label className="form-label fw-semibold">
                {t('CompanyProjectCategories.fields.status')}
              </Label>
              <Input
                type="select"
                value={newCategory.status}
                onChange={(e) => handleNewCategoryChange('status', e.target.value)}
              >
                <option value={STATUS.ACTIVE}>{t('Common.StatusActive')}</option>
                <option value={STATUS.INACTIVE}>{t('Common.StatusInactive')}</option>
              </Input>
            </Col>
          </Row>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={handleCloseCreateModal}>
            {t('Common.cancel')}
          </Button>
          <Button color="primary" onClick={handleCreateCategory}>
            {t('Common.create')}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default CompanyProjectCategories;

