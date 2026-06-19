import { Fragment, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import {
  Button,
  Card,
  CardBody,
  Col,
  Form,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
} from 'reactstrap';
import Breadcrumbs from '../../../common/Breadcrumbs/Breadcrumbs';
import ConfirmModal from '../../../common/ConfirmModal/ConfirmModal';
import {
  ASSIGNEE_OPTIONS,
  addTaskUnderParent,
  addTaskTime,
  collectExpandableSubTaskIds,
  deleteTask,
  findTaskById,
  formatTaskDate,
  getAvatarColor,
  getInitials,
  getTaskProgress,
  priorityClass,
  priorityLabelKey,
  taskTypeClass,
  taskTypeLabelKey,
  updateTask,
  type SubTaskItem,
  type TaskDetail,
  type TaskNavigationState,
  type TaskPriority,
  type TaskStatusGroup,
} from './companyTaskData';
import { TaskStatusCell } from './TaskStatusCell';
import { TaskSpentTimeCell } from './TaskSpentTimeCell';
import { TaskRowActions } from './TaskRowActions';
import './CompanyTaskDetail.scss';
import './CompanyTaskList.scss';

type CreateTaskForm = {
  subject: string;
  assignee: string;
  priority: TaskPriority;
  timeHours: string;
  description: string;
};

type EditTaskForm = CreateTaskForm & {
  progress: string;
};

const EMPTY_FORM: CreateTaskForm = {
  subject: '',
  assignee: ASSIGNEE_OPTIONS[0],
  priority: 'NORMAL',
  timeHours: '',
  description: '',
};

const buildEditForm = (taskDetail: TaskDetail): EditTaskForm => ({
  subject: taskDetail.subject,
  assignee: taskDetail.assignee,
  priority: taskDetail.priority,
  timeHours: taskDetail.timeHours != null && taskDetail.timeHours > 0 ? String(taskDetail.timeHours) : '',
  description: taskDetail.description,
  progress: String(taskDetail.progress),
});

const TaskPriorityCell = ({ priority, t }: { priority: TaskPriority; t: TFunction }) => (
  <span className={priorityClass(priority)}>{t(priorityLabelKey(priority))}</span>
);

const TaskProgressCell = ({ progress }: { progress: number }) => (
  <div className="company-task-progress">
    <div className="company-task-progress__bar progress progress-sm">
      <div
        className="progress-bar bg-primary"
        role="progressbar"
        style={{ width: `${progress}%` }}
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
    <span className="company-task-progress__label">{progress}%</span>
  </div>
);

interface DetailSubTaskRowsProps {
  subTasks: SubTaskItem[];
  parentStatus: TaskStatusGroup;
  depth: number;
  expandedTasks: Set<number>;
  onToggleExpand: (taskId: number) => void;
  onOpenTask: (taskId: number) => void;
  onEditTask: (taskId: number) => void;
  onDeleteTask: (taskId: number) => void;
  t: TFunction;
}

const DetailSubTaskRows = ({
  subTasks,
  parentStatus,
  depth,
  expandedTasks,
  onToggleExpand,
  onOpenTask,
  onEditTask,
  onDeleteTask,
  t,
}: DetailSubTaskRowsProps) => (
  <>
    {subTasks.map((subTask) => {
      const hasChildren = (subTask.subTasks?.length ?? 0) > 0;
      const isExpanded = hasChildren && expandedTasks.has(subTask.id);

      return (
        <Fragment key={subTask.id}>
          <tr className="company-task-list-table__subtask-row">
            <td>
              <div
                className="company-task-list-table__type-cell company-task-list-table__type-cell--subtask"
                style={{ ['--task-depth' as string]: depth }}
              >
                {hasChildren ? (
                  <button
                    type="button"
                    className="company-task-list-table__subtask-toggle"
                    onClick={() => onToggleExpand(subTask.id)}
                    aria-expanded={isExpanded}
                    aria-label={
                      isExpanded
                        ? t('CompanyTaskList.collapseSubTasks')
                        : t('CompanyTaskList.expandSubTasks')
                    }
                  >
                    <i className={`bx ${isExpanded ? 'bx-chevron-down' : 'bx-chevron-right'}`} aria-hidden />
                  </button>
                ) : (
                  <span className="company-task-list-table__subtask-toggle-spacer" aria-hidden />
                )}
                <span className={`company-task-type ${taskTypeClass('SUB_TASK')}`}>
                  {t(taskTypeLabelKey('SUB_TASK'))}
                </span>
              </div>
            </td>
            <td>
              <Button
                color="link"
                className="company-task-list-table__task-id p-0 border-0"
                onClick={() => onOpenTask(subTask.id)}
              >
                {subTask.id}
              </Button>
            </td>
            <td>
              <div
                className="company-task-list-table__subject-cell company-task-list-table__subject-cell--subtask"
                style={{ ['--task-depth' as string]: depth }}
              >
                <span>{subTask.subject}</span>
                {hasChildren && (
                  <span className="company-task-list-table__subtask-count">
                    {t('CompanyTaskList.subTaskCount', { count: subTask.subTasks?.length ?? 0 })}
                  </span>
                )}
              </div>
            </td>
            <td><TaskStatusCell status={parentStatus} type="SUB_TASK" t={t} /></td>
            <td>
              <span className="company-task-assignee">
                <span
                  className="company-task-assignee__avatar"
                  style={{ backgroundColor: getAvatarColor(subTask.assignee) }}
                >
                  {getInitials(subTask.assignee)}
                </span>
                <span className="company-task-assignee__name">{subTask.assignee}</span>
              </span>
            </td>
            <td><TaskPriorityCell priority={subTask.priority} t={t} /></td>
            <td className="company-task-list-table__col-time">
              <TaskSpentTimeCell timeHours={subTask.timeHours} />
            </td>
            <td className="company-task-list-table__col-progress">
              <TaskProgressCell
                progress={subTask.progress ?? getTaskProgress(parentStatus, subTask.id)}
              />
            </td>
            <td className="company-task-list-table__col-actions">
              <TaskRowActions taskId={subTask.id} onEdit={onEditTask} onDelete={onDeleteTask} />
            </td>
          </tr>

          {isExpanded && subTask.subTasks && (
            <DetailSubTaskRows
              subTasks={subTask.subTasks}
              parentStatus={parentStatus}
              depth={depth + 1}
              expandedTasks={expandedTasks}
              onToggleExpand={onToggleExpand}
              onOpenTask={onOpenTask}
              onEditTask={onEditTask}
              onDeleteTask={onDeleteTask}
              t={t}
            />
          )}
        </Fragment>
      );
    })}
  </>
);

interface DetailChildTaskListProps {
  subTasks: SubTaskItem[] | undefined;
  parentStatus: TaskStatusGroup;
  onOpenTask: (taskId: number) => void;
  onEditTask: (taskId: number) => void;
  onDeleteTask: (taskId: number) => void;
  t: TFunction;
}

const DetailChildTaskList = ({
  subTasks,
  parentStatus,
  onOpenTask,
  onEditTask,
  onDeleteTask,
  t,
}: DetailChildTaskListProps) => {
  const [expandedTasks, setExpandedTasks] = useState<Set<number>>(
    () => new Set(collectExpandableSubTaskIds(subTasks))
  );

  useEffect(() => {
    setExpandedTasks(new Set(collectExpandableSubTaskIds(subTasks)));
  }, [subTasks]);

  const toggleExpand = (id: number) => {
    setExpandedTasks((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (!subTasks?.length) return null;

  return (
    <div className="company-task-list company-task-detail__task-list">
      <div className="company-task-list-table-wrap">
        <table className="company-task-list-table">
          <thead>
            <tr>
              <th className="company-task-list-table__col-type">{t('CompanyTaskList.table.type')}</th>
              <th className="company-task-list-table__col-id">{t('CompanyTaskList.table.id')}</th>
              <th className="company-task-list-table__col-subject">{t('CompanyTaskList.table.subject')}</th>
              <th className="company-task-list-table__col-status">{t('CompanyTaskList.table.status')}</th>
              <th className="company-task-list-table__col-assignee">{t('CompanyTaskList.table.assignee')}</th>
              <th className="company-task-list-table__col-priority">{t('CompanyTaskList.table.priority')}</th>
              <th className="company-task-list-table__col-time">{t('CompanyTaskList.table.time')}</th>
              <th className="company-task-list-table__col-progress">{t('CompanyTaskList.table.progress')}</th>
              <th className="company-task-list-table__col-actions">{t('Common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            <DetailSubTaskRows
              subTasks={subTasks}
              parentStatus={parentStatus}
              depth={0}
              expandedTasks={expandedTasks}
              onToggleExpand={toggleExpand}
              onOpenTask={onOpenTask}
              onEditTask={onEditTask}
              onDeleteTask={onDeleteTask}
              t={t}
            />
          </tbody>
        </table>
      </div>
    </div>
  );
};

const CompanyTaskDetail = () => {
  const { t } = useTranslation();
  const { taskId } = useParams<{ taskId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const stateTask = (location.state as TaskNavigationState | null)?.task;
  const [refreshVersion, setRefreshVersion] = useState(0);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [addTimeModalOpen, setAddTimeModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreateTaskForm>(EMPTY_FORM);
  const [editForm, setEditForm] = useState<EditTaskForm | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<number | null>(null);
  const [timeToAdd, setTimeToAdd] = useState('');

  const task = useMemo((): TaskDetail | null => {
    if (!taskId) return null;
    const fromData = findTaskById(taskId);
    if (fromData) return fromData;
    if (stateTask && String(stateTask.id) === taskId) return stateTask;
    return null;
  }, [stateTask, taskId, refreshVersion]);

  const canCreateChildTask = task?.type === 'USER_STORY' || task?.type === 'SUB_TASK';
  const isUserStory = task?.type === 'USER_STORY';
  const isSubTask = task?.type === 'SUB_TASK';
  const deletingTask = deletingTaskId ? findTaskById(deletingTaskId) : null;

  const refreshCurrentTask = (targetId?: number) => {
    const nextId = targetId ?? task?.id;
    if (!nextId) return;

    setRefreshVersion((version) => version + 1);
    navigate(`/company/projects/tasks/${nextId}`, {
      replace: true,
      state: { task: findTaskById(nextId), refresh: true },
    });
  };

  const handleOpenTask = (id: number) => {
    const childTask = findTaskById(id);
    if (!childTask) return;
    navigate(`/company/projects/tasks/${id}`, { state: { task: childTask } });
  };

  const handleCreateTask = () => {
    if (!task || !createForm.subject.trim()) return;

    const created = addTaskUnderParent(task.id, {
      subject: createForm.subject,
      assignee: createForm.assignee,
      priority: createForm.priority,
      timeHours: createForm.timeHours ? Number(createForm.timeHours) : undefined,
      description: createForm.description,
    });

    if (!created) return;

    setCreateModalOpen(false);
    setCreateForm(EMPTY_FORM);
    refreshCurrentTask(task.id);
  };

  const handleOpenEditTask = (id: number) => {
    const taskToEdit = findTaskById(id);
    if (!taskToEdit || taskToEdit.type !== 'SUB_TASK') return;

    setEditingTaskId(id);
    setEditForm(buildEditForm(taskToEdit));
    setEditModalOpen(true);
  };

  const handleSaveEditTask = () => {
    if (!editForm || editingTaskId == null || !editForm.subject.trim()) return;

    const progress = Number(editForm.progress);
    if (!updateTask(editingTaskId, {
      subject: editForm.subject,
      assignee: editForm.assignee,
      priority: editForm.priority,
      timeHours: editForm.timeHours ? Number(editForm.timeHours) : undefined,
      progress: Number.isNaN(progress) ? undefined : Math.min(100, Math.max(0, progress)),
      description: editForm.description,
    })) {
      return;
    }

    setEditModalOpen(false);
    setEditForm(null);
    setEditingTaskId(null);
    refreshCurrentTask(editingTaskId === task?.id ? editingTaskId : task?.id);
  };

  const handleOpenDeleteTask = (id: number) => {
    setDeletingTaskId(id);
    setDeleteModalOpen(true);
  };

  const handleConfirmDeleteTask = () => {
    if (deletingTaskId == null) return;

    const result = deleteTask(deletingTaskId);
    if (!result.success) return;

    setDeleteModalOpen(false);
    setDeletingTaskId(null);

    if (deletingTaskId === task?.id) {
      const redirectId = result.redirectToId;
      if (redirectId) {
        navigate(`/company/projects/tasks/${redirectId}`, {
          replace: true,
          state: { task: findTaskById(redirectId), refresh: true },
        });
      } else {
        navigate('/company/projects/tasks', { replace: true, state: { refresh: true } });
      }
      return;
    }

    refreshCurrentTask(task?.id);
  };

  const handleAddTaskTime = () => {
    if (!task || task.type !== 'SUB_TASK') return;

    const hours = Number(timeToAdd);
    if (!hours || hours <= 0) return;

    if (!addTaskTime(task.id, hours)) return;

    setTimeToAdd('');
    setAddTimeModalOpen(false);
    refreshCurrentTask(task.id);
  };

  if (!task) {
    return (
      <>
        <Breadcrumbs
          title={t('CompanyTaskList.pageTitle')}
          breadcrumbItem={t('CompanyTaskDetail.breadcrumbItem')}
          breadcrumbParent={t('CompanyTaskList.breadcrumbItem')}
          link="/company/projects/tasks"
        />
        <Card>
          <CardBody className="text-center py-5 text-muted">
            {t('CompanyTaskDetail.notFound')}
          </CardBody>
        </Card>
      </>
    );
  }

  return (
    <div className="company-task-detail">
      <Breadcrumbs
        title={t('CompanyTaskList.pageTitle')}
        breadcrumbItem={t('CompanyTaskDetail.breadcrumbItem')}
        breadcrumbParent={t('CompanyTaskList.breadcrumbItem')}
        link="/company/projects/tasks"
      />

      <Card className="company-task-detail-card shadow-none mb-0">
        <div className="company-task-detail__toolbar">
          <div className="company-task-detail__toolbar-main">
            <div className="company-task-detail__meta-line">
              <span className={`company-task-type ${taskTypeClass(task.type)}`}>
                {t(taskTypeLabelKey(task.type))}
              </span>
              <TaskStatusCell status={task.status} type={task.type} t={t} />
              <span className="company-task-detail__id">#{task.id}</span>
            </div>
            <h1 className="company-task-detail__title">{task.subject}</h1>
            {task.parentTask && (
              <p className="company-task-detail__parent">
                {t('CompanyTaskDetail.parentTask')}:{' '} 
                <Link
                  to={`/company/projects/tasks/${task.parentTask.id}`}
                  state={{ task: findTaskById(task.parentTask.id) }}
                >
                  #{task.parentTask.id} — {task.parentTask.subject}
                </Link>
              </p>
            )}
          </div>

          <div className="company-task-detail__actions">
            {canCreateChildTask && (
              <Button color="success" size="sm" onClick={() => setCreateModalOpen(true)}>
                <i className="bx bx-plus me-1" aria-hidden />
                {t('CompanyTaskDetail.createTask')}
              </Button>
            )}
            {isSubTask && (
              <>
                <Button color="primary" size="sm" onClick={() => handleOpenEditTask(task.id)}>
                  <i className="mdi mdi-pencil me-1" aria-hidden />
                  {t('CompanyTaskDetail.editTask')}
                </Button>
                <Button color="danger" size="sm" outline onClick={() => handleOpenDeleteTask(task.id)}>
                  <i className="mdi mdi-delete me-1" aria-hidden />
                  {t('CompanyTaskDetail.deleteTask')}
                </Button>
              </>
            )}
            <Button tag={Link} to="/company/projects/tasks" state={{ refresh: true }} color="light" size="sm">
              <i className="bx bx-arrow-back me-1" aria-hidden />
              {t('CompanyTaskDetail.backToList')}
            </Button>
          </div>
        </div>

        <div className="company-task-detail__body">
          <Row className="g-3">
            <Col lg="12">
              <div className="company-task-detail__panel--summary mb-3 mb-lg-0">
                <div className="company-task-detail__panel-body">
                  <p className="company-task-detail__description mb-3">{task.description}</p>
                  <div className=" company-task-detail__sidebar">
                    <div className="company-task-detail__detail-row">
                      <span className="company-task-detail__detail-label">{t('CompanyTaskList.table.assignee')}</span>
                      <div className="company-task-detail__detail-value">
                        <span className="company-task-assignee">
                          <span
                            className="company-task-assignee__avatar"
                            style={{ backgroundColor: getAvatarColor(task.assignee) }}
                          >
                            {getInitials(task.assignee)}
                          </span>
                          <span className="company-task-assignee__name">{task.assignee}</span>
                        </span>
                      </div>
                    </div>

                {!isUserStory && (
                  <div className="company-task-detail__detail-row">
                    <span className="company-task-detail__detail-label">{t('CompanyTaskList.table.priority')}</span>
                    <div className="company-task-detail__detail-value">
                      <span className={priorityClass(task.priority)}>{t(priorityLabelKey(task.priority))}</span>
                    </div>
                  </div>
                )}

                {!isUserStory && (
                  <div className="company-task-detail__detail-row company-task-detail__detail-row--spent-time">
                    <span className="company-task-detail__detail-label company-task-detail__detail-label--spent-time">
                      {t('CompanyTaskDetail.spentTime')}
                    </span>
                    <div className="company-task-detail__detail-value">
                      <TaskSpentTimeCell
                        timeHours={task.timeHours}
                        interactive
                        onClick={() => setAddTimeModalOpen(true)}
                      />
                    </div>
                  </div>
                )}

                <div className="company-task-detail__detail-row company-task-detail__detail-row--progress">
                      <span className="company-task-detail__detail-label">{t('CompanyTaskList.table.progress')}</span>
                      <div className="company-task-detail__detail-value">
                        <TaskProgressCell progress={task.progress} />
                      </div>
                    </div>

                    <div className="company-task-detail__detail-row">
                      <span className="company-task-detail__detail-label">{t('CompanyTaskDetail.createdBy')}</span>
                      <div className="company-task-detail__detail-value">
                        <span className="company-task-assignee">
                          <span
                            className="company-task-assignee__avatar"
                            style={{ backgroundColor: getAvatarColor(task.createdBy) }}
                          >
                            {getInitials(task.createdBy)}
                          </span>
                          <span className="company-task-assignee__name">{task.createdBy}</span>
                        </span>
                      </div>
                    </div>

                    <div className="company-task-detail__detail-row">
                      <span className="company-task-detail__detail-label">{t('CompanyTaskDetail.lastUpdated')}</span>
                      <div className="company-task-detail__detail-value">
                        <span className="company-task-detail__date">{formatTaskDate(task.lastUpdatedAt)}</span>
                      </div>
                    </div>

                  </div>
                </div>
              </div>

              {canCreateChildTask && (
                <div className="company-task-detail__panel company-task-detail__panel--tasks">
                  

                  {task.subTasks && task.subTasks.length > 0 ? (
                    <DetailChildTaskList
                      subTasks={task.subTasks}
                      parentStatus={task.status}
                      onOpenTask={handleOpenTask}
                      onEditTask={handleOpenEditTask}
                      onDeleteTask={handleOpenDeleteTask}
                      t={t}
                    />
                  ) : (
                    <div className="company-task-detail__empty-tasks">
                      <i className="bx bx-task text-muted" aria-hidden />
                      <p className="mb-2">{t('CompanyTaskDetail.noChildTasks')}</p>
                      
                    </div>
                  )}
                </div>
              )}
            </Col>

           
          </Row>
        </div>
      </Card>

      <Modal isOpen={createModalOpen} toggle={() => setCreateModalOpen(false)} centered>
        <ModalHeader toggle={() => setCreateModalOpen(false)}>
          {t('CompanyTaskDetail.createTaskTitle')}
        </ModalHeader>
        <ModalBody>
          <Form>
            <FormGroup>
              <Label for="create-task-subject">{t('CompanyTaskList.table.subject')}</Label>
              <Input
                id="create-task-subject"
                value={createForm.subject}
                onChange={(event) => setCreateForm((prev) => ({ ...prev, subject: event.target.value }))}
                placeholder={t('CompanyTaskDetail.createTaskSubjectPlaceholder')}
              />
            </FormGroup>
            <FormGroup>
              <Label for="create-task-description">{t('CompanyTaskDetail.description')}</Label>
              <Input
                id="create-task-description"
                type="textarea"
                rows={3}
                value={createForm.description}
                onChange={(event) => setCreateForm((prev) => ({ ...prev, description: event.target.value }))}
                placeholder={t('CompanyTaskDetail.taskDescriptionPlaceholder')}
              />
            </FormGroup>
            <FormGroup>
              <Label for="create-task-assignee">{t('CompanyTaskList.table.assignee')}</Label>
              <Input
                id="create-task-assignee"
                type="select"
                value={createForm.assignee}
                onChange={(event) => setCreateForm((prev) => ({ ...prev, assignee: event.target.value }))}
              >
                {ASSIGNEE_OPTIONS.map((assignee) => (
                  <option key={assignee} value={assignee}>
                    {assignee}
                  </option>
                ))}
              </Input>
            </FormGroup>
            <FormGroup>
              <Label for="create-task-priority">{t('CompanyTaskList.table.priority')}</Label>
              <Input
                id="create-task-priority"
                type="select"
                value={createForm.priority}
                onChange={(event) =>
                  setCreateForm((prev) => ({ ...prev, priority: event.target.value as TaskPriority }))
                }
              >
                <option value="NORMAL">{t('CompanyTaskList.priorityNormal')}</option>
                <option value="MEDIUM">{t('CompanyTaskList.priorityMedium')}</option>
                <option value="HIGH">{t('CompanyTaskList.priorityHigh')}</option>
              </Input>
            </FormGroup>
            <FormGroup className="mb-0">
              <Label for="create-task-time">{t('CompanyTaskDetail.spentTime')}</Label>
              <Input
                id="create-task-time"
                type="number"
                min="0"
                step="0.5"
                value={createForm.timeHours}
                onChange={(event) => setCreateForm((prev) => ({ ...prev, timeHours: event.target.value }))}
                placeholder={t('CompanyTaskDetail.timeHoursPlaceholder')}
              />
            </FormGroup>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button color="light" onClick={() => setCreateModalOpen(false)}>
            {t('CompanyTaskDetail.cancel')}
          </Button>
          <Button color="success" onClick={handleCreateTask} disabled={!createForm.subject.trim()}>
            {t('CompanyTaskDetail.createTask')}
          </Button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={editModalOpen} toggle={() => setEditModalOpen(false)} centered>
        <ModalHeader toggle={() => setEditModalOpen(false)}>
          {t('CompanyTaskDetail.editTaskTitle')}
        </ModalHeader>
        <ModalBody>
          {editForm && (
            <Form>
              <FormGroup>
                <Label for="edit-task-subject">{t('CompanyTaskList.table.subject')}</Label>
                <Input
                  id="edit-task-subject"
                  value={editForm.subject}
                  onChange={(event) => setEditForm((prev) => prev && { ...prev, subject: event.target.value })}
                />
              </FormGroup>
              <FormGroup>
                <Label for="edit-task-description">{t('CompanyTaskDetail.description')}</Label>
                <Input
                  id="edit-task-description"
                  type="textarea"
                  rows={3}
                  value={editForm.description}
                  onChange={(event) => setEditForm((prev) => prev && { ...prev, description: event.target.value })}
                  placeholder={t('CompanyTaskDetail.taskDescriptionPlaceholder')}
                />
              </FormGroup>
              <FormGroup>
                <Label for="edit-task-assignee">{t('CompanyTaskList.table.assignee')}</Label>
                <Input
                  id="edit-task-assignee"
                  type="select"
                  value={editForm.assignee}
                  onChange={(event) => setEditForm((prev) => prev && { ...prev, assignee: event.target.value })}
                >
                  {ASSIGNEE_OPTIONS.map((assignee) => (
                    <option key={assignee} value={assignee}>
                      {assignee}
                    </option>
                  ))}
                </Input>
              </FormGroup>
              <FormGroup>
                <Label for="edit-task-priority">{t('CompanyTaskList.table.priority')}</Label>
                <Input
                  id="edit-task-priority"
                  type="select"
                  value={editForm.priority}
                  onChange={(event) =>
                    setEditForm(
                      (prev) => prev && { ...prev, priority: event.target.value as TaskPriority }
                    )
                  }
                >
                  <option value="NORMAL">{t('CompanyTaskList.priorityNormal')}</option>
                  <option value="MEDIUM">{t('CompanyTaskList.priorityMedium')}</option>
                  <option value="HIGH">{t('CompanyTaskList.priorityHigh')}</option>
                </Input>
              </FormGroup>
              <FormGroup>
                <Label for="edit-task-time">{t('CompanyTaskDetail.spentTime')}</Label>
                <Input
                  id="edit-task-time"
                  type="number"
                  min="0"
                  step="0.5"
                  value={editForm.timeHours}
                  onChange={(event) => setEditForm((prev) => prev && { ...prev, timeHours: event.target.value })}
                  placeholder={t('CompanyTaskDetail.timeHoursPlaceholder')}
                />
              </FormGroup>
              <FormGroup className="mb-0">
                <Label for="edit-task-progress">{t('CompanyTaskList.table.progress')}</Label>
                <Input
                  id="edit-task-progress"
                  type="number"
                  min="0"
                  max="100"
                  value={editForm.progress}
                  onChange={(event) => setEditForm((prev) => prev && { ...prev, progress: event.target.value })}
                />
              </FormGroup>
            </Form>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="light" onClick={() => setEditModalOpen(false)}>
            {t('CompanyTaskDetail.cancel')}
          </Button>
          <Button color="primary" onClick={handleSaveEditTask} disabled={!editForm?.subject.trim()}>
            {t('CompanyTaskDetail.save')}
          </Button>
        </ModalFooter>
      </Modal>

      <ConfirmModal
        isOpen={deleteModalOpen}
        toggle={() => {
          setDeleteModalOpen(false);
          setDeletingTaskId(null);
        }}
        message={
          deletingTask
            ? `${t('CompanyTaskDetail.deleteConfirmation')} "${deletingTask.subject}"?`
            : t('CompanyTaskDetail.deleteConfirmation')
        }
        onConfirm={handleConfirmDeleteTask}
      />

      <Modal isOpen={addTimeModalOpen} toggle={() => setAddTimeModalOpen(false)} centered>
        <ModalHeader toggle={() => setAddTimeModalOpen(false)}>
          {t('CompanyTaskDetail.addTime')}
        </ModalHeader>
        <ModalBody>
          <Form>
            <FormGroup className="mb-0">
              <Label for="add-task-time">{t('CompanyTaskDetail.spentTime')}</Label>
              <Input
                id="add-task-time"
                type="number"
                min="0"
                step="0.5"
                value={timeToAdd}
                onChange={(event) => setTimeToAdd(event.target.value)}
                placeholder={t('CompanyTaskDetail.timeHoursPlaceholder')}
                autoFocus
              />
            </FormGroup>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button color="light" onClick={() => setAddTimeModalOpen(false)}>
            {t('CompanyTaskDetail.cancel')}
          </Button>
          <Button color="primary" onClick={handleAddTaskTime} disabled={!timeToAdd || Number(timeToAdd) <= 0}>
            {t('CompanyTaskDetail.addTime')}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default CompanyTaskDetail;
