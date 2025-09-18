import Link from "next/link";
import { Button } from "@/components/ui";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Smart Task Manager
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Organize, track, and manage your tasks efficiently with our modern task management system.
            Features drag-and-drop functionality, real-time updates, and powerful filtering options.
          </p>
          
          <div className="space-y-4 md:space-y-0 md:space-x-4 md:flex md:justify-center">
            <Link href="/tasks">
              <Button size="lg" className="w-full md:w-auto">
                Get Started with Tasks
              </Button>
            </Link>
            <Link href="/api/tasks" target="_blank">
              <Button variant="secondary" size="lg" className="w-full md:w-auto">
                View API Documentation
              </Button>
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="text-2xl font-bold text-blue-600 mb-2">✨</div>
              <h3 className="font-semibold text-gray-900 mb-2">Intuitive Interface</h3>
              <p className="text-gray-600 text-sm">
                Clean, modern interface with drag-and-drop functionality for easy task organization.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="text-2xl font-bold text-green-600 mb-2">⚡</div>
              <h3 className="font-semibold text-gray-900 mb-2">Real-time Updates</h3>
              <p className="text-gray-600 text-sm">
                Optimistic UI updates provide instant feedback while maintaining data consistency.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="text-2xl font-bold text-purple-600 mb-2">🔍</div>
              <h3 className="font-semibold text-gray-900 mb-2">Powerful Filtering</h3>
              <p className="text-gray-600 text-sm">
                Advanced search and filtering options to help you find and organize tasks quickly.
              </p>
            </div>
          </div>

          <div className="mt-16 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              RESTful API Available
            </h2>
            <p className="text-gray-600 mb-6">
              Full CRUD operations with comprehensive validation and error handling.
            </p>
            <div className="bg-gray-900 text-green-400 rounded-lg p-4 text-left max-w-2xl mx-auto font-mono text-sm">
              <div>POST /api/tasks - Create a new task</div>
              <div>GET /api/tasks - Retrieve all tasks</div>
              <div>GET /api/tasks/:id - Get specific task</div>
              <div>PUT /api/tasks/:id - Update a task</div>
              <div>DELETE /api/tasks/:id - Delete a task</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
