# Task Management API Documentation

## Overview

RESTful API for managing tasks with full CRUD operations, filtering, and validation.

## Base URL

```
http://localhost:3000/api
```

## Endpoints

### 1. Create a Task

**POST** `/api/tasks`

Creates a new task.

#### Request Body

```json
{
  "title": "Complete project documentation",
  "description": "Write comprehensive API documentation with examples",
  "status": "pending",
  "userId": "user-123"
}
```

#### Response (201 Created)

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Complete project documentation",
    "description": "Write comprehensive API documentation with examples",
    "status": "pending",
    "userId": "user-123",
    "created_at": "2025-09-18T10:00:00.000Z",
    "updated_at": "2025-09-18T10:00:00.000Z"
  },
  "message": "Task created successfully",
  "timestamp": "2025-09-18T10:00:00.000Z"
}
```

### 2. Get All Tasks

**GET** `/api/tasks`

Retrieves all tasks with optional filtering and pagination.

#### Query Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `status` | string | Filter by task status | `?status=pending` |
| `userId` | string | Filter by user ID | `?userId=user-123` |
| `startDate` | string | Filter tasks created after date | `?startDate=2025-01-01` |
| `endDate` | string | Filter tasks created before date | `?endDate=2025-12-31` |
| `limit` | number | Number of results (1-100) | `?limit=20` |
| `skip` | number | Number of results to skip | `?skip=10` |
| `sort` | string | Sort fields and order | `?sort=title:asc,createdAt:desc` |

#### Examples

```bash
# Get all tasks
GET /api/tasks

# Get pending tasks for a specific user
GET /api/tasks?status=pending&userId=user-123

# Get tasks with pagination
GET /api/tasks?limit=10&skip=20

# Get tasks sorted by title ascending, then creation date descending
GET /api/tasks?sort=title:asc,createdAt:desc

# Complex filtering
GET /api/tasks?status=in_progress&startDate=2025-01-01&limit=5
```

#### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "title": "Complete project documentation",
        "description": "Write comprehensive API documentation with examples",
        "status": "pending",
        "userId": "user-123",
        "created_at": "2025-09-18T10:00:00.000Z",
        "updated_at": "2025-09-18T10:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 25,
      "limit": 10,
      "skip": 0,
      "hasMore": true,
      "page": 1,
      "totalPages": 3
    },
    "filters": {
      "status": "pending",
      "userId": "user-123",
      "startDate": null,
      "endDate": null
    }
  },
  "timestamp": "2025-09-18T10:00:00.000Z"
}
```

### 3. Get Task by ID

**GET** `/api/tasks/:id`

Retrieves a specific task by its ID.

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Task UUID |

#### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Complete project documentation",
    "description": "Write comprehensive API documentation with examples",
    "status": "pending",
    "userId": "user-123",
    "created_at": "2025-09-18T10:00:00.000Z",
    "updated_at": "2025-09-18T10:00:00.000Z"
  },
  "timestamp": "2025-09-18T10:00:00.000Z"
}
```

### 4. Update Task

**PUT** `/api/tasks/:id`

Updates an existing task. Only provided fields will be updated.

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Task UUID |

#### Request Body (partial update)

```json
{
  "title": "Updated task title",
  "status": "in_progress"
}
```

#### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Updated task title",
    "description": "Write comprehensive API documentation with examples",
    "status": "in_progress",
    "userId": "user-123",
    "created_at": "2025-09-18T10:00:00.000Z",
    "updated_at": "2025-09-18T10:15:00.000Z"
  },
  "message": "Task updated successfully",
  "timestamp": "2025-09-18T10:15:00.000Z"
}
```

### 5. Delete Task

**DELETE** `/api/tasks/:id`

Deletes a task by its ID.

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Task UUID |

#### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "message": "Task deleted successfully"
  },
  "message": "Task deleted successfully",
  "timestamp": "2025-09-18T10:20:00.000Z"
}
```

## Data Models

### Task Schema

```typescript
interface Task {
  id: string;           // UUID, auto-generated
  title: string;        // Required, max 200 characters
  description?: string; // Optional
  status: 'pending' | 'in_progress' | 'completed'; // Default: 'pending'
  userId: string;       // Required, foreign key
  created_at: Date;     // Auto-generated
  updated_at: Date;     // Auto-updated
}
```

## Error Responses

All errors follow a consistent format:

```json
{
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "statusCode": 400,
    "timestamp": "2025-09-18T10:00:00.000Z"
  }
}
```

### Common Error Codes

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 400 | `VALIDATION_ERROR` | Invalid request data |
| 404 | `NOT_FOUND` | Resource not found |
| 409 | `CONFLICT` | Resource already exists |
| 500 | `DATABASE_ERROR` | Database operation failed |
| 500 | `INTERNAL_SERVER_ERROR` | Unknown server error |

### Example Error Responses

#### Validation Error (400)

```json
{
  "error": {
    "message": "title: Title is required and must be a string, status: Status must be one of: pending, in_progress, completed",
    "code": "VALIDATION_ERROR",
    "statusCode": 400,
    "timestamp": "2025-09-18T10:00:00.000Z"
  }
}
```

#### Not Found Error (404)

```json
{
  "error": {
    "message": "Task not found",
    "code": "NOT_FOUND",
    "statusCode": 404,
    "timestamp": "2025-09-18T10:00:00.000Z"
  }
}
```

## Setup Instructions

### 1. Environment Variables

Create a `.env.local` file in the project root:

```env
MONGODB_URI=mongodb://localhost:27017/smart-task-manager
NODE_ENV=development
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

### 4. Database Setup

The API will automatically connect to MongoDB. Ensure MongoDB is running locally or provide a valid MongoDB URI.

## Testing the API

### Using cURL

```bash
# Create a task
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test task",
    "description": "This is a test task",
    "status": "pending",
    "userId": "user-123"
  }'

# Get all tasks
curl http://localhost:3000/api/tasks

# Get task by ID
curl http://localhost:3000/api/tasks/550e8400-e29b-41d4-a716-446655440000

# Update task
curl -X PUT http://localhost:3000/api/tasks/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "completed"
  }'

# Delete task
curl -X DELETE http://localhost:3000/api/tasks/550e8400-e29b-41d4-a716-446655440000
```

### Using JavaScript/Fetch

```javascript
// Create a task
const response = await fetch('/api/tasks', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    title: 'New task',
    description: 'Task description',
    status: 'pending',
    userId: 'user-123'
  })
});

const result = await response.json();
console.log(result);
```

## Performance Considerations

- Database indexes are created on frequently queried fields (`userId`, `status`, `createdAt`)
- Pagination is enforced with a maximum limit of 100 items per request
- Lean queries are used for better performance when possible
- Error logging is implemented for debugging

## Security Considerations

- Input validation is performed on all endpoints
- UUID validation prevents injection attacks
- Proper HTTP status codes are returned
- Error messages don't expose sensitive information