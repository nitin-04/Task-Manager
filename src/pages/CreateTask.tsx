import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { toast } from 'sonner';

export default function CreateTask() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: async () => (await api.get('/users')).data,
  });

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'To Do',
    priority: 'Low',
    dueDate: '',
    assignedTo: [] as string[],
  });

  //  Mutation to Create Task
  const createTaskMutation = useMutation({
    mutationFn: async (newTask: any) => {
      return await api.post('/tasks', newTask);
    },
    onSuccess: () => {
      toast.success('Task created successfully');
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      navigate('/');
    },
    onError: () => {
      toast.error('Failed to create task');
    },
  });

  // Helper to toggle users in the array
  const toggleUser = (userId: string) => {
    setFormData((prev) => {
      const isSelected = prev.assignedTo.includes(userId);
      if (isSelected) {
        return {
          ...prev,
          assignedTo: prev.assignedTo.filter((id) => id !== userId),
        };
      } else {
        return { ...prev, assignedTo: [...prev.assignedTo, userId] };
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTaskMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-lg border border-gray-100">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Create New Task
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Task Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Fix Login Bug"
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              placeholder="Add details..."
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none transition"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                className="w-full p-2.5 border border-gray-300 rounded-lg bg-white"
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
              >
                <option>To Do</option>
                <option>In Progress</option>
                <option>Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                className="w-full p-2.5 border border-gray-300 rounded-lg bg-white"
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.value })
                }
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Urgent</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date
              </label>
              <input
                type="date"
                className="w-full p-2.5 border border-gray-300 rounded-lg"
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData({ ...formData, dueDate: e.target.value })
                }
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assign Team Members
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-gray-50 p-3 rounded-lg border border-gray-200 max-h-40 overflow-y-auto">
                {users.map((user: any) => (
                  <label
                    key={user._id}
                    className={`flex items-center space-x-2 p-2 rounded cursor-pointer transition-colors border ${
                      formData.assignedTo.includes(user._id)
                        ? 'bg-blue-50 border-blue-200'
                        : 'hover:bg-gray-100 border-transparent'
                    }`}
                  >
                    <input
                      type="checkbox"
                      value={user._id}
                      checked={formData.assignedTo.includes(user._id)}
                      onChange={() => toggleUser(user._id)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 truncate">
                      {user.name}
                    </span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Selected: {formData.assignedTo.length} members
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={createTaskMutation.isPending}
            className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors mt-4"
          >
            {createTaskMutation.isPending ? 'Creating...' : 'Create Task'}
          </button>
        </form>
      </div>
    </div>
  );
}
