import { Link } from '@tanstack/react-router';
import { useCopybooks, useDeleteCopybook } from '../api';

export const CopybooksListPage = () => {
  const { data: copybooks, isLoading, error } = useCopybooks();
  const deleteCopybook = useDeleteCopybook();

  // Функція для форматування. Приймає об'єкт location з DTO
  const formatLocation = (location: any) => {
    if (!location) return 'Не вказано';
    // Якщо є text (форматована відповідь від сервера) - використовуємо її
    if (location.text) return location.text;
    // Інакше, якщо є shelf - форматуємо вручну
    if (location.shelf) {
      const { shelf } = location;
      return `${shelf.cabinet?.name || '?'}, Полиця: ${shelf.shelfcode}`;
    }
    return 'Не вказано';
  };

  if (isLoading) 
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-gray-600">Завантаження копій...</div>
      </div>
    );

  if (error) 
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-red-600">Помилка завантаження даних!</div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Копії книг</h1>
            <p className="text-gray-600 mt-2">Всього копій: {copybooks?.length || 0}</p>
          </div>
          <Link 
            to="/copybooks/new" 
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            + Додати копію
          </Link>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {copybooks && copybooks.length > 0 ? (
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Назва книги</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Статус</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Місце</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Дії</th>
                </tr>
              </thead>
              <tbody>
                {copybooks.map((copybook, index) => (
                  <tr 
                    key={copybook.id} 
                    className={`border-b hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">#{copybook.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {copybook.edition?.book?.title || 'Без назви'}
                      <span className="text-gray-400 text-xs ml-2">({copybook.edition?.yearPublication})</span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        copybook.status === 'доступний' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {copybook.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatLocation(copybook.location)}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link 
                        to={`/copybooks/${copybook.id}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium transition-colors"
                      >
                        Редагувати
                      </Link>
                      <button 
                        onClick={() => {
                          if (window.confirm('Видалити цю копію?')) {
                            deleteCopybook.mutate(copybook.id);
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
              <p className="text-lg">Копій не знайдено</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};