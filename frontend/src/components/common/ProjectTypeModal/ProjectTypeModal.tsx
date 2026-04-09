import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Col,
  FormFeedback,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
} from 'reactstrap';
import { STATUS } from '../../../core/constants/constantValues';
import { validateRequired } from '../../../core/utils/Utils';

export interface ProjectTypeFormData {
  name: string;
  description: string;
  status: string;
}

interface ProjectTypeModalProps {
  isOpen: boolean;
  toggle: () => void;
  onSubmit: (data: ProjectTypeFormData) => Promise<void> | void;
  title?: string;
  submitLabel?: string;
  initialData?: Partial<ProjectTypeFormData>;
}

const initialFormData: ProjectTypeFormData = {
  name: '',
  description: '',
  status: STATUS.ACTIVE,
};

const ProjectTypeModal = ({
  isOpen,
  toggle,
  onSubmit,
  title,
  submitLabel,
  initialData,
}: ProjectTypeModalProps) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<ProjectTypeFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof ProjectTypeFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: initialData?.name ?? initialFormData.name,
        description: initialData?.description ?? initialFormData.description,
        status: initialData?.status ?? initialFormData.status,
      });
      setFormErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen, initialData]);

  const handleChange = (field: keyof ProjectTypeFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field] !== undefined) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = async () => {
    const nameValidation = validateRequired(formData.name, 'name');
    const errors: Partial<Record<keyof ProjectTypeFormData, string>> = {};

    if (!nameValidation.isValid) {
      errors.name = nameValidation.errorMessage ?? '';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        name: formData.name.trim(),
        description: formData.description.trim(),
        status: formData.status,
      });
      toggle();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered>
      <ModalHeader toggle={toggle}>{title || t('CompanyProjectTypes.addProjectType')}</ModalHeader>
      <ModalBody>
        <Row>
          <Col md="12" className="mb-3">
            <Label className="form-label fw-semibold">
              {t('CompanyProjectTypes.fields.name')} <span className="text-danger">*</span>
            </Label>
            <Input
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
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
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder={t('CompanyProjectTypes.placeholders.description')}
            />
          </Col>
          <Col md="12">
            <Label className="form-label fw-semibold">
              {t('CompanyProjectTypes.fields.status')}
            </Label>
            <Input
              type="select"
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
            >
              <option value={STATUS.ACTIVE}>{t('Common.StatusActive')}</option>
              <option value={STATUS.INACTIVE}>{t('Common.StatusInactive')}</option>
            </Input>
          </Col>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={toggle}>
          {t('Common.cancel')}
        </Button>
        <Button color="primary" onClick={handleSubmit} disabled={isSubmitting}>
          {submitLabel || t('Common.create')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ProjectTypeModal;
