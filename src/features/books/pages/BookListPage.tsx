import { useState, useMemo } from 'react';
import { Link } from '@tanstack/react-router';
import { useBooks, useDeleteBook } from '../api'; //
import { IBook } from './types'; //
import { useAuthStore } from '@/store/authStore'; // Імпортуємо стор авторизації

export const BooksListPage = () => {
  // 1. Отримуємо роль
  const role = useAuthStore((state) => state.role);
  const isReader = role === 'READER' || !role;

  const { data: books, isLoading, error } = useBooks(); //
  const deleteBook = useDeleteBook(); //

  // Стейт
  const [searchQuery, setSearchQuery] = useState(''); //
  const [sortConfig, setSortConfig] = useState<{ key: keyof IBook | 'category' | 'genre'; direction: 'asc' | 'desc' } | null>(null); //

  // Сортування (без змін)
  const handleSort = (key: keyof IBook | 'category' | 'genre') => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Обробка даних (пошук та сортування - без змін логіки)
  const processedBooks = useMemo(() => {
    if (!books) return [];

    let result = [...books];

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter((book) => {
        const matchTitle = book.title.toLowerCase().includes(lowerQuery);
        const matchCategory = book.category?.name.toLowerCase().includes(lowerQuery);
        const matchGenre = book.genre?.name.toLowerCase().includes(lowerQuery);
        const matchAuthor = book.authors.some(a => 
          `${a.firstname} ${a.lastname}`.toLowerCase().includes(lowerQuery)
        );
        return matchTitle || matchCategory || matchGenre || matchAuthor;
      });
    }

    if (sortConfig) {
      result.sort((a, b) => {
        let aValue = '';
        let bValue = '';

        switch (sortConfig.key) {
          case 'category':
            aValue = a.category?.name || '';
            bValue = b.category?.name || '';
            break;
          case 'genre':
            aValue = a.genre?.name || '';
            bValue = b.genre?.name || '';
            break;
          case 'title':
            aValue = a.title;
            bValue = b.title;
            break;
          default:
            // @ts-ignore
            aValue = a[sortConfig.key] ? String(a[sortConfig.key]) : '';
            // @ts-ignore
            bValue = b[sortConfig.key] ? String(b[sortConfig.key]) : '';
        }

        const comparison = aValue.localeCompare(bValue, 'uk');
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [books, searchQuery, sortConfig]); //

  if (isLoading) return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-gray-500 font-medium">Завантаження бібліотеки...</div>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="bg-white p-6 rounded-xl shadow-lg border border-red-100 text-center">
        <div className="text-4xl mb-2">⚠️</div>
        <h3 className="text-lg font-bold text-gray-800">Виникла помилка</h3>
        <p className="text-red-500">Не вдалося завантажити список книг.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Книжковий фонд</h1>
            <p className="text-slate-500 mt-1">
              Відображено {processedBooks.length} із {books?.length || 0} книг
            </p>
          </div>
          
          {/* Кнопка додавання - ПРИХОВАНА ДЛЯ ЧИТАЧА */}
          {!isReader && (
            <Link 
              to="/books/new" 
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 active:scale-95 transition-all shadow-md shadow-blue-200 font-medium"
            >
              <span>+</span> Додати нову книгу
            </Link>
          )}
        </div>

        {/* SEARCH BAR */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
            🔍
          </div>
          <input
            type="text"
            placeholder="Пошук за назвою, категорією, жанром або автором..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 bg-white rounded-2xl border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700 placeholder:text-slate-400"
          />
        </div>

        {/* TABLE CARD */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {processedBooks.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full whitespace-nowrap">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th onClick={() => handleSort('title')} className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors select-none">
                      Назва {sortConfig?.key === 'title' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th onClick={() => handleSort('category')} className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors select-none">
                      Категорія {sortConfig?.key === 'category' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th onClick={() => handleSort('genre')} className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors select-none">
                      Жанр {sortConfig?.key === 'genre' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Автори
                    </th>
                    {/* Заголовок Дій - ПРИХОВАНИЙ ДЛЯ ЧИТАЧА */}
                    {!isReader && (
                      <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Дії
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {processedBooks.map((book) => (
                    <tr key={book.id} className="hover:bg-blue-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800">{book.title}</div>
                      </td>
                      <td className="px-6 py-4">
                        {book.category ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-purple-100 text-purple-800">
                            {book.category.name}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-sm">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {book.genre ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-emerald-100 text-emerald-800">
                            {book.genre.name}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-sm">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {book.authors && book.authors.length > 0 ? (
                           <div className="flex flex-col gap-0.5">
                             {book.authors.map((a, idx) => (
                               <span key={idx}>{a.firstname} {a.lastname}</span>
                             ))}
                           </div>
                        ) : (
                           <span className="text-slate-400">-</span>
                        )}
                      </td>
                      
                      {/* Кнопки Дій - ПРИХОВАНІ ДЛЯ ЧИТАЧА */}
                      {!isReader && (
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-3 opacity-80 group-hover:opacity-100 transition-opacity">
                            <Link 
                              to={`/books/${book.id}`} 
                              className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              Редагувати
                            </Link>
                            <button 
                              onClick={() => {
                                if (window.confirm(`Видалити книгу "${book.title}"?`)) deleteBook.mutate(book.id);
                              }}
                              className="text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              Видалити
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <span className="text-4xl mb-3">📚</span>
              <p className="text-lg font-medium">Книг не знайдено</p>
              <p className="text-sm">Спробуйте змінити запит пошуку</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};