import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Badge,
  Button,
  Card,
  CardBody,
  Col,
  FormFeedback,
  Input,
  InputGroup,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
  Table,
} from 'reactstrap';
import Breadcrumbs from '../../../common/Breadcrumbs/Breadcrumbs';
import { STATUS } from '../../../../core/constants/constantValues';
import { validateRequired } from '../../../../core/utils/Utils';
import { showSuccessToast } from '../../../../core/utils/toast';

interface JobTitle {
  id: string;
  name: string;
  description?: string;
  status: string;
}

const INITIAL_JOB_TITLES: JobTitle[] = [
  { id: 'JT-001', name: 'Project Manager', description: 'Manages end-to-end project execution', status: STATUS.ACTIVE },
  { id: 'JT-002', name: 'Site Engineer', description: 'Oversees site execution and quality', status: STATUS.ACTIVE },
  { id: 'JT-003', name: 'Quantity Surveyor', description: 'Handles quantity takeoff and billing', status: STATUS.ACTIVE },
  { id: 'JT-004', name: 'Store Keeper', description: 'Manages materials inventory', status: STATUS.INACTIVE },
];

const CompanyJobTitles = () => {
  const { t } = useTranslation();

  const [jobTitles, setJobTitles] = useState<JobTitle[]>(INITIAL_JOB_TITLES);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  type NewJobTitleForm = {
    name: string;
    description: string;
    status: string;
  };
  type NewJobTitleFormField = keyof NewJobTitleForm;

  const [newJobTitle, setNewJobTitle] = useState<NewJobTitleForm>({
    name: '',
    description: '',
    status: STATUS.ACTIVE,
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<NewJobTitleFormField, string>>>({});

  const filteredJobTitles = useMemo(() => {
    if (!searchTerm.trim()) return jobTitles;
    const term = searchTerm.toLowerCase();
    return jobTitles.filter(
      (jt) =>
        jt.name.toLowerCase().includes(term) ||
        (jt.description && jt.description.toLowerCase().includes(term)),
    );
  }, [jobTitles, searchTerm]);

  const handleToggleStatus = (jobTitle: JobTitle) => {
    setJobTitles((prev) =>
      prev.map((item) =>
        item.id === jobTitle.id
          ? { ...item, status: item.status === STATUS.ACTIVE ? STATUS.INACTIVE : STATUS.ACTIVE }
          : item,
      ),
    );
  };

  const handleOpenCreateModal = () => {
    setNewJobTitle({ name: '', description: '', status: STATUS.ACTIVE });
    setFormErrors({});
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleNewJobTitleChange = (field: NewJobTitleFormField, value: string) => {
    setNewJobTitle((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field] !== undefined) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleCreateJobTitle = () => {
    const nameValidation = validateRequired(newJobTitle.name, 'name');
    const errors: { name?: string } = {};
    if (!nameValidation.isValid) {
      errors.name = nameValidation.errorMessage ?? '';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const created: JobTitle = {
      id: `JT-${String(Date.now()).slice(-6)}`,
      name: newJobTitle.name.trim(),
      description: newJobTitle.description.trim() || undefined,
      status: newJobTitle.status,
    };

    setJobTitles((prev) => [created, ...prev]);
    showSuccessToast(t('CompanyJobTitles.createdSuccessfully'));
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
        title={t('CompanyJobTitles.pageTitle')}
        breadcrumbItem={t('CompanyJobTitles.breadcrumbItem')}
        breadcrumbParent={t('CompanyJobTitles.breadcrumbParent')}
        link="/company/employees/job-titles"
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
                  {t('CompanyJobTitles.addJobTitle')}
                </Button>
              </div>

              <div className="table-responsive">
                <Table className="table-nowrap mb-0 align-middle">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: '100px' }}>{t('CompanyJobTitles.table.id')}</th>
                      <th>{t('CompanyJobTitles.table.name')}</th>
                      <th>{t('CompanyJobTitles.table.description')}</th>
                      <th style={{ width: '140px' }}>{t('CompanyJobTitles.table.status')}</th>
                      <th style={{ width: '150px' }}>{t('CompanyJobTitles.table.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredJobTitles.length > 0 ? (
                      filteredJobTitles.map((jt) => (
                        <tr key={jt.id}>
                          <td>{jt.id}</td>
                          <td>{jt.name}</td>
                          <td className="text-truncate" style={{ maxWidth: 320 }}>
                            {jt.description || '—'}
                          </td>
                          <td>{getStatusBadge(jt.status)}</td>
                          <td>
                            <div className="d-flex align-items-center gap-1">
                              <input
                                type="checkbox"
                                className="switch switch-success"
                                id={`job-title-status-${jt.id}`}
                                checked={jt.status === STATUS.ACTIVE}
                                onChange={() => handleToggleStatus(jt)}
                              />
                              <label htmlFor={`job-title-status-${jt.id}`} />
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
                          <p className="text-muted mb-0">{t('CompanyJobTitles.noJobTitlesFound')}</p>
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
        <ModalHeader toggle={handleCloseCreateModal}>{t('CompanyJobTitles.addJobTitle')}</ModalHeader>
        <ModalBody>
          <Row>
            <Col md="12" className="mb-3">
              <Label className="form-label fw-semibold">
                {t('CompanyJobTitles.fields.name')} <span className="text-danger">*</span>
              </Label>
              <Input
                value={newJobTitle.name}
                onChange={(e) => handleNewJobTitleChange('name', e.target.value)}
                invalid={!!formErrors.name}
                placeholder={t('CompanyJobTitles.placeholders.name')}
              />
              {formErrors.name && <FormFeedback>{t(formErrors.name)}</FormFeedback>}
            </Col>
            <Col md="12" className="mb-3">
              <Label className="form-label fw-semibold">{t('CompanyJobTitles.fields.description')}</Label>
              <Input
                type="textarea"
                rows={3}
                value={newJobTitle.description}
                onChange={(e) => handleNewJobTitleChange('description', e.target.value)}
                placeholder={t('CompanyJobTitles.placeholders.description')}
              />
            </Col>
            <Col md="12">
              <Label className="form-label fw-semibold">{t('CompanyJobTitles.fields.status')}</Label>
              <Input
                type="select"
                value={newJobTitle.status}
                onChange={(e) => handleNewJobTitleChange('status', e.target.value)}
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
          <Button color="primary" onClick={handleCreateJobTitle}>
            {t('Common.create')}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default CompanyJobTitles;

