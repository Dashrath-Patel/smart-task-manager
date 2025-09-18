'use client';

import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { Task, TaskStatus, CreateTaskRequest, UpdateTaskRequest } from '@/types/api';

// Task Actions
type TaskAction =
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: { id: string; updates: Partial<Task> } }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'OPTIMISTIC_ADD'; payload: { tempId: string; task: Omit<Task, 'id' | 'created_at' | 'updated_at'> } }
  | { type: 'OPTIMISTIC_UPDATE'; payload: { id: string; updates: Partial<Task> } }
  | { type: 'OPTIMISTIC_DELETE'; payload: string }
  | { type: 'REVERT_OPTIMISTIC'; payload: string }
  | { type: 'REORDER_TASKS'; payload: Task[] };

// State interface
interface TaskState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  optimisticOperations: Map<string, { type: 'add' | 'update' | 'delete'; originalTask?: Task }>;
}

// Context interface
interface TaskContextType {
  state: TaskState;
  actions: {
    fetchTasks: (filters?: Record<string, any>) => Promise<void>;
    createTask: (task: CreateTaskRequest) => Promise<void>;
    updateTask: (id: string, updates: UpdateTaskRequest) => Promise<void>;
    deleteTask: (id: string) => Promise<void>;
    reorderTasks: (tasks: Task[]) => void;
  };
}

// Initial state
const initialState: TaskState = {
  tasks: [],
  loading: false,
  error: null,
  optimisticOperations: new Map(),
};

// Reducer function
function taskReducer(state: TaskState, action: TaskAction): TaskState {
  switch (action.type) {
    case 'SET_TASKS':
      return {
        ...state,
        tasks: action.payload,
        loading: false,
        error: null,
      };

    case 'ADD_TASK':
      // Remove optimistic operation if it exists
      const newOptimisticOps = new Map(state.optimisticOperations);
      const tempId = Array.from(newOptimisticOps.keys()).find(key => 
        newOptimisticOps.get(key)?.type === 'add'
      );
      if (tempId) {
        newOptimisticOps.delete(tempId);
      }
      
      return {
        ...state,
        tasks: [...state.tasks.filter(t => !t.id.startsWith('temp-')), action.payload],
        optimisticOperations: newOptimisticOps,
      };

    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id
            ? { ...task, ...action.payload.updates }
            : task
        ),
      };

    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload),
      };

    case 'OPTIMISTIC_ADD':
      const optimisticTask: Task = {
        id: action.payload.tempId,
        ...action.payload.task,
        created_at: new Date(),
        updated_at: new Date(),
      };
      
      return {
        ...state,
        tasks: [optimisticTask, ...state.tasks],
        optimisticOperations: new Map(state.optimisticOperations).set(action.payload.tempId, {
          type: 'add',
        }),
      };

    case 'OPTIMISTIC_UPDATE':
      const originalTask = state.tasks.find(t => t.id === action.payload.id);
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id
            ? { ...task, ...action.payload.updates, updated_at: new Date() }
            : task
        ),
        optimisticOperations: new Map(state.optimisticOperations).set(action.payload.id, {
          type: 'update',
          originalTask,
        }),
      };

    case 'OPTIMISTIC_DELETE':
      const taskToDelete = state.tasks.find(t => t.id === action.payload);
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload),
        optimisticOperations: new Map(state.optimisticOperations).set(action.payload, {
          type: 'delete',
          originalTask: taskToDelete,
        }),
      };

    case 'REVERT_OPTIMISTIC':
      const operation = state.optimisticOperations.get(action.payload);
      const newOps = new Map(state.optimisticOperations);
      newOps.delete(action.payload);

      if (!operation) return state;

      switch (operation.type) {
        case 'add':
          return {
            ...state,
            tasks: state.tasks.filter(t => t.id !== action.payload),
            optimisticOperations: newOps,
          };
        case 'update':
          return {
            ...state,
            tasks: state.tasks.map(t =>
              t.id === action.payload && operation.originalTask
                ? operation.originalTask
                : t
            ),
            optimisticOperations: newOps,
          };
        case 'delete':
          return {
            ...state,
            tasks: operation.originalTask
              ? [...state.tasks, operation.originalTask]
              : state.tasks,
            optimisticOperations: newOps,
          };
        default:
          return { ...state, optimisticOperations: newOps };
      }

    case 'REORDER_TASKS':
      return {
        ...state,
        tasks: action.payload,
      };

    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false,
      };

    default:
      return state;
  }
}

// Create context
const TaskContext = createContext<TaskContextType | undefined>(undefined);

// Provider component
interface TaskProviderProps {
  children: ReactNode;
}

export function TaskProvider({ children }: TaskProviderProps) {
  const [state, dispatch] = useReducer(taskReducer, initialState);

  // API helper function
  const apiCall = async (url: string, options: RequestInit = {}) => {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'API request failed');
    }

    return response.json();
  };

  // Fetch tasks
  const fetchTasks = useCallback(async (filters: Record<string, any> = {}) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });

      const url = `/api/tasks${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiCall(url);
      
      dispatch({ type: 'SET_TASKS', payload: response.data.tasks });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to fetch tasks' });
    }
  }, []);

  // Create task with optimistic update
  const createTask = useCallback(async (taskData: CreateTaskRequest) => {
    const tempId = `temp-${Date.now()}`;
    
    // Optimistic update
    dispatch({
      type: 'OPTIMISTIC_ADD',
      payload: {
        tempId,
        task: {
          title: taskData.title,
          description: taskData.description || '',
          status: taskData.status || TaskStatus.PENDING,
          userId: taskData.userId,
        },
      },
    });

    try {
      const response = await apiCall('/api/tasks', {
        method: 'POST',
        body: JSON.stringify(taskData),
      });

      // Replace optimistic task with real task
      dispatch({ type: 'ADD_TASK', payload: response.data });
    } catch (error) {
      // Revert optimistic update
      dispatch({ type: 'REVERT_OPTIMISTIC', payload: tempId });
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to create task' });
      throw error;
    }
  }, []);

  // Update task with optimistic update
  const updateTask = useCallback(async (id: string, updates: UpdateTaskRequest) => {
    // Optimistic update
    dispatch({
      type: 'OPTIMISTIC_UPDATE',
      payload: { id, updates },
    });

    try {
      const response = await apiCall(`/api/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });

      // Update with server response
      dispatch({ type: 'UPDATE_TASK', payload: { id, updates: response.data } });
    } catch (error) {
      // Revert optimistic update
      dispatch({ type: 'REVERT_OPTIMISTIC', payload: id });
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to update task' });
      throw error;
    }
  }, []);

  // Delete task with optimistic update
  const deleteTask = useCallback(async (id: string) => {
    // Optimistic update
    dispatch({ type: 'OPTIMISTIC_DELETE', payload: id });

    try {
      await apiCall(`/api/tasks/${id}`, {
        method: 'DELETE',
      });

      // Confirm deletion
      dispatch({ type: 'DELETE_TASK', payload: id });
    } catch (error) {
      // Revert optimistic update
      dispatch({ type: 'REVERT_OPTIMISTIC', payload: id });
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to delete task' });
      throw error;
    }
  }, []);

  // Reorder tasks (for drag and drop)
  const reorderTasks = useCallback((tasks: Task[]) => {
    dispatch({ type: 'REORDER_TASKS', payload: tasks });
  }, []);

  const contextValue: TaskContextType = {
    state,
    actions: {
      fetchTasks,
      createTask,
      updateTask,
      deleteTask,
      reorderTasks,
    },
  };

  return (
    <TaskContext.Provider value={contextValue}>
      {children}
    </TaskContext.Provider>
  );
}

// Custom hook to use the context
export function useTaskContext() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
}