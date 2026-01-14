import { useState, useMemo } from 'react';
import { Link } from '@tanstack/react-router';
import { useLocations, useDeleteLocation } from '../api';
import { ILocation } from '../types';
import { useAuthStore } from '@/store/authStore';

export const LocationListPage = () => {
  // 1. Отримуємо роль
  const role = useAuthStore((state) => state.user?.role);
  const isReader = role === 'READER';

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

        // Пошук по книзі
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
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-gray-500 font-medium">Завантаження структури сховища...</div>
        </div>
      </div>
    );

  if (error) 
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-red-100 text-center">
          <div className="text-4xl mb-2">⚠️</div>
          <h3 className="text-lg font-bold text-gray-800">Виникла помилка</h3>
          <p className="text-red-500">Не вдалося завантажити локації.</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header & Stats */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-4">Локації зберігання</h1>
            <div className="flex flex-wrap gap-3">
               <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 flex flex-col">
                 <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Знайдено</span>
                 <span className="text-xl font-bold text-slate-800">{stats.total}</span>
               </div>
               <div className="bg-emerald-50 px-4 py-2 rounded-xl shadow-sm border border-emerald-100 flex flex-col">
                 <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider">Вільні</span>
                 <span className="text-xl font-bold text-emerald-700">{stats.free}</span>
               </div>
               <div className="bg-amber-50 px-4 py-2 rounded-xl shadow-sm border border-amber-100 flex flex-col">
                 <span className="text-[10px] uppercase font-bold text-amber-600 tracking-wider">Зайняті</span>
                 <span className="text-xl font-bold text-amber-700">{stats.occupied}</span>
               </div>
            </div>
          </div>
          
          {!isReader && (
            <Link 
              to="/locations/new" 
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-xl hover:bg-blue-700 active:scale-95 transition-all shadow-md shadow-blue-200 font-medium"
            >
              <span>+</span> Генерація місць
            </Link>
          )}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-2 rounded-2xl shadow-sm border border-slate-200">
          <div className="relative flex-1 w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                🔍
            </div>
            <input 
                type="text" 
                placeholder="Пошук за ID, шафою, полицею або назвою книги..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-transparent focus:outline-none text-slate-700 placeholder:text-slate-400"
            />
          </div>
          
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {[
                { key: 'all', label: 'Всі' },
                { key: 'free', label: 'Вільні' },
                { key: 'occupied', label: 'Зайняті' }
            ].map((option) => (
                <button
                    key={option.key}
                    onClick={() => setFilterStatus(option.key as any)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        filterStatus === option.key 
                        ? 'bg-white text-blue-600 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                    }`}
                >
                    {option.label}
                </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="space-y-6">
          {groupedByShelf && groupedByShelf.length > 0 ? (
            groupedByShelf.map((group, groupIndex) => (
              <div key={group.shelf?.id ? `shelf-${group.shelf.id}` : `no-shelf-${groupIndex}`} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in-up">
                
                {/* Заголовок групи (Полиця) */}
                <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100 flex flex-wrap gap-4 justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      {group.shelf ? (
                          <>
                            <span className="bg-white border border-slate-200 px-2 py-1 rounded-md text-sm text-slate-600 shadow-sm">
                                🗄️ {group.shelf.cabinet?.name || '?'}
                            </span>
                            <span className="text-slate-300">/</span>
                            <span>Полиця <span className="text-blue-600">{group.shelf.code || group.shelf.shelfcode}</span></span>
                          </>
                      ) : 'Не прив\'язано до полиці'}
                    </h3>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                     <span className="text-slate-500">Всього: <span className="font-semibold text-slate-800">{group.total}</span></span>
                     <span className="w-px h-3 bg-slate-300"></span>
                     <span className="text-slate-500">Вільно: <span className="font-semibold text-emerald-600">{group.free}</span></span>
                  </div>
                </div>

                {/* Таблиця */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left whitespace-nowrap">
                    <thead className="bg-white border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Статус</th>
                        <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Вміст</th>
                        {!isReader && <th className="px-6 py-3 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Дії</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {group.locations.map((location) => (
                        <tr key={location.id} className="hover:bg-blue-50/30 transition-colors group">
                          <td className="px-6 py-4 w-32">
                             {location.copybook ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">
                                   <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                   Зайнято
                                </span>
                             ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                                   <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                   Вільно
                                </span>
                             )}
                             <div className="text-[10px] text-slate-400 mt-1 pl-1">ID: #{location.id}</div>
                          </td>
                          <td className="px-6 py-4">
                              {location.copybook ? (
                                  <div className="flex items-center gap-3">
                                      <div className="w-8 h-10 bg-slate-100 rounded flex items-center justify-center text-lg shadow-sm">📕</div>
                                      <div>
                                          <div className="font-semibold text-slate-800">
                                              {location.copybook.edition?.book?.title || 'Назва невідома'}
                                          </div>
                                          <Link 
                                            to="/copybooks/$copybookId"
                                            params={{ copybookId: location.copybook.id.toString() }}
                                            className="text-xs text-blue-500 hover:underline flex items-center gap-1"
                                          >
                                            Копія #{location.copybook.id} ↗
                                          </Link>
                                      </div>
                                  </div>
                              ) : (
                                  <span className="text-slate-400 text-sm flex items-center gap-2">
                                    <span className="w-8 h-10 border border-dashed border-slate-200 rounded flex items-center justify-center opacity-50"></span>
                                    Порожнє місце
                                  </span>
                              )}
                          </td>
                          {!isReader && (
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                {!location.copybook && (
                                   <Link 
                                     to="/locations/$locationId"
                                     params={{ locationId: location.id.toString() }}
                                     className="text-sm font-medium text-slate-500 hover:text-blue-600 px-2 py-1 rounded hover:bg-slate-100 transition-colors"
                                   >
                                     Змінити
                                   </Link>
                                )}
                                <button 
                                  onClick={() => {
                                    if (window.confirm('Ви впевнені, що хочете видалити це місце?')) {
                                      deleteLocation.mutate(location.id);
                                    }
                                  }}
                                  className="text-sm font-medium text-slate-500 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50 transition-colors"
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
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-white rounded-3xl border border-dashed border-slate-200">
              <span className="text-5xl mb-4 opacity-50">🗺️</span>
              <p className="text-xl font-medium text-slate-600">
                {searchQuery ? 'Нічого не знайдено' : 'Список локацій порожній'}
              </p>
              <p className="text-sm">Спробуйте змінити фільтри або додати нові місця</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};