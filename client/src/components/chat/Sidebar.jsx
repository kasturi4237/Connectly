import { useEffect, useState } from 'react';
import { useChatStore } from '../../store/useChatStore';
import { useAuthStore } from '../../store/useAuthStore';
import { Search, LogOut, Settings } from 'lucide-react';
import axios from '../../lib/axios';

export default function Sidebar() {
  const { users, getUsers, setSelectedUser, selectedUser, onlineUsers } = useChatStore();
  const { user, logout } = useAuthStore();
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => { getUsers(); }, []);

  const handleSearch = async (q) => {
    setSearch(q);
    if (q.length < 2) return setSearchResults([]);
    try {
      const { data } = await axios.get(`/users/search?q=${q}`);
      setSearchResults(data);
    } catch {}
  };

  const displayUsers = search.length >= 2 ? searchResults : users;

  return (
    <div className="w-72 bg-gray-900 border-r border-gray-800 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.username}&background=6366f1&color=fff`}
              className="w-8 h-8 rounded-full" alt="" />
            <span className="font-semibold text-sm">{user.username}</span>
          </div>
          <button onClick={logout} className="text-gray-400 hover:text-red-400 transition">
            <LogOut size={18} />
          </button>
        </div>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-2.5 text-gray-500" />
          <input
            value={search}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Search users..."
            className="w-full bg-gray-800 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Users List */}
      <div className="flex-1 overflow-y-auto">
        {displayUsers.map(u => {
          const isOnline = onlineUsers.includes(u._id);
          return (
            <button key={u._id} onClick={() => setSelectedUser(u)}
              className={`w-full flex items-center gap-3 p-3 hover:bg-gray-800 transition text-left ${selectedUser?._id === u._id ? 'bg-gray-800' : ''}`}>
              <div className="relative">
                <img src={u.avatar || `https://ui-avatars.com/api/?name=${u.username}&background=6366f1&color=fff`}
                  className="w-10 h-10 rounded-full" alt="" />
                {isOnline && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-gray-900" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{u.username}</p>
                <p className="text-xs text-gray-500">{isOnline ? 'Online' : 'Offline'}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}