import { useState, useEffect } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useBook, useUpdateBook } from '../api';
import type { IBookPayload } from '../types';
import { useCategories } from '../../categories/api';
import { useGenres } from '../../genres/api';
import { useAuthors } from '../../authors/api';

export const EditBookPage = () => {
  const { bookId } = useParams({ strict: false });
  const navigate = useNavigate();
  
  const { data: book, isLoading: isBookLoading } = useBook(Number(bookId));
  const { data: categories } = useCategories();
  const { data: genres } = useGenres();
  const { data: authors } = useAuthors();

  const updateBook = useUpdateBook();

  const [formData, setFormData] = useState({
    title: '',
    categoryId: '',
    genreId: '',
    authorIds: [] as string[],
  });

  const [formErrors, setFormErrors] = useState<string | null>(null);
  const [authorSearch, setAuthorSearch] = useState('');

  useEffect(() => {
    if (book) {
      setFormData({
        title: book.title,
        categoryId: book.category?.id?.toString() || '',
        genreId: book.genre?.id?.toString() || '',
        authorIds: book.authors?.map(a => a.id.toString()) || [],
      });
    }
  }, [book]);

  const toggleAuthor = (id: string) => {
    setFormData((prev) => {
      const isSelected = prev.authorIds.includes(id);
      return { 
        ...prev, 
        authorIds: isSelected 
          ? prev.authorIds.filter((aid) => aid !== id) 
          : [...prev.authorIds, id] 
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors(null);

    if (!formData.title.trim()) return setFormErrors("Назва книги обов'язкова");
    if (!formData.categoryId) return setFormErrors("Оберіть категорію");
    if (!formData.genreId) return setFormErrors("Оберіть жанр");
    if (formData.authorIds.length === 0) return setFormErrors("Оберіть хоча б одного автора");
    
    const payload: Partial<IBookPayload> = {
      title: formData.title,
      id_category: Number(formData.categoryId),
      id_genre: Number(formData.genreId),
      id_author: formData.authorIds.map(Number),
    };

    updateBook.mutate({ id: Number(bookId), data: payload });
  };

  const filteredAuthors = authors?.filter((author) => {
    const fullName = `${author.firstname} ${author.lastname}`.toLowerCase();
    return fullName.includes(authorSearch.toLowerCase());
  });

  if (isBookLoading) return <div className="flex justify-center items-center h-64 text-gray-500">Завантаження...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-xl mt-6">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-800">Редагувати книгу</h1>
        <span className="text-sm text-gray-400 bg-gray-100 px-2 py-1 rounded">ID: {bookId}</span>
      </div>

      {formErrors && <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">{formErrors}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Назва книги *</label>
          <input
            type="text"
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Категорія *</label>
            <select 
              className="w-full border border-gray-300 p-3 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.categoryId}
              onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
            >
              <option value="" disabled hidden>Оберіть категорію...</option>
              {categories?.map(cat => (
                  <option key={cat.id} value={cat.id}>{(cat as any).name || (cat as any).title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Жанр *</label>
            <select 
              className="w-full border border-gray-300 p-3 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.genreId}
              onChange={(e) => setFormData({...formData, genreId: e.target.value})}
            >
              <option value="" disabled hidden>Оберіть жанр...</option>
              {genres?.map(genre => (
                  <option key={genre.id} value={genre.id}>{(genre as any).name || (genre as any).title}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
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
          <button type="submit" className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium" disabled={updateBook.isPending}>Оновити</button>
          <button type="button" onClick={() => navigate({ to: '/books' })} className="flex-1 bg-gray-300 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-400 transition-colors font-medium">Скасувати</button>
        </div>
      </form>
    </div>
  );
};