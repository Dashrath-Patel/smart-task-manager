import { NextRequest } from 'next/server';
import connectDB from '@/lib/database';
import Task from '@/models/Task';
import { validateTaskData, validateUUID } from '@/lib/validation';
import { 
  handleAsyncRoute, 
  createSuccessResponse, 
  ValidationError,
  NotFoundError,
  DatabaseError 
} from '@/lib/errors';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/tasks/:id - Retrieve a specific task
async function GET(request: NextRequest, { params }: RouteParams) {
  await connectDB();

  const { id } = params;

  // Validate UUID format
  if (!validateUUID(id)) {
    throw new ValidationError('Invalid task ID format');
  }

  try {
    const task = await Task.findOne({ id }).lean();
    
    if (!task) {
      throw new NotFoundError('Task');
    }

    return createSuccessResponse(task);
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof ValidationError) {
      throw error;
    }
    
    console.error('Error fetching task:', error);
    throw new DatabaseError('Failed to fetch task');
  }
}

// PUT /api/tasks/:id - Update a task
async function PUT(request: NextRequest, { params }: RouteParams) {
  await connectDB();

  const { id } = params;

  // Validate UUID format
  if (!validateUUID(id)) {
    throw new ValidationError('Invalid task ID format');
  }

  try {
    const body = await request.json();
    
    // Validate the request body for updates
    const validation = validateTaskData(body, true);
    if (!validation.isValid) {
      throw new ValidationError(validation.getErrorMessage());
    }

    // Build update object with only provided fields
    const updateData: any = {};
    
    if (body.title !== undefined) {
      updateData.title = body.title.trim();
    }
    
    if (body.description !== undefined) {
      updateData.description = body.description.trim();
    }
    
    if (body.status !== undefined) {
      updateData.status = body.status;
    }

    // Find and update the task
    const task = await Task.findOneAndUpdate(
      { id },
      updateData,
      { 
        new: true, 
        runValidators: true 
      }
    );

    if (!task) {
      throw new NotFoundError('Task');
    }

    return createSuccessResponse(task.toJSON(), 200, 'Task updated successfully');
  } catch (error) {
    if (error instanceof ValidationError || error instanceof NotFoundError) {
      throw error;
    }
    
    console.error('Error updating task:', error);
    throw new DatabaseError('Failed to update task');
  }
}

// DELETE /api/tasks/:id - Delete a task
async function DELETE(request: NextRequest, { params }: RouteParams) {
  await connectDB();

  const { id } = params;

  // Validate UUID format
  if (!validateUUID(id)) {
    throw new ValidationError('Invalid task ID format');
  }

  try {
    const task = await Task.findOneAndDelete({ id });
    
    if (!task) {
      throw new NotFoundError('Task');
    }

    return createSuccessResponse(
      { 
        id: task.id, 
        message: 'Task deleted successfully' 
      },
      200,
      'Task deleted successfully'
    );
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof ValidationError) {
      throw error;
    }
    
    console.error('Error deleting task:', error);
    throw new DatabaseError('Failed to delete task');
  }
}

export const GET_HANDLER = handleAsyncRoute(GET);
export const PUT_HANDLER = handleAsyncRoute(PUT);
export const DELETE_HANDLER = handleAsyncRoute(DELETE);

export { GET_HANDLER as GET, PUT_HANDLER as PUT, DELETE_HANDLER as DELETE };