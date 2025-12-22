import { useState, useEffect } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useBook, useUpdateBook } from '../api';
import { useCategories } from '../../categories/api';
import { useGenres } from '../../genres/api';
import { useAuthors } from '../../authors/api';

export const EditBookPage = () => {
  const { bookId } = useParams({ strict: false });
  const navigate = useNavigate();
  
  // 1. Завантажуємо дані книги та довідників
  const { data: book, isLoading: isBookLoading } = useBook(Number(bookId));
  const { data: categories, isLoading: isCatLoading } = useCategories();
  const { data: genres, isLoading: isGenresLoading } = useGenres();
  const { data: authors, isLoading: isAuthorsLoading } = useAuthors();

  const updateBook = useUpdateBook();

  // Стан форми
  const [formData, setFormData] = useState({
    title: '',
    categoryId: '',
    genreId: '',
    authorIds: [] as string[],
  });

  // Стан для пошуку авторів
  const [authorSearch, setAuthorSearch] = useState('');

  // 2. Заповнюємо форму, коли дані книги завантажились
  useEffect(() => {
    if (book) {
      setFormData({
        title: book.title,
        // Використовуємо optional chaining (?.) та toString() для безпеки
        categoryId: book.category?.id?.toString() || '',
        genreId: book.genre?.id?.toString() || '',
        // Мапимо масив об'єктів авторів у масив ID (строкових, для порівняння)
        authorIds: book.authors?.map(a => a.id.toString()) || [],
      });
    }
  }, [book]);

  // Логіка перемикання автора (Checkbox toggle)
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
    updateBook.mutate({
        id: Number(bookId),
        data: {
            title: formData.title,
            id_category: Number(formData.categoryId), 
            id_genre: Number(formData.genreId),
            id_author: formData.authorIds.map(Number),
        }
    });
  };

  // Фільтрація авторів для пошуку
  const filteredAuthors = authors?.filter((author) => {
    const fullName = `${author.firstname} ${author.lastname}`.toLowerCase();
    return fullName.includes(authorSearch.toLowerCase());
  });

  // Лоадер, поки завантажуються основні дані
  if (isBookLoading || isCatLoading || isGenresLoading || isAuthorsLoading) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-500">
        <span className="text-xl animate-pulse">Завантаження даних книги...</span>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-xl mt-6">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-800">Редагувати книгу</h1>
        <span className="text-sm text-gray-400 bg-gray-100 px-2 py-1 rounded">ID: {bookId}</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Назва книги */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Назва книги</label>
          <input
            type="text"
            required
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
            placeholder="Введіть назву..."
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Категорія */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Категорія</label>
            <div className="relative">
              <select 
                required
                className="w-full border border-gray-300 p-3 rounded-lg bg-white appearance-none focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
                value={formData.categoryId}
                onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
              >
                <option value="" disabled hidden>Оберіть категорію...</option>
                {categories?.map(cat => (
                    <option key={cat.id} value={cat.id}>
                        {(cat as any).name || (cat as any).title}
                    </option>
                ))}
              </select>
               <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
          </div>

          {/* Жанр */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Жанр</label>
            <div className="relative">
              <select 
                required
                className="w-full border border-gray-300 p-3 rounded-lg bg-white appearance-none focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
                value={formData.genreId}
                onChange={(e) => setFormData({...formData, genreId: e.target.value})}
              >
                <option value="" disabled hidden>Оберіть жанр...</option>
                {genres?.map(genre => (
                    <option key={genre.id} value={genre.id}>
                         {(genre as any).name || (genre as any).title}
                    </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
          </div>
        </div>

        {/* Автори (Checkboxes + Search) */}
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
           <label className="block text-sm font-semibold text-gray-700 mb-2">
            Автори <span className="text-gray-400 font-normal text-xs">(Оберіть одного або декількох)</span>
          </label>

          {/* Пошук авторів */}
          <input
            type="text"
            placeholder="Пошук автора..."
            className="w-full border border-gray-300 p-2 rounded mb-3 text-sm focus:outline-none focus:border-blue-500"
            value={authorSearch}
            onChange={(e) => setAuthorSearch(e.target.value)}
          />

          {/* Скрол-список */}
          <div className="h-48 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            {filteredAuthors?.length === 0 && (
               <p className="text-sm text-gray-500 text-center py-4">Авторів не знайдено</p>
            )}

            {filteredAuthors?.map((author) => (
              <label 
                key={author.id} 
                className={`flex items-center p-2 rounded cursor-pointer transition hover:bg-white border ${
                  formData.authorIds.includes(String(author.id)) 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-transparent'
                }`}
              >
                <input
                  type="checkbox"
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                  // Перевіряємо, чи є ID автора у нашому стані
                  checked={formData.authorIds.includes(String(author.id))}
                  onChange={() => toggleAuthor(String(author.id))}
                />
                <span className="ml-3 text-gray-700">
                  {author.firstname} {author.lastname}
                </span>
              </label>
            ))}
          </div>
          <p className="text-right text-xs text-gray-500 mt-2">
            Обрано: {formData.authorIds.length}
          </p>
        </div>

        {/* Кнопки */}
        <div className="flex gap-3 pt-4">
          <button 
            type="submit" 
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Оновити
          </button>
          <button 
            type="button" 
            onClick={() => navigate({ to: '/books' })} 
            className="flex-1 bg-gray-300 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-400 transition-colors font-medium"
          >
            Скасувати
          </button>
        </div>
      </form>
    </div>
  );
};