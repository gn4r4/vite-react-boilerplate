import { useState, useMemo } from 'react';
import { Link } from '@tanstack/react-router';
import { useSuppliers, useDeleteSupplier } from '../api';
import { ISupplier } from '../types';
import { useAuthStore } from '@/store/authStore';

export const SupplierListPage = () => {
  // 1. Отримуємо роль
  const role = useAuthStore((state) => state.user?.role);
  const isReader = role === 'READER';

  const { data: suppliers, isLoading, error } = useSuppliers();
  const deleteSupplier = useDeleteSupplier();

  // Стейт для пошуку та сортування
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{ 
    key: keyof ISupplier; 
    direction: 'asc' | 'desc' 
  } | null>(null);

  // Обробник сортування
  const handleSort = (key: keyof ISupplier) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Мемоізація даних
  const processedSuppliers = useMemo(() => {
    if (!suppliers) return [];

    let result = [...suppliers];

    // 1. Пошук
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter((supplier) => 
        supplier.name.toLowerCase().includes(lowerQuery) ||
        (supplier.address && supplier.address.toLowerCase().includes(lowerQuery)) ||
        (supplier.contact && supplier.contact.toLowerCase().includes(lowerQuery))
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
        
        // Обробка пустих значень
        if (aValue === '') return 1;
        if (bValue === '') return -1;

        const comparison = aValue.localeCompare(bValue, 'uk');
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [suppliers, searchQuery, sortConfig]);

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-gray-500 font-medium">Завантаження постачальників...</div>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-red-100 text-center">
          <div className="text-4xl mb-2">⚠️</div>
          <h3 className="text-lg font-bold text-gray-800">Виникла помилка</h3>
          <p className="text-red-500">Не вдалося завантажити список постачальників.</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Постачальники</h1>
            <p className="text-slate-500 mt-1">
              Знайдено {processedSuppliers.length} із {suppliers?.length || 0} партнерів
            </p>
          </div>
          
          {/* Кнопка додавання - ПРИХОВАНА ДЛЯ ЧИТАЧА */}
          {!isReader && (
            <Link
              to="/suppliers/new"
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 active:scale-95 transition-all shadow-md shadow-blue-200 font-medium"
            >
              <span>+</span> Додати постачальника
            </Link>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
            🔍
          </div>
          <input
            type="text"
            placeholder="Пошук за назвою, адресою або контактами..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 bg-white rounded-2xl border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700 placeholder:text-slate-400"
          />
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {processedSuppliers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full whitespace-nowrap">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th 
                      onClick={() => handleSort('name')}
                      className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors select-none"
                    >
                      Назва {sortConfig?.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      onClick={() => handleSort('address')}
                      className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors select-none"
                    >
                      Адреса {sortConfig?.key === 'address' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      onClick={() => handleSort('contact')}
                      className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors select-none"
                    >
                      Контакт {sortConfig?.key === 'contact' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    
                    {/* Заголовок Дій - ПРИХОВАНИЙ ДЛЯ ЧИТАЧА */}
                    {!isReader && (
                      <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Дії
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {processedSuppliers.map((supplier) => (
                    <tr
                      key={supplier.id}
                      className="hover:bg-blue-50/50 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-lg">
                                🏢
                            </span>
                            <span className="font-semibold text-slate-800">{supplier.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {supplier.address || <span className="text-slate-400 italic">-</span>}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {supplier.contact ? (
                            <span className="bg-slate-100 px-2 py-1 rounded text-slate-700 font-mono text-xs border border-slate-200">
                                {supplier.contact}
                            </span>
                        ) : (
                            <span className="text-slate-400 italic">-</span>
                        )}
                      </td>
                      
                      {/* Кнопки Дій - ПРИХОВАНІ ДЛЯ ЧИТАЧА */}
                      {!isReader && (
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-3 opacity-80 group-hover:opacity-100 transition-opacity">
                            <Link
                              to="/suppliers/$supplierId"
                              params={{ supplierId: supplier.id.toString() }}
                              className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              Редагувати
                            </Link>
                            <button
                              onClick={() => {
                                if (window.confirm(`Ви впевнені, що хочете видалити постачальника "${supplier.name}"?`)) {
                                  deleteSupplier.mutate(supplier.id);
                                }
                              }}
                              className="text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
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
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <span className="text-4xl mb-3">🤝</span>
              <p className="text-lg font-medium">
                {searchQuery ? 'За вашим запитом нічого не знайдено' : 'Список постачальників порожній'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};