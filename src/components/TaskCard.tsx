import { useUpdateTask, useDeleteTask } from '../hooks/useTasks';
import { Trash2, Calendar, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';

const priorityColors: Record<string, string> = {
  Low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Medium: 'bg-blue-50 text-blue-700 border-blue-200',
  High: 'bg-orange-50 text-orange-700 border-orange-200',
  Urgent: 'bg-red-50 text-red-700 border-red-200',
};

const statusColors: Record<string, string> = {
  'To Do': 'bg-gray-100 text-gray-600 hover:bg-gray-200',
  'In Progress': 'bg-blue-50 text-blue-600 hover:bg-blue-100',
  Completed: 'bg-green-50 text-green-600 hover:bg-green-100',
};

export default function TaskCard({ task, users }: { task: any; users: any[] }) {
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  // console.log(task);

  const assignees = users.filter((u) => task.assignedTo?.includes(u._id));
  // console.log('a', assignees);

  const creator = users.find((u) => u._id === task.creatorId);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.preventDefault();
    updateTask.mutate({ id: task._id, updates: { status: e.target.value } });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this task?')) {
      deleteTask.mutate(task._id);
    }
  };

  return (
    <div className="group relative flex flex-col justify-between bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-blue-100 transition-all duration-300 ease-in-out">
      <div className="flex justify-between items-start mb-3">
        <span
          className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full border ${
            priorityColors[task.priority] || priorityColors.Low
          }`}
        >
          {task.priority || 'Low'}
        </span>

        <div className="relative group/select">
          <select
            value={task.status}
            onChange={handleStatusChange}
            className={`appearance-none cursor-pointer text-xs font-semibold pl-3 pr-8 py-1 rounded-full transition-colors outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-400 ${
              statusColors[task.status]
            }`}
          >
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
          <ChevronDown
            size={14}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-current pointer-events-none opacity-60"
          />
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-800 leading-tight mb-1">
          {task.title}
        </h3>
        {task.description && (
          <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-7 mt-auto pt-4 border-t border-gray-50">
        <div className="flex flex-col gap-1 min-h-6">
          <span className="text-xs font-medium text-gray-400">Assigned:</span>

          {assignees.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 mt-0.5">
              {assignees.map((u) => (
                <span
                  key={u._id}
                  className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-[#caf0f8] text-[#343a40] border border-blue-100"
                >
                  {u.name}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-xs text-gray-300 italic">Unassigned</span>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="font-medium text-gray-400">Created by:</span>
          <span className="text-gray-600 bg-[#dee2e6] font-bold px-2 py-0.5 rounded">
            {creator ? creator.name : 'Unknown'}
          </span>
        </div>

        <div className="flex justify-between items-end mt-2">
          <div className="flex flex-col gap-1">
            <div
              className={`flex items-center gap-1.5 text-xs font-medium ${
                task.dueDate ? 'text-gray-500' : 'text-gray-300'
              }`}
            >
              <Calendar size={12} />
              <span>
                {task.dueDate
                  ? format(new Date(task.dueDate), 'MMM d')
                  : 'No Due Date'}
              </span>
            </div>
          </div>
          <button
            onClick={handleDelete}
            className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div
        className={`absolute left-0 top-4 bottom-4 w-1 rounded-r-full ${
          task.priority === 'Urgent'
            ? 'bg-red-500'
            : task.priority === 'High'
            ? 'bg-orange-400'
            : task.priority === 'Medium'
            ? 'bg-blue-400'
            : 'bg-transparent'
        }`}
      />
    </div>
  );
}
