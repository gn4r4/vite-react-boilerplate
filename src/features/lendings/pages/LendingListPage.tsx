import { useState, useMemo } from 'react';
import { Link } from '@tanstack/react-router';
import { useLendings, useDeleteLending } from '../api';
import { ILending } from '../types';

export const LendingsListPage = () => {
  const { data: lendings, isLoading, error } = useLendings();
  const deleteLending = useDeleteLending();

  // Стейт
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'overdue' | 'closed'>('all');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  // Сортування
  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Логіка обробки даних
  const processedLendings = useMemo(() => {
    if (!lendings) return [];

    let result = [...lendings];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Пошук (Читач, Працівник, ID)
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter((l) => 
        l.reader?.fullName?.toLowerCase().includes(lowerQuery) ||
        l.employee?.fullName?.toLowerCase().includes(lowerQuery) ||
        l.id.toString().includes(lowerQuery)
      );
    }

    // 2. Фільтрація по статусу
    if (filterStatus !== 'all') {
      result = result.filter((l) => {
        const isClosed = !!l.dateReturn;
        const planDate = l.dateReturnPlanned ? new Date(l.dateReturnPlanned) : null;
        // Прострочено: не закрито І дата плану менше сьогодні
        const isOverdue = !isClosed && planDate && planDate < today;

        if (filterStatus === 'closed') return isClosed;
        if (filterStatus === 'active') return !isClosed; // Активні (включно з простроченими)
        if (filterStatus === 'overdue') return isOverdue;
        return true;
      });
    }

    // 3. Сортування
    if (sortConfig) {
      result.sort((a, b) => {
        let aValue: any = '';
        let bValue: any = '';

        switch (sortConfig.key) {
          case 'reader':
            aValue = a.reader?.fullName || '';
            bValue = b.reader?.fullName || '';
            break;
          case 'employee':
            aValue = a.employee?.fullName || '';
            bValue = b.employee?.fullName || '';
            break;
          case 'dateLending':
            aValue = new Date(a.dateLending).getTime();
            bValue = new Date(b.dateLending).getTime();
            break;
          case 'dateReturnPlanned':
            aValue = a.dateReturnPlanned ? new Date(a.dateReturnPlanned).getTime() : 0;
            bValue = b.dateReturnPlanned ? new Date(b.dateReturnPlanned).getTime() : 0;
            break;
          case 'copybooks':
            aValue = a.copybooks?.length || 0;
            bValue = b.copybooks?.length || 0;
            break;
          default:
            // @ts-ignore
            aValue = a[sortConfig.key];
            // @ts-ignore
            bValue = b[sortConfig.key];
        }

        if (aValue === bValue) return 0;
        
        if (typeof aValue === 'string') {
            return sortConfig.direction === 'asc' 
                ? aValue.localeCompare(bValue) 
                : bValue.localeCompare(aValue);
        }
        
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      });
    }

    return result;
  }, [lendings, searchQuery, filterStatus, sortConfig]);

  // Статистика для шапки
  const stats = useMemo(() => {
      if (!lendings) return { total: 0, overdue: 0, active: 0 };
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const active = lendings.filter(l => !l.dateReturn).length;
      const overdue = lendings.filter(l => !l.dateReturn && l.dateReturnPlanned && new Date(l.dateReturnPlanned) < today).length;
      
      return { total: lendings.length, active, overdue };
  }, [lendings]);

  if (isLoading) 
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-gray-600">Завантаження видачі...</div>
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
            <h1 className="text-4xl font-bold text-gray-900">Видача книг</h1>
            <div className="flex gap-4 mt-2 text-sm text-gray-600">
                <span>Всього: <span className="font-semibold text-gray-900">{stats.total}</span></span>
                <span className="text-blue-600">Активних: <span className="font-bold">{stats.active}</span></span>
                <span className="text-red-600">Прострочених: <span className="font-bold">{stats.overdue}</span></span>
            </div>
          </div>
          <Link 
            to="/lendings/new" 
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            + Додати видачу
          </Link>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
                <input
                    type="text"
                    placeholder="Пошук за читачем, працівником або ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
                />
            </div>
            <div className="flex space-x-2">
                {[
                    { key: 'all', label: 'Всі' },
                    { key: 'active', label: 'В процесі' },
                    { key: 'overdue', label: 'Прострочені' },
                    { key: 'closed', label: 'Повернуті' },
                ].map((status) => (
                    <button
                        key={status.key}
                        onClick={() => setFilterStatus(status.key as any)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            filterStatus === status.key
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                        }`}
                    >
                        {status.label}
                    </button>
                ))}
            </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {processedLendings.length > 0 ? (
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th onClick={() => handleSort('reader')} className="px-6 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-200 select-none">
                    Читач {sortConfig?.key === 'reader' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSort('employee')} className="px-6 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-200 select-none">
                    Працівник {sortConfig?.key === 'employee' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSort('dateLending')} className="px-6 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-200 select-none">
                    Дата видачі {sortConfig?.key === 'dateLending' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSort('dateReturnPlanned')} className="px-6 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-200 select-none">
                    Планове повернення {sortConfig?.key === 'dateReturnPlanned' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Фактичне повернення</th>
                  <th onClick={() => handleSort('copybooks')} className="px-6 py-3 text-center text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-200 select-none">
                    Книг {sortConfig?.key === 'copybooks' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Дії</th>
                </tr>
              </thead>
              <tbody>
                {processedLendings.map((lending, index) => {
                    const isOverdue = !lending.dateReturn && lending.dateReturnPlanned && new Date(lending.dateReturnPlanned) < new Date();
                    return (
                        <tr 
                            key={lending.id} 
                            className={`border-b hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                        >
                            <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                                {lending.reader?.fullName || '-'}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                                {lending.employee?.fullName || '-'}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                                {lending.dateLending ? new Date(lending.dateLending).toLocaleDateString('uk-UA') : '-'}
                            </td>
                            <td className={`px-6 py-4 text-sm font-medium ${isOverdue ? 'text-red-600' : 'text-gray-600'}`}>
                                {lending.dateReturnPlanned ? new Date(lending.dateReturnPlanned).toLocaleDateString('uk-UA') : '-'}
                                {isOverdue && <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Прострочено</span>}
                            </td>
                            <td className="px-6 py-4 text-sm">
                                {lending.dateReturn ? (
                                    <span className="text-green-600 font-medium">
                                        {new Date(lending.dateReturn).toLocaleDateString('uk-UA')}
                                    </span>
                                ) : (
                                    <span className="text-yellow-600 text-xs px-2 py-1 bg-yellow-100 rounded-full">В процесі</span>
                                )}
                            </td>
                            <td className="px-6 py-4 text-center text-sm text-gray-600">{lending.copybooks?.length || 0}</td>
                            <td className="px-6 py-4 text-right space-x-2">
                                <Link 
                                    to={`/lendings/${lending.id}`}
                                    className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium transition-colors"
                                >
                                    Редагувати
                                </Link>
                                <button 
                                    onClick={() => {
                                        if (window.confirm(`Видалити запис про видачу #${lending.id}?`)) {
                                            deleteLending.mutate(lending.id);
                                        }
                                    }}
                                    className="text-red-600 hover:text-red-800 hover:underline text-sm font-medium transition-colors"
                                >
                                    Видалити
                                </button>
                            </td>
                        </tr>
                    );
                })}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-gray-600">
              <p className="text-lg">
                {searchQuery ? 'Нічого не знайдено за вашим запитом' : 'Видач не знайдено'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};