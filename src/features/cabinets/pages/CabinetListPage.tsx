import { useState, useMemo } from 'react';
import { Link } from '@tanstack/react-router';
import { useCabinets, useDeleteCabinet } from '../api';
import { ICabinet } from './types';

export const CabinetsListPage = () => {
  const { data: cabinets, isLoading, error } = useCabinets();
  const deleteCabinet = useDeleteCabinet();

  // Стейт для пошуку та сортування
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof ICabinet; direction: 'asc' | 'desc' } | null>(null);

  // Обробник сортування
  const handleSort = (key: keyof ICabinet) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Мемоізація даних (фільтрація + сортування)
  const processedCabinets = useMemo(() => {
    if (!cabinets) return [];

    let result = [...cabinets];

    // 1. Фільтрація
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter((cabinet) => 
        cabinet.name.toLowerCase().includes(lowerQuery) ||
        (cabinet.description && cabinet.description.toLowerCase().includes(lowerQuery))
      );
    }

    // 2. Сортування
    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        // Якщо значення рівні
        if (aValue === bValue) return 0;
        
        // Обробка null (порожні значення в кінець)
        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        // Порівняння чисел (ID)
        if (typeof aValue === 'number' && typeof bValue === 'number') {
            return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
        }

        // Порівняння рядків
        const comparison = String(aValue).localeCompare(String(bValue), 'uk');
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [cabinets, searchQuery, sortConfig]);

  if (isLoading) 
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-gray-600">Завантаження шаф...</div>
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
            <h1 className="text-4xl font-bold text-gray-900">Шафи</h1>
            <p className="text-gray-600 mt-2">
              {searchQuery 
                ? `Знайдено: ${processedCabinets.length} (Всього: ${cabinets?.length || 0})` 
                : `Всього шаф: ${cabinets?.length || 0}`
              }
            </p>
          </div>
          <Link 
            to="/cabinets/new" 
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            + Додати шафу
          </Link>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Пошук за назвою або описом..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm transition-all"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {processedCabinets.length > 0 ? (
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
                    onClick={() => handleSort('name')}
                    className="px-6 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-200 transition-colors select-none"
                  >
                    Назва {sortConfig?.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    onClick={() => handleSort('description')}
                    className="px-6 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-200 transition-colors select-none"
                  >
                    Опис {sortConfig?.key === 'description' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Дії</th>
                </tr>
              </thead>
              <tbody>
                {processedCabinets.map((cabinet, index) => (
                  <tr 
                    key={cabinet.id} 
                    className={`border-b hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">#{cabinet.id}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{cabinet.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{cabinet.description || '-'}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link 
                        to="/cabinets/$cabinetId"
                        params={{ cabinetId: cabinet.id.toString() }}
                        className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium transition-colors"
                      >
                        Редагувати
                      </Link>
                      <button 
                        onClick={() => {
                          if (window.confirm(`Ви впевнені, що хочете видалити шафу "${cabinet.name}"?`)) {
                            deleteCabinet.mutate(cabinet.id);
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
                {searchQuery ? 'За вашим запитом нічого не знайдено' : 'Шаф не знайдено'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};