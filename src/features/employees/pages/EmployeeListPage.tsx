import { Link } from '@tanstack/react-router';
import { useEmployees, useDeleteEmployee } from '../api';

export const EmployeesListPage = () => {
  const { data: employees, isLoading, error } = useEmployees();
  const deleteEmployee = useDeleteEmployee();

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
            <p className="text-gray-600 mt-2">Всього працівників: {employees?.length || 0}</p>
          </div>
          <Link 
            to="/employees/new" 
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            + Додати працівника
          </Link>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {employees && employees.length > 0 ? (
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">ПІБ</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Посада</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Контакт</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Адреса</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Дії</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee, index) => (
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
                          if (window.confirm('Видалити цього працівника?')) {
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
            <div className="text-center py-8 text-gray-500">
              Працівників не знайдено
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
