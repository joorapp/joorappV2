import type { TFunction } from 'i18next';
import { statusGroupLabelKey, type TaskStatusGroup, type TaskType } from './companyTaskData';

interface TaskStatusCellProps {
  status: TaskStatusGroup;
  type: TaskType;
  t: TFunction;
}

export const TaskStatusCell = ({ status, type: _type, t }: TaskStatusCellProps) => {
  const label = t(statusGroupLabelKey(status));
  return <span className="company-task-status-badge">{label}</span>;
};
