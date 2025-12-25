import { useState, useMemo } from 'react';
import { Link } from '@tanstack/react-router';
import { useEditions, useDeleteEdition } from '../api';
import { IEdition } from './types';

export const EditionsListPage = () => {
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

  // Мемоізація даних (фільтрація + сортування)
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

        // Визначаємо значення для порівняння в залежності від ключа
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
            // Перетворюємо дати в timestamp для коректного порівняння чисел
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
        
        // Логіка для рядків (localeCompare) та чисел
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
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-gray-600">Завантаження видань...</div>
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
            <h1 className="text-4xl font-bold text-gray-900">Видання</h1>
            <p className="text-gray-600 mt-2">
              Знайдено видань: {processedEditions.length} (Всього: {editions?.length || 0})
            </p>
          </div>
          <Link 
            to="/editions/new" 
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            + Додати видання
          </Link>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Пошук за книгою, видавцем або ISBN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm transition-all"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {processedEditions.length > 0 ? (
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th 
                    onClick={() => handleSort('book')}
                    className="px-6 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-200 transition-colors select-none"
                  >
                    Книга {sortConfig?.key === 'book' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    onClick={() => handleSort('publisher')}
                    className="px-6 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-200 transition-colors select-none"
                  >
                    Видавець {sortConfig?.key === 'publisher' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    onClick={() => handleSort('year')}
                    className="px-6 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-200 transition-colors select-none"
                  >
                    Рік {sortConfig?.key === 'year' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    onClick={() => handleSort('isbn')}
                    className="px-6 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-200 transition-colors select-none"
                  >
                    ISBN {sortConfig?.key === 'isbn' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    onClick={() => handleSort('pages')}
                    className="px-6 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-200 transition-colors select-none"
                  >
                    Сторінки {sortConfig?.key === 'pages' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Дії</th>
                </tr>
              </thead>
              <tbody>
                {processedEditions.map((edition, index) => (
                  <tr 
                    key={edition.id} 
                    className={`border-b hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                  >
                    <td className="px-6 py-4 text-sm text-gray-900">{edition.book?.title || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{edition.publisher?.name || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {edition.yearPublication ? new Date(edition.yearPublication).getFullYear() : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-mono">{edition.ISBN || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{edition.pages || '-'}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link 
                        to={`/editions/${edition.id}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium transition-colors"
                      >
                        Редагувати
                      </Link>
                      <button 
                        onClick={() => {
                          const confirmMessage = `Ви впевнені, що хочете видалити видання "${edition.book?.title}" (${edition.publisher?.name})?`;
                          if (window.confirm(confirmMessage)) {
                            deleteEdition.mutate(edition.id);
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
                {searchQuery ? 'За вашим запитом нічого не знайдено' : 'Видань не знайдено'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};