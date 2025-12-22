import { useState, useEffect } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useGenre, useUpdateGenre } from '../api';

export const EditGenrePage = () => {
  const { genreId } = useParams({ strict: false });
  const navigate = useNavigate();
  
  const { data: genre, isLoading } = useGenre(Number(genreId));
  const updateGenre = useUpdateGenre();
  
  const [formData, setFormData] = useState({
    name: '',
  });

  useEffect(() => {
    if (genre) {
      setFormData({
        name: genre.name,
      });
    }
  }, [genre]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateGenre.mutate({ 
      id: Number(genreId), 
      data: {
        name: formData.name,
      }
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Редагувати жанр</h1>
          <p className="text-gray-600 mb-6">Оновіть інформацію про жанр</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Назва *</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Введіть назву жанру"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button 
                type="submit" 
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Оновити
              </button>
              <button 
                type="button" 
                onClick={() => navigate({ to: '/genres' })} 
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