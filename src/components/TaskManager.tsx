'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTaskContext } from '@/contexts/TaskContext';
import { TaskCreateForm, QuickTaskForm } from './TaskCreateForm';
import { TaskList, GroupedTaskList } from './TaskList';
import { TaskSearchAndFilter, QuickFilters, TaskFilters } from './TaskSearchAndFilter';
import { Button } from '@/components/ui';
import { 
  PlusIcon, 
  ViewColumnsIcon, 
  ListBulletIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { Task, TaskStatus } from '@/types/api';

interface TaskManagerProps {
  initialUserId?: string;
  className?: string;
}

export function TaskManager({ initialUserId = 'current-user', className = '' }: TaskManagerProps) {
  const { state, actions } = useTaskContext();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grouped'>('list');
  const [filters, setFilters] = useState<TaskFilters>({
    search: '',
    status: '',
    userId: '',
    startDate: '',
    endDate: '',
    sortBy: 'created_at',
    sortOrder: 'desc',
  });

  // Filter and sort tasks
  const filteredTasks = useMemo(() => {
    let filtered = [...state.tasks];

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchLower) ||
        task.description?.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (filters.status) {
      filtered = filtered.filter(task => task.status === filters.status);
    }

    // Apply user filter
    if (filters.userId) {
      filtered = filtered.filter(task => 
        task.userId.toLowerCase().includes(filters.userId.toLowerCase())
      );
    }

    // Apply date range filter
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      filtered = filtered.filter(task => new Date(task.created_at) >= startDate);
    }

    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999); // End of day
      filtered = filtered.filter(task => new Date(task.created_at) <= endDate);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any = a[filters.sortBy as keyof Task];
      let bValue: any = b[filters.sortBy as keyof Task];

      // Handle different data types
      if (filters.sortBy === 'created_at' || filters.sortBy === 'updated_at') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) {
        return filters.sortOrder === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return filters.sortOrder === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return filtered;
  }, [state.tasks, filters]);

  // Task statistics
  const taskStats = useMemo(() => {
    const stats = {
      total: filteredTasks.length,
      pending: 0,
      inProgress: 0,
      completed: 0,
    };

    filteredTasks.forEach(task => {
      switch (task.status) {
        case TaskStatus.PENDING:
          stats.pending++;
          break;
        case TaskStatus.IN_PROGRESS:
          stats.inProgress++;
          break;
        case TaskStatus.COMPLETED:
          stats.completed++;
          break;
      }
    });

    return stats;
  }, [filteredTasks]);

  // Fetch tasks on component mount
  useEffect(() => {
    actions.fetchTasks();
  }, [actions]);

  // Handle filter changes
  const handleFiltersChange = useCallback((newFilters: TaskFilters) => {
    setFilters(newFilters);
  }, []);

  const handleQuickFilterChange = useCallback((quickFilters: Partial<TaskFilters>) => {
    setFilters(prev => ({ ...prev, ...quickFilters }));
  }, []);

  const handleRefresh = () => {
    actions.fetchTasks(filters);
  };

  return (
    <div className={`max-w-7xl mx-auto p-6 space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Task Manager</h1>
          <p className="mt-1 text-gray-600">
            Organize and track your tasks efficiently
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            onClick={handleRefresh}
            disabled={state.loading}
            className="flex items-center space-x-2"
          >
            <ArrowPathIcon className={`h-4 w-4 ${state.loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
          
          <Button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Add Task</span>
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {state.error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
            <span className="text-red-800">{state.error}</span>
          </div>
        </div>
      )}

      {/* Task Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-900">{taskStats.total}</div>
          <div className="text-sm text-gray-600">Total Tasks</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-yellow-600">{taskStats.pending}</div>
          <div className="text-sm text-gray-600">Pending</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-blue-600">{taskStats.inProgress}</div>
          <div className="text-sm text-gray-600">In Progress</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-green-600">{taskStats.completed}</div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
      </div>

      {/* Quick Task Form */}
      <QuickTaskForm
        initialUserId={initialUserId}
        onTaskCreated={() => actions.fetchTasks()}
      />

      {/* Search and Filters */}
      <TaskSearchAndFilter
        onFiltersChange={handleFiltersChange}
        loading={state.loading}
      />

      {/* Quick Filters */}
      <QuickFilters
        onFilterChange={handleQuickFilterChange}
        currentFilters={filters}
      />

      {/* View Mode Toggle */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Showing {filteredTasks.length} of {state.tasks.length} tasks
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">View:</span>
          <Button
            variant={viewMode === 'list' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="flex items-center space-x-1"
          >
            <ListBulletIcon className="h-4 w-4" />
            <span>List</span>
          </Button>
          <Button
            variant={viewMode === 'grouped' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grouped')}
            className="flex items-center space-x-1"
          >
            <ViewColumnsIcon className="h-4 w-4" />
            <span>Grouped</span>
          </Button>
        </div>
      </div>

      {/* Task List */}
      {viewMode === 'list' ? (
        <TaskList 
          tasks={filteredTasks} 
          loading={state.loading}
          emptyMessage="No tasks match your current filters."
        />
      ) : (
        <GroupedTaskList 
          tasks={filteredTasks} 
          loading={state.loading}
          groupByStatus={true}
        />
      )}

      {/* Create Task Modal */}
      <TaskCreateForm
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        initialUserId={initialUserId}
      />
    </div>
  );
}