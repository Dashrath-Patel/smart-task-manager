import { TaskStatus } from '@/models/Task';

export interface ValidationError {
  field: string;
  message: string;
}

export interface TaskValidationData {
  title?: string;
  description?: string;
  status?: string;
  userId?: string;
}

export class ValidationResult {
  public errors: ValidationError[] = [];
  public isValid: boolean = true;

  addError(field: string, message: string) {
    this.errors.push({ field, message });
    this.isValid = false;
  }

  getErrorMessage(): string {
    return this.errors.map(err => `${err.field}: ${err.message}`).join(', ');
  }
}

export function validateTaskData(data: TaskValidationData, isUpdate: boolean = false): ValidationResult {
  const result = new ValidationResult();

  // Title validation
  if (!isUpdate || data.title !== undefined) {
    if (!data.title || typeof data.title !== 'string') {
      result.addError('title', 'Title is required and must be a string');
    } else if (data.title.trim().length === 0) {
      result.addError('title', 'Title cannot be empty');
    } else if (data.title.length > 200) {
      result.addError('title', 'Title cannot exceed 200 characters');
    }
  }

  // Description validation (optional)
  if (data.description !== undefined) {
    if (typeof data.description !== 'string') {
      result.addError('description', 'Description must be a string');
    }
  }

  // Status validation
  if (data.status !== undefined) {
    const validStatuses = Object.values(TaskStatus);
    if (!validStatuses.includes(data.status as TaskStatus)) {
      result.addError('status', `Status must be one of: ${validStatuses.join(', ')}`);
    }
  }

  // User ID validation (required for creation)
  if (!isUpdate || data.userId !== undefined) {
    if (!data.userId || typeof data.userId !== 'string') {
      result.addError('userId', 'User ID is required and must be a string');
    } else if (data.userId.trim().length === 0) {
      result.addError('userId', 'User ID cannot be empty');
    }
  }

  return result;
}

export function validateUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

export function validateQueryParameters(query: any): ValidationResult {
  const result = new ValidationResult();

  // Status filter validation
  if (query.status && !Object.values(TaskStatus).includes(query.status)) {
    result.addError('status', `Status filter must be one of: ${Object.values(TaskStatus).join(', ')}`);
  }

  // User ID filter validation
  if (query.userId && typeof query.userId !== 'string') {
    result.addError('userId', 'User ID filter must be a string');
  }

  // Limit validation
  if (query.limit) {
    const limit = parseInt(query.limit);
    if (isNaN(limit) || limit < 1 || limit > 100) {
      result.addError('limit', 'Limit must be a number between 1 and 100');
    }
  }

  // Skip validation
  if (query.skip) {
    const skip = parseInt(query.skip);
    if (isNaN(skip) || skip < 0) {
      result.addError('skip', 'Skip must be a non-negative number');
    }
  }

  // Sort validation
  if (query.sort) {
    const validSortFields = ['title', 'status', 'createdAt', 'updatedAt'];
    const sortParts = query.sort.split(',');
    
    for (const sortPart of sortParts) {
      const [field, order] = sortPart.trim().split(':');
      
      if (!validSortFields.includes(field)) {
        result.addError('sort', `Sort field '${field}' is not valid. Valid fields: ${validSortFields.join(', ')}`);
      }
      
      if (order && !['asc', 'desc'].includes(order)) {
        result.addError('sort', `Sort order '${order}' is not valid. Use 'asc' or 'desc'`);
      }
    }
  }

  return result;
}