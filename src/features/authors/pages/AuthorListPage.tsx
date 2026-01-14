import { useState, useMemo } from 'react';
import { Link } from '@tanstack/react-router';
import { useAuthors, useDeleteAuthor } from '../api';
import { IAuthor } from '../types';
import { useAuthStore } from '@/store/authStore'; // Імпорт стору

export const AuthorsListPage = () => {
  // 1. Отримуємо роль
  const role = useAuthStore((state) => state.user?.role);
  const isReader = role === 'READER' || !role;

  const { data: authors, isLoading, error } = useAuthors();
  const deleteAuthor = useDeleteAuthor();

  // Стейт для пошуку та сортування
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof IAuthor; direction: 'asc' | 'desc' } | null>(null);

  // Логіка сортування
  const handleSort = (key: keyof IAuthor) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Мемоізація фільтрації та сортування
  const processedAuthors = useMemo(() => {
    if (!authors) return [];

    let result = [...authors];

    // 1. Фільтрація
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter((author) => 
        author.firstname.toLowerCase().includes(lowerQuery) ||
        author.lastname.toLowerCase().includes(lowerQuery) ||
        (author.patronymic && author.patronymic.toLowerCase().includes(lowerQuery)) ||
        (author.fullName && author.fullName.toLowerCase().includes(lowerQuery))
      );
    }

    // 2. Сортування
    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue === bValue) return 0;
        
        // Обробка null/undefined (завжди в кінець)
        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        let comparison = 0;

        // Спеціальна логіка для дат
        if (sortConfig.key === 'dateofbirth') {
            const dateA = new Date(aValue as string | Date).getTime();
            const dateB = new Date(bValue as string | Date).getTime();
            comparison = dateA - dateB;
        } 
        // Логіка для рядків
        else if (typeof aValue === 'string' && typeof bValue === 'string') {
            comparison = aValue.localeCompare(bValue, 'uk');
        } 
        // Логіка для чисел
        else {
            comparison = (aValue < bValue) ? -1 : 1;
        }

        return sortConfig.direction === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [authors, searchQuery, sortConfig]);

  if (isLoading) 
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-gray-500 font-medium">Завантаження списку авторів...</div>
        </div>
      </div>
    );

  if (error) 
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-red-100 text-center">
          <div className="text-4xl mb-2">⚠️</div>
          <h3 className="text-lg font-bold text-gray-800">Виникла помилка</h3>
          <p className="text-red-500">Не вдалося завантажити авторів.</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Автори</h1>
            <p className="text-slate-500 mt-1">
              Знайдено {processedAuthors.length} із {authors?.length || 0} записів
            </p>
          </div>
          
          {/* Кнопка додавання - ПРИХОВАНА ДЛЯ ЧИТАЧА */}
          {!isReader && (
            <Link 
              to="/authors/new" 
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 active:scale-95 transition-all shadow-md shadow-blue-200 font-medium"
            >
              <span>+</span> Додати автора
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
            placeholder="Пошук за ім'ям, прізвищем..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 bg-white rounded-2xl border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700 placeholder:text-slate-400"
          />
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {processedAuthors.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full whitespace-nowrap">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th 
                      onClick={() => handleSort('firstname')}
                      className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors select-none"
                    >
                      Ім'я {sortConfig?.key === 'firstname' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      onClick={() => handleSort('lastname')}
                      className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors select-none"
                    >
                      Прізвище {sortConfig?.key === 'lastname' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      onClick={() => handleSort('patronymic')}
                      className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors select-none"
                    >
                      По батькові {sortConfig?.key === 'patronymic' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      onClick={() => handleSort('dateofbirth')}
                      className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors select-none"
                    >
                      Дата народження {sortConfig?.key === 'dateofbirth' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
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
                  {processedAuthors.map((author) => (
                    <tr 
                      key={author.id} 
                      className="hover:bg-blue-50/50 transition-colors group"
                    >
                      <td className="px-6 py-4 text-slate-800 font-medium">{author.firstname}</td>
                      <td className="px-6 py-4 text-slate-800 font-semibold">{author.lastname}</td>
                      <td className="px-6 py-4 text-slate-600">{author.patronymic || '-'}</td>
                      <td className="px-6 py-4 text-slate-600">
                        {author.dateofbirth 
                          ? new Date(author.dateofbirth).toLocaleDateString('uk-UA')
                          : <span className="text-slate-400">-</span>
                        }
                      </td>
                      
                      {/* Кнопки Дій - ПРИХОВАНІ ДЛЯ ЧИТАЧА */}
                      {!isReader && (
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-3 opacity-80 group-hover:opacity-100 transition-opacity">
                            <Link 
                              to="/authors/$authorId" 
                              params={{ authorId: author.id.toString() }} 
                              className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              Редагувати
                            </Link>
                            <button 
                              onClick={() => {
                                if (window.confirm(`Ви впевнені, що хочете видалити автора ${author.lastname} ${author.firstname}?`)) {
                                  deleteAuthor.mutate(author.id);
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
              <span className="text-4xl mb-3">👤</span>
              <p className="text-lg font-medium">
                {searchQuery ? 'За вашим запитом нічого не знайдено' : 'Список авторів порожній'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};