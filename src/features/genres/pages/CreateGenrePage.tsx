import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useCreateGenre } from '../api';

export const CreateGenrePage = () => {
  const navigate = useNavigate();
  const createGenre = useCreateGenre();
  const [title, setTitle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createGenre.mutate({ name: title });
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Новий жанр</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Назва</label>
          <input
            type="text"
            required
            className="w-full border p-2 rounded"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Створити</button>
          <button type="button" onClick={() => navigate({ to: '/genres' })} className="bg-gray-300 px-4 py-2 rounded">Скасувати</button>
        </div>
      </form>
    </div>
  );
};