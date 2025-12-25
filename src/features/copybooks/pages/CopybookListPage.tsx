import { useState, useMemo } from 'react';
import { Link } from '@tanstack/react-router';
import { useCopybooks, useDeleteCopybook } from '../api';
import type { ICopybook } from '../types';

export const CopybooksListPage = () => {
  const { data: copybooks, isLoading, error } = useCopybooks();
  const deleteCopybook = useDeleteCopybook();

  // Стейт для пошуку та сортування
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{ 
    key: 'id' | 'title' | 'status' | 'location'; 
    direction: 'asc' | 'desc' 
  } | null>(null);

  // Обробник сортування
  const handleSort = (key: 'id' | 'title' | 'status' | 'location') => {
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

  // Мемоізація даних (фільтрація + сортування)
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
        
        // Пошук по локації (назва шафи або код полиці)
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
          case 'id':
            aValue = a.id;
            bValue = b.id;
            break;
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
        
        if (typeof aValue === 'number' && typeof bValue === 'number') {
            return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
        }

        const comparison = String(aValue).localeCompare(String(bValue), 'uk');
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [copybooks, searchQuery, sortConfig]);

  if (isLoading) 
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-gray-600">Завантаження копій...</div>
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
            <h1 className="text-4xl font-bold text-gray-900">Копії книг</h1>
            <p className="text-gray-600 mt-2">
              Знайдено копій: {processedCopybooks.length} (Всього: {copybooks?.length || 0})
            </p>
          </div>
          <Link 
            to="/copybooks/new" 
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            + Додати копію
          </Link>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Пошук за назвою книги, статусом, полицею або ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm transition-all"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {processedCopybooks.length > 0 ? (
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
                    onClick={() => handleSort('title')}
                    className="px-6 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-200 transition-colors select-none"
                  >
                    Назва книги {sortConfig?.key === 'title' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    onClick={() => handleSort('status')}
                    className="px-6 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-200 transition-colors select-none"
                  >
                    Статус {sortConfig?.key === 'status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    onClick={() => handleSort('location')}
                    className="px-6 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-200 transition-colors select-none"
                  >
                    Місце {sortConfig?.key === 'location' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Дії</th>
                </tr>
              </thead>
              <tbody>
                {processedCopybooks.map((copybook, index) => (
                  <tr 
                    key={copybook.id} 
                    className={`border-b hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">#{copybook.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <span className="font-medium">{copybook.edition?.book?.title || 'Без назви'}</span>
                      <span className="text-gray-500 text-xs ml-2">({copybook.edition?.yearPublication ? new Date(copybook.edition.yearPublication).getFullYear() : '-'})</span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        copybook.status === 'доступний' ? 'bg-green-100 text-green-800' : 
                        copybook.status === 'виданий' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {copybook.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatLocation(copybook.location)}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link 
                        to={`/copybooks/${copybook.id}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium transition-colors"
                      >
                        Редагувати
                      </Link>
                      <button 
                        onClick={() => {
                          const bookTitle = copybook.edition?.book?.title || 'Книга';
                          if (window.confirm(`Видалити копію #${copybook.id} ("${bookTitle}")?`)) {
                            deleteCopybook.mutate(copybook.id);
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
                {searchQuery ? 'За вашим запитом нічого не знайдено' : 'Копій не знайдено'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};