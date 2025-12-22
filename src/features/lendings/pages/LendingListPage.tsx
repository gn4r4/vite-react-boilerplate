import { Link } from '@tanstack/react-router';
import { useLendings, useDeleteLending } from '../api';

export const LendingsListPage = () => {
  const { data: lendings, isLoading, error } = useLendings();
  const deleteLending = useDeleteLending();

  if (isLoading) 
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-gray-600">Завантаження видачі...</div>
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
            <h1 className="text-4xl font-bold text-gray-900">Видача книг</h1>
            <p className="text-gray-600 mt-2">Всього видач: {lendings?.length || 0}</p>
          </div>
          <Link 
            to="/lendings/new" 
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            + Додати видачу
          </Link>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {lendings && lendings.length > 0 ? (
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Читач</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Дата видачі</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Дата повернення</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Кількість копій</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Дії</th>
                </tr>
              </thead>
              <tbody>
                {lendings.map((lending, index) => (
                  <tr 
                    key={lending.id} 
                    className={`border-b hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                  >
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {lending.reader?.fullName || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {lending.dateLending ? new Date(lending.dateLending).toLocaleDateString('uk-UA') : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {lending.dateReturn ? new Date(lending.dateReturn).toLocaleDateString('uk-UA') : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{lending.items?.length || 0}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link 
                        to={`/lendings/${lending.id}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium transition-colors"
                      >
                        Редагувати
                      </Link>
                      <button 
                        onClick={() => {
                          if (window.confirm('Ви впевнені?')) {
                            deleteLending.mutate(lending.id);
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
              <p className="text-lg">Видач не знайдено</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
