import mongoose, { Schema, Document, Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

// Task status enum
export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed'
}

// Task interface
export interface ITask extends Document {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

// Task schema
const TaskSchema = new Schema<ITask>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      default: uuidv4
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    status: {
      type: String,
      enum: {
        values: Object.values(TaskStatus),
        message: 'Status must be one of: pending, in_progress, completed'
      },
      default: TaskStatus.PENDING
    },
    userId: {
      type: String,
      required: [true, 'User ID is required'],
      index: true
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: function(doc, ret) {
        const transformed = {
          id: ret.id,
          title: ret.title,
          description: ret.description,
          status: ret.status,
          userId: ret.userId,
          created_at: ret.createdAt,
          updated_at: ret.updatedAt
        };
        return transformed;
      }
    }
  }
);

// Create compound index for better query performance
TaskSchema.index({ userId: 1, status: 1 });
TaskSchema.index({ userId: 1, createdAt: -1 });

// Ensure the id field is unique
TaskSchema.index({ id: 1 }, { unique: true });

// Create the model
const Task: Model<ITask> = mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema);

export default Task;