import { Fragment, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import {
  Button,
  Card,
  CardBody,
  Form,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from 'reactstrap';
import Breadcrumbs from '../../../common/Breadcrumbs/Breadcrumbs';
import ConfirmModal from '../../../common/ConfirmModal/ConfirmModal';
import {
  ASSIGNEE_OPTIONS,
  DUMMY_TASKS,
  STATUS_GROUPS,
  addTaskUnderParent,
  countNestedSubTasks,
  deleteTask,
  findTaskById,
  getAvatarColor,
  getInitials,
  getTaskProgress,
  priorityClass,
  priorityLabelKey,
  statusGroupLabelKey,
  taskTypeClass,
  taskTypeLabelKey,
  updateTask,
} from './companyTaskData';
import type { SubTaskItem, TaskDetail, TaskItem, TaskPriority, TaskStatusGroup } from './companyTaskData';
import { TaskStatusCell } from './TaskStatusCell';
import { TaskSpentTimeCell } from './TaskSpentTimeCell';
import { TaskRowActions } from './TaskRowActions';
import './CompanyTaskList.scss';

type CreateTaskForm = {
  parentId: string;
  subject: string;
  assignee: string;
  priority: TaskPriority;
  timeHours: string;
  description: string;
};

const EMPTY_CREATE_FORM: CreateTaskForm = {
  parentId: '',
  subject: '',
  assignee: ASSIGNEE_OPTIONS[0],
  priority: 'NORMAL',
  timeHours: '',
  description: '',
};

type EditTaskForm = {
  subject: string;
  assignee: string;
  priority: TaskPriority;
  timeHours: string;
  progress: string;
  description: string;
};

const buildEditForm = (taskDetail: TaskDetail): EditTaskForm => ({
  subject: taskDetail.subject,
  assignee: taskDetail.assignee,
  priority: taskDetail.priority,
  timeHours: taskDetail.timeHours != null && taskDetail.timeHours > 0 ? String(taskDetail.timeHours) : '',
  progress: String(taskDetail.progress),
  description: taskDetail.description,
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

const collectExpandableIds = (tasks: TaskItem[]): number[] => {
  const ids: number[] = [];

  const walkSubTasks = (items: SubTaskItem[] | undefined) => {
    for (const item of items ?? []) {
      if (item.subTasks?.length) {
        ids.push(item.id);
        walkSubTasks(item.subTasks);
      }
    }
  };

  for (const task of tasks) {
    if (task.subTasks?.length) {
      ids.push(task.id);
      walkSubTasks(task.subTasks);
    }
  }

  return ids;
};

interface SubTaskRowsProps {
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

const SubTaskRows = ({
  subTasks,
  parentStatus,
  depth,
  expandedTasks,
  onToggleExpand,
  onOpenTask,
  onEditTask,
  onDeleteTask,
  t,
}: SubTaskRowsProps) => (
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
            <SubTaskRows
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

interface TaskRowProps {
  task: TaskItem;
  t: TFunction;
  expandedTasks: Set<number>;
  onToggleExpand: (taskId: number) => void;
  onOpenTask: (taskId: number) => void;
  onEditTask: (taskId: number) => void;
  onDeleteTask: (taskId: number) => void;
}

const TaskRow = ({
  task,
  t,
  expandedTasks,
  onToggleExpand,
  onOpenTask,
  onEditTask,
  onDeleteTask,
}: TaskRowProps) => {
  const hasSubTasks = task.type === 'USER_STORY' && (task.subTasks?.length ?? 0) > 0;
  const isExpanded = hasSubTasks && expandedTasks.has(task.id);
  const nestedCount = countNestedSubTasks(task.subTasks);

  const renderTaskIdButton = (id: number) => (
    <Button
      color="link"
      className="company-task-list-table__task-id p-0 border-0"
      onClick={() => onOpenTask(id)}
    >
      {id}
    </Button>
  );

  return (
    <>
      <tr className={hasSubTasks ? 'company-task-list-table__parent-row' : undefined}>
        <td>
          <div className="company-task-list-table__type-cell">
            {hasSubTasks ? (
              <button
                type="button"
                className="company-task-list-table__subtask-toggle"
                onClick={() => onToggleExpand(task.id)}
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
            <span className={`company-task-type ${taskTypeClass(task.type)}`}>
              {t(taskTypeLabelKey(task.type))}
            </span>
          </div>
        </td>
        <td>{renderTaskIdButton(task.id)}</td>
        <td>
          <div className="company-task-list-table__subject-cell">
            <span>{task.subject}</span>
            {hasSubTasks && (
              <span className="company-task-list-table__subtask-count">
                {t('CompanyTaskList.subTaskCount', { count: nestedCount })}
              </span>
            )}
          </div>
        </td>
        <td><TaskStatusCell status={task.status} type={task.type} t={t} /></td>
        <td>
          <span className="company-task-assignee">
            <span
              className="company-task-assignee__avatar"
              style={{ backgroundColor: getAvatarColor(task.assignee) }}
            >
              {getInitials(task.assignee)}
            </span>
            <span className="company-task-assignee__name">{task.assignee}</span>
          </span>
        </td>
        <td>
          {task.type === 'USER_STORY' ? (
            <span className="company-task-list-table__empty-cell">—</span>
          ) : (
            <TaskPriorityCell priority={task.priority} t={t} />
          )}
        </td>
        <td className="company-task-list-table__col-time">
          {task.type === 'USER_STORY' ? (
            <span className="company-task-list-table__empty-cell">—</span>
          ) : (
            <TaskSpentTimeCell timeHours={task.timeHours} />
          )}
        </td>
        <td className="company-task-list-table__col-progress">
          {task.type === 'USER_STORY' ? (
            <span className="company-task-list-table__empty-cell">—</span>
          ) : (
            <TaskProgressCell progress={task.progress ?? getTaskProgress(task.status, task.id)} />
          )}
        </td>
        <td className="company-task-list-table__col-actions">
          <span className="company-task-list-table__empty-cell">—</span>
        </td>
      </tr>

      {isExpanded && task.subTasks && (
        <SubTaskRows
          subTasks={task.subTasks}
          parentStatus={task.status}
          depth={1}
          expandedTasks={expandedTasks}
          onToggleExpand={onToggleExpand}
          onOpenTask={onOpenTask}
          onEditTask={onEditTask}
          onDeleteTask={onDeleteTask}
          t={t}
        />
      )}
    </>
  );
};

type ListNavigationState = {
  refresh?: boolean;
};

const CompanyTaskList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [refreshKey, setRefreshKey] = useState(0);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<TaskStatusGroup>>(new Set());
  const [expandedTasks, setExpandedTasks] = useState<Set<number>>(
    () => new Set(collectExpandableIds(DUMMY_TASKS))
  );
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreateTaskForm>(EMPTY_CREATE_FORM);
  const [editForm, setEditForm] = useState<EditTaskForm | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<number | null>(null);

  const deletingTask = deletingTaskId ? findTaskById(deletingTaskId) : null;

  const projectOptions = useMemo(
    () => DUMMY_TASKS.filter((task) => task.type === 'USER_STORY'),
    [refreshKey]
  );

  useEffect(() => {
    if (!createModalOpen || createForm.parentId || projectOptions.length === 0) return;
    setCreateForm((prev) => ({ ...prev, parentId: String(projectOptions[0].id) }));
  }, [createModalOpen, createForm.parentId, projectOptions]);

  useEffect(() => {
    const state = location.state as ListNavigationState | null;
    if (state?.refresh) {
      setRefreshKey((key) => key + 1);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const groupedTasks = useMemo(() => {
    return STATUS_GROUPS.map((status) => ({
      status,
      tasks: DUMMY_TASKS.filter((task) => task.status === status),
    }));
  }, [refreshKey]);

  const toggleGroup = (status: TaskStatusGroup) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(status)) next.delete(status);
      else next.add(status);
      return next;
    });
  };

  const toggleExpand = (taskId: number) => {
    setExpandedTasks((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) next.delete(taskId);
      else next.add(taskId);
      return next;
    });
  };

  const handleOpenTask = (taskId: number) => {
    const task = findTaskById(taskId);
    if (!task) return;
    navigate(`/company/projects/tasks/${taskId}`, { state: { task } });
  };

  const handleCreateTask = () => {
    const parentId = Number(createForm.parentId);
    if (!parentId || !createForm.subject.trim()) return;

    const created = addTaskUnderParent(parentId, {
      subject: createForm.subject,
      assignee: createForm.assignee,
      priority: createForm.priority,
      timeHours: createForm.timeHours ? Number(createForm.timeHours) : undefined,
      description: createForm.description,
    });

    if (!created) return;

    setCreateModalOpen(false);
    setCreateForm(EMPTY_CREATE_FORM);
    setRefreshKey((key) => key + 1);
    setExpandedTasks((prev) => new Set(prev).add(parentId));
  };

  const handleOpenEditTask = (taskId: number) => {
    const taskToEdit = findTaskById(taskId);
    if (!taskToEdit || taskToEdit.type !== 'SUB_TASK') return;

    setEditingTaskId(taskId);
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
    setRefreshKey((key) => key + 1);
  };

  const handleOpenDeleteTask = (taskId: number) => {
    setDeletingTaskId(taskId);
    setDeleteModalOpen(true);
  };

  const handleConfirmDeleteTask = () => {
    if (deletingTaskId == null) return;

    if (!deleteTask(deletingTaskId).success) return;

    setDeleteModalOpen(false);
    setDeletingTaskId(null);
    setRefreshKey((key) => key + 1);
  };

  return (
    <div className="company-task-list">
      <Breadcrumbs
        title={t('CompanyTaskList.pageTitle')}
        breadcrumbItem={t('CompanyTaskList.breadcrumbItem')}
        breadcrumbParent={t('CompanyTaskList.breadcrumbParent')}
        link="/company/projects"
      />

      <Card className="company-task-list-card shadow-none mb-0">
        <CardBody className="p-0">
          <div className="company-task-list-toolbar">
            <div className="company-task-list-toolbar__left">
              <span className="company-task-list-toolbar__sprint">
                {t('CompanyTaskList.sprintLabel')}
              </span>
            </div>

            <div className="company-task-list-toolbar__right">
              <button
                type="button"
                className="company-task-list-toolbar__create-btn btn btn-primary btn-sm"
                onClick={() => setCreateModalOpen(true)}
              >
                <i className="bx bx-plus me-1" aria-hidden />
                {t('CompanyTaskList.createTask')}
              </button>
              <button type="button" className="company-task-list-toolbar__filter-btn">
                {t('CompanyTaskList.filter')}
                <span className="text-muted">(3)</span>
                <i className="bx bx-chevron-down" aria-hidden />
              </button>

             
              <button type="button" className="company-task-list-toolbar__icon-btn" title={t('CompanyTaskList.moreOptions')}>
                <i className="bx bx-dots-vertical-rounded" aria-hidden />
              </button>
            </div>
          </div>

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
                {groupedTasks.map(({ status, tasks }) => {
                  const isCollapsed = collapsedGroups.has(status);

                  return (
                    <Fragment key={status}>
                      <tr className="company-task-list-table__group-row">
                        <td colSpan={9}>
                          <button
                            type="button"
                            className="company-task-list-table__group-toggle"
                            onClick={() => toggleGroup(status)}
                          >
                            <i className={`bx ${isCollapsed ? 'bx-plus' : 'bx-minus'}`} aria-hidden />
                            {t(statusGroupLabelKey(status))} ({tasks.length})
                          </button>
                        </td>
                      </tr>

                      {!isCollapsed &&
                        tasks.map((task) => (
                          <TaskRow
                            key={task.id}
                            task={task}
                            t={t}
                            expandedTasks={expandedTasks}
                            onToggleExpand={toggleExpand}
                            onOpenTask={handleOpenTask}
                            onEditTask={handleOpenEditTask}
                            onDeleteTask={handleOpenDeleteTask}
                          />
                        ))}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      <Modal isOpen={createModalOpen} toggle={() => setCreateModalOpen(false)} centered>
        <ModalHeader toggle={() => setCreateModalOpen(false)}>
          {t('CompanyTaskList.createTaskTitle')}
        </ModalHeader>
        <ModalBody>
          <Form>
            <FormGroup>
              <Label for="list-create-task-project">{t('CompanyTaskList.table.project')}</Label>
              <Input
                id="list-create-task-project"
                type="select"
                value={createForm.parentId}
                onChange={(event) =>
                  setCreateForm((prev) => ({ ...prev, parentId: event.target.value }))
                }
              >
                {projectOptions.map((project) => (
                  <option key={project.id} value={project.id}>
                    #{project.id} — {project.subject}
                  </option>
                ))}
              </Input>
            </FormGroup>
            <FormGroup>
              <Label for="list-create-task-subject">{t('CompanyTaskList.table.subject')}</Label>
              <Input
                id="list-create-task-subject"
                value={createForm.subject}
                onChange={(event) => setCreateForm((prev) => ({ ...prev, subject: event.target.value }))}
                placeholder={t('CompanyTaskList.createTaskSubjectPlaceholder')}
              />
            </FormGroup>
            <FormGroup>
              <Label for="list-create-task-description">{t('CompanyTaskDetail.description')}</Label>
              <Input
                id="list-create-task-description"
                type="textarea"
                rows={3}
                value={createForm.description}
                onChange={(event) => setCreateForm((prev) => ({ ...prev, description: event.target.value }))}
                placeholder={t('CompanyTaskDetail.taskDescriptionPlaceholder')}
              />
            </FormGroup>
            <FormGroup>
              <Label for="list-create-task-assignee">{t('CompanyTaskList.table.assignee')}</Label>
              <Input
                id="list-create-task-assignee"
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
              <Label for="list-create-task-priority">{t('CompanyTaskList.table.priority')}</Label>
              <Input
                id="list-create-task-priority"
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
              <Label for="list-create-task-time">{t('CompanyTaskList.table.time')}</Label>
              <Input
                id="list-create-task-time"
                type="number"
                min="0"
                step="0.5"
                value={createForm.timeHours}
                onChange={(event) => setCreateForm((prev) => ({ ...prev, timeHours: event.target.value }))}
                placeholder={t('CompanyTaskList.timeHoursPlaceholder')}
              />
            </FormGroup>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button color="light" onClick={() => setCreateModalOpen(false)}>
            {t('CompanyTaskList.cancel')}
          </Button>
          <Button
            color="success"
            onClick={handleCreateTask}
            disabled={!createForm.parentId || !createForm.subject.trim()}
          >
            {t('CompanyTaskList.createTask')}
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
                <Label for="list-edit-task-subject">{t('CompanyTaskList.table.subject')}</Label>
                <Input
                  id="list-edit-task-subject"
                  value={editForm.subject}
                  onChange={(event) => setEditForm((prev) => prev && { ...prev, subject: event.target.value })}
                />
              </FormGroup>
              <FormGroup>
                <Label for="list-edit-task-description">{t('CompanyTaskDetail.description')}</Label>
                <Input
                  id="list-edit-task-description"
                  type="textarea"
                  rows={3}
                  value={editForm.description}
                  onChange={(event) => setEditForm((prev) => prev && { ...prev, description: event.target.value })}
                  placeholder={t('CompanyTaskDetail.taskDescriptionPlaceholder')}
                />
              </FormGroup>
              <FormGroup>
                <Label for="list-edit-task-assignee">{t('CompanyTaskList.table.assignee')}</Label>
                <Input
                  id="list-edit-task-assignee"
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
                <Label for="list-edit-task-priority">{t('CompanyTaskList.table.priority')}</Label>
                <Input
                  id="list-edit-task-priority"
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
                <Label for="list-edit-task-time">{t('CompanyTaskList.table.time')}</Label>
                <Input
                  id="list-edit-task-time"
                  type="number"
                  min="0"
                  step="0.5"
                  value={editForm.timeHours}
                  onChange={(event) => setEditForm((prev) => prev && { ...prev, timeHours: event.target.value })}
                  placeholder={t('CompanyTaskList.timeHoursPlaceholder')}
                />
              </FormGroup>
              <FormGroup className="mb-0">
                <Label for="list-edit-task-progress">{t('CompanyTaskList.table.progress')}</Label>
                <Input
                  id="list-edit-task-progress"
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
            {t('CompanyTaskList.cancel')}
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
    </div>
  );
};

export default CompanyTaskList;
