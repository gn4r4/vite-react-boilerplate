import { useEffect, useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useUser, useUpdateUser } from '../api';
import { IUser, Role } from '../types';

export const EditUserPage = () => {
  const { userId } = useParams({ from: '/users/$userId' });
  const navigate = useNavigate();
  const id = Number(userId);

  const { data: user, isLoading } = useUser(id);
  const updateUser = useUpdateUser();

  const [formData, setFormData] = useState<Partial<IUser>>({
    username: '',
    email: '',
    role: Role.USER,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        email: user.email,
        role: user.role as Role,
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser.mutate({
      id,
      data: {
        username: formData.username || '',
        email: formData.email || '',
        role: formData.role || Role.USER,
      },
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Редагувати користувача</h1>
          <p className="text-gray-600 mb-6">Оновіть інформацію про користувача</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Ім'я користувача *</label>
              <input
                type="text"
                name="username"
                value={formData.username || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
                required
                placeholder="Введіть ім'я користувача"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
                required
                placeholder="Введіть email"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Роль</label>
              <select
                name="role"
                value={formData.role || Role.USER}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
              >
                <option value={Role.USER}>Користувач</option>
                <option value={Role.ADMIN}>Адміністратор</option>
                <option value={Role.MODERATOR}>Модератор</option>
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                disabled={updateUser.isPending}
              >
                {updateUser.isPending ? 'Збереження...' : 'Оновити'}
              </button>
              <button
                type="button"
                onClick={() => navigate({ to: '/users' })}
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