import { useState, useMemo } from 'react';
import { Link } from '@tanstack/react-router';
import { useSuppliers, useDeleteSupplier } from '../api';
import { ISupplier } from '../types';

export const SupplierListPage = () => {
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

  // Мемоізація даних (фільтрація + сортування)
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
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-gray-600">Завантаження постачальників...</div>
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
            <h1 className="text-4xl font-bold text-gray-900">Постачальники</h1>
            <p className="text-gray-600 mt-2">
              Знайдено постачальників: {processedSuppliers.length} (Всього: {suppliers?.length || 0})
            </p>
          </div>
          <Link
            to="/suppliers/new"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            + Додати постачальника
          </Link>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Пошук за назвою, адресою або контактами..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm transition-all"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {processedSuppliers.length > 0 ? (
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th 
                    onClick={() => handleSort('name')}
                    className="px-6 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-200 transition-colors select-none"
                  >
                    Назва {sortConfig?.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    onClick={() => handleSort('address')}
                    className="px-6 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-200 transition-colors select-none"
                  >
                    Адреса {sortConfig?.key === 'address' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    onClick={() => handleSort('contact')}
                    className="px-6 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-200 transition-colors select-none"
                  >
                    Контакт {sortConfig?.key === 'contact' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Дії</th>
                </tr>
              </thead>
              <tbody>
                {processedSuppliers.map((supplier, index) => (
                  <tr
                    key={supplier.id}
                    className={`border-b hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{supplier.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{supplier.address || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{supplier.contact || '-'}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link
                        to="/suppliers/$supplierId"
                        params={{ supplierId: supplier.id.toString() }}
                        className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium transition-colors"
                      >
                        Редагувати
                      </Link>
                      <button
                        onClick={() => {
                          if (window.confirm(`Ви впевнені, що хочете видалити постачальника "${supplier.name}"?`)) {
                            deleteSupplier.mutate(supplier.id);
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
                {searchQuery ? 'За вашим запитом нічого не знайдено' : 'Постачальників не знайдено'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};