import { useState } from 'react';
import { useNavigate, Link } from '@tanstack/react-router'; 
import { useGenres } from '@/features/genres/api';
import { useCatalog } from '@/features/catalog/api';

export const ReaderHomePage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  
  // Отримуємо дані
  const { data: books = [], isLoading: isBooksLoading } = useCatalog(search);
  const { data: genres = [], isLoading: isGenresLoading } = useGenres();

  // Локальна фільтрація за жанрами
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);

  const toggleGenre = (id: number) => {
    setSelectedGenres(prev => 
      prev.includes(id) ? prev.filter(gId => gId !== id) : [...prev, id]
    );
  };

  // Фільтрація книг на клієнті (оскільки API повертає назву жанру, а ми фільтруємо по ID для зручності UI)
  const filteredBooks = books.filter(book => {
    if (selectedGenres.length === 0) return true;
    const selectedGenreNames = genres
       .filter(g => selectedGenres.includes(g.id))
       .map(g => g.name);
    return selectedGenreNames.includes(book.genre);
  });

  const isLoading = isBooksLoading || isGenresLoading;
  
  // Показуємо перші 6 жанрів, решту ховаємо (або можна розгорнути)
  const displayedGenres = genres.slice(0, 10); 

  return (
    <div className="space-y-10 pb-10">
      
      {/* HERO SECTION */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-xl shadow-blue-200">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/pattern-bg.svg')] opacity-10"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 p-10 md:p-16 text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
              Бібліотека знань
            </h1>
            <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto">
              Шукайте книги, перевіряйте наявність та відкривайте для себе нові історії.
            </p>
          </div>

          <div className="max-w-2xl mx-auto relative group">
            <input
              type="text"
              placeholder="Введіть назву книги, автора або ISBN..."
              className="w-full pl-14 pr-6 py-5 rounded-2xl text-slate-800 bg-white/95 backdrop-blur shadow-2xl border-2 border-transparent focus:border-blue-300 focus:outline-none transition-all text-lg placeholder:text-slate-400"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-2xl text-slate-400 group-focus-within:text-blue-500 transition-colors">🔍</span>
          </div>
        </div>
      </div>

      {/* GENRES FILTER */}
      <div className="space-y-4">
         <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800">Популярні жанри</h2>
            {selectedGenres.length > 0 && (
                <button 
                    onClick={() => setSelectedGenres([])}
                    className="text-sm text-red-500 hover:text-red-700 font-medium"
                >
                    Скинути фільтри
                </button>
            )}
         </div>
         <div className="flex flex-wrap gap-2">
            <button 
                onClick={() => setSelectedGenres([])} 
                className={`px-5 py-2.5 rounded-xl text-sm font-bold border transition-all active:scale-95 ${
                    selectedGenres.length === 0 
                    ? 'bg-slate-800 text-white border-slate-800 shadow-md' 
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
            >
                Всі
            </button>
            {displayedGenres.map(g => (
                <button 
                    key={g.id} 
                    onClick={() => toggleGenre(g.id)} 
                    className={`px-5 py-2.5 rounded-xl text-sm font-bold border transition-all active:scale-95 ${
                        selectedGenres.includes(g.id) 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200' 
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                >
                    {g.name}
                </button>
            ))}
         </div>
      </div>

      {/* BOOKS GRID */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span>📚</span> Результати пошуку
            <span className="text-sm font-normal text-slate-400 ml-2 bg-slate-100 px-2 py-0.5 rounded-full">{filteredBooks.length}</span>
        </h2>

        {isLoading ? (
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1,2,3,4,5,6,7,8].map(i => (
                  <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                      <div className="h-48 bg-slate-100 rounded-xl animate-pulse"></div>
                      <div className="h-4 bg-slate-100 rounded w-3/4 animate-pulse"></div>
                      <div className="h-3 bg-slate-100 rounded w-1/2 animate-pulse"></div>
                  </div>
              ))}
           </div>
        ) : filteredBooks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in-up">
            {filteredBooks.map((book) => (
              <div key={book.id} className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 overflow-hidden flex flex-col h-full">
                
                {/* Book Cover Placeholder */}
                <div className="h-56 bg-slate-50 flex items-center justify-center text-7xl group-hover:scale-105 transition-transform duration-500 relative select-none border-b border-slate-100">
                   <span className="drop-shadow-lg filter">📕</span>
                   {book.isAvailable ? (
                       <div className="absolute top-3 right-3 bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-lg border border-green-200 shadow-sm">
                           В НАЯВНОСТІ
                       </div>
                   ) : (
                       <div className="absolute top-3 right-3 bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-1 rounded-lg border border-orange-200 shadow-sm">
                           ВИДАНО
                       </div>
                   )}
                </div>
                
                <div className="p-5 flex-1 flex flex-col">
                  {/* Category & Genre */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                        {book.genre}
                    </span>
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-lg font-bold text-slate-800 leading-tight mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {book.title}
                  </h3>
                  
                  {/* Authors */}
                  <p className="text-sm text-slate-500 mb-4 line-clamp-1 flex items-center gap-1">
                      <span>✍️</span>
                      {book.authors.length > 0 ? book.authors.join(', ') : 'Невідомий автор'}
                  </p>
                  
                  {/* Footer Info */}
                  <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                      <div className="flex items-center gap-1">
                          <span>🏢</span> {book.publisher}
                      </div>
                      <div className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">
                          {book.year}
                      </div>
                  </div>

                  <div className="mt-4">
                    <Link 
                        to={`/editions/${book.id}`}
                        className="flex items-center justify-center w-full py-2.5 rounded-xl bg-slate-50 text-slate-700 font-semibold text-sm hover:bg-blue-600 hover:text-white transition-all active:scale-95 group-hover:bg-blue-50 group-hover:text-blue-700"
                    >
                      Детальніше
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-dashed border-slate-200 text-center">
            <span className="text-6xl mb-4 opacity-50">🔍</span>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Нічого не знайдено</h3>
            <p className="text-slate-500 max-w-sm">
              Спробуйте змінити пошуковий запит або очистити фільтри жанрів.
            </p>
            <button 
                onClick={() => { setSearch(''); setSelectedGenres([]); }}
                className="mt-6 text-blue-600 font-semibold hover:underline"
            >
                Очистити все
            </button>
          </div>
        )}
      </div>
    </div>
  );
};