import { useState, useMemo } from 'react';
import { Link } from '@tanstack/react-router';
import { useEditions, useDeleteEdition } from '../api';
import { useAuthStore } from '@/store/authStore'; // Імпорт стору

export const EditionsListPage = () => {
  // 1. Отримуємо роль
  const role = useAuthStore((state) => state.user?.role);
  const isReader = role === 'READER' || !role;

  const { data: editions, isLoading, error } = useEditions();
  const deleteEdition = useDeleteEdition();

  // Стейт для пошуку та сортування
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{ 
    key: 'book' | 'publisher' | 'year' | 'isbn' | 'pages'; 
    direction: 'asc' | 'desc' 
  } | null>(null);

  // Обробник сортування
  const handleSort = (key: 'book' | 'publisher' | 'year' | 'isbn' | 'pages') => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Мемоізація даних
  const processedEditions = useMemo(() => {
    if (!editions) return [];

    let result = [...editions];

    // 1. Фільтрація
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter((edition) => 
        (edition.book?.title && edition.book.title.toLowerCase().includes(lowerQuery)) ||
        (edition.publisher?.name && edition.publisher.name.toLowerCase().includes(lowerQuery)) ||
        (edition.ISBN && edition.ISBN.toLowerCase().includes(lowerQuery))
      );
    }

    // 2. Сортування
    if (sortConfig) {
      result.sort((a, b) => {
        let aValue: string | number = '';
        let bValue: string | number = '';

        switch (sortConfig.key) {
          case 'book':
            aValue = a.book?.title || '';
            bValue = b.book?.title || '';
            break;
          case 'publisher':
            aValue = a.publisher?.name || '';
            bValue = b.publisher?.name || '';
            break;
          case 'year':
            aValue = a.yearPublication ? new Date(a.yearPublication).getTime() : 0;
            bValue = b.yearPublication ? new Date(b.yearPublication).getTime() : 0;
            break;
          case 'isbn':
            aValue = a.ISBN || '';
            bValue = b.ISBN || '';
            break;
          case 'pages':
            aValue = a.pages || 0;
            bValue = b.pages || 0;
            break;
        }

        if (aValue === bValue) return 0;
        
        let comparison = 0;
        if (typeof aValue === 'string' && typeof bValue === 'string') {
           comparison = aValue.localeCompare(bValue, 'uk');
        } else {
           comparison = aValue > bValue ? 1 : -1;
        }

        return sortConfig.direction === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [editions, searchQuery, sortConfig]);

  if (isLoading) 
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-gray-500 font-medium">Завантаження списку видань...</div>
        </div>
      </div>
    );

  if (error) 
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-red-100 text-center">
          <div className="text-4xl mb-2">⚠️</div>
          <h3 className="text-lg font-bold text-gray-800">Виникла помилка</h3>
          <p className="text-red-500">Не вдалося завантажити видання.</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Видання</h1>
            <p className="text-slate-500 mt-1">
              Знайдено {processedEditions.length} із {editions?.length || 0} записів
            </p>
          </div>
          
          {/* Кнопка додавання - ПРИХОВАНА ДЛЯ ЧИТАЧА */}
          {!isReader && (
            <Link 
              to="/editions/new" 
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 active:scale-95 transition-all shadow-md shadow-blue-200 font-medium"
            >
              <span>+</span> Додати видання
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
            placeholder="Пошук за книгою, видавцем або ISBN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 bg-white rounded-2xl border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700 placeholder:text-slate-400"
          />
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {processedEditions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full whitespace-nowrap">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th 
                      onClick={() => handleSort('book')}
                      className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors select-none"
                    >
                      Книга {sortConfig?.key === 'book' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      onClick={() => handleSort('publisher')}
                      className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors select-none"
                    >
                      Видавець {sortConfig?.key === 'publisher' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      onClick={() => handleSort('year')}
                      className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors select-none"
                    >
                      Рік {sortConfig?.key === 'year' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      onClick={() => handleSort('isbn')}
                      className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors select-none"
                    >
                      ISBN {sortConfig?.key === 'isbn' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      onClick={() => handleSort('pages')}
                      className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors select-none"
                    >
                      Стор. {sortConfig?.key === 'pages' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
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
                  {processedEditions.map((edition) => (
                    <tr 
                      key={edition.id} 
                      className="hover:bg-blue-50/50 transition-colors group"
                    >
                      <td className="px-6 py-4">
                         <div className="font-semibold text-slate-800">{edition.book?.title || '-'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-600 font-medium bg-slate-100 px-2 py-1 rounded text-sm">
                          {edition.publisher?.name || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {edition.yearPublication ? new Date(edition.yearPublication).getFullYear() : '-'}
                      </td>
                      <td className="px-6 py-4">
                         {edition.ISBN ? (
                           <span className="font-mono text-xs text-slate-600 bg-slate-50 border border-slate-200 px-2 py-1 rounded">
                             {edition.ISBN}
                           </span>
                         ) : (
                           <span className="text-slate-400 text-sm">-</span>
                         )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {edition.pages || '-'}
                      </td>
                      
                      {/* Кнопки Дій - ПРИХОВАНІ ДЛЯ ЧИТАЧА */}
                      {!isReader && (
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-3 opacity-80 group-hover:opacity-100 transition-opacity">
                            <Link 
                              to={`/editions/${edition.id}`}
                              className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              Редагувати
                            </Link>
                            <button 
                              onClick={() => {
                                const confirmMessage = `Ви впевнені, що хочете видалити видання "${edition.book?.title}"?`;
                                if (window.confirm(confirmMessage)) {
                                  deleteEdition.mutate(edition.id);
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
              <span className="text-4xl mb-3">📖</span>
              <p className="text-lg font-medium">
                {searchQuery ? 'За вашим запитом нічого не знайдено' : 'Список видань порожній'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};