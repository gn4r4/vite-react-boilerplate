import { Link } from '@tanstack/react-router';
import { useShelves, useDeleteShelf } from '../api';

export const ShelvesListPage = () => {
  const { data: shelves, isLoading, error } = useShelves();
  const deleteShelf = useDeleteShelf();

  if (isLoading) 
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-gray-600">Завантаження полиць...</div>
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
            <h1 className="text-4xl font-bold text-gray-900">Полиці</h1>
            <p className="text-gray-600 mt-2">Всього полиць: {shelves?.length || 0}</p>
          </div>
          <Link 
            to="/shelves/new" 
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            + Додати полицю
          </Link>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {shelves && shelves.length > 0 ? (
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Код</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Шафа</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Дії</th>
                </tr>
              </thead>
              <tbody>
                {shelves.map((shelf, index) => (
                  <tr 
                    key={shelf.id} 
                    className={`border-b hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{shelf.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{shelf.shelfcode}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{shelf.cabinet?.name || '-'}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link 
                        to={`/shelves/${shelf.id}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium transition-colors"
                      >
                        Редагувати
                      </Link>
                      <button 
                        onClick={() => {
                          if (window.confirm('Ви впевнені?')) {
                            deleteShelf.mutate(shelf.id);
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
              <p className="text-lg">Полиць не знайдено</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
