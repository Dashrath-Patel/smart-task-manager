'use client';

import { TaskProvider } from '@/contexts/TaskContext';
import { TaskManager } from '@/components/TaskManager';

export default function TasksPage() {
  return (
    <TaskProvider>
      <div className="min-h-screen bg-gray-50">
        <TaskManager initialUserId="demo-user-123" />
      </div>
    </TaskProvider>
  );
}