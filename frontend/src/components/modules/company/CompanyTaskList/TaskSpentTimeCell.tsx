import { formatSpentTime } from './companyTaskData';

interface TaskSpentTimeCellProps {
  timeHours?: number;
  onClick?: () => void;
  interactive?: boolean;
}

export const TaskSpentTimeCell = ({ timeHours, onClick, interactive }: TaskSpentTimeCellProps) => {
  const className = `company-task-spent-time${interactive ? ' company-task-spent-time--interactive' : ''}`;

  const content = (
    <>
      <span className="company-task-spent-time__value">{formatSpentTime(timeHours)}</span>
      <i className="bx bx-time company-task-spent-time__icon" aria-hidden />
    </>
  );

  if (onClick) {
    return (
      <button type="button" className={className} onClick={onClick}>
        {content}
      </button>
    );
  }

  return <span className={className}>{content}</span>;
};
