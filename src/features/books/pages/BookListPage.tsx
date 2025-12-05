import { Link } from '@tanstack/react-router';
import { useBooks, useDeleteBook } from '../api';

export const BooksListPage = () => {
  // Тепер books - це точно масив, завдяки виправленню в api.ts
  const { data: books, isLoading, error } = useBooks();
  const deleteBook = useDeleteBook();

  if (isLoading) return <div>Завантаження книг...</div>;
  if (error) return <div>Помилка: {(error as any).message}</div>;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Книги</h1>
        <Link 
          to="/books/new" 
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Додати книгу
        </Link>
      </div>
      
      <ul className="space-y-2">
        {books?.map((book) => (
          <li key={book.id} className="border p-4 rounded shadow flex justify-between items-center">
            <div>
              <h3 className="font-bold text-lg">{book.title} <span className="text-gray-400 text-sm">(ID: {book.id})</span></h3>
              
              <p className="text-sm text-gray-600">
                {/* Виводимо категорію та жанр */}
                {book.category?.name} | {book.genre?.name}
              </p>
              
              <p className="text-sm text-gray-500">
                {/* Виводимо авторів через кому */}
                Автори: {book.authors?.map(a => a.fullName).join(', ')}
              </p>
            </div>

            <div className="space-x-2">
              <Link 
                to="/books/$bookId" 
                params={{ bookId: book.id.toString() }} 
                className="text-blue-600 hover:underline"
              >
                Редагувати
              </Link>
              <button 
                onClick={() => deleteBook.mutate(book.id)}
                className="text-red-600 hover:underline"
              >
                Видалити
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};