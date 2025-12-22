import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useCreateAuthor } from '../api';

export const CreateAuthorPage = () => {
  const navigate = useNavigate();
  const createAuthor = useCreateAuthor();
  
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    patronymic: '',
    dateofbirth: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createAuthor.mutate({
      firstname: formData.firstname,
      lastname: formData.lastname,
      patronymic: formData.patronymic,
      dateofbirth: formData.dateofbirth ? new Date(formData.dateofbirth) : undefined
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Створити автора</h1>
          <p className="text-gray-600 mb-6">Введіть інформацію про нового автора</p>

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
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Зберегти
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