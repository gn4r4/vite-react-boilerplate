import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useCreateBook } from '../api';
import type { IBookPayload } from '../types';
import { useCategories } from '../../categories/api';
import { useGenres } from '../../genres/api';
import { useAuthors } from '../../authors/api';

export const CreateBookPage = () => {
  const navigate = useNavigate();
  const createBook = useCreateBook();

  const { data: categories } = useCategories();
  const { data: genres } = useGenres();
  const { data: authors } = useAuthors();

  // Локальний стан форми
  const [formData, setFormData] = useState({
    title: '',
    categoryId: '',
    genreId: '',
    authorIds: [] as string[],
  });

  const [formErrors, setFormErrors] = useState<string | null>(null);
  const [authorSearch, setAuthorSearch] = useState(''); // Стан для пошуку автора

  const toggleAuthor = (id: string) => {
    setFormData((prev) => {
      const isSelected = prev.authorIds.includes(id);
      if (isSelected) {
        return { ...prev, authorIds: prev.authorIds.filter((aid) => aid !== id) };
      } else {
        return { ...prev, authorIds: [...prev.authorIds, id] };
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors(null);

    // Валідація
    if (!formData.title.trim()) return setFormErrors("Назва книги обов'язкова");
    if (!formData.categoryId) return setFormErrors("Оберіть категорію");
    if (!formData.genreId) return setFormErrors("Оберіть жанр");
    if (formData.authorIds.length === 0) return setFormErrors("Оберіть хоча б одного автора");

    const payload: IBookPayload = {
      title: formData.title,
      id_category: Number(formData.categoryId),
      id_genre: Number(formData.genreId),
      id_author: formData.authorIds.map(Number),
    };

    createBook.mutate(payload, {
        onSuccess: () => navigate({ to: '/books' }),
    });
  };

  // Фільтрація авторів для зручного пошуку
  const filteredAuthors = authors?.filter((author) => {
    const fullName = `${author.firstname} ${author.lastname}`.toLowerCase();
    return fullName.includes(authorSearch.toLowerCase());
  });

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-xl mt-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-4">Створити нову книгу</h1>
      
      {formErrors && <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">{formErrors}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Назва */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Назва книги *</label>
          <input
            type="text"
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
            placeholder="Введіть назву..."
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Категорія */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Категорія *</label>
            <select
              className="w-full border border-gray-300 p-3 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
            >
              <option value="" disabled hidden>Оберіть категорію...</option>
              {categories?.map((cat) => (
                <option key={cat.id} value={cat.id}>{(cat as any).name || (cat as any).title}</option>
              ))}
            </select>
          </div>

          {/* Жанр */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Жанр *</label>
            <select
              className="w-full border border-gray-300 p-3 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.genreId}
              onChange={(e) => setFormData({ ...formData, genreId: e.target.value })}
            >
              <option value="" disabled hidden>Оберіть жанр...</option>
              {genres?.map((genre) => (
                <option key={genre.id} value={genre.id}>{(genre as any).name || (genre as any).title}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Автори (з пошуком) */}
        <div className={`border rounded-lg p-4 bg-gray-50 ${formErrors && formData.authorIds.length === 0 ? 'border-red-500' : 'border-gray-200'}`}>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Автори *</label>
          <input
            type="text"
            placeholder="Пошук автора..."
            className="w-full border border-gray-300 p-2 rounded mb-3 text-sm focus:outline-none focus:border-blue-500"
            value={authorSearch}
            onChange={(e) => setAuthorSearch(e.target.value)}
          />
          <div className="h-48 overflow-y-auto space-y-2 pr-2">
            {filteredAuthors?.map((author) => (
              <label key={author.id} className={`flex items-center p-2 rounded cursor-pointer transition hover:bg-white border ${formData.authorIds.includes(String(author.id)) ? 'border-blue-500 bg-blue-50' : 'border-transparent'}`}>
                <input
                  type="checkbox"
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                  checked={formData.authorIds.includes(String(author.id))}
                  onChange={() => toggleAuthor(String(author.id))}
                />
                <span className="ml-3 text-gray-700">{author.firstname} {author.lastname}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button type="submit" className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium" disabled={createBook.isPending}>
            {createBook.isPending ? 'Збереження...' : 'Зберегти'}
          </button>
          <button type="button" onClick={() => navigate({ to: '/books' })} className="flex-1 bg-gray-300 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-400 transition-colors font-medium">Скасувати</button>
        </div>
      </form>
    </div>
  );
};