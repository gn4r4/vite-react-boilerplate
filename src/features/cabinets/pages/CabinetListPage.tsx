import { Link } from '@tanstack/react-router';
import { useCabinets, useDeleteCabinet } from '../api';

export const CabinetsListPage = () => {
  const { data: cabinets, isLoading, error } = useCabinets();
  const deleteCabinet = useDeleteCabinet();

  if (isLoading) 
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-gray-600">Завантаження шаф...</div>
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
            <h1 className="text-4xl font-bold text-gray-900">Шафи</h1>
            <p className="text-gray-600 mt-2">Всього шаф: {cabinets?.length || 0}</p>
          </div>
          <Link 
            to="/cabinets/new" 
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            + Додати шафу
          </Link>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {cabinets && cabinets.length > 0 ? (
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Назва</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Опис</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Дії</th>
                </tr>
              </thead>
              <tbody>
                {cabinets.map((cabinet, index) => (
                  <tr 
                    key={cabinet.id} 
                    className={`border-b hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{cabinet.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{cabinet.description || '-'}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link 
                        to="/cabinets/$cabinetId"
                        params={{ cabinetId: cabinet.id.toString() }}
                        className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium transition-colors"
                      >
                        Редагувати
                      </Link>
                      <button 
                        onClick={() => {
                          if (window.confirm('Ви впевнені?')) {
                            deleteCabinet.mutate(cabinet.id);
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
              <p className="text-lg">Шаф не знайдено</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
