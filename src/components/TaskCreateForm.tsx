'use client';

import React, { useState } from 'react';
import { TaskStatus, CreateTaskRequest } from '@/types/api';
import { useTaskContext } from '@/contexts/TaskContext';
import { Button, Input, Textarea, Select, Modal } from '@/components/ui';

interface TaskCreateFormProps {
  isOpen: boolean;
  onClose: () => void;
  initialUserId?: string;
}

export function TaskCreateForm({ isOpen, onClose, initialUserId = 'current-user' }: TaskCreateFormProps) {
  const { actions } = useTaskContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateTaskRequest>({
    title: '',
    description: '',
    status: TaskStatus.PENDING,
    userId: initialUserId,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Title must be less than 200 characters';
    }

    if (!formData.userId.trim()) {
      newErrors.userId = 'User ID is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof CreateTaskRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      status: TaskStatus.PENDING,
      userId: initialUserId,
    });
    setErrors({});
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      await actions.createTask(formData);
      handleClose();
    } catch (error) {
      console.error('Failed to create task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusOptions = [
    { value: TaskStatus.PENDING, label: 'Pending' },
    { value: TaskStatus.IN_PROGRESS, label: 'In Progress' },
    { value: TaskStatus.COMPLETED, label: 'Completed' },
  ];

  const remainingChars = 200 - formData.title.length;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New Task" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Title"
          placeholder="Enter task title..."
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          error={errors.title}
          helperText={`${remainingChars} characters remaining`}
        />

        <Textarea
          label="Description"
          placeholder="Enter task description..."
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          rows={4}
          error={errors.description}
          helperText="Optional: Provide more details about this task"
        />

        <Select
          label="Status"
          options={statusOptions}
          value={formData.status}
          onChange={(e) => handleInputChange('status', e.target.value as TaskStatus)}
          error={errors.status}
        />

        <Input
          label="User ID"
          placeholder="Enter user ID..."
          value={formData.userId}
          onChange={(e) => handleInputChange('userId', e.target.value)}
          error={errors.userId}
          helperText="The user responsible for this task"
        />

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            Create Task
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// Quick task creation component (without modal)
interface QuickTaskFormProps {
  onTaskCreated?: () => void;
  initialUserId?: string;
}

export function QuickTaskForm({ onTaskCreated, initialUserId = 'current-user' }: QuickTaskFormProps) {
  const { actions } = useTaskContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateTaskRequest>({
    title: '',
    description: '',
    status: TaskStatus.PENDING,
    userId: initialUserId,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Title must be less than 200 characters';
    }

    if (!formData.userId.trim()) {
      newErrors.userId = 'User ID is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof CreateTaskRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      await actions.createTask(formData);
      setFormData({
        title: '',
        description: '',
        status: TaskStatus.PENDING,
        userId: initialUserId,
      });
      setErrors({});
      onTaskCreated?.();
    } catch (error) {
      console.error('Failed to create task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Quick Add Task</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Title"
            placeholder="What needs to be done?"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            error={errors.title}
          />
          
          <Select
            label="Status"
            options={[
              { value: TaskStatus.PENDING, label: 'Pending' },
              { value: TaskStatus.IN_PROGRESS, label: 'In Progress' },
              { value: TaskStatus.COMPLETED, label: 'Completed' },
            ]}
            value={formData.status}
            onChange={(e) => handleInputChange('status', e.target.value as TaskStatus)}
            error={errors.status}
          />
        </div>

        <Textarea
          label="Description (Optional)"
          placeholder="Add more details..."
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          rows={2}
          error={errors.description}
        />

        <div className="flex justify-end">
          <Button
            type="submit"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            Add Task
          </Button>
        </div>
      </form>
    </div>
  );
}