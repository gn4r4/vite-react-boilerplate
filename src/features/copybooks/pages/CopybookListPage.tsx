import { useState, useMemo } from 'react';
import { Link } from '@tanstack/react-router';
import { useCopybooks, useDeleteCopybook } from '../api';
import type { ICopybook } from '../types';
import { useAuthStore } from '@/store/authStore';

export const CopybooksListPage = () => {
  const role = useAuthStore((state) => state.user?.role);
  const isReader = role === 'READER' || !role;
  const canManage = !isReader;

  const { data: copybooks, isLoading, error } = useCopybooks();
  const deleteCopybook = useDeleteCopybook();

  const [searchQuery, setSearchQuery] = useState('');
  // 1. Додано стейт для фільтру
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  const [sortConfig, setSortConfig] = useState<{ 
    key: 'id' | 'title' | 'year' | 'status' | 'location'; 
    direction: 'asc' | 'desc' 
  } | null>(null);

  const handleSort = (key: 'id' | 'title' | 'year' | 'status' | 'location') => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const formatLocation = (location: ICopybook['location']) => {
    if (!location) return 'Не вказано';
    if (location.shelf) {
      const { shelf } = location;
      const cabinetName = (shelf.cabinet as any)?.name || (shelf.cabinet as any)?.number_cabinet || '?';
      return `${cabinetName}, Полиця: ${shelf.shelfcode}`;
    }
    return 'Не вказано';
  };

  const getYear = (dateStr: string | Date | undefined) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? '-' : date.getFullYear();
  };

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('доступн')) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (s.includes('видан')) return 'bg-blue-100 text-blue-700 border-blue-200';
    if (s.includes('списан') || s.includes('втрач')) return 'bg-red-100 text-red-700 border-red-200';
    if (s.includes('реставр')) return 'bg-amber-100 text-amber-700 border-amber-200';
    return 'bg-slate-100 text-slate-600 border-slate-200';
  };

  const processedCopybooks = useMemo(() => {
    if (!copybooks) return [];

    let result = [...copybooks];

    // 2. Логіка фільтрації по статусу
    if (filterStatus !== 'all') {
      result = result.filter((copybook) => {
        const s = copybook.status.toLowerCase();
        if (filterStatus === 'available') return s.includes('доступн');
        if (filterStatus === 'borrowed') return s.includes('видан');
        if (filterStatus === 'restoration') return s.includes('реставр');
        if (filterStatus === 'lost') return s.includes('списан') || s.includes('втрач');
        return true;
      });
    }

    // 3. Пошук
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter((copybook) => {
        const titleMatch = copybook.edition?.book?.title?.toLowerCase().includes(lowerQuery);
        const statusMatch = copybook.status.toLowerCase().includes(lowerQuery);
        const idMatch = copybook.id.toString().includes(lowerQuery);
        const yearMatch = getYear(copybook.edition?.yearPublication).toString().includes(lowerQuery);
        
        let locationMatch = false;
        if (copybook.location?.shelf) {
            const shelfCode = copybook.location.shelf.shelfcode.toLowerCase();
            const cabinetName = ((copybook.location.shelf.cabinet as any)?.name || '').toLowerCase();
            locationMatch = shelfCode.includes(lowerQuery) || cabinetName.includes(lowerQuery);
        }

        return titleMatch || statusMatch || idMatch || locationMatch || yearMatch;
      });
    }

    // 4. Сортування
    if (sortConfig) {
      result.sort((a, b) => {
        let aValue: string | number = '';
        let bValue: string | number = '';

        switch (sortConfig.key) {
          case 'id':
            return sortConfig.direction === 'asc' ? a.id - b.id : b.id - a.id;
          case 'title':
            aValue = a.edition?.book?.title || '';
            bValue = b.edition?.book?.title || '';
            break;
          case 'year':
            const yearA = a.edition?.yearPublication ? new Date(a.edition.yearPublication).getTime() : 0;
            const yearB = b.edition?.yearPublication ? new Date(b.edition.yearPublication).getTime() : 0;
            return sortConfig.direction === 'asc' ? yearA - yearB : yearB - yearA;
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
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
            const comparison = aValue.localeCompare(bValue, 'uk');
            return sortConfig.direction === 'asc' ? comparison : -comparison;
        }
        return 0;
      });
    }

    return result;
  }, [copybooks, searchQuery, filterStatus, sortConfig]);

  if (isLoading) 
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-gray-500 font-medium">Завантаження фізичних копій...</div>
        </div>
      </div>
    );

  if (error) 
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-red-100 text-center">
          <div className="text-4xl mb-2">⚠️</div>
          <h3 className="text-lg font-bold text-gray-800">Виникла помилка</h3>
          <p className="text-red-500">Не вдалося завантажити дані про копії.</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Фізичні копії книг</h1>
            <p className="text-slate-500 mt-1">
              Знайдено {processedCopybooks.length} із {copybooks?.length || 0} записів
            </p>
          </div>
          
          {canManage && (
            <Link 
              to="/copybooks/new" 
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 active:scale-95 transition-all shadow-md shadow-blue-200 font-medium"
            >
              <span>+</span> Додати копію
            </Link>
          )}
        </div>

        {/* 5. Toolbar (Пошук + Фільтри) */}
        <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-2 rounded-2xl shadow-sm border border-slate-200">
            <div className="relative flex-1 w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    🔍
                </div>
                <input
                    type="text"
                    placeholder="Пошук за ID, назвою, роком, статусом або локацією..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-transparent focus:outline-none text-slate-700 placeholder:text-slate-400"
                />
            </div>
            
            <div className="flex bg-slate-100 p-1 rounded-xl overflow-x-auto max-w-full">
                {[
                    { key: 'all', label: 'Всі' },
                    { key: 'available', label: 'Доступні' },
                    { key: 'borrowed', label: 'Видані' },
                    { key: 'restoration', label: 'Реставрація' },
                    { key: 'lost', label: 'Списані' },
                ].map((status) => (
                    <button
                        key={status.key}
                        onClick={() => setFilterStatus(status.key)}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                            filterStatus === status.key
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                        }`}
                    >
                        {status.label}
                    </button>
                ))}
            </div>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {processedCopybooks.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full whitespace-nowrap">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th 
                      onClick={() => handleSort('title')}
                      className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors select-none"
                    >
                      Книга / ID {sortConfig?.key === 'title' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    
                    <th 
                      onClick={() => handleSort('year')}
                      className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors select-none"
                    >
                      Рік {sortConfig?.key === 'year' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>

                    <th 
                      onClick={() => handleSort('status')}
                      className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors select-none"
                    >
                      Статус {sortConfig?.key === 'status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      onClick={() => handleSort('location')}
                      className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors select-none"
                    >
                      Локація {sortConfig?.key === 'location' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    
                    {canManage && (
                      <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Дії
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {processedCopybooks.map((copybook) => (
                    <tr 
                      key={copybook.id} 
                      className="hover:bg-blue-50/50 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-800">
                            {copybook.edition?.book?.title || 'Без назви'}
                          </span>
                          <span className="text-[10px] text-slate-400 mt-0.5 font-mono">ID: #{copybook.id}</span>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-slate-600 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                            {getYear(copybook.edition?.yearPublication)}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${getStatusColor(copybook.status)}`}>
                          {copybook.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                           <span className="text-lg opacity-70">📍</span>
                           {formatLocation(copybook.location)}
                        </div>
                      </td>
                      
                      {canManage && (
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-3 opacity-80 group-hover:opacity-100 transition-opacity">
                            <Link 
                              to={`/copybooks/${copybook.id}`}
                              className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              Редагувати
                            </Link>
                            {canManage && (
                              <button 
                                onClick={() => {
                                  const bookTitle = copybook.edition?.book?.title || 'Книга';
                                  if (window.confirm(`Видалити копію "${bookTitle}" (ID: ${copybook.id})?`)) {
                                    deleteCopybook.mutate(copybook.id);
                                  }
                                }}
                                className="text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
                              >
                                Видалити
                              </button>
                            )}
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
              <span className="text-4xl mb-3">📦</span>
              <p className="text-lg font-medium">
                {searchQuery ? 'За вашим запитом нічого не знайдено' : 'Список копій порожній'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};