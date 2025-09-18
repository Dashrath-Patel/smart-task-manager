# Smart Task Manager

A modern, full-stack task management application built with Next.js, React, TypeScript, and MongoDB. Features a comprehensive RESTful API and an intuitive React component system with drag-and-drop functionality.

## Features

### 🎯 Task Management
- **CRUD Operations**: Create, read, update, and delete tasks
- **Task Properties**: Title, description, status (pending, in_progress, completed), user assignment
- **Optimistic UI Updates**: Instant feedback with automatic rollback on errors
- **Inline Editing**: Edit tasks directly in the list view

### 🔍 Search & Filtering
- **Real-time Search**: Search tasks by title and description with debounced input
- **Advanced Filters**: Filter by status, user, date range, and more
- **Quick Filters**: One-click status filtering buttons
- **Sorting Options**: Sort by date, title, or status in ascending/descending order

### 🎨 User Interface
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Drag & Drop**: Reorder tasks with @dnd-kit library
- **View Modes**: Switch between list view and grouped (Kanban-style) view
- **Loading States**: Skeleton loaders and loading indicators
- **Error Handling**: User-friendly error messages and recovery

### 🚀 Technical Features
- **RESTful API**: Complete API with validation, error handling, and proper HTTP status codes
- **TypeScript**: Full type safety throughout the application
- **State Management**: React Context with useReducer for complex state logic
- **Form Validation**: Client-side validation with error messages
- **Database**: MongoDB with Mongoose ODM

## Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB (local or cloud)
- npm or yarn

### Installation

1. **Clone and install dependencies:**
```bash
git clone <repository-url>
cd smart-task-manager
npm install
```

2. **Set up environment variables:**
```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```env
MONGODB_URI=mongodb://localhost:27017/smart-task-manager
NODE_ENV=development
```

3. **Start the development server:**

```bash
npm run dev
```bash
npm run dev
```

4. **Open your browser:**

```
http://localhost:3000
```

## Usage

Visit the homepage at `http://localhost:3000` for an overview, then go to `/tasks` to start managing tasks.

### API Testing

Use the included test script:

```bash
node test-api.js
```

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/tasks/         # API routes
│   ├── tasks/             # Tasks page
│   └── page.tsx           # Homepage
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── TaskManager.tsx   # Main task management component
│   ├── TaskList.tsx      # Task list with drag-and-drop
│   ├── TaskItem.tsx      # Individual task component
│   ├── TaskCreateForm.tsx # Task creation forms
│   └── TaskSearchAndFilter.tsx # Search and filtering
├── contexts/             # React contexts
│   └── TaskContext.tsx   # Task state management
├── lib/                  # Utility libraries
│   ├── database.ts       # MongoDB connection
│   ├── errors.ts         # Error handling utilities
│   └── validation.ts     # Validation functions
├── models/               # Database models
│   └── Task.ts          # Task model/schema
└── types/                # TypeScript type definitions
    └── api.ts           # API response types
```

## Features

- ✅ **Complete CRUD API** with validation and error handling
- ✅ **React Components** with drag-and-drop functionality  
- ✅ **Search & Filter** capabilities with real-time updates
- ✅ **Optimistic UI Updates** for better user experience
- ✅ **Responsive Design** using Tailwind CSS
- ✅ **TypeScript** throughout for type safety
- ✅ **State Management** with React Context and useReducer

## API Endpoints

- `POST /api/tasks` - Create a new task
- `GET /api/tasks` - Retrieve all tasks (with filtering)
- `GET /api/tasks/:id` - Retrieve a specific task
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for detailed API documentation.

## License

MIT
