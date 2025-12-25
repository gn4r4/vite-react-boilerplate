import { useState, useMemo } from 'react';
import { Link } from '@tanstack/react-router';
import { useLocations, useDeleteLocation } from '../api';
import { ILocation } from '../types';

export const LocationListPage = () => {
  const { data: locations, isLoading, error } = useLocations();
  const deleteLocation = useDeleteLocation();
  
  // Стейт для фільтрації та пошуку
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'free' | 'occupied'>('all');

  // Фільтрація даних
  const filteredLocations = useMemo(() => {
    if (!locations) return [];

    return locations.filter(loc => {
      // 1. Фільтр по статусу
      if (filterStatus === 'free' && loc.copybook !== null) return false;
      if (filterStatus === 'occupied' && loc.copybook === null) return false;

      // 2. Пошук
      if (searchQuery) {
        const lowerQuery = searchQuery.toLowerCase();
        
        // Пошук по ID
        const matchId = loc.id.toString().includes(lowerQuery);
        
        // Пошук по полиці/шафі
        const matchShelfCode = loc.shelf?.shelfcode?.toLowerCase().includes(lowerQuery) || 
                               loc.shelf?.code?.toLowerCase().includes(lowerQuery);
        const matchCabinet = loc.shelf?.cabinet?.name.toLowerCase().includes(lowerQuery);

        // Пошук по книзі (безпечна перевірка)
        const bookTitle = loc.copybook?.edition?.book?.title?.toLowerCase() || '';
        const matchBook = bookTitle.includes(lowerQuery);

        return matchId || matchShelfCode || matchCabinet || matchBook;
      }

      return true;
    });
  }, [locations, searchQuery, filterStatus]);

  // Групування місць за полицями зі статистикою
  const groupedByShelf = useMemo(() => {
    const groups: { [key: string]: { shelf: any; locations: ILocation[]; total: number; free: number } } = {};
    
    filteredLocations.forEach(loc => {
      const shelfKey = loc.shelf?.id ? `shelf-${loc.shelf.id}` : 'no-shelf';
      
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
    
    // Сортування груп
    return Object.values(groups).sort((a, b) => {
        if (!a.shelf) return 1;
        if (!b.shelf) return -1;
        
        const cabinetA = a.shelf.cabinet?.name || '';
        const cabinetB = b.shelf.cabinet?.name || '';
        
        if (cabinetA !== cabinetB) return cabinetA.localeCompare(cabinetB);
        
        const codeA = a.shelf.code || a.shelf.shelfcode || '';
        const codeB = b.shelf.code || b.shelf.shelfcode || '';
        
        return codeA.localeCompare(codeB);
    });
  }, [filteredLocations]);

  // Загальна статистика
  const stats = useMemo(() => {
     const total = filteredLocations.length;
     const free = filteredLocations.filter(l => l.copybook === null).length;
     return { total, free, occupied: total - free };
  }, [filteredLocations]);

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
                 Знайдено місць: <span className="font-bold text-gray-900">{stats.total}</span>
               </span>
               <span className="bg-green-50 px-3 py-1 rounded shadow-sm border border-green-100">
                 Вільно: <span className="font-bold text-green-700">{stats.free}</span>
               </span>
               <span className="bg-red-50 px-3 py-1 rounded shadow-sm border border-red-100">
                 Зайнято: <span className="font-bold text-red-700">{stats.occupied}</span>
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

        {/* Toolbar */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 w-full">
            <input 
                type="text" 
                placeholder="Пошук за ID, шафою, полицею або назвою книги..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition"
            />
          </div>
          
          <div className="flex bg-gray-100 p-1 rounded-lg">
            {[
                { key: 'all', label: 'Всі' },
                { key: 'free', label: 'Вільні' },
                { key: 'occupied', label: 'Зайняті' }
            ].map((option) => (
                <button
                    key={option.key}
                    onClick={() => setFilterStatus(option.key as any)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                        filterStatus === option.key 
                        ? 'bg-white text-blue-700 shadow-sm' 
                        : 'text-gray-600 hover:bg-gray-200'
                    }`}
                >
                    {option.label}
                </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {groupedByShelf && groupedByShelf.length > 0 ? (
            <div className="space-y-6 p-6">
              {groupedByShelf.map((group, groupIndex) => (
                <div key={group.shelf?.id ? `shelf-${group.shelf.id}` : `no-shelf-${groupIndex}`} className="border border-gray-200 rounded-lg overflow-hidden">
                  
                  {/* Заголовок групи */}
                  <div className="bg-gray-100 px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {group.shelf ? (
                              <>
                                <span className="text-gray-500 font-normal">Шафа:</span> {group.shelf.cabinet?.name || '?'} 
                                <span className="mx-2 text-gray-400">|</span> 
                                <span className="text-gray-500 font-normal">Полиця:</span> {group.shelf.code || group.shelf.shelfcode}
                              </>
                          ) : 'Не прив\'язано до полиці'}
                        </h3>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                          <div className="text-xl font-bold text-gray-900">{group.total}</div>
                          <div className="text-[10px] uppercase tracking-wider text-gray-500">всього</div>
                        </div>
                        <div className="w-px h-8 bg-gray-300 hidden sm:block"></div>
                        <div className="text-right hidden sm:block">
                          <div className="text-xl font-bold text-green-700">{group.free}</div>
                          <div className="text-[10px] uppercase tracking-wider text-green-600">вільно</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Таблиця */}
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
                                {location.copybook ? (
                                    <div className="flex flex-col">
                                        <span className="font-medium text-gray-900">
                                            {/* Безпечне відображення назви */}
                                            {location.copybook.edition?.book?.title || 'Назва невідома'}
                                        </span>
                                        <span className="text-xs text-gray-500">Копія ID: {location.copybook.id}</span>
                                    </div>
                                ) : (
                                    <span className="text-gray-400 italic">-</span>
                                )}
                            </td>
                            <td className="px-6 py-4 text-right space-x-2">
                              {location.copybook ? (
                                <Link 
                                  to="/copybooks/$copybookId"
                                  params={{ copybookId: location.copybook.id.toString() }}
                                  className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium transition-colors"
                                >
                                  До книги
                                </Link>
                              ) : (
                                <Link 
                                  to="/locations/$locationId"
                                  params={{ locationId: location.id.toString() }}
                                  className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium transition-colors"
                                >
                                  Редагувати
                                </Link>
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
                {searchQuery ? 'За вашим запитом нічого не знайдено' : 'Локацій не знайдено'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};