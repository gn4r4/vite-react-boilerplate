import { Link } from '@tanstack/react-router';
import { useAuthors, useDeleteAuthor } from '../api';

export const AuthorsListPage = () => {
  const { data: authors, isLoading, error } = useAuthors();
  const deleteAuthor = useDeleteAuthor();

  if (isLoading) 
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-gray-600">Завантаження авторів...</div>
      </div>
    );

  if (error) 
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-red-600">Помилка завантаження данних!</div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Автори</h1>
            <p className="text-gray-600 mt-2">Всього авторів: {authors?.length || 0}</p>
          </div>
          <Link 
            to="/authors/new" 
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            + Додати автора
          </Link>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {authors && authors.length > 0 ? (
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Ім'я</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Прізвище</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">По батькові</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Дата народження</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Дії</th>
                </tr>
              </thead>
              <tbody>
                {authors.map((author, index) => (
                  <tr 
                    key={author.id} 
                    className={`border-b hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                  >
                    <td className="px-6 py-4 text-sm text-gray-900">{author.firstname}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{author.lastname}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{author.patronymic || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {author.dateofbirth 
                        ? new Date(author.dateofbirth).toLocaleDateString('uk-UA')
                        : '-'
                      }
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link 
                        to="/authors/$authorId" 
                        params={{ authorId: author.id.toString() }} 
                        className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium transition-colors"
                      >
                        Редагувати
                      </Link>
                      <button 
                        onClick={() => {
                          if (window.confirm('Ви впевнені?')) {
                            deleteAuthor.mutate(author.id);
                          }
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
            <div className="p-8 text-center text-gray-600">
              <p className="text-lg">Авторів не знайдено</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};