import { useState, useMemo } from 'react';
import { Link } from '@tanstack/react-router';
import { usePositions, useDeletePosition } from '../api';
import { useAuthStore } from '@/store/authStore';

export const PositionsListPage = () => {
  // 1. Отримуємо роль
  const role = useAuthStore((state) => state.user?.role);
  const isReader = role === 'READER' || !role;

  const { data: positions, isLoading, error } = usePositions();
  const deletePosition = useDeletePosition();

  // Стейт для пошуку та сортування
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{ direction: 'asc' | 'desc' } | null>(null);

  // Обробник сортування
  const handleSort = () => {
    setSortConfig((current) => ({
      direction: current?.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  // Мемоізація даних (фільтрація + сортування)
  const processedPositions = useMemo(() => {
    if (!positions) return [];

    let result = [...positions];

    // 1. Фільтрація
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter((pos) => 
        pos.name.toLowerCase().includes(lowerQuery)
      );
    }

    // 2. Сортування
    if (sortConfig) {
      result.sort((a, b) => {
        const comparison = a.name.localeCompare(b.name, 'uk');
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [positions, searchQuery, sortConfig]);

  if (isLoading) 
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-gray-500 font-medium">Завантаження списку посад...</div>
        </div>
      </div>
    );

  if (error) 
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-red-100 text-center">
          <div className="text-4xl mb-2">⚠️</div>
          <h3 className="text-lg font-bold text-gray-800">Виникла помилка</h3>
          <p className="text-red-500">Не вдалося завантажити посади.</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Посади</h1>
            <p className="text-slate-500 mt-1">
              Знайдено {processedPositions.length} із {positions?.length || 0} записів
            </p>
          </div>
          
          {/* Кнопка додавання - ПРИХОВАНА ДЛЯ ЧИТАЧА */}
          {!isReader && (
            <Link 
              to="/positions/new" 
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 active:scale-95 transition-all shadow-md shadow-blue-200 font-medium"
            >
              <span>+</span> Додати посаду
            </Link>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
            🔍
          </div>
          <input
            type="text"
            placeholder="Пошук за назвою посади..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 bg-white rounded-2xl border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700 placeholder:text-slate-400"
          />
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {processedPositions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full whitespace-nowrap">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th 
                      onClick={handleSort}
                      className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors select-none"
                    >
                      Назва посади {sortConfig && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    
                    {/* Заголовок Дій - ПРИХОВАНИЙ ДЛЯ ЧИТАЧА */}
                    {!isReader && (
                      <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Дії
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {processedPositions.map((position) => (
                    <tr 
                      key={position.id} 
                      className="hover:bg-blue-50/50 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                           <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg shadow-sm">
                             💼
                           </div>
                           <div className="flex flex-col">
                             <span className="font-semibold text-slate-800">{position.name}</span>
                             {!isReader && <span className="text-[10px] text-slate-400">ID: #{position.id}</span>}
                           </div>
                        </div>
                      </td>
                      
                      {/* Кнопки Дій - ПРИХОВАНІ ДЛЯ ЧИТАЧА */}
                      {!isReader && (
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-3 opacity-80 group-hover:opacity-100 transition-opacity">
                            <Link 
                              to="/positions/$positionId"
                              params={{ positionId: position.id.toString() }}
                              className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              Редагувати
                            </Link>
                            <button 
                              onClick={() => {
                                if (window.confirm(`Ви впевнені, що хочете видалити посаду "${position.name}"?`)) {
                                  deletePosition.mutate(position.id);
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
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <span className="text-4xl mb-3">💼</span>
              <p className="text-lg font-medium">
                {searchQuery ? 'За вашим запитом нічого не знайдено' : 'Список посад порожній'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};