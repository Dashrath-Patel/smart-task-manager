// API Response Types
export interface APIResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

export interface APIError {
  error: {
    message: string;
    code?: string;
    statusCode: number;
    timestamp: string;
  };
}

// Task Types
export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed'
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  userId: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  status?: TaskStatus;
  userId: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: TaskStatus;
}

// Query Parameters
export interface TaskQueryParams {
  status?: TaskStatus;
  userId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  skip?: number;
  sort?: string;
}

// Pagination
export interface PaginationInfo {
  total: number;
  limit: number;
  skip: number;
  hasMore: boolean;
  page: number;
  totalPages: number;
}

export interface TaskFilters {
  status: TaskStatus | null;
  userId: string | null;
  startDate: string | null;
  endDate: string | null;
}

export interface TaskListResponse {
  tasks: Task[];
  pagination: PaginationInfo;
  filters: TaskFilters;
}

// Validation Types
export interface ValidationError {
  field: string;
  message: string;
}