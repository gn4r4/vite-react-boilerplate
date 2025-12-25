import { useState, useMemo } from 'react';
import { Link } from '@tanstack/react-router';
import { useBooks, useDeleteBook } from '../api';
import { IBook } from './types';

export const BooksListPage = () => {
  const { data: books, isLoading, error } = useBooks();
  const deleteBook = useDeleteBook();

  // Стейт
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof IBook | 'category' | 'genre'; direction: 'asc' | 'desc' } | null>(null);

  // Сортування
  const handleSort = (key: keyof IBook | 'category' | 'genre') => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Обробка даних
  const processedBooks = useMemo(() => {
    if (!books) return [];

    let result = [...books];

    // 1. Пошук
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

    // 2. Сортування
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
  }, [books, searchQuery, sortConfig]);

  if (isLoading) return <div className="flex items-center justify-center h-screen"><div className="text-lg text-gray-600">Завантаження книг...</div></div>;
  if (error) return <div className="flex items-center justify-center h-screen"><div className="text-lg text-red-600">Помилка завантаження!</div></div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Книги</h1>
            <p className="text-gray-600 mt-2">Знайдено книг: {processedBooks.length} (Всього: {books?.length || 0})</p>
          </div>
          <Link to="/books/new" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">+ Додати книгу</Link>
        </div>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Пошук за назвою, категорією, жанром або автором..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {processedBooks.length > 0 ? (
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th onClick={() => handleSort('title')} className="px-6 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-200 select-none">
                    Назва {sortConfig?.key === 'title' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSort('category')} className="px-6 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-200 select-none">
                    Категорія {sortConfig?.key === 'category' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSort('genre')} className="px-6 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-200 select-none">
                    Жанр {sortConfig?.key === 'genre' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Автори</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Дії</th>
                </tr>
              </thead>
              <tbody>
                {processedBooks.map((book, index) => (
                  <tr key={book.id} className={`border-b hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{book.title}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{book.category?.name || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{book.genre?.name || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {book.authors?.map(a => `${a.firstname} ${a.lastname}`).join(', ') || '-'}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link to={`/books/${book.id}`} className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium transition-colors">Редагувати</Link>
                      <button 
                        onClick={() => {
                          if (window.confirm(`Видалити книгу "${book.title}"?`)) deleteBook.mutate(book.id);
                        }}
                        className="text-red-600 hover:text-red-800 hover:underline text-sm font-medium transition-colors"
                      >
                        Видалити
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-gray-600"><p className="text-lg">Книг не знайдено</p></div>
          )}
        </div>
      </div>
    </div>
  );
};