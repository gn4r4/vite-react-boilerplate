import { useEffect, useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useEmployee, useUpdateEmployee } from '../api';
import { usePositions } from '../../positions/api';

export const EditEmployeePage = () => {
  const { employeeId } = useParams({ from: '/employees/$employeeId' });
  const navigate = useNavigate();
  const id = Number(employeeId);

  const { data: employee, isLoading } = useEmployee(id);
  const updateEmployee = useUpdateEmployee();
  const { data: positions } = usePositions();

  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    patronymic: '',
    contact: '',
    address: '',
    position: '',
  });

  const [formErrors, setFormErrors] = useState<string | null>(null);

  useEffect(() => {
    if (employee) {
      setFormData({
        firstname: employee.firstname,
        lastname: employee.lastname,
        patronymic: employee.patronymic || '',
        contact: employee.contact,
        address: employee.address,
        position: employee.position ? employee.position.id.toString() : '',
      });
    }
  }, [employee]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors(null);

    if (!formData.firstname || !formData.lastname) {
      setFormErrors('Будь ласка, введіть ім\'я та прізвище');
      return;
    }

    updateEmployee.mutate({
      id,
      data: {
        firstname: formData.firstname,
        lastname: formData.lastname,
        patronymic: formData.patronymic || undefined,
        contact: formData.contact,
        address: formData.address,
        id_position: formData.position ? Number(formData.position) : undefined,
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-500">
        <span className="text-xl animate-pulse">Завантаження даних працівника...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex justify-between items-center mb-6 border-b pb-4">
            <h1 className="text-3xl font-bold text-gray-900">Редагувати працівника</h1>
            <span className="text-sm text-gray-400 bg-gray-100 px-2 py-1 rounded">ID: {id}</span>
          </div>

          {formErrors && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {formErrors}
            </div>
          )}

          {updateEmployee.isError && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              Помилка: {(updateEmployee.error as any)?.response?.data?.message || 'Невідома помилка'}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Ім'я */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Ім'я *</label>
                <input
                  type="text"
                  value={formData.firstname}
                  onChange={(e) => setFormData({ ...formData, firstname: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none transition"
                  required
                />
              </div>

              {/* Прізвище */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Прізвище *</label>
                <input
                  type="text"
                  value={formData.lastname}
                  onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none transition"
                  required
                />
              </div>
            </div>

            {/* По-батькові */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">По-батькові</label>
              <input
                type="text"
                value={formData.patronymic}
                onChange={(e) => setFormData({ ...formData, patronymic: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none transition"
              />
            </div>

            {/* Контакт */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Контакт</label>
              <input
                type="text"
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none transition"
              />
            </div>

            {/* Адреса */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Адреса</label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none transition"
                rows={3}
              />
            </div>

            {/* Посада */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Посада</label>
              <select
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none transition bg-white"
              >
                <option value="">Оберіть посаду...</option>
                {positions?.map((position) => (
                  <option key={position.id} value={position.id}>
                    {position.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Кнопки */}
            <div className="flex gap-3 pt-4">
              <button 
                type="submit" 
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Оновити
              </button>
              <button 
                type="button" 
                onClick={() => navigate({ to: '/employees' })} 
                className="flex-1 bg-gray-300 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-400 transition-colors font-medium"
              >
                Скасувати
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
