import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from '@tanstack/react-router';
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

    updateBook.mutate({ id: Number(bookId), data: payload }, {
        onSuccess: () => navigate({ to: '/books' })
    });
  };

  const filteredAuthors = authors?.filter((author) => {
    const fullName = `${author.firstname} ${author.lastname}`.toLowerCase();
    return fullName.includes(authorSearch.toLowerCase());
  });

  if (isBookLoading) return (
    <div className="flex justify-center items-center h-screen bg-gray-50/50">
        <div className="flex flex-col items-center gap-3">
             <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
             <div className="text-gray-500 font-medium">Завантаження даних книги...</div>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-10 flex justify-center">
      <div className="w-full max-w-3xl">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
           <Link to="/books" className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 transition-all">
             ←
           </Link>
           <div className="flex-1 flex justify-between items-center">
             <div>
                <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Редагування</h1>
                <p className="text-slate-500">Зміна інформації про книгу</p>
             </div>
             <div className="hidden sm:block px-3 py-1 bg-slate-200 text-slate-600 rounded-lg font-mono text-sm font-bold">
                ID: #{bookId}
             </div>
           </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden p-6 md:p-8">
          
          {formErrors && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-center gap-3">
              <span className="text-xl">⚠️</span>
              <p className="font-medium">{formErrors}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Основна інформація */}
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
                <span>📚</span> Основна інформація
              </h2>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Назва книги <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-white rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-400 font-medium"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Категорія <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select 
                      className="w-full px-4 py-3 bg-white rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all appearance-none cursor-pointer"
                      value={formData.categoryId}
                      onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                    >
                      <option value="" disabled hidden>Оберіть зі списку...</option>
                      {categories?.map(cat => (
                          <option key={cat.id} value={cat.id}>{(cat as any).name || (cat as any).title}</option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Жанр <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select 
                      className="w-full px-4 py-3 bg-white rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all appearance-none cursor-pointer"
                      value={formData.genreId}
                      onChange={(e) => setFormData({...formData, genreId: e.target.value})}
                    >
                      <option value="" disabled hidden>Оберіть зі списку...</option>
                      {genres?.map(genre => (
                          <option key={genre.id} value={genre.id}>{(genre as any).name || (genre as any).title}</option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Автори */}
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
                <span>✍️</span> Автори <span className="text-sm font-normal text-slate-400 ml-auto">(Оберіть одного або декілька)</span>
              </h2>

              <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-200">
                <div className="relative mb-4">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                  <input
                    type="text"
                    placeholder="Швидкий пошук автора..."
                    className="w-full pl-10 pr-4 py-2 bg-white rounded-lg border border-slate-200 focus:border-blue-500 focus:outline-none text-sm"
                    value={authorSearch}
                    onChange={(e) => setAuthorSearch(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {filteredAuthors?.map((author) => {
                    const isSelected = formData.authorIds.includes(String(author.id));
                    return (
                      <label key={author.id} className={`flex items-center p-3 rounded-xl cursor-pointer transition-all border ${
                        isSelected 
                          ? 'bg-blue-50 border-blue-500 shadow-sm' 
                          : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-sm'
                      }`}>
                        <div className={`w-5 h-5 rounded border flex items-center justify-center mr-3 transition-colors ${
                          isSelected ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300'
                        }`}>
                          {isSelected && <span className="text-white text-xs font-bold">✓</span>}
                        </div>
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={isSelected}
                          onChange={() => toggleAuthor(String(author.id))}
                        />
                        <span className={`text-sm font-medium ${isSelected ? 'text-blue-800' : 'text-slate-700'}`}>
                          {author.firstname} {author.lastname}
                        </span>
                      </label>
                    );
                  })}
                </div>
                {filteredAuthors?.length === 0 && (
                  <div className="text-center py-4 text-slate-400 text-sm">Авторів не знайдено</div>
                )}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4 border-t border-slate-100">
              <button 
                type="button" 
                onClick={() => navigate({ to: '/books' })} 
                className="flex-1 px-6 py-3.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 hover:text-slate-800 transition-all"
              >
                Скасувати
              </button>
              <button 
                type="submit" 
                disabled={updateBook.isPending}
                className="flex-1 px-6 py-3.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 active:scale-95 shadow-lg shadow-blue-200 transition-all disabled:opacity-70 disabled:pointer-events-none"
              >
                {updateBook.isPending ? 'Збереження...' : 'Зберегти зміни'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};