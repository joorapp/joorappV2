import { Button } from 'reactstrap';
import { useTranslation } from 'react-i18next';

interface TaskRowActionsProps {
  taskId: number;
  onEdit: (taskId: number) => void;
  onDelete: (taskId: number) => void;
}

export const TaskRowActions = ({ taskId, onEdit, onDelete }: TaskRowActionsProps) => {
  const { t } = useTranslation();

  return (
    <div className="company-task-row-actions">
      <Button
        color="outline-secondary"
        className="btn-sm border-0 company-task-row-actions__btn"
        title={t('Common.edit')}
        onClick={() => onEdit(taskId)}
      >
        <i className="mdi mdi-pencil" aria-hidden />
      </Button>
      <Button
        color="outline-danger"
        className="btn-sm border-0 company-task-row-actions__btn"
        title={t('Common.delete')}
        onClick={() => onDelete(taskId)}
      >
        <i className="mdi mdi-delete" aria-hidden />
      </Button>
    </div>
  );
};
