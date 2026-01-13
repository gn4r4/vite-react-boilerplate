import { useState, useMemo } from 'react';
import { Link } from '@tanstack/react-router';
import { useCopybooks, useDeleteCopybook } from '../api';
import type { ICopybook } from '../types';
import { useAuthStore } from '@/store/authStore';

export const CopybooksListPage = () => {
  // Отримуємо роль користувача
  const role = useAuthStore((state) => state.role);
  
  const isReader = role === 'READER' || !role;
  
  const canManage = !isReader;

  const { data: copybooks, isLoading, error } = useCopybooks();
  const deleteCopybook = useDeleteCopybook();

  // Стейт для пошуку та сортування
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{ 
    key: 'title' | 'status' | 'location'; 
    direction: 'asc' | 'desc' 
  } | null>(null);

  // Обробник сортування
  const handleSort = (key: 'title' | 'status' | 'location') => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Функція форматування локації
  const formatLocation = (location: ICopybook['location']) => {
    if (!location) return 'Не вказано';
    if (location.shelf) {
      const { shelf } = location;
      const cabinetName = (shelf.cabinet as any)?.name || (shelf.cabinet as any)?.number_cabinet || '?';
      return `${cabinetName}, Полиця: ${shelf.shelfcode}`;
    }
    return 'Не вказано';
  };

  // Хелпер для кольорів статусу
  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('доступн')) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (s.includes('видан')) return 'bg-blue-100 text-blue-700 border-blue-200';
    if (s.includes('списан') || s.includes('втрач')) return 'bg-red-100 text-red-700 border-red-200';
    if (s.includes('реставр')) return 'bg-amber-100 text-amber-700 border-amber-200';
    return 'bg-slate-100 text-slate-600 border-slate-200';
  };

  // Мемоізація даних
  const processedCopybooks = useMemo(() => {
    if (!copybooks) return [];

    let result = [...copybooks];

    // 1. Фільтрація
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter((copybook) => {
        const titleMatch = copybook.edition?.book?.title?.toLowerCase().includes(lowerQuery);
        const statusMatch = copybook.status.toLowerCase().includes(lowerQuery);
        const idMatch = copybook.id.toString().includes(lowerQuery);
        
        let locationMatch = false;
        if (copybook.location?.shelf) {
            const shelfCode = copybook.location.shelf.shelfcode.toLowerCase();
            const cabinetName = ((copybook.location.shelf.cabinet as any)?.name || '').toLowerCase();
            locationMatch = shelfCode.includes(lowerQuery) || cabinetName.includes(lowerQuery);
        }

        return titleMatch || statusMatch || idMatch || locationMatch;
      });
    }

    // 2. Сортування
    if (sortConfig) {
      result.sort((a, b) => {
        let aValue: string | number = '';
        let bValue: string | number = '';

        switch (sortConfig.key) {
          case 'title':
            aValue = a.edition?.book?.title || '';
            bValue = b.edition?.book?.title || '';
            break;
          case 'status':
            aValue = a.status;
            bValue = b.status;
            break;
          case 'location':
             aValue = formatLocation(a.location);
             bValue = formatLocation(b.location);
             break;
        }

        if (aValue === bValue) return 0;
        const comparison = String(aValue).localeCompare(String(bValue), 'uk');
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [copybooks, searchQuery, sortConfig]);

  if (isLoading) 
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-gray-500 font-medium">Завантаження фізичних копій...</div>
        </div>
      </div>
    );

  if (error) 
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-red-100 text-center">
          <div className="text-4xl mb-2">⚠️</div>
          <h3 className="text-lg font-bold text-gray-800">Виникла помилка</h3>
          <p className="text-red-500">Не вдалося завантажити дані про копії.</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Фізичні копії книг</h1>
            <p className="text-slate-500 mt-1">
              Знайдено {processedCopybooks.length} із {copybooks?.length || 0} записів
            </p>
          </div>
          
          {canManage && (
            <Link 
              to="/copybooks/new" 
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 active:scale-95 transition-all shadow-md shadow-blue-200 font-medium"
            >
              <span>+</span> Додати копію
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
            placeholder="Пошук за назвою, статусом, полицею..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 bg-white rounded-2xl border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700 placeholder:text-slate-400"
          />
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {processedCopybooks.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full whitespace-nowrap">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th 
                      onClick={() => handleSort('title')}
                      className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors select-none"
                    >
                      Книга {sortConfig?.key === 'title' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      onClick={() => handleSort('status')}
                      className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors select-none"
                    >
                      Статус {sortConfig?.key === 'status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      onClick={() => handleSort('location')}
                      className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors select-none"
                    >
                      Локація {sortConfig?.key === 'location' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    
                    {canManage && (
                      <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Дії
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {processedCopybooks.map((copybook) => (
                    <tr 
                      key={copybook.id} 
                      className="hover:bg-blue-50/50 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-800">
                            {copybook.edition?.book?.title || 'Без назви'}
                          </span>
                          <span className="text-xs text-slate-500 mt-0.5">
                            Рік: {copybook.edition?.yearPublication ? new Date(copybook.edition.yearPublication).getFullYear() : '-'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${getStatusColor(copybook.status)}`}>
                          {copybook.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                           <span className="text-lg opacity-70">📍</span>
                           {formatLocation(copybook.location)}
                        </div>
                      </td>
                      
                      {canManage && (
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-3 opacity-80 group-hover:opacity-100 transition-opacity">
                            <Link 
                              to={`/copybooks/${copybook.id}`}
                              className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              Редагувати
                            </Link>
                            {canManage && (
                              <button 
                                onClick={() => {
                                  const bookTitle = copybook.edition?.book?.title || 'Книга';
                                  if (window.confirm(`Видалити копію "${bookTitle}"?`)) {
                                    deleteCopybook.mutate(copybook.id);
                                  }
                                }}
                                className="text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
                              >
                                Видалити
                              </button>
                            )}
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
              <span className="text-4xl mb-3">📦</span>
              <p className="text-lg font-medium">
                {searchQuery ? 'За вашим запитом нічого не знайдено' : 'Список копій порожній'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};