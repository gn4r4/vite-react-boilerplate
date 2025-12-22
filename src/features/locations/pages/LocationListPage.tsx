import { useState, useMemo } from 'react';
import { Link } from '@tanstack/react-router';
import { useLocations, useDeleteLocation } from '../api';
import { ILocation } from '../types';

export const LocationListPage = () => {
  const { data: locations, isLoading, error } = useLocations();
  const deleteLocation = useDeleteLocation();
  
  // Стейт для фільтрації
  const [showFreeOnly, setShowFreeOnly] = useState(false);


  // Фільтрація даних
  const filteredLocations = locations?.filter(loc => {
    if (showFreeOnly) {
      return loc.copybook === null; // Показуємо тільки якщо немає книги
    }
    return true; // Показуємо всі
  });

  // Групування місць за полицями зі статистикою
  const groupedByShelf = useMemo(() => {
    const groups: { [key: string]: { shelf: any; locations: ILocation[]; total: number; free: number } } = {};
    
    filteredLocations?.forEach(loc => {
      const shelfKey = loc.shelf?.id || 'no-shelf';
      if (!groups[shelfKey]) {
        groups[shelfKey] = {
          shelf: loc.shelf,
          locations: [],
          total: 0,
          free: 0
        };
      }
      groups[shelfKey].locations.push(loc);
      groups[shelfKey].total += 1;
      if (loc.copybook === null) {
        groups[shelfKey].free += 1;
      }
    });
    
    return Object.values(groups);
  }, [filteredLocations]);

  // Статистика
  const totalCount = locations?.length || 0;
  const freeCount = locations?.filter(l => l.copybook === null).length || 0;

  if (isLoading) 
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-gray-600">Завантаження локацій...</div>
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
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Локації (Місця)</h1>
            <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
               <span className="bg-white px-3 py-1 rounded shadow-sm border">
                 Всього місць: <span className="font-bold text-gray-900">{totalCount}</span>
               </span>
               <span className="bg-green-50 px-3 py-1 rounded shadow-sm border border-green-100">
                 Вільно: <span className="font-bold text-green-700">{freeCount}</span>
               </span>
            </div>
          </div>
          <Link 
            to="/locations/new" 
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md"
          >
            + Додати місця
          </Link>
        </div>

        {/* Toolbar (Фільтри) */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-6 flex items-center gap-3">
          <label className="flex items-center cursor-pointer select-none">
            <div className="relative">
              <input 
                type="checkbox" 
                className="sr-only" 
                checked={showFreeOnly}
                onChange={() => setShowFreeOnly(!showFreeOnly)}
              />
              <div className={`block w-10 h-6 rounded-full transition ${showFreeOnly ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform ${showFreeOnly ? 'translate-x-4' : ''}`}></div>
            </div>
            <span className="ml-3 text-gray-700 font-medium">Показувати тільки вільні місця</span>
          </label>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {groupedByShelf && groupedByShelf.length > 0 ? (
            <div className="space-y-6 p-6">
              {groupedByShelf.map((group, groupIndex) => (
                <div key={group.shelf?.id || `no-shelf-${groupIndex}`} className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* Заголовок групи (полиця) */}
                  <div className="bg-gray-100 px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {group.shelf ? `Шафа: ${group.shelf.cabinet?.name || '?'}, Полиця: ${group.shelf.code || group.shelf.shelfcode}` : 'Не прив\'язано до полиці'}
                        </h3>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">{group.total}</div>
                          <div className="text-xs text-gray-600">місць всього</div>
                        </div>
                        <div className="w-px h-10 bg-gray-300"></div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-700">{group.free}</div>
                          <div className="text-xs text-green-600">вільно</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Таблиця місць для цієї полиці */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Статус</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Зайнято книгою</th>
                          <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Дії</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.locations.map((location, index) => (
                          <tr 
                            key={location.id} 
                            className={`border-b hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                          >
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">#{location.id}</td>
                            <td className="px-6 py-4 text-sm">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  location.copybook ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                              }`}>
                                  {location.copybook ? 'Зайнято' : 'Вільно'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                                {location.copybook 
                                  ? `${location.copybook.edition?.book?.title || 'Книга'} (ID: ${location.copybook.id})` 
                                  : '-'}
                            </td>
                            <td className="px-6 py-4 text-right space-x-2">
                              {location.copybook ? (
                                <Link 
                                  to="/copybooks/$copybookId"
                                  params={{ copybookId: location.copybook.id.toString() }}
                                  className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium transition-colors"
                                >
                                  Редагувати
                                </Link>
                              ) : (
                                <span className="text-gray-400 text-sm font-medium cursor-not-allowed">
                                  Редагувати
                                </span>
                              )}
                              <button 
                                onClick={() => {
                                  if (window.confirm('Ви впевнені, що хочете видалити це місце?')) {
                                    deleteLocation.mutate(location.id);
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
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-600">
              <p className="text-lg">
                {showFreeOnly ? 'Вільних місць не знайдено' : 'Локацій не знайдено'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};