
export type Role = 'Admin' | 'Employee';
export type Priority = 'Low' | 'Medium' | 'High';
export type Status = 'Pending' | 'InProgress' | 'Completed';

export interface AuthUser {
  token: string;
  userId: number;
  fullName: string;
  email: string;
  role: Role;
}

export interface TaskItem {
  id: number;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  startDate: string;
  dueDate: string;
  assignedToUserId: number;
  assignedToName: string;
  attachmentPath?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Employee {
  id: number;
  fullName: string;
  email: string;
  role: Role;
  department: string;
  designation: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AppNotification {
  id: number;
  message: string;
  type: string;
  taskId?: number | null;
  isRead: boolean;
  createdAt: string;
}
