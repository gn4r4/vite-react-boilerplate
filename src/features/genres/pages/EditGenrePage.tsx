import { useState, useEffect } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useGenre, useUpdateGenre } from '../api';

export const EditGenrePage = () => {
  const { genreId } = useParams({ strict: false });
  const navigate = useNavigate();
  
  const { data: genre, isLoading } = useGenre(Number(genreId));
  const updateGenre = useUpdateGenre();
  
  const [title, setTitle] = useState('');

  useEffect(() => {
    if (genre) setTitle(genre.name);
  }, [genre]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateGenre.mutate({ id: Number(genreId), data: { name: title } });
  };

  if (isLoading) return <div className="p-4">Завантаження...</div>;

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Редагувати жанр</h1>
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
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Зберегти</button>
          <button type="button" onClick={() => navigate({ to: '/genres' })} className="bg-gray-300 px-4 py-2 rounded">Скасувати</button>
        </div>
      </form>
    </div>
  );
};