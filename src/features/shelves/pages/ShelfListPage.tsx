import { useState, useMemo } from 'react';
import { Link } from '@tanstack/react-router';
import { useShelves, useDeleteShelf } from '../api';
import { IShelf } from '../types';

export const ShelvesListPage = () => {
  const { data: shelves, isLoading, error } = useShelves();
  const deleteShelf = useDeleteShelf();

  // State for search and sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{ 
    key: keyof IShelf | 'cabinet'; 
    direction: 'asc' | 'desc' 
  } | null>(null);

  // Sorting handler
  const handleSort = (key: keyof IShelf | 'cabinet') => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Memoization of data (filtering + sorting)
  const processedShelves = useMemo(() => {
    if (!shelves) return [];

    let result = [...shelves];

    // 1. Search
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter((shelf) => 
        shelf.shelfcode.toLowerCase().includes(lowerQuery) ||
        (shelf.cabinet?.name || '').toLowerCase().includes(lowerQuery) ||
        shelf.id.toString().includes(lowerQuery)
      );
    }

    // 2. Sorting
    if (sortConfig) {
      result.sort((a, b) => {
        let aValue: string | number = '';
        let bValue: string | number = '';

        if (sortConfig.key === 'cabinet') {
          aValue = a.cabinet?.name || '';
          bValue = b.cabinet?.name || '';
        } else {
          // @ts-ignore
          aValue = a[sortConfig.key] || '';
          // @ts-ignore
          bValue = b[sortConfig.key] || '';
        }

        if (aValue === bValue) return 0;

        // Number sorting (ID)
        if (typeof aValue === 'number' && typeof bValue === 'number') {
           return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
        }

        // String sorting
        const comparison = String(aValue).localeCompare(String(bValue), 'uk');
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [shelves, searchQuery, sortConfig]);

  if (isLoading) 
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-gray-600">Завантаження полиць...</div>
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
            <h1 className="text-4xl font-bold text-gray-900">Полиці</h1>
            <p className="text-gray-600 mt-2">
              Знайдено полиць: {processedShelves.length} (Всього: {shelves?.length || 0})
            </p>
          </div>
          <Link 
            to="/shelves/new" 
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            + Додати полицю
          </Link>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Пошук за кодом полиці або назвою шафи..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm transition-all"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {processedShelves.length > 0 ? (
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th 
                    onClick={() => handleSort('id')}
                    className="px-6 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-200 transition-colors select-none"
                  >
                    ID {sortConfig?.key === 'id' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    onClick={() => handleSort('shelfcode')}
                    className="px-6 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-200 transition-colors select-none"
                  >
                    Код {sortConfig?.key === 'shelfcode' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    onClick={() => handleSort('cabinet')}
                    className="px-6 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-200 transition-colors select-none"
                  >
                    Шафа {sortConfig?.key === 'cabinet' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Дії</th>
                </tr>
              </thead>
              <tbody>
                {processedShelves.map((shelf, index) => (
                  <tr 
                    key={shelf.id} 
                    className={`border-b hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{shelf.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{shelf.shelfcode}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{shelf.cabinet?.name || '-'}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link 
                        to="/shelves/$shelfId"
                        params={{ shelfId: shelf.id.toString() }}
                        className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium transition-colors"
                      >
                        Редагувати
                      </Link>
                      <button 
                        onClick={() => {
                          if (window.confirm(`Ви впевнені, що хочете видалити полицю "${shelf.shelfcode}"?`)) {
                            deleteShelf.mutate(shelf.id);
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
                {searchQuery ? 'За вашим запитом нічого не знайдено' : 'Полиць не знайдено'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};