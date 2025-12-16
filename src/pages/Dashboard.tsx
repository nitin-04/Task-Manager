import { useState } from 'react';
import { useTasks } from '../hooks/useTasks';
import TaskCard from '../components/TaskCard';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');

  const { tasks, isLoading } = useTasks({
    status: filterStatus,
    priority: filterPriority,
  });

  return (
    <div className="min-h-screen bg-[#e3f2fd] p-8">
      <div className="max-w-6xl mx-auto m-14 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Task Dashboard</h1>
          <p className="text-gray-500">Manage your team's projects</p>
        </div>

        <Link
          to="/create-task"
          className="bg-black hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          + New Task
        </Link>
      </div>

      <div className="flex justify-between max-w-6xl mx-auto mb-8 bg-white p-4 rounded-lg shadow-sm  gap-4 overflow-x-auto">
        <select
          className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="To Do">To Do</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>

        <select
          className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
        >
          <option value="">All Priorities</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
          <option value="Urgent">Urgent</option>
        </select>

        {(filterStatus || filterPriority) && (
          <button
            onClick={() => {
              setFilterStatus('');
              setFilterPriority('');
            }}
            className="text-sm text-red-600 hover:underline"
          >
            Clear Filters
          </button>
        )}
      </div>

      <div className="max-w-6xl mx-auto">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-40 bg-gray-200 rounded-lg animate-pulse"
              ></div>
            ))}
          </div>
        ) : tasks?.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            No tasks found matching your filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasks.map((task: any) => (
              <TaskCard key={task._id} task={task} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
