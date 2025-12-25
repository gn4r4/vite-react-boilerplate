import { useState, useMemo } from 'react';
import { Link } from '@tanstack/react-router';
import { useAuthors, useDeleteAuthor } from '../api';
import { IAuthor } from '../types';

export const AuthorsListPage = () => {
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

    // 1. Фільтрація (Пошук по всіх текстових полях)
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter((author) => 
        author.firstname.toLowerCase().includes(lowerQuery) ||
        author.lastname.toLowerCase().includes(lowerQuery) ||
        (author.patronymic && author.patronymic.toLowerCase().includes(lowerQuery)) ||
        // Про всяк випадок залишаємо пошук по повному імені, якщо воно приходить з бекенду
        (author.fullName && author.fullName.toLowerCase().includes(lowerQuery))
      );
    }

    // 2. Сортування
    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        // Якщо значення рівні, порядок не міняємо
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
        // Логіка для рядків (з врахуванням локалізації)
        else if (typeof aValue === 'string' && typeof bValue === 'string') {
            comparison = aValue.localeCompare(bValue, 'uk');
        } 
        // Логіка для чисел (id)
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
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-gray-600">Завантаження авторів...</div>
      </div>
    );

  if (error) 
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-red-600">Помилка завантаження данних!</div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Автори</h1>
            <p className="text-gray-600 mt-2">
              Знайдено авторів: {processedAuthors.length} (Всього: {authors?.length || 0})
            </p>
          </div>
          <Link 
            to="/authors/new" 
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            + Додати автора
          </Link>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Пошук за ім'ям, прізвищем..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm transition-all"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {processedAuthors.length > 0 ? (
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th 
                    onClick={() => handleSort('firstname')}
                    className="px-6 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-200 transition-colors select-none"
                  >
                    Ім'я {sortConfig?.key === 'firstname' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    onClick={() => handleSort('lastname')}
                    className="px-6 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-200 transition-colors select-none"
                  >
                    Прізвище {sortConfig?.key === 'lastname' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    onClick={() => handleSort('patronymic')}
                    className="px-6 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-200 transition-colors select-none"
                  >
                    По батькові {sortConfig?.key === 'patronymic' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    onClick={() => handleSort('dateofbirth')}
                    className="px-6 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-200 transition-colors select-none"
                  >
                    Дата народження {sortConfig?.key === 'dateofbirth' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Дії</th>
                </tr>
              </thead>
              <tbody>
                {processedAuthors.map((author, index) => (
                  <tr 
                    key={author.id} 
                    className={`border-b hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                  >
                    <td className="px-6 py-4 text-sm text-gray-900">{author.firstname}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{author.lastname}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{author.patronymic || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {author.dateofbirth 
                        ? new Date(author.dateofbirth).toLocaleDateString('uk-UA')
                        : '-'
                      }
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link 
                        to="/authors/$authorId" 
                        params={{ authorId: author.id.toString() }} 
                        className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium transition-colors"
                      >
                        Редагувати
                      </Link>
                      <button 
                        onClick={() => {
                          if (window.confirm(`Ви впевнені, що хочете видалити автора ${author.lastname} ${author.firstname}?`)) {
                            deleteAuthor.mutate(author.id);
                          }
                        }}
                        className="text-red-600 hover:text-red-800 hover:underline text-sm font-medium transition-colors"
                      >
                        Видалити
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-gray-600">
              <p className="text-lg">
                {searchQuery ? 'За вашим запитом нічого не знайдено' : 'Авторів не знайдено'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};