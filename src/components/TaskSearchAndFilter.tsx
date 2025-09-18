'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { TaskStatus } from '@/types/api';
import { Input, Select, Button } from '@/components/ui';
import { MagnifyingGlassIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';

export interface TaskFilters {
  search: string;
  status: TaskStatus | '';
  userId: string;
  startDate: string;
  endDate: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface TaskSearchAndFilterProps {
  onFiltersChange: (filters: TaskFilters) => void;
  loading?: boolean;
  className?: string;
}

export function TaskSearchAndFilter({ 
  onFiltersChange, 
  loading = false, 
  className = '' 
}: TaskSearchAndFilterProps) {
  const [filters, setFilters] = useState<TaskFilters>({
    search: '',
    status: '',
    userId: '',
    startDate: '',
    endDate: '',
    sortBy: 'created_at',
    sortOrder: 'desc',
  });
  
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchInput }));
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Notify parent of filter changes
  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const handleFilterChange = useCallback((key: keyof TaskFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = () => {
    const defaultFilters: TaskFilters = {
      search: '',
      status: '',
      userId: '',
      startDate: '',
      endDate: '',
      sortBy: 'created_at',
      sortOrder: 'desc',
    };
    setFilters(defaultFilters);
    setSearchInput('');
  };

  const hasActiveFilters = () => {
    return filters.search || 
           filters.status || 
           filters.userId || 
           filters.startDate || 
           filters.endDate || 
           filters.sortBy !== 'created_at' || 
           filters.sortOrder !== 'desc';
  };

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: TaskStatus.PENDING, label: 'Pending' },
    { value: TaskStatus.IN_PROGRESS, label: 'In Progress' },
    { value: TaskStatus.COMPLETED, label: 'Completed' },
  ];

  const sortOptions = [
    { value: 'created_at', label: 'Date Created' },
    { value: 'updated_at', label: 'Date Updated' },
    { value: 'title', label: 'Title' },
    { value: 'status', label: 'Status' },
  ];

  const sortOrderOptions = [
    { value: 'desc', label: 'Descending' },
    { value: 'asc', label: 'Ascending' },
  ];

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 space-y-4 ${className}`}>
      {/* Search Bar */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search tasks by title or description..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          disabled={loading}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
        />
      </div>

      {/* Filter Toggle */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsFilterExpanded(!isFilterExpanded)}
          className="flex items-center space-x-2"
        >
          <FunnelIcon className="h-4 w-4" />
          <span>Filters</span>
          {hasActiveFilters() && (
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              Active
            </span>
          )}
        </Button>

        {hasActiveFilters() && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-red-600 hover:text-red-700"
          >
            <XMarkIcon className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      {/* Expanded Filters */}
      {isFilterExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
          {/* Status Filter */}
          <Select
            label="Status"
            options={statusOptions}
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            disabled={loading}
          />

          {/* User ID Filter */}
          <Input
            label="User ID"
            placeholder="Filter by user..."
            value={filters.userId}
            onChange={(e) => handleFilterChange('userId', e.target.value)}
            disabled={loading}
          />

          {/* Date Range */}
          <Input
            label="Start Date"
            type="date"
            value={filters.startDate}
            onChange={(e) => handleFilterChange('startDate', e.target.value)}
            disabled={loading}
          />

          <Input
            label="End Date"
            type="date"
            value={filters.endDate}
            onChange={(e) => handleFilterChange('endDate', e.target.value)}
            disabled={loading}
          />

          {/* Sort Options */}
          <Select
            label="Sort By"
            options={sortOptions}
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            disabled={loading}
          />

          <Select
            label="Sort Order"
            options={sortOrderOptions}
            value={filters.sortOrder}
            onChange={(e) => handleFilterChange('sortOrder', e.target.value as 'asc' | 'desc')}
            disabled={loading}
          />
        </div>
      )}

      {/* Active Filters Summary */}
      {hasActiveFilters() && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200">
          <span className="text-sm text-gray-600">Active filters:</span>
          
          {filters.search && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
              Search: "{filters.search}"
              <button
                onClick={() => {
                  setSearchInput('');
                  handleFilterChange('search', '');
                }}
                className="ml-1 hover:text-blue-900"
              >
                <XMarkIcon className="h-3 w-3" />
              </button>
            </span>
          )}
          
          {filters.status && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
              Status: {statusOptions.find(opt => opt.value === filters.status)?.label}
              <button
                onClick={() => handleFilterChange('status', '')}
                className="ml-1 hover:text-green-900"
              >
                <XMarkIcon className="h-3 w-3" />
              </button>
            </span>
          )}
          
          {filters.userId && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
              User: {filters.userId}
              <button
                onClick={() => handleFilterChange('userId', '')}
                className="ml-1 hover:text-purple-900"
              >
                <XMarkIcon className="h-3 w-3" />
              </button>
            </span>
          )}
          
          {(filters.startDate || filters.endDate) && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
              Date: {filters.startDate || '...'} to {filters.endDate || '...'}
              <button
                onClick={() => {
                  handleFilterChange('startDate', '');
                  handleFilterChange('endDate', '');
                }}
                className="ml-1 hover:text-orange-900"
              >
                <XMarkIcon className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// Quick filter buttons component
interface QuickFiltersProps {
  onFilterChange: (filters: Partial<TaskFilters>) => void;
  currentFilters: TaskFilters;
  className?: string;
}

export function QuickFilters({ onFilterChange, currentFilters, className = '' }: QuickFiltersProps) {
  const quickFilters = [
    {
      label: 'All Tasks',
      filters: { status: '' as const },
      active: !currentFilters.status,
    },
    {
      label: 'Pending',
      filters: { status: TaskStatus.PENDING },
      active: currentFilters.status === TaskStatus.PENDING,
    },
    {
      label: 'In Progress',
      filters: { status: TaskStatus.IN_PROGRESS },
      active: currentFilters.status === TaskStatus.IN_PROGRESS,
    },
    {
      label: 'Completed',
      filters: { status: TaskStatus.COMPLETED },
      active: currentFilters.status === TaskStatus.COMPLETED,
    },
  ];

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {quickFilters.map((filter, index) => (
        <Button
          key={index}
          variant={filter.active ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => onFilterChange(filter.filters)}
        >
          {filter.label}
        </Button>
      ))}
    </div>
  );
}