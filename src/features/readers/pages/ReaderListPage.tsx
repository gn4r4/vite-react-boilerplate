import { useState, useMemo } from 'react';
import { Link } from '@tanstack/react-router';
import { useReaders, useDeleteReader } from '../api';
import { IReader } from '../types';

export const ReaderListPage = () => {
  const { data: readers, isLoading, error } = useReaders();
  const deleteReader = useDeleteReader();

  // Стейт для пошуку та сортування
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{ 
    key: keyof IReader; 
    direction: 'asc' | 'desc' 
  } | null>(null);

  // Обробник сортування
  const handleSort = (key: keyof IReader) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Мемоізація даних (фільтрація + сортування)
  const processedReaders = useMemo(() => {
    if (!readers) return [];

    let result = [...readers];

    // 1. Пошук
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter((reader) => 
        reader.fullName.toLowerCase().includes(lowerQuery) ||
        reader.contact.toLowerCase().includes(lowerQuery) ||
        reader.address.toLowerCase().includes(lowerQuery) ||
        reader.id.toString().includes(lowerQuery)
      );
    }

    // 2. Сортування
    if (sortConfig) {
      result.sort((a, b) => {
        // @ts-ignore
        const aValue = a[sortConfig.key] ? String(a[sortConfig.key]) : '';
        // @ts-ignore
        const bValue = b[sortConfig.key] ? String(b[sortConfig.key]) : '';

        if (aValue === bValue) return 0;

        // Сортування чисел (ID)
        if (sortConfig.key === 'id') {
            return sortConfig.direction === 'asc' 
                ? Number(aValue) - Number(bValue) 
                : Number(bValue) - Number(aValue);
        }

        const comparison = aValue.localeCompare(bValue, 'uk');
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [readers, searchQuery, sortConfig]);

  if (isLoading) 
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-gray-600">Завантаження читачів...</div>
      </div>
    );

  if (error) 
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-red-600">Помилка завантаження даних!</div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Читачі</h1>
            <p className="text-gray-600 mt-2">
              Знайдено читачів: {processedReaders.length} (Всього: {readers?.length || 0})
            </p>
          </div>
          <Link 
            to="/readers/new" 
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            + Додати читача
          </Link>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Пошук за ім'ям, контактами, адресою або ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm transition-all"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {processedReaders.length > 0 ? (
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
                    onClick={() => handleSort('fullName')}
                    className="px-6 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-200 transition-colors select-none"
                  >
                    ПІБ {sortConfig?.key === 'fullName' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    onClick={() => handleSort('contact')}
                    className="px-6 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-200 transition-colors select-none"
                  >
                    Контакт {sortConfig?.key === 'contact' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    onClick={() => handleSort('address')}
                    className="px-6 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-200 transition-colors select-none"
                  >
                    Адреса {sortConfig?.key === 'address' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Дії</th>
                </tr>
              </thead>
              <tbody>
                {processedReaders.map((reader, index) => (
                  <tr 
                    key={reader.id} 
                    className={`border-b hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">#{reader.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {reader.fullName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {reader.contact || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {reader.address || '-'}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link 
                        to={`/readers/${reader.id}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium transition-colors"
                      >
                        Редагувати
                      </Link>
                      <button 
                        onClick={() => {
                          if (window.confirm(`Ви дійсно хочете видалити читача "${reader.fullName}"?`)) {
                            deleteReader.mutate(reader.id);
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
                {searchQuery ? 'За вашим запитом нічого не знайдено' : 'Читачів не знайдено'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};