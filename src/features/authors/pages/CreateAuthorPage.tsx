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
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Створити автора</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Ім'я</label>
          <input
            type="text"
            required
            className="w-full border p-2 rounded"
            value={formData.firstname}
            onChange={(e) => setFormData({ ...formData, firstname: e.target.value })}
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Прізвище</label>
          <input
            type="text"
            required
            className="w-full border p-2 rounded"
            value={formData.lastname}
            onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">По батькові</label>
          <input
            type="text"
            className="w-full border p-2 rounded"
            value={formData.patronymic}
            onChange={(e) => setFormData({ ...formData, patronymic: e.target.value })}
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Дата народження</label>
          <input
            type="date"
            className="w-full border p-2 rounded"
            value={formData.dateofbirth}
            onChange={(e) => setFormData({ ...formData, dateofbirth: e.target.value })}
          />
        </div>
        
        <div className="flex gap-2 pt-2">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Зберегти
          </button>
          <button type="button" onClick={() => navigate({ to: '/authors' })} className="bg-gray-300 px-4 py-2 rounded">
            Скасувати
          </button>
        </div>
      </form>
    </div>
  );
};