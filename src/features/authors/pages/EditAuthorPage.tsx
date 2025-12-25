import { useState, useEffect } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useAuthor, useUpdateAuthor } from '../api';
import type { IAuthorPayload, IAuthor } from '../types';

export const EditAuthorPage = () => {
  const { authorId } = useParams({ strict: false });
  const navigate = useNavigate();
  
  const { data: author, isLoading } = useAuthor(Number(authorId));
  const updateAuthor = useUpdateAuthor();

  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    patronymic: '',
    dateofbirth: '',
  });

  const [formErrors, setFormErrors] = useState<string | null>(null);

  useEffect(() => {
    if (author) {
      setFormData({
        firstname: author.firstname,
        lastname: author.lastname,
        patronymic: author.patronymic || '',
        // Форматуємо дату в YYYY-MM-DD для input type="date"
        dateofbirth: author.dateofbirth 
          ? new Date(author.dateofbirth).toISOString().split('T')[0] 
          : '',
      });
    }
  }, [author]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormErrors(null);

    if (!formData.firstname.trim() || !formData.lastname.trim()) {
        setFormErrors("Ім'я та прізвище є обов'язковими полями.");
        return;
    }

    // 1. Формуємо payload
    const payload: IAuthorPayload = {
      firstname: formData.firstname.trim(),
      lastname: formData.lastname.trim(),
      patronymic: formData.patronymic.trim() || null,
      dateofbirth: formData.dateofbirth || null
    };

    // 2. Конвертуємо в Partial<IAuthor>
    const apiData: Partial<IAuthor> = {
      ...payload,
      dateofbirth: payload.dateofbirth ? new Date(payload.dateofbirth) : null
    };

    updateAuthor.mutate({
      id: Number(authorId),
      data: apiData
    });
  };

  if (isLoading) 
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-gray-600">Завантаження...</div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Редагувати автора</h1>
          <p className="text-gray-600 mb-6">Оновіть інформацію про автора</p>

          {formErrors && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {formErrors}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Ім'я *</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
                  value={formData.firstname}
                  onChange={(e) => setFormData({ ...formData, firstname: e.target.value })}
                  placeholder="Введіть ім'я"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Прізвище *</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
                  value={formData.lastname}
                  onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
                  placeholder="Введіть прізвище"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">По батькові</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
                value={formData.patronymic}
                onChange={(e) => setFormData({ ...formData, patronymic: e.target.value })}
                placeholder="Введіть по батькові (опціонально)"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Дата народження</label>
              <input
                type="date"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
                value={formData.dateofbirth}
                onChange={(e) => setFormData({ ...formData, dateofbirth: e.target.value })}
              />
            </div>
            
            <div className="flex gap-3 pt-4">
              <button 
                type="submit" 
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-70"
                disabled={updateAuthor.isPending}
              >
                {updateAuthor.isPending ? 'Збереження...' : 'Оновити'}
              </button>
              <button 
                type="button" 
                onClick={() => navigate({ to: '/authors' })} 
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