/**
 * @author Ananthapadmanabhan V K
 * ConfirmModal component for the application
 * This is a reusable confirmation modal component that can be used across the application
 */

import { Modal, ModalBody, ModalFooter, Button } from 'reactstrap';
import { useTranslation } from 'react-i18next';

interface ConfirmModalProps {
  isOpen: boolean;
  toggle: () => void;
  title?: string;
  message: string;
  onConfirm: () => void | Promise<void>;
  confirmButtonText?: string;
  cancelButtonText?: string;
  confirmButtonColor?: string;
  isLoading?: boolean;
}

const ConfirmModal = ({
  isOpen,
  toggle,
  title,
  message,
  onConfirm,
  confirmButtonText,
  cancelButtonText,
  confirmButtonColor = 'danger',
  isLoading = false,
}: ConfirmModalProps) => {
  const { t } = useTranslation();

  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered>
      <ModalBody>
        <div className="text-center p-4">
          <div className="mb-3">
            <i className="mdi mdi-alert-circle-outline delete-confirm-icon"></i>
          </div>
          <h4 className="mb-3">{title || t('Common.confirmToDelete')}</h4>
          <p className="text-muted mb-0">{message}</p>
          <div className="d-flex gap-2 justify-content-center mt-3">
            <Button
              color={confirmButtonColor}
              onClick={handleConfirm}
              disabled={isLoading}
            >
              {isLoading ? t('Common.loading') : confirmButtonText || t('Common.delete')}
            </Button>
            <Button
              color="secondary"
              onClick={toggle}
              disabled={isLoading}
            >
              {cancelButtonText || t('Common.cancel')}
            </Button>
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
};

export default ConfirmModal;

