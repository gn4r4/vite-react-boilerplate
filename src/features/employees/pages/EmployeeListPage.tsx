import { useState, useMemo } from 'react';
import { Link } from '@tanstack/react-router';
import { useEmployees, useDeleteEmployee } from '../api';
import { IEmployee } from './types';

export const EmployeesListPage = () => {
  const { data: employees, isLoading, error } = useEmployees();
  const deleteEmployee = useDeleteEmployee();

  // Стейт для пошуку та сортування
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{ 
    key: 'id' | 'fullName' | 'position' | 'contact' | 'address'; 
    direction: 'asc' | 'desc' 
  } | null>(null);

  // Обробник сортування
  const handleSort = (key: 'id' | 'fullName' | 'position' | 'contact' | 'address') => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Мемоізація даних (фільтрація + сортування)
  const processedEmployees = useMemo(() => {
    if (!employees) return [];

    let result = [...employees];

    // 1. Фільтрація
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter((employee) => 
        employee.fullName.toLowerCase().includes(lowerQuery) ||
        (employee.position?.name && employee.position.name.toLowerCase().includes(lowerQuery)) ||
        employee.contact.toLowerCase().includes(lowerQuery) ||
        employee.address.toLowerCase().includes(lowerQuery)
      );
    }

    // 2. Сортування
    if (sortConfig) {
      result.sort((a, b) => {
        let aValue: string | number = '';
        let bValue: string | number = '';

        // Визначаємо значення для порівняння
        switch (sortConfig.key) {
          case 'id':
            aValue = a.id;
            bValue = b.id;
            break;
          case 'position':
            aValue = a.position?.name || '';
            bValue = b.position?.name || '';
            break;
          case 'fullName':
            aValue = a.fullName;
            bValue = b.fullName;
            break;
          default:
             // @ts-ignore - доступ до contact, address
            aValue = a[sortConfig.key] || '';
             // @ts-ignore
            bValue = b[sortConfig.key] || '';
        }

        if (aValue === bValue) return 0;
        
        // Порівняння чисел або рядків
        let comparison = 0;
        if (typeof aValue === 'string' && typeof bValue === 'string') {
           comparison = aValue.localeCompare(bValue, 'uk');
        } else {
           comparison = aValue > bValue ? 1 : -1;
        }

        return sortConfig.direction === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [employees, searchQuery, sortConfig]);

  if (isLoading) 
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-gray-600">Завантаження працівників...</div>
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
            <h1 className="text-4xl font-bold text-gray-900">Працівники</h1>
            <p className="text-gray-600 mt-2">
              Знайдено працівників: {processedEmployees.length} (Всього: {employees?.length || 0})
            </p>
          </div>
          <Link 
            to="/employees/new" 
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            + Додати працівника
          </Link>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Пошук за ім'ям, посадою, контактами..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm transition-all"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {processedEmployees.length > 0 ? (
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
                    onClick={() => handleSort('position')}
                    className="px-6 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-200 transition-colors select-none"
                  >
                    Посада {sortConfig?.key === 'position' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
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
                {processedEmployees.map((employee, index) => (
                  <tr 
                    key={employee.id} 
                    className={`border-b hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">#{employee.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {employee.fullName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {employee.position?.name || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {employee.contact}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {employee.address}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link 
                        to={`/employees/${employee.id}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium transition-colors"
                      >
                        Редагувати
                      </Link>
                      <button 
                        onClick={() => {
                          if (window.confirm(`Ви дійсно хочете видалити працівника ${employee.fullName}?`)) {
                            deleteEmployee.mutate(employee.id);
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
                {searchQuery ? 'За вашим запитом нічого не знайдено' : 'Працівників не знайдено'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};