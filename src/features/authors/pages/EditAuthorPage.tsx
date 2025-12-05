import { useState, useEffect } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useAuthor, useUpdateAuthor } from '../api';

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

  useEffect(() => {
    if (author) {
      setFormData({
        firstname: author.firstname,
        lastname: author.lastname,
        patronymic: author.patronymic || '',
        dateofbirth: author.dateofbirth 
        ? new Date(author.dateofbirth).toISOString().split('T')[0] ?? '' 
        : '',
      });
    }
  }, [author]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateAuthor.mutate({ 
      id: Number(authorId), 
      data: {
        firstname: formData.firstname,
        lastname: formData.lastname,
        patronymic: formData.patronymic,
        dateofbirth: formData.dateofbirth ? new Date(formData.dateofbirth) : undefined
      } 
    });
  };

  if (isLoading) return <div className="p-4">Завантаження...</div>;

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Редагувати автора</h1>
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
            Оновити
          </button>
          <button type="button" onClick={() => navigate({ to: '/authors' })} className="bg-gray-300 px-4 py-2 rounded">
            Скасувати
          </button>
        </div>
      </form>
    </div>
  );
};