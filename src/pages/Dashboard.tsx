import { useEffect, useState, useRef } from 'react';
import { useTasks } from '../hooks/useTasks';
import TaskCard from '../components/TaskCard';
import Profile from './Profile';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { toast } from 'sonner';
import {
  LayoutGrid,
  Plus,
  LogOut,
  User as UserIcon,
  ChevronDown,
} from 'lucide-react';

const socket = io('http://localhost:3000');

const getInitials = (name: string) => {
  return name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '??';
};

export default function Dashboard() {
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');

  const [view, setView] = useState<'all' | 'mine' | 'created' | 'overdue'>(
    'all'
  );
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const { user, logout } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: any) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: async () => (await api.get('/users')).data,
  });

  const { tasks, isLoading } = useTasks({
    status: filterStatus,
    priority: filterPriority,
  });

  // Filter Logic
  const filteredTasks = tasks?.filter((task: any) => {
    const currentUserId = user?._id || user?.id;
    if (!currentUserId) return false;

    if (view === 'mine') {
      return Array.isArray(task.assignedTo)
        ? task.assignedTo.includes(currentUserId)
        : task.assignedTo === currentUserId;
    }
    if (view === 'created') return task.creatorId === currentUserId;
    if (view === 'overdue') {
      return (
        task.dueDate &&
        new Date(task.dueDate) < new Date() &&
        task.status !== 'Completed'
      );
    }
    return true;
  });

  useEffect(() => {
    socket.on(
      'notification',
      (payload: { userId: string; message: string }) => {
        if (payload.userId === user?.id) {
          toast.info('New Assignment', { description: payload.message });
        }
      }
    );
    return () => {
      socket.off('notification');
    };
  }, [user]);

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => setIsProfileOpen(false)}
          >
            <div className="bg-blue-600 p-2 rounded-lg text-white">
              <LayoutGrid size={20} />
            </div>
            <h1 className="text-xl font-bold text-gray-800 tracking-tight">
              TaskFlow
            </h1>
          </div>

          <div className="flex items-center gap-6">
            {!isProfileOpen && (
              <Link
                to="/create-task"
                className="hidden md:flex items-center gap-2 bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm"
              >
                <Plus size={16} />
                New Task
              </Link>
            )}

            <div className="h-6 w-px bg-gray-200"></div>

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-3 hover:bg-gray-50 p-1.5 pr-3 rounded-full transition-colors border border-transparent hover:border-gray-200"
              >
                <div className="w-9 h-9 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold shadow-sm text-sm">
                  {getInitials(user?.name || '')}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-semibold text-gray-700 leading-none">
                    {user?.name}
                  </p>
                </div>
                <ChevronDown size={14} className="text-gray-400" />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-3 border-b border-gray-50">
                    <p className="text-sm font-semibold text-gray-900">
                      {user?.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user?.email}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setIsProfileOpen(true);
                      setIsDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <UserIcon size={16} />
                    Edit Profile
                  </button>

                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <LogOut size={16} />
                    Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {isProfileOpen ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-6">
              <button
                onClick={() => setIsProfileOpen(false)}
                className="text-sm text-gray-500 hover:text-black flex items-center gap-1"
              >
                ← Back to Dashboard
              </button>
            </div>
            <Profile onBack={() => setIsProfileOpen(false)} />
          </div>
        ) : (
          <>
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Project Board
                </h2>
                <p className="text-gray-500 mt-1">
                  Monitor tasks and track progress
                </p>
              </div>

              <div className="bg-white p-1 rounded-lg border border-gray-200 inline-flex shadow-sm">
                {['all', 'mine', 'created', 'overdue'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setView(tab as any)}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                      view === tab
                        ? 'bg-black text-white shadow-md'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {tab === 'mine'
                      ? 'My Tasks'
                      : tab === 'created'
                      ? 'Created'
                      : tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-2">
              <select
                className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-blue-100 outline-none"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>

              <select
                className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-blue-100 outline-none"
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
                  className="text-sm text-red-600 font-medium hover:underline px-2"
                >
                  Reset
                </button>
              )}
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-48 bg-gray-200 rounded-xl animate-pulse"
                  />
                ))}
              </div>
            ) : filteredTasks?.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                <p className="text-gray-400">
                  No tasks found matching your filters.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTasks?.map((task: any) => (
                  <TaskCard key={task._id} task={task} users={users} />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
