import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { toast } from 'sonner';

export default function CreateTask() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();
  const navigate = useNavigate();

  const onSubmit = async (data: any) => {
    try {
      await api.post('/tasks', data);
      toast.success('Task created successfully!');
      navigate('/');
    } catch (error) {
      toast.error('Failed to create task');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">Create New Task</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              {...register('title', { required: 'Title is required' })}
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g. Fix Login Bug"
            />
            {errors.title && (
              <span className="text-red-500 text-xs">
                {errors.title.message as string}
              </span>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Priority</label>
            <select
              {...register('priority')}
              className="w-full border p-2 rounded"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              {...register('status')}
              className="w-full border p-2 rounded"
            >
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Due Date</label>
            <input
              type="date"
              {...register('dueDate')}
              className="w-full border p-2 rounded"
            />
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex-1 py-2 text-gray-600 hover:bg-gray-100 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
