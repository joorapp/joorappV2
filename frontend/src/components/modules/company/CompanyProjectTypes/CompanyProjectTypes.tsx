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

interface ProjectType {
  id: string;
  name: string;
  description?: string;
  status: string;
}

const CompanyProjectTypes = () => {
  const { t } = useTranslation();

  const [projectTypes, setProjectTypes] = useState<ProjectType[]>([
    {
      id: 'PT-001',
      name: 'Civil Construction',
      description: 'General civil construction projects',
      status: STATUS.ACTIVE,
    },
    {
      id: 'PT-002',
      name: 'Revive - Maintenance Project',
      description: 'Ongoing maintenance and refurbishment projects',
      status: STATUS.ACTIVE,
    },
    {
      id: 'PT-003',
      name: 'Re-modelling',
      description: 'Renovation and re-modelling projects',
      status: STATUS.ACTIVE,
    },
    {
      id: 'PT-004',
      name: 'Interior Design',
      description: 'Interior design and fit-out projects',
      status: STATUS.ACTIVE,
    },
    {
      id: 'PT-005',
      name: 'Pre-engineered Projects',
      description: 'Pre-engineered and prefabricated structure projects',
      status: STATUS.ACTIVE,
    },
    {
      id: 'PT-006',
      name: 'General Construction',
      description: 'General construction and building works',
      status: STATUS.ACTIVE,
    },
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  type NewTypeForm = {
    name: string;
    description: string;
    status: string;
  };

  type NewTypeFormField = keyof NewTypeForm;

  const [newType, setNewType] = useState<NewTypeForm>({
    name: '',
    description: '',
    status: STATUS.ACTIVE,
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<NewTypeFormField, string>>>({});

  const filteredTypes = useMemo(() => {
    if (!searchTerm.trim()) return projectTypes;
    const term = searchTerm.toLowerCase();
    return projectTypes.filter(
      (type) =>
        type.name.toLowerCase().includes(term) ||
        (type.description && type.description.toLowerCase().includes(term))
    );
  }, [projectTypes, searchTerm]);

  const handleToggleStatus = (type: ProjectType) => {
    setProjectTypes((prev) =>
      prev.map((item) =>
        item.id === type.id
          ? {
              ...item,
              status: item.status === STATUS.ACTIVE ? STATUS.INACTIVE : STATUS.ACTIVE,
            }
          : item
      )
    );
  };

  const handleOpenCreateModal = () => {
    setNewType({
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

  const handleNewTypeChange = (field: NewTypeFormField, value: string) => {
    setNewType((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field] !== undefined) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleCreateType = () => {
    const nameValidation = validateRequired(newType.name, 'name');
    const errors: { name?: string } = {};
    if (!nameValidation.isValid) {
      errors.name = nameValidation.errorMessage ?? '';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const newId = String(Date.now());
    const created: ProjectType = {
      id: newId,
      name: newType.name.trim(),
      description: newType.description.trim() || undefined,
      status: newType.status,
    };
    setProjectTypes((prev) => [created, ...prev]);
    showSuccessToast(t('CompanyProjectTypes.createdSuccessfully'));
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
        title={t('CompanyProjectTypes.pageTitle')}
        breadcrumbItem={t('CompanyProjectTypes.breadcrumbItem')}
        breadcrumbParent={t('CompanyProjectTypes.breadcrumbParent')}
        link="/company/projects/types"
      />

      <Row>
        <Col lg="12">
          

          <Card>
            <CardBody>
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
              {t('CompanyProjectTypes.addProjectType')}
            </Button>
          </div>

              <div className="table-responsive">
                <Table className="table-nowrap mb-0 align-middle">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: '80px' }}>{t('CompanyProjectTypes.table.id')}</th>
                      <th>{t('CompanyProjectTypes.table.name')}</th>
                      <th>{t('CompanyProjectTypes.table.description')}</th>
                      <th style={{ width: '140px' }}>{t('CompanyProjectTypes.table.status')}</th>
                      <th style={{ width: '150px' }}>{t('CompanyProjectTypes.table.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTypes.length > 0 ? (
                      filteredTypes.map((type) => (
                        <tr key={type.id}>
                          <td>{type.id}</td>
                          <td>{type.name}</td>
                          <td className="text-truncate" style={{ maxWidth: 320 }}>
                            {type.description || '—'}
                          </td>
                          <td>{getStatusBadge(type.status)}</td>
                          <td>
                            <div className="d-flex align-items-center gap-1">
                              <input
                                type="checkbox"
                                className="switch switch-success"
                                id={`project-type-status-${type.id}`}
                                checked={type.status === STATUS.ACTIVE}
                                onChange={() => handleToggleStatus(type)}
                              />
                              <label htmlFor={`project-type-status-${type.id}`} />
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
                            {t('CompanyProjectTypes.noProjectTypesFound')}
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
          {t('CompanyProjectTypes.addProjectType')}
        </ModalHeader>
        <ModalBody>
          <Row>
            <Col md="12" className="mb-3">
              <Label className="form-label fw-semibold">
                {t('CompanyProjectTypes.fields.name')} <span className="text-danger">*</span>
              </Label>
              <Input
                value={newType.name}
                onChange={(e) => handleNewTypeChange('name', e.target.value)}
                invalid={!!formErrors.name}
                placeholder={t('CompanyProjectTypes.placeholders.name')}
              />
              {formErrors.name && <FormFeedback>{t(formErrors.name)}</FormFeedback>}
            </Col>
            <Col md="12" className="mb-3">
              <Label className="form-label fw-semibold">
                {t('CompanyProjectTypes.fields.description')}
              </Label>
              <Input
                type="textarea"
                rows={3}
                value={newType.description}
                onChange={(e) => handleNewTypeChange('description', e.target.value)}
                placeholder={t('CompanyProjectTypes.placeholders.description')}
              />
            </Col>
            <Col md="12">
              <Label className="form-label fw-semibold">
                {t('CompanyProjectTypes.fields.status')}
              </Label>
              <Input
                type="select"
                value={newType.status}
                onChange={(e) => handleNewTypeChange('status', e.target.value)}
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
          <Button color="primary" onClick={handleCreateType}>
            {t('Common.create')}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default CompanyProjectTypes;

