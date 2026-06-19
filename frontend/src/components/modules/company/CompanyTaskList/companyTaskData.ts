export type TaskType = 'USER_STORY' | 'SUB_TASK';
export type TaskStatusGroup = 'NEW' | 'IN_PROGRESS' | 'IN_TESTING' | 'CLOSED';
export type TaskPriority = 'NORMAL' | 'MEDIUM' | 'HIGH';

export interface SubTaskItem {
  id: number;
  subject: string;
  assignee: string;
  priority: TaskPriority;
  progress?: number;
  timeHours?: number;
  createdBy?: string;
  lastUpdatedAt?: string;
  description?: string;
  subTasks?: SubTaskItem[];
}

export interface TaskItem {
  id: number;
  type: TaskType;
  subject: string;
  status: TaskStatusGroup;
  assignee: string;
  priority: TaskPriority;
  progress?: number;
  timeHours?: number;
  createdBy?: string;
  lastUpdatedAt?: string;
  description?: string;
  subTasks?: SubTaskItem[];
}

export interface TaskDetail {
  id: number;
  type: TaskType;
  subject: string;
  status: TaskStatusGroup;
  assignee: string;
  priority: TaskPriority;
  progress: number;
  description: string;
  timeHours?: number;
  createdBy: string;
  lastUpdatedAt: string;
  subTasks?: SubTaskItem[];
  parentTask?: Pick<TaskItem, 'id' | 'subject' | 'type'>;
}

export const STATUS_GROUPS: TaskStatusGroup[] = ['NEW', 'IN_PROGRESS', 'IN_TESTING', 'CLOSED'];

export const DUMMY_TASKS: TaskItem[] = [
  {
    id: 33177,
    type: 'USER_STORY',
    subject: 'Foundation waterproofing inspection - Site A',
    status: 'NEW',
    assignee: 'Ahmed Khan',
    priority: 'HIGH',
    subTasks: [
      {
        id: 331771,
        subject: 'Inspect basement membrane for leaks',
        assignee: 'Rahul Menon',
        priority: 'HIGH',
        timeHours: 6,
        subTasks: [
          { id: 3317711, subject: 'Mark water ingress points on floor plan', assignee: 'Mohammed Ali', priority: 'HIGH', timeHours: 4 },
          { id: 3317712, subject: 'Prepare defect report with site photos', assignee: 'Sara Youssef', priority: 'NORMAL', timeHours: 3 },
        ],
      },
      { id: 331772, subject: 'Repair cracked retaining wall mortar joints', assignee: 'Fatima Al Zahra', priority: 'MEDIUM', timeHours: 8 },
    ],
  },
  {
    id: 33178,
    type: 'USER_STORY',
    subject: 'Structural steel delivery delayed - Tower B',
    status: 'NEW',
    assignee: 'Fatima Al Zahra',
    priority: 'HIGH',
    subTasks: [
      { id: 331781, subject: 'Verify steel beam dimensions against drawings', assignee: 'Mohammed Ali', priority: 'HIGH', timeHours: 5 },
      { id: 331782, subject: 'Coordinate revised delivery schedule with supplier', assignee: 'Rahul Menon', priority: 'MEDIUM', timeHours: 2 },
    ],
  },
  { id: 33183, type: 'USER_STORY', subject: 'Scaffolding permit pending approval', status: 'NEW', assignee: 'Rahul Menon', priority: 'MEDIUM' },
  { id: 33189, type: 'USER_STORY', subject: 'Concrete pour weather delay assessment', status: 'NEW', assignee: 'Sara Youssef', priority: 'MEDIUM' },
  {
    id: 33165,
    type: 'USER_STORY',
    subject: 'Residential tower MEP rough-in',
    status: 'IN_PROGRESS',
    assignee: 'Ahmed Khan',
    priority: 'MEDIUM',
    subTasks: [
      {
        id: 331651,
        subject: 'Install HVAC ductwork - Level 12',
        assignee: 'Fatima Al Zahra',
        priority: 'MEDIUM',
        timeHours: 12,
        subTasks: [
          { id: 3316511, subject: 'Pressure test duct joints on Level 12', assignee: 'Mohammed Ali', priority: 'MEDIUM', timeHours: 4 },
        ],
      },
      { id: 331652, subject: 'Electrical conduit routing - basement parking', assignee: 'Sara Youssef', priority: 'NORMAL', timeHours: 10 },
      { id: 331653, subject: 'Plumbing stack installation - core shaft', assignee: 'Rahul Menon', priority: 'NORMAL', timeHours: 8 },
    ],
  },
  { id: 33166, type: 'USER_STORY', subject: 'Site office temporary works relocation', status: 'IN_PROGRESS', assignee: 'Mohammed Ali', priority: 'NORMAL' },
  { id: 33170, type: 'USER_STORY', subject: 'Commercial plaza facade cladding', status: 'IN_PROGRESS', assignee: 'Sara Youssef', priority: 'HIGH' },
  { id: 33179, type: 'USER_STORY', subject: 'Subcontractor safety induction program', status: 'IN_PROGRESS', assignee: 'Rahul Menon', priority: 'NORMAL' },
  { id: 33186, type: 'USER_STORY', subject: 'Material procurement - cement and aggregates', status: 'IN_PROGRESS', assignee: 'Fatima Al Zahra', priority: 'NORMAL' },
  { id: 33172, type: 'USER_STORY', subject: 'Final inspection - fire stopping systems', status: 'IN_TESTING', assignee: 'Ahmed Khan', priority: 'MEDIUM' },
  {
    id: 33171,
    type: 'USER_STORY',
    subject: 'Villa compound boundary wall completion',
    status: 'CLOSED',
    assignee: 'Ahmed Khan',
    priority: 'NORMAL',
    subTasks: [
      { id: 331711, subject: 'Apply external render coat - north elevation', assignee: 'Sara Youssef', priority: 'NORMAL', timeHours: 16 },
      { id: 331712, subject: 'Install boundary wall cap stones', assignee: 'Mohammed Ali', priority: 'NORMAL', timeHours: 6 },
    ],
  },
  { id: 33180, type: 'USER_STORY', subject: 'Highway bridge deck formwork installation', status: 'CLOSED', assignee: 'Rahul Menon', priority: 'NORMAL' },
  { id: 33181, type: 'USER_STORY', subject: 'Underground parking slab reinforcement', status: 'CLOSED', assignee: 'Mohammed Ali', priority: 'NORMAL' },
  { id: 33182, type: 'USER_STORY', subject: 'Landscaping and hardscape - main entrance', status: 'CLOSED', assignee: 'Sara Youssef', priority: 'NORMAL' },
];

export const ASSIGNEE_COLORS: Record<string, string> = {
  'Ahmed Khan': '#2563eb',
  'Fatima Al Zahra': '#db2777',
  'Rahul Menon': '#059669',
  'Mohammed Ali': '#d97706',
  'Sara Youssef': '#7c3aed',
};

const AVATAR_COLORS = ['#0ea5e9', '#8b5cf6', '#14b8a6', '#f97316', '#ec4899', '#64748b'];

export const getTaskProgress = (status: TaskStatusGroup, seed: number): number => {
  if (status === 'CLOSED') return 100;

  const baseByStatus: Record<Exclude<TaskStatusGroup, 'CLOSED'>, number> = {
    NEW: 12,
    IN_PROGRESS: 58,
    IN_TESTING: 88,
  };

  const base = baseByStatus[status];
  const offset = seed % 29;
  return Math.min(status === 'IN_TESTING' ? 99 : 95, Math.max(0, base + offset - 14));
};

export const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
};

export const getAvatarColor = (name: string): string => {
  const mapped = ASSIGNEE_COLORS[name.trim()];
  if (mapped) return mapped;

  let hash = 0;
  for (let i = 0; i < name.length; i += 1) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

export const statusGroupLabelKey = (status: TaskStatusGroup): string => {
  const keys: Record<TaskStatusGroup, string> = {
    NEW: 'CompanyTaskList.statusNew',
    IN_PROGRESS: 'CompanyTaskList.statusInProgress',
    IN_TESTING: 'CompanyTaskList.statusInTesting',
    CLOSED: 'CompanyTaskList.statusClosed',
  };
  return keys[status];
};

export const taskTypeLabelKey = (type: TaskType): string => {
  const keys: Record<TaskType, string> = {
    USER_STORY: 'CompanyTaskList.typeUserStory',
    SUB_TASK: 'CompanyTaskList.typeSubTask',
  };
  return keys[type];
};

export const taskTypeClass = (type: TaskType): string => {
  const classes: Record<TaskType, string> = {
    USER_STORY: 'company-task-type--user-story',
    SUB_TASK: 'company-task-type--sub-task',
  };
  return classes[type];
};

export const priorityLabelKey = (priority: TaskPriority): string => {
  const keys: Record<TaskPriority, string> = {
    NORMAL: 'CompanyTaskList.priorityNormal',
    MEDIUM: 'CompanyTaskList.priorityMedium',
    HIGH: 'CompanyTaskList.priorityHigh',
  };
  return keys[priority];
};

export const priorityClass = (priority: TaskPriority): string =>
  `company-task-priority company-task-priority--${priority.toLowerCase()}`;

export const ASSIGNEE_OPTIONS = ['Ahmed Khan', 'Fatima Al Zahra', 'Rahul Menon', 'Mohammed Ali', 'Sara Youssef'];

export const formatTaskTime = (hours?: number): string => {
  if (hours == null || hours <= 0) return '—';
  return Number.isInteger(hours) ? `${hours}h` : `${hours.toFixed(1)}h`;
};

export const formatSpentTime = (hours?: number): string => {
  if (hours == null || hours <= 0) return '0h';
  return Number.isInteger(hours) ? `${hours}h` : `${hours.toFixed(1)}h`;
};

export const getDefaultTaskTime = (seed: number): number => {
  const values = [2, 3, 4, 5, 6, 8, 10, 12, 16];
  return values[seed % values.length];
};

export const getTaskCreatedBy = (seed: number, fallback?: string): string =>
  ASSIGNEE_OPTIONS[Math.abs(seed) % ASSIGNEE_OPTIONS.length] ?? fallback ?? ASSIGNEE_OPTIONS[0];

export const getTaskLastUpdatedAt = (seed: number): string => {
  const date = new Date('2026-06-01T09:00:00.000Z');
  date.setDate(date.getDate() + (Math.abs(seed) % 45));
  date.setHours(9 + (Math.abs(seed) % 8), (Math.abs(seed) * 7) % 60, 0, 0);
  return date.toISOString();
};

export const resolveTaskAuditFields = (
  id: number,
  fallback?: { createdBy?: string; lastUpdatedAt?: string }
): { createdBy: string; lastUpdatedAt: string } => ({
  createdBy: fallback?.createdBy ?? getTaskCreatedBy(id),
  lastUpdatedAt: fallback?.lastUpdatedAt ?? getTaskLastUpdatedAt(id),
});

export const formatTaskDate = (dateStr?: string): string => {
  if (!dateStr) return '—';

  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return '—';

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const buildDescription = (subject: string, parentSubject?: string): string => {
  if (parentSubject) {
    return `Site task under "${parentSubject}". ${subject}. Track site progress, safety checks, material requirements, and sign-off criteria here.`;
  }
  return `${subject}. Review construction scope, site dependencies, subcontractor coordination, and project milestones for this work item.`;
};

type SubTaskSearchResult = {
  subTask: SubTaskItem;
  parent: Pick<TaskItem, 'id' | 'subject' | 'type' | 'status'>;
  parentSubTask?: Pick<SubTaskItem, 'id' | 'subject'>;
};

const findSubTaskById = (
  items: SubTaskItem[] | undefined,
  id: number,
  parent: Pick<TaskItem, 'id' | 'subject' | 'type' | 'status'>,
  parentSubTask?: Pick<SubTaskItem, 'id' | 'subject'>
): SubTaskSearchResult | null => {
  if (!items) return null;

  for (const subTask of items) {
    if (subTask.id === id) {
      return { subTask, parent, parentSubTask };
    }

    const nested = findSubTaskById(subTask.subTasks, id, parent, { id: subTask.id, subject: subTask.subject });
    if (nested) return nested;
  }

  return null;
};

const addSubTaskRecursive = (
  items: SubTaskItem[] | undefined,
  parentId: number,
  newTask: SubTaskItem
): boolean => {
  if (!items) return false;

  for (const item of items) {
    if (item.id === parentId) {
      item.subTasks = item.subTasks ?? [];
      item.subTasks.push(newTask);
      return true;
    }

    if (addSubTaskRecursive(item.subTasks, parentId, newTask)) return true;
  }

  return false;
};

const updateSubTaskTimeRecursive = (
  items: SubTaskItem[] | undefined,
  taskId: number,
  hoursToAdd: number
): boolean => {
  if (!items) return false;

  for (const item of items) {
    if (item.id === taskId) {
      item.timeHours = Math.round(((item.timeHours ?? 0) + hoursToAdd) * 10) / 10;
      item.lastUpdatedAt = new Date().toISOString();
      return true;
    }

    if (updateSubTaskTimeRecursive(item.subTasks, taskId, hoursToAdd)) return true;
  }

  return false;
};

export const addTaskTime = (taskId: number, hoursToAdd: number): boolean => {
  if (hoursToAdd <= 0) return false;

  for (const userStory of DUMMY_TASKS) {
    if (updateSubTaskTimeRecursive(userStory.subTasks, taskId, hoursToAdd)) {
      return true;
    }
  }

  return false;
};

export const addTaskUnderParent = (
  parentId: number,
  payload: Pick<SubTaskItem, 'subject' | 'assignee' | 'priority' | 'timeHours' | 'description'>
): SubTaskItem | null => {
  const subject = payload.subject.trim();
  const parent = findTaskById(parentId);
  const description =
    payload.description?.trim() ||
    buildDescription(subject, parent?.type === 'SUB_TASK' ? parent.parentTask?.subject ?? parent.subject : parent?.subject);

  const newTask: SubTaskItem = {
    id: Date.now(),
    subject,
    assignee: payload.assignee,
    priority: payload.priority,
    timeHours: payload.timeHours && payload.timeHours > 0 ? payload.timeHours : undefined,
    description,
    createdBy: payload.assignee,
    lastUpdatedAt: new Date().toISOString(),
  };

  for (const userStory of DUMMY_TASKS) {
    if (userStory.id === parentId) {
      userStory.subTasks = userStory.subTasks ?? [];
      userStory.subTasks.push(newTask);
      return newTask;
    }

    if (addSubTaskRecursive(userStory.subTasks, parentId, newTask)) {
      return newTask;
    }
  }

  return null;
};

export const findTaskById = (taskId: string | number): TaskDetail | null => {
  const id = Number(taskId);
  if (Number.isNaN(id)) return null;

  for (const task of DUMMY_TASKS) {
    if (task.id === id) {
      const audit = resolveTaskAuditFields(task.id, task);
      return {
        ...task,
        ...audit,
        progress: task.progress ?? getTaskProgress(task.status, task.id),
        description: task.description ?? buildDescription(task.subject),
        subTasks: task.subTasks,
      };
    }

    const match = findSubTaskById(task.subTasks, id, task);
    if (match) {
      const { subTask, parent, parentSubTask } = match;
      const directParent: Pick<TaskItem, 'id' | 'subject' | 'type'> = parentSubTask
        ? { id: parentSubTask.id, subject: parentSubTask.subject, type: 'SUB_TASK' }
        : { id: parent.id, subject: parent.subject, type: parent.type };

      const audit = resolveTaskAuditFields(subTask.id, subTask);

      return {
        id: subTask.id,
        type: 'SUB_TASK',
        subject: subTask.subject,
        status: parent.status,
        assignee: subTask.assignee,
        priority: subTask.priority,
        progress: subTask.progress ?? getTaskProgress(parent.status, subTask.id),
        timeHours: subTask.timeHours,
        ...audit,
        description: subTask.description ?? buildDescription(subTask.subject, directParent.subject),
        subTasks: subTask.subTasks,
        parentTask: directParent,
      };
    }
  }

  return null;
};

export type TaskNavigationState = {
  task?: TaskDetail;
};

export type UpdateTaskPayload = {
  subject: string;
  assignee: string;
  priority: TaskPriority;
  timeHours?: number;
  progress?: number;
  description?: string;
};

const findSubTaskParentId = (
  items: SubTaskItem[] | undefined,
  taskId: number,
  parentId: number
): number | null => {
  if (!items) return null;

  for (const item of items) {
    if (item.id === taskId) return parentId;

    const nested = findSubTaskParentId(item.subTasks, taskId, item.id);
    if (nested != null) return nested;
  }

  return null;
};

const updateSubTaskRecursive = (
  items: SubTaskItem[] | undefined,
  taskId: number,
  payload: UpdateTaskPayload
): boolean => {
  if (!items) return false;

  for (const item of items) {
    if (item.id === taskId) {
      item.subject = payload.subject.trim();
      item.assignee = payload.assignee;
      item.priority = payload.priority;
      item.timeHours = payload.timeHours && payload.timeHours > 0 ? payload.timeHours : undefined;
      if (payload.progress != null) item.progress = payload.progress;
      if (payload.description != null) item.description = payload.description.trim();
      item.lastUpdatedAt = new Date().toISOString();
      return true;
    }

    if (updateSubTaskRecursive(item.subTasks, taskId, payload)) return true;
  }

  return false;
};

const deleteSubTaskRecursive = (items: SubTaskItem[] | undefined, taskId: number): boolean => {
  if (!items) return false;

  const index = items.findIndex((item) => item.id === taskId);
  if (index >= 0) {
    items.splice(index, 1);
    return true;
  }

  for (const item of items) {
    if (deleteSubTaskRecursive(item.subTasks, taskId)) return true;
  }

  return false;
};

export const updateTask = (taskId: number, payload: UpdateTaskPayload): boolean => {
  if (!payload.subject.trim()) return false;

  for (const userStory of DUMMY_TASKS) {
    if (updateSubTaskRecursive(userStory.subTasks, taskId, payload)) {
      return true;
    }
  }

  return false;
};

export const deleteTask = (taskId: number): { success: boolean; redirectToId?: number } => {
  for (const userStory of DUMMY_TASKS) {
    const parentId = findSubTaskParentId(userStory.subTasks, taskId, userStory.id);
    if (parentId == null) continue;

    if (deleteSubTaskRecursive(userStory.subTasks, taskId)) {
      return { success: true, redirectToId: parentId };
    }

    return { success: false };
  }

  return { success: false };
};

export const countNestedSubTasks = (items: SubTaskItem[] | undefined): number => {
  if (!items?.length) return 0;
  return items.reduce((sum, item) => sum + 1 + countNestedSubTasks(item.subTasks), 0);
};

export const collectExpandableSubTaskIds = (items: SubTaskItem[] | undefined): number[] => {
  const ids: number[] = [];

  const walk = (list: SubTaskItem[] | undefined) => {
    for (const item of list ?? []) {
      if (item.subTasks?.length) {
        ids.push(item.id);
        walk(item.subTasks);
      }
    }
  };

  walk(items);
  return ids;
};
