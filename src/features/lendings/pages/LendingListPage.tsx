import { useState, useMemo } from 'react';
import { Link } from '@tanstack/react-router';
import { useLendings, useDeleteLending } from '../api';
import { useAuthStore } from '@/store/authStore';

export const LendingsListPage = () => {
  // 1. Отримуємо роль
  const role = useAuthStore((state) => state.role);
  const isReader = role === 'READER';

  const { data: lendings, isLoading, error } = useLendings();
  const deleteLending = useDeleteLending();

  // Стейт
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'overdue' | 'closed'>('all');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  // Сортування
  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Логіка обробки даних
  const processedLendings = useMemo(() => {
    if (!lendings) return [];

    let result = [...lendings];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Пошук (Читач, Працівник, ID)
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter((l) => 
        l.reader?.fullName?.toLowerCase().includes(lowerQuery) ||
        l.employee?.fullName?.toLowerCase().includes(lowerQuery) ||
        l.id.toString().includes(lowerQuery)
      );
    }

    // 2. Фільтрація по статусу
    if (filterStatus !== 'all') {
      result = result.filter((l) => {
        const isClosed = !!l.dateReturn;
        const planDate = l.dateReturnPlanned ? new Date(l.dateReturnPlanned) : null;
        const isOverdue = !isClosed && planDate && planDate < today;

        if (filterStatus === 'closed') return isClosed;
        if (filterStatus === 'active') return !isClosed; 
        if (filterStatus === 'overdue') return isOverdue;
        return true;
      });
    }

    // 3. Сортування
    if (sortConfig) {
      result.sort((a, b) => {
        let aValue: any = '';
        let bValue: any = '';

        switch (sortConfig.key) {
          case 'reader':
            aValue = a.reader?.fullName || '';
            bValue = b.reader?.fullName || '';
            break;
          case 'employee':
            aValue = a.employee?.fullName || '';
            bValue = b.employee?.fullName || '';
            break;
          case 'dateLending':
            aValue = new Date(a.dateLending).getTime();
            bValue = new Date(b.dateLending).getTime();
            break;
          case 'dateReturnPlanned':
            aValue = a.dateReturnPlanned ? new Date(a.dateReturnPlanned).getTime() : 0;
            bValue = b.dateReturnPlanned ? new Date(b.dateReturnPlanned).getTime() : 0;
            break;
          case 'copybooks':
            aValue = a.copybooks?.length || 0;
            bValue = b.copybooks?.length || 0;
            break;
          default:
            // @ts-ignore
            aValue = a[sortConfig.key];
            // @ts-ignore
            bValue = b[sortConfig.key];
        }

        if (aValue === bValue) return 0;
        
        if (typeof aValue === 'string') {
            return sortConfig.direction === 'asc' 
                ? aValue.localeCompare(bValue, 'uk') 
                : bValue.localeCompare(aValue, 'uk');
        }
        
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      });
    }

    return result;
  }, [lendings, searchQuery, filterStatus, sortConfig]);

  // Статистика для шапки
  const stats = useMemo(() => {
      if (!lendings) return { total: 0, overdue: 0, active: 0 };
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const active = lendings.filter(l => !l.dateReturn).length;
      const overdue = lendings.filter(l => !l.dateReturn && l.dateReturnPlanned && new Date(l.dateReturnPlanned) < today).length;
      
      return { total: lendings.length, active, overdue };
  }, [lendings]);

  if (isLoading) 
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-gray-500 font-medium">Завантаження журналу видачі...</div>
        </div>
      </div>
    );

  if (error) 
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-red-100 text-center">
          <div className="text-4xl mb-2">⚠️</div>
          <h3 className="text-lg font-bold text-gray-800">Виникла помилка</h3>
          <p className="text-red-500">Не вдалося завантажити дані про видачу.</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header & Stats */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-4">Журнал видачі книг</h1>
            <div className="flex flex-wrap gap-3">
               <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 flex flex-col">
                 <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Всього записів</span>
                 <span className="text-xl font-bold text-slate-800">{stats.total}</span>
               </div>
               <div className="bg-blue-50 px-4 py-2 rounded-xl shadow-sm border border-blue-100 flex flex-col">
                 <span className="text-[10px] uppercase font-bold text-blue-600 tracking-wider">На руках</span>
                 <span className="text-xl font-bold text-blue-700">{stats.active}</span>
               </div>
               <div className="bg-red-50 px-4 py-2 rounded-xl shadow-sm border border-red-100 flex flex-col">
                 <span className="text-[10px] uppercase font-bold text-red-600 tracking-wider">Прострочено</span>
                 <span className="text-xl font-bold text-red-700">{stats.overdue}</span>
               </div>
            </div>
          </div>
          
          {!isReader && (
            <Link 
              to="/lendings/new" 
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-xl hover:bg-blue-700 active:scale-95 transition-all shadow-md shadow-blue-200 font-medium"
            >
              <span>+</span> Нова видача
            </Link>
          )}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-2 rounded-2xl shadow-sm border border-slate-200">
            <div className="relative flex-1 w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    🔍
                </div>
                <input
                    type="text"
                    placeholder="Пошук за читачем, працівником або ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-transparent focus:outline-none text-slate-700 placeholder:text-slate-400"
                />
            </div>
            
            <div className="flex bg-slate-100 p-1 rounded-xl overflow-x-auto max-w-full">
                {[
                    { key: 'all', label: 'Всі' },
                    { key: 'active', label: 'В процесі' },
                    { key: 'overdue', label: 'Прострочені' },
                    { key: 'closed', label: 'Повернуті' },
                ].map((status) => (
                    <button
                        key={status.key}
                        onClick={() => setFilterStatus(status.key as any)}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                            filterStatus === status.key
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                        }`}
                    >
                        {status.label}
                    </button>
                ))}
            </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {processedLendings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full whitespace-nowrap">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th onClick={() => handleSort('reader')} className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors select-none">
                      Читач {sortConfig?.key === 'reader' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th onClick={() => handleSort('employee')} className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors select-none">
                      Працівник {sortConfig?.key === 'employee' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th onClick={() => handleSort('dateLending')} className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors select-none">
                      Дата видачі {sortConfig?.key === 'dateLending' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th onClick={() => handleSort('dateReturnPlanned')} className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors select-none">
                      План повернення {sortConfig?.key === 'dateReturnPlanned' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Статус
                    </th>
                    <th onClick={() => handleSort('copybooks')} className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors select-none">
                      Книг {sortConfig?.key === 'copybooks' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    {!isReader && <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Дії</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {processedLendings.map((lending) => {
                      const isOverdue = !lending.dateReturn && lending.dateReturnPlanned && new Date(lending.dateReturnPlanned) < new Date();
                      return (
                          <tr key={lending.id} className="hover:bg-blue-50/50 transition-colors group">
                              <td className="px-6 py-4">
                                  <div className="flex flex-col">
                                      <span className="text-sm font-bold text-slate-800">
                                          {lending.reader?.fullName || 'Невідомий читач'}
                                      </span>
                                      <span className="text-[10px] text-slate-400">ID: #{lending.id}</span>
                                  </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-slate-600">
                                  <div className="flex items-center gap-2">
                                     <span className="text-xs">👤</span>
                                     {lending.employee?.fullName || '-'}
                                  </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-slate-600">
                                  {lending.dateLending ? new Date(lending.dateLending).toLocaleDateString('uk-UA') : '-'}
                              </td>
                              <td className="px-6 py-4">
                                  <div className="flex flex-col">
                                      <span className={`text-sm font-medium ${isOverdue ? 'text-red-600' : 'text-slate-600'}`}>
                                          {lending.dateReturnPlanned ? new Date(lending.dateReturnPlanned).toLocaleDateString('uk-UA') : '-'}
                                      </span>
                                      {isOverdue && (
                                          <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider">Прострочено</span>
                                      )}
                                  </div>
                              </td>
                              <td className="px-6 py-4">
                                  {lending.dateReturn ? (
                                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                                          Повернуто {new Date(lending.dateReturn).toLocaleDateString('uk-UA')}
                                      </span>
                                  ) : isOverdue ? (
                                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                                          Не повернуто
                                      </span>
                                  ) : (
                                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                                          В процесі
                                      </span>
                                  )}
                              </td>
                              <td className="px-6 py-4 text-center">
                                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                                      {lending.copybooks?.length || 0}
                                  </span>
                              </td>
                              {!isReader && (
                                <td className="px-6 py-4 text-right whitespace-nowrap">
                                    <div className="flex items-center justify-end gap-3 opacity-80 group-hover:opacity-100 transition-opacity">
                                        <Link 
                                            to={`/lendings/${lending.id}`}
                                            className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                                        >
                                            Редагувати
                                        </Link>
                                        <button 
                                            onClick={() => {
                                                if (window.confirm(`Видалити запис про видачу #${lending.id}?`)) {
                                                    deleteLending.mutate(lending.id);
                                                }
                                            }}
                                            className="text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
                                        >
                                            Видалити
                                        </button>
                                    </div>
                                </td>
                              )}
                          </tr>
                      );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <span className="text-4xl mb-3">📇</span>
              <p className="text-lg font-medium">
                {searchQuery ? 'Нічого не знайдено за вашим запитом' : 'Журнал видачі порожній'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};