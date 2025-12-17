import { useEffect, useState, useRef } from 'react';
import { useTasks } from '../hooks/useTasks';
import TaskCard from '../components/TaskCard';
import Profile from './Profile';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { toast } from 'sonner';
import {
  LayoutGrid,
  Plus,
  LogOut,
  User as UserIcon,
  ChevronDown,
  Bell,
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
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifDropdownRef = useRef<HTMLDivElement>(null);

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: async () => (await api.get('/users')).data,
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => (await api.get('/notifications')).data,
    refetchInterval: 60000,
  });

  const { tasks, isLoading } = useTasks({
    status: filterStatus,
    priority: filterPriority,
  });

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    } catch (e) {
      console.error('Failed to mark read');
    }
  };

  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

  useEffect(() => {
    function handleClickOutside(event: any) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (
        notifDropdownRef.current &&
        !notifDropdownRef.current.contains(event.target)
      ) {
        setShowNotifDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  // Real-time Listeners
  useEffect(() => {
    const refreshTasks = () =>
      queryClient.invalidateQueries({ queryKey: ['tasks'] });

    socket.on('taskCreated', refreshTasks);
    socket.on('taskUpdated', refreshTasks);
    socket.on('taskDeleted', refreshTasks);

    socket.on(
      'notification',
      (payload: { userId: string; message: string }) => {
        const currentUserId = user?._id || user?.id;

        if (currentUserId === payload.userId) {
          toast.info('New Assignment', {
            description: payload.message,
            duration: 5000,
          });

          queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
      }
    );

    return () => {
      socket.off('taskCreated');
      socket.off('taskUpdated');
      socket.off('taskDeleted');
      socket.off('notification');
    };
  }, [user, queryClient]);

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

            <div className="relative" ref={notifDropdownRef}>
              <button
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-full relative transition-colors"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
                )}
              </button>

              {showNotifDropdown && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="p-3 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                    <h3 className="text-sm font-semibold text-gray-900">
                      Notifications
                    </h3>
                    <span className="text-xs text-gray-500">
                      {unreadCount} unread
                    </span>
                  </div>

                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-gray-400 text-sm">
                        No notifications
                      </div>
                    ) : (
                      notifications.map((notif: any) => (
                        <div
                          key={notif._id}
                          onClick={() => markAsRead(notif._id)}
                          className={`p-4 border-b border-gray-50 hover:bg-blue-50/50 cursor-pointer transition-colors flex gap-3 ${
                            !notif.isRead ? 'bg-blue-50/30' : ''
                          }`}
                        >
                          <div
                            className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${
                              !notif.isRead ? 'bg-blue-600' : 'bg-transparent'
                            }`}
                          />
                          <div>
                            <p
                              className={`text-sm ${
                                !notif.isRead
                                  ? 'font-semibold text-gray-800'
                                  : 'text-gray-600'
                              }`}
                            >
                              {notif.message}
                            </p>
                            <p className="text-[10px] text-gray-400 mt-1">
                              {new Date(notif.createdAt).toLocaleDateString()}{' '}
                              at{' '}
                              {new Date(notif.createdAt).toLocaleTimeString(
                                [],
                                { hour: '2-digit', minute: '2-digit' }
                              )}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

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
