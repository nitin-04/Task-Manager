import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { toast } from 'sonner';

export default function Profile({ onBack }: { onBack?: () => void }) {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const { register, handleSubmit } = useForm({
    defaultValues: { name: user?.name, email: user?.email },
  });

  const onSubmit = async (data: any) => {
    try {
      const response = await api.patch('/users/profile', { name: data.name });
      updateUser(response.data);
      toast.success('Profile updated');

      // If onBack exists (Dashboard mode), use it. Otherwise use router.
      if (onBack) {
        onBack();
      } else {
        setTimeout(() => navigate('/'), 500);
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to update');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="bg-white p-10 rounded-xl shadow-sm border border-gray-100 w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-1 text-gray-900">Edit Profile</h2>
        <p className="text-gray-500 mb-6 text-sm">
          Update your personal details
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Full Name
            </label>
            <input
              {...register('name')}
              className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-black transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Email Address
            </label>
            <input
              {...register('email')}
              disabled
              className="w-full p-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => (onBack ? onBack() : navigate('/'))}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-all shadow-lg shadow-gray-200"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
