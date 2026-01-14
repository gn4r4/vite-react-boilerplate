import { useState, useEffect, useMemo } from 'react';
import { useGenres } from '@/features/genres/api';
import { useCatalog } from '@/features/catalog/api';

export const ReaderHomePage = () => {
  // 1. Стейт для інпуту (миттєве оновлення)
  const [inputValue, setInputValue] = useState('');
  // 2. Стейт для запиту (із затримкою)
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);

  // 3. Debounce ефект: оновлюємо пошук тільки коли користувач перестає друкувати
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(inputValue);
    }, 500); // 500ms затримка

    return () => clearTimeout(timer);
  }, [inputValue]);

  // Запит до API йде з debounced значенням
  const { data: books = [], isLoading: isBooksLoading } = useCatalog(debouncedSearch);
  const { data: genres = [], isLoading: isGenresLoading } = useGenres();

  const isLoading = isBooksLoading || isGenresLoading;

  const toggleGenre = (id: number) => {
    setSelectedGenres(prev => 
      prev.includes(id) ? prev.filter(gId => gId !== id) : [...prev, id]
    );
  };

  const filteredBooks = useMemo(() => {
    return books.filter(book => {
        if (selectedGenres.length === 0) return true;
        const selectedGenreNames = genres
           .filter(g => selectedGenres.includes(g.id))
           .map(g => g.name);
        return selectedGenreNames.includes(book.genre);
      });
  }, [books, genres, selectedGenres]);

  const displayedGenres = genres.slice(0, 10); 

  // Функція для кольору статусу (замість тексту)
  const getStatusIndicator = (isAvailable: boolean) => {
      if (isAvailable) return 'bg-emerald-500 shadow-emerald-200';
      return 'bg-amber-500 shadow-amber-200';
  };

  return (
    <div className="space-y-10 pb-20 animate-fade-in">
      
      {/* 1. HEADER SECTION (Clean & Stable) */}
      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm relative overflow-hidden">
        {/* Decorative background blob */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-60 pointer-events-none"></div>
        
        <div className="relative z-10 max-w-3xl">
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight mb-3">
              Бібліотечний каталог
            </h1>
            <p className="text-slate-500 text-lg mb-8">
              Шукайте книги, перевіряйте наявність та знаходьте натхнення.
            </p>

            {/* Search Bar */}
            <div className="relative group max-w-2xl">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <svg className={`w-6 h-6 transition-colors duration-300 ${isBooksLoading ? 'text-blue-500 animate-spin' : 'text-slate-400 group-focus-within:text-blue-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        {isBooksLoading 
                            ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        }
                    </svg>
                </div>
                <input
                    type="text"
                    placeholder="Введіть назву книги, автора або рік..."
                    className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-transparent text-slate-800 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all text-lg placeholder:text-slate-400 font-medium shadow-inner"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                />
            </div>
        </div>
      </div>

      {/* 2. GENRES (Clean Pills) */}
      <div className="space-y-4">
         <div className="flex items-center justify-between px-2">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Категорії</h3>
            {selectedGenres.length > 0 && (
                <button 
                    onClick={() => setSelectedGenres([])}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline transition-all"
                >
                    Очистити фільтр
                </button>
            )}
         </div>
         
         <div className="flex flex-wrap gap-2">
            <button 
                onClick={() => setSelectedGenres([])} 
                className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all duration-200 active:scale-95 ${
                    selectedGenres.length === 0 
                    ? 'bg-slate-800 text-white border-slate-800 shadow-md' 
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
            >
                Всі
            </button>
            {displayedGenres.map(g => (
                <button 
                    key={g.id} 
                    onClick={() => toggleGenre(g.id)} 
                    className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all duration-200 active:scale-95 ${
                        selectedGenres.includes(g.id) 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200' 
                        : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-700'
                    }`}
                >
                    {g.name}
                </button>
            ))}
         </div>
      </div>

      {/* 3. CONTENT GRID */}
      <div>
        {isLoading && filteredBooks.length === 0 ? (
           // Skeleton Loading (Stable height)
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm h-[320px] flex flex-col gap-4">
                      <div className="flex-1 bg-slate-100/70 rounded-xl animate-pulse w-full"></div>
                      <div className="h-4 bg-slate-100 rounded w-3/4 animate-pulse"></div>
                      <div className="h-3 bg-slate-100 rounded w-1/2 animate-pulse"></div>
                  </div>
              ))}
           </div>
        ) : filteredBooks.length > 0 ? (
          // Results Grid
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBooks.map((book) => (
              <div 
                key={book.id} 
                className="group bg-white rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 flex flex-col h-full overflow-hidden relative cursor-default"
              >
                {/* Status Indicator Bar */}
                <div className={`absolute top-0 left-0 right-0 h-1.5 ${book.isAvailable ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col">
                  
                  {/* Header: Year & Genre */}
                  <div className="flex justify-between items-start mb-4">
                     <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-50 text-xs font-bold text-slate-500 border border-slate-100">
                        {book.year}
                     </span>
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right max-w-[50%] truncate">
                        {book.genre}
                     </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-slate-800 leading-snug mb-2 group-hover:text-blue-700 transition-colors line-clamp-2" title={book.title}>
                    {book.title}
                  </h3>
                  
                  {/* Author */}
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] text-slate-500">
                        ✍️
                    </div>
                    <p className="text-sm font-medium text-slate-500 truncate">
                        {book.authors.length > 0 ? book.authors.join(', ') : 'Автор не вказаний'}
                    </p>
                  </div>
                  
                  {/* Footer: Publisher & Availability */}
                  <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 max-w-[60%]">
                          <span className="truncate" title={book.publisher}>{book.publisher}</span>
                      </div>
                      
                      {/* Availability Badge */}
                      <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full ${book.isAvailable ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full shadow-sm ${getStatusIndicator(book.isAvailable)}`}></span>
                          <span className="text-[10px] font-bold uppercase tracking-wide">
                              {book.isAvailable ? 'В наявності' : 'Видано'}
                          </span>
                      </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Empty State (Stable Layout)
          <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm text-3xl text-slate-300">
                📚
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-1">Книг не знайдено</h3>
            <p className="text-slate-400 text-sm mb-6 max-w-xs text-center">
              Спробуйте інший запит або змініть фільтри.
            </p>
            <button 
                onClick={() => { setInputValue(''); setSelectedGenres([]); }}
                className="px-5 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-100 hover:text-slate-800 transition-colors"
            >
                Показати всі книги
            </button>
          </div>
        )}
      </div>
    </div>
  );
};