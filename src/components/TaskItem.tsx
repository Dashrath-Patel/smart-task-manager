'use client';

import React, { useState } from 'react';
import { Task, TaskStatus, UpdateTaskRequest } from '@/types/api';
import { useTaskContext } from '@/contexts/TaskContext';
import { Button, Input, Textarea, Select } from '@/components/ui';
import { PencilIcon, TrashIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface TaskItemProps {
  task: Task;
  isOptimistic?: boolean;
}

export function TaskItem({ task, isOptimistic = false }: TaskItemProps) {
  const { actions } = useTaskContext();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editData, setEditData] = useState<UpdateTaskRequest>({
    title: task.title,
    description: task.description,
    status: task.status,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const statusOptions = [
    { value: TaskStatus.PENDING, label: 'Pending' },
    { value: TaskStatus.IN_PROGRESS, label: 'In Progress' },
    { value: TaskStatus.COMPLETED, label: 'Completed' },
  ];

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case TaskStatus.IN_PROGRESS:
        return 'bg-blue-100 text-blue-800';
      case TaskStatus.COMPLETED:
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const validateEdit = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!editData.title?.trim()) {
      newErrors.title = 'Title is required';
    } else if (editData.title.length > 200) {
      newErrors.title = 'Title must be less than 200 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditData({
      title: task.title,
      description: task.description,
      status: task.status,
    });
    setErrors({});
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData({
      title: task.title,
      description: task.description,
      status: task.status,
    });
    setErrors({});
  };

  const handleSaveEdit = async () => {
    if (!validateEdit()) {
      return;
    }

    try {
      await actions.updateTask(task.id, editData);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      setIsDeleting(true);
      await actions.deleteTask(task.id);
    } catch (error) {
      console.error('Failed to delete task:', error);
      setIsDeleting(false);
    }
  };

  const handleQuickStatusChange = async (newStatus: TaskStatus) => {
    if (newStatus === task.status) return;
    
    try {
      await actions.updateTask(task.id, { status: newStatus });
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div
      className={`
        bg-white rounded-lg border border-gray-200 p-4 space-y-3 transition-all duration-200
        ${isOptimistic ? 'opacity-60' : 'opacity-100'}
        ${isDeleting ? 'opacity-50 pointer-events-none' : ''}
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <Input
              value={editData.title || ''}
              onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
              error={errors.title}
              placeholder="Task title..."
              className="text-lg font-medium"
            />
          ) : (
            <h3 className="text-lg font-medium text-gray-900 truncate">
              {task.title}
            </h3>
          )}
        </div>

        <div className="flex items-center space-x-2 ml-4">
          {/* Status Badge */}
          {!isEditing && (
            <span
              className={`
                inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                ${getStatusColor(task.status)}
              `}
            >
              {statusOptions.find(option => option.value === task.status)?.label}
            </span>
          )}

          {/* Action Buttons */}
          {isEditing ? (
            <div className="flex space-x-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleSaveEdit}
                disabled={!!errors.title}
              >
                <CheckIcon className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCancelEdit}
              >
                <XMarkIcon className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex space-x-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleEdit}
                disabled={isOptimistic}
              >
                <PencilIcon className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDelete}
                disabled={isOptimistic || isDeleting}
                className="text-red-600 hover:text-red-700"
              >
                <TrashIcon className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      {(task.description || isEditing) && (
        <div>
          {isEditing ? (
            <Textarea
              value={editData.description || ''}
              onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Task description..."
              rows={3}
            />
          ) : (
            <p className="text-gray-600 text-sm whitespace-pre-wrap">
              {task.description}
            </p>
          )}
        </div>
      )}

      {/* Status and Controls */}
      {isEditing && (
        <div className="space-y-3">
          <Select
            label="Status"
            options={statusOptions}
            value={editData.status || TaskStatus.PENDING}
            onChange={(e) => setEditData(prev => ({ ...prev, status: e.target.value as TaskStatus }))}
          />
        </div>
      )}

      {/* Quick Status Change (when not editing) */}
      {!isEditing && (
        <div className="flex flex-wrap gap-2">
          {statusOptions
            .filter(option => option.value !== task.status)
            .map(option => (
              <Button
                key={option.value}
                size="sm"
                variant="ghost"
                onClick={() => handleQuickStatusChange(option.value as TaskStatus)}
                disabled={isOptimistic}
                className="text-xs"
              >
                Mark as {option.label}
              </Button>
            ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-100 pt-3">
        <div>
          <span>User: {task.userId}</span>
        </div>
        <div className="text-right">
          <div>Created: {formatDate(task.created_at)}</div>
          {task.updated_at !== task.created_at && (
            <div>Updated: {formatDate(task.updated_at)}</div>
          )}
        </div>
      </div>
    </div>
  );
}