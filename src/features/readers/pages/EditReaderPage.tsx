import { useEffect, useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useReader, useUpdateReader } from '../api';
import type { IReaderPayload, IReader } from '../types';

export const EditReaderPage = () => {
  const { readerId } = useParams({ from: '/readers/$readerId' });
  const navigate = useNavigate();
  const id = Number(readerId);

  const { data: reader, isLoading } = useReader(id);
  const updateReader = useUpdateReader();

  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    patronymic: '',
    contact: '',
    address: '',
  });

  const [formErrors, setFormErrors] = useState<string | null>(null);

  useEffect(() => {
    if (reader) {
      setFormData({
        firstname: reader.firstname,
        lastname: reader.lastname,
        patronymic: reader.patronymic || '',
        contact: reader.contact || '',
        address: reader.address || '',
      });
    }
  }, [reader]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors(null);

    if (!formData.firstname.trim() || !formData.lastname.trim()) {
      setFormErrors('Будь ласка, введіть ім\'я та прізвище');
      return;
    }

    const payload: IReaderPayload = {
      firstname: formData.firstname.trim(),
      lastname: formData.lastname.trim(),
      patronymic: formData.patronymic.trim() || null,
      contact: formData.contact.trim(),
      address: formData.address.trim(),
    };

    updateReader.mutate({
      id,
      data: payload as unknown as Partial<IReader>
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-500">
        <span className="text-xl animate-pulse">Завантаження даних читача...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex justify-between items-center mb-6 border-b pb-4">
            <h1 className="text-3xl font-bold text-gray-900">Редагувати читача</h1>
            <span className="text-sm text-gray-400 bg-gray-100 px-2 py-1 rounded">ID: {id}</span>
          </div>

          {formErrors && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {formErrors}
            </div>
          )}

          {updateReader.isError && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              Помилка: {(updateReader.error as any)?.response?.data?.message || 'Невідома помилка'}
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

            {/* Кнопки */}
            <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                    type="button"
                    onClick={() => navigate({ to: '/readers' })}
                    className="px-6 py-2 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 transition font-medium"
                >
                    Скасувати
                </button>
                <button
                    type="submit"
                    disabled={updateReader.isPending}
                    className="px-6 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transition font-medium disabled:opacity-50"
                >
                    {updateReader.isPending ? 'Збереження...' : 'Зберегти зміни'}
                </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};