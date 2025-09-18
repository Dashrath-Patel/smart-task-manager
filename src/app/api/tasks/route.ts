import { NextRequest } from 'next/server';
import connectDB from '@/lib/database';
import Task, { TaskStatus } from '@/models/Task';
import { validateTaskData, validateQueryParameters } from '@/lib/validation';
import { 
  handleAsyncRoute, 
  createSuccessResponse, 
  ValidationError,
  DatabaseError 
} from '@/lib/errors';

// GET /api/tasks - Retrieve all tasks with filtering options
async function GET(request: NextRequest) {
  await connectDB();

  const { searchParams } = new URL(request.url);
  const queryParams = Object.fromEntries(searchParams.entries());

  // Validate query parameters
  const queryValidation = validateQueryParameters(queryParams);
  if (!queryValidation.isValid) {
    throw new ValidationError(queryValidation.getErrorMessage());
  }

  try {
    // Build filter object
    const filter: any = {};
    
    if (queryParams.status) {
      filter.status = queryParams.status;
    }
    
    if (queryParams.userId) {
      filter.userId = queryParams.userId;
    }

    // Handle date range filtering
    if (queryParams.startDate || queryParams.endDate) {
      filter.createdAt = {};
      if (queryParams.startDate) {
        filter.createdAt.$gte = new Date(queryParams.startDate);
      }
      if (queryParams.endDate) {
        filter.createdAt.$lte = new Date(queryParams.endDate);
      }
    }

    // Build sort object
    let sort: any = { createdAt: -1 }; // Default sort by newest first
    if (queryParams.sort) {
      sort = {};
      const sortParts = queryParams.sort.split(',');
      
      for (const sortPart of sortParts) {
        const [field, order = 'asc'] = sortPart.trim().split(':');
        sort[field] = order === 'desc' ? -1 : 1;
      }
    }

    // Pagination
    const limit = Math.min(parseInt(queryParams.limit) || 10, 100);
    const skip = parseInt(queryParams.skip) || 0;

    // Execute query
    const tasks = await Task.find(filter)
      .sort(sort)
      .limit(limit)
      .skip(skip)
      .lean();

    // Get total count for pagination metadata
    const totalCount = await Task.countDocuments(filter);
    const hasMore = skip + limit < totalCount;

    const response = {
      tasks,
      pagination: {
        total: totalCount,
        limit,
        skip,
        hasMore,
        page: Math.floor(skip / limit) + 1,
        totalPages: Math.ceil(totalCount / limit)
      },
      filters: {
        status: queryParams.status || null,
        userId: queryParams.userId || null,
        startDate: queryParams.startDate || null,
        endDate: queryParams.endDate || null
      }
    };

    return createSuccessResponse(response);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw new DatabaseError('Failed to fetch tasks');
  }
}

// POST /api/tasks - Create a new task
async function POST(request: NextRequest) {
  await connectDB();

  try {
    const body = await request.json();
    
    // Validate the request body
    const validation = validateTaskData(body, false);
    if (!validation.isValid) {
      throw new ValidationError(validation.getErrorMessage());
    }

    // Create new task
    const taskData = {
      title: body.title.trim(),
      description: body.description?.trim() || '',
      status: body.status || TaskStatus.PENDING,
      userId: body.userId.trim()
    };

    const task = new Task(taskData);
    await task.save();

    return createSuccessResponse(task.toJSON(), 201, 'Task created successfully');
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    
    console.error('Error creating task:', error);
    throw new DatabaseError('Failed to create task');
  }
}

export const GET_HANDLER = handleAsyncRoute(GET);
export const POST_HANDLER = handleAsyncRoute(POST);

export { GET_HANDLER as GET, POST_HANDLER as POST };