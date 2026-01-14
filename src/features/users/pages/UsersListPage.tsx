import { useState, useMemo } from 'react';
import { Link } from '@tanstack/react-router';
import { useUsers, useDeleteUser } from '../api';
import { IUser, Role } from '../types';

export const UsersListPage = () => {
  const { data: users, isLoading, error } = useUsers();
  const deleteUser = useDeleteUser();

  const [searchQuery, setSearchQuery] = useState('');
  // 1. Стейт для фільтрації по ролі
  const [filterRole, setFilterRole] = useState<Role | 'ALL'>('ALL');
  
  const [sortConfig, setSortConfig] = useState<{ key: keyof IUser; direction: 'asc' | 'desc' } | null>(null);

  const handleSort = (key: keyof IUser) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Оновлені стилі та назви відповідно до Dashboard/Sidebar
  const getRoleBadge = (role: Role) => {
    switch (role) {
      case Role.ADMINISTRATOR:
        return { style: 'bg-violet-100 text-violet-700 border-violet-200', label: 'Адміністратор' };
      case Role.LIBRARIAN:
        return { style: 'bg-emerald-100 text-emerald-700 border-emerald-200', label: 'Бібліотекар' };
      case Role.RESTORER:
        return { style: 'bg-amber-100 text-amber-700 border-amber-200', label: 'Реставратор' };
      case Role.READER:
        return { style: 'bg-blue-100 text-blue-700 border-blue-200', label: 'Читач' };
      default:
        return { style: 'bg-slate-100 text-slate-600 border-slate-200', label: 'Гість' };
    }
  };

  const processedUsers = useMemo(() => {
    if (!users) return [];

    let result = [...users];

    // 2. Фільтрація за роллю
    if (filterRole !== 'ALL') {
      result = result.filter(user => user.role === filterRole);
    }

    // 3. Пошук
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter((user) => {
        const username = (user.username || '').toLowerCase();
        const email = (user.email || '').toLowerCase();
        const name = (user.name || '').toLowerCase();
        const id = user.id.toString();

        return username.includes(lowerQuery) || 
               email.includes(lowerQuery) || 
               name.includes(lowerQuery) ||
               id.includes(lowerQuery);
      });
    }

    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue === bValue) return 0;
        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        if (typeof aValue === 'number' && typeof bValue === 'number') {
            return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
        }

        const comparison = String(aValue).localeCompare(String(bValue), 'uk');
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [users, searchQuery, sortConfig, filterRole]);

  // Список вкладок для фільтру
  const roleFilters = [
    { key: 'ALL', label: 'Всі' },
    { key: Role.ADMINISTRATOR, label: 'Адміністратори' },
    { key: Role.LIBRARIAN, label: 'Бібліотекарі' },
    { key: Role.RESTORER, label: 'Реставратори' },
    { key: Role.READER, label: 'Читачі' },
  ];

  if (isLoading) 
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-gray-500 font-medium">Завантаження користувачів...</div>
        </div>
      </div>
    );

  if (error) 
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-red-100 text-center">
          <div className="text-4xl mb-2">⚠️</div>
          <h3 className="text-lg font-bold text-gray-800">Виникла помилка</h3>
          <p className="text-red-500">Не вдалося завантажити список користувачів.</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Системні користувачі</h1>
            <p className="text-slate-500 mt-1">
              Управління доступом та обліковими записами ({processedUsers.length})
            </p>
          </div>
          
          <Link 
            to="/users/new" 
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 active:scale-95 transition-all shadow-md shadow-blue-200 font-medium"
          >
            <span>+</span> Створити користувача
          </Link>
        </div>

        {/* 4. Toolbar (Пошук + Фільтри) */}
        <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-2 rounded-2xl shadow-sm border border-slate-200">
            <div className="relative flex-1 w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    🔍
                </div>
                <input
                    type="text"
                    placeholder="Пошук за логіном, ім'ям або email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-transparent focus:outline-none text-slate-700 placeholder:text-slate-400"
                />
            </div>
            
            <div className="flex bg-slate-100 p-1 rounded-xl overflow-x-auto max-w-full no-scrollbar">
                {roleFilters.map((filter) => (
                    <button
                        key={filter.key}
                        onClick={() => setFilterRole(filter.key as Role | 'ALL')}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                            filterRole === filter.key
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                        }`}
                    >
                        {filter.label}
                    </button>
                ))}
            </div>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {processedUsers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full whitespace-nowrap">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th onClick={() => handleSort('id')} className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors select-none">
                      ID {sortConfig?.key === 'id' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th onClick={() => handleSort('username')} className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors select-none">
                      Користувач {sortConfig?.key === 'username' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th onClick={() => handleSort('email')} className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors select-none">
                      Email {sortConfig?.key === 'email' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th onClick={() => handleSort('role')} className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors select-none">
                      Роль {sortConfig?.key === 'role' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Дії
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {processedUsers.map((u) => {
                    const badge = getRoleBadge(u.role);
                    return (
                      <tr key={u.id} className="hover:bg-blue-50/50 transition-colors group">
                        <td className="px-6 py-4 text-sm text-slate-400 font-mono">#{u.id}</td>
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs uppercase">
                                  {(u.username || u.email || '??').substring(0, 2)}
                              </div>
                              <div className="flex flex-col">
                                  <span className="font-semibold text-slate-800">{u.username || 'Без імені'}</span>
                                  {u.name && <span className="text-[11px] text-slate-400">{u.name}</span>}
                              </div>
                           </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                           {u.email}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border ${badge.style}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-3 opacity-80 group-hover:opacity-100 transition-opacity">
                            <Link 
                              to={`/users/${u.id}`}
                              className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              Редагувати
                            </Link>
                            <button 
                              onClick={() => {
                                const displayName = u.username || u.email || 'цього користувача';
                                if (window.confirm(`Ви дійсно хочете видалити ${displayName}?`)) {
                                  deleteUser.mutate(u.id);
                                }
                              }}
                              className="text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              Видалити
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
             <div className="flex flex-col items-center justify-center py-16 text-slate-400">
               <span className="text-4xl mb-3">🛡️</span>
               <p className="text-lg font-medium">
                 {searchQuery ? 'За вашим запитом нічого не знайдено' : 'Список користувачів порожній'}
               </p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};