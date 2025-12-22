import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useCreateReader } from '../api';

export const CreateReaderPage = () => {
  const navigate = useNavigate();
  const createReader = useCreateReader();

  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    patronymic: '',
    contact: '',
    address: '',
  });

  const [formErrors, setFormErrors] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors(null);

    if (!formData.firstname || !formData.lastname) {
      setFormErrors('Будь ласка, введіть ім\'я та прізвище');
      return;
    }

    createReader.mutate({
      firstname: formData.firstname,
      lastname: formData.lastname,
      patronymic: formData.patronymic || undefined,
      contact: formData.contact,
      address: formData.address,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Додати читача</h1>
          <p className="text-gray-600 mb-6">Введіть інформацію про нового читача</p>

          {formErrors && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {formErrors}
            </div>
          )}

          {createReader.isError && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              Помилка: {(createReader.error as any)?.response?.data?.message || 'Невідома помилка'}
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
                  placeholder="Введіть ім'я..."
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
                  placeholder="Введіть прізвище..."
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
                placeholder="Введіть по-батькові..."
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
                placeholder="Телефон, електронна пошта..."
              />
            </div>

            {/* Адреса */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Адреса</label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none transition"
                placeholder="Введіть адресу..."
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button 
                type="submit" 
                disabled={createReader.isPending}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
              >
                {createReader.isPending ? 'Збереження...' : 'Додати'}
              </button>
              <button 
                type="button" 
                onClick={() => navigate({ to: '/readers' })} 
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
