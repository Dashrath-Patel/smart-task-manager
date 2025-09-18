'use client';

import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '@/types/api';
import { useTaskContext } from '@/contexts/TaskContext';
import { TaskItem } from './TaskItem';

// Sortable wrapper for TaskItem
interface SortableTaskItemProps {
  task: Task;
  isOptimistic?: boolean;
}

function SortableTaskItem({ task, isOptimistic }: SortableTaskItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-grab active:cursor-grabbing"
    >
      <TaskItem task={task} isOptimistic={isOptimistic} />
    </div>
  );
}

interface TaskListProps {
  tasks: Task[];
  loading?: boolean;
  emptyMessage?: string;
}

export function TaskList({ tasks, loading = false, emptyMessage = 'No tasks found.' }: TaskListProps) {
  const { actions, state } = useTaskContext();
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = tasks.findIndex(task => task.id === active.id);
      const newIndex = tasks.findIndex(task => task.id === over?.id);
      
      const newTasks = arrayMove(tasks, oldIndex, newIndex);
      actions.reorderTasks(newTasks);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-20"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              <div className="flex justify-between">
                <div className="h-3 bg-gray-200 rounded w-24"></div>
                <div className="h-3 bg-gray-200 rounded w-32"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto h-12 w-12 text-gray-400">
          <svg
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
            />
          </svg>
        </div>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks</h3>
        <p className="mt-1 text-sm text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={tasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-4">
          {tasks.map((task) => {
            const isOptimistic = state.optimisticOperations.has(task.id);
            return (
              <SortableTaskItem
                key={task.id}
                task={task}
                isOptimistic={isOptimistic}
              />
            );
          })}
        </div>
      </SortableContext>
    </DndContext>
  );
}

// Task list with grouping by status
interface GroupedTaskListProps {
  tasks: Task[];
  loading?: boolean;
  groupByStatus?: boolean;
}

export function GroupedTaskList({ tasks, loading = false, groupByStatus = true }: GroupedTaskListProps) {
  if (!groupByStatus) {
    return <TaskList tasks={tasks} loading={loading} />;
  }

  const groupedTasks = tasks.reduce((groups, task) => {
    const status = task.status;
    if (!groups[status]) {
      groups[status] = [];
    }
    groups[status].push(task);
    return groups;
  }, {} as Record<string, Task[]>);

  const statusOrder = ['pending', 'in_progress', 'completed'];
  const statusLabels = {
    pending: 'Pending',
    in_progress: 'In Progress',
    completed: 'Completed',
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'border-yellow-200 bg-yellow-50';
      case 'in_progress':
        return 'border-blue-200 bg-blue-50';
      case 'completed':
        return 'border-green-200 bg-green-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  if (loading) {
    return <TaskList tasks={[]} loading={loading} />;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {statusOrder.map((status) => {
        const statusTasks = groupedTasks[status] || [];
        return (
          <div
            key={status}
            className={`rounded-lg border-2 border-dashed p-4 ${getStatusColor(status)}`}
          >
            <h3 className="font-medium text-gray-900 mb-4 flex items-center justify-between">
              {statusLabels[status as keyof typeof statusLabels]}
              <span className="bg-white rounded-full px-2 py-1 text-xs text-gray-600">
                {statusTasks.length}
              </span>
            </h3>
            <TaskList
              tasks={statusTasks}
              emptyMessage={`No ${statusLabels[status as keyof typeof statusLabels].toLowerCase()} tasks.`}
            />
          </div>
        );
      })}
    </div>
  );
}