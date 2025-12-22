import { Link } from '@tanstack/react-router';
import { useOrders, useDeleteOrder } from '../api';

export const OrdersListPage = () => {
  const { data: orders, isLoading, error } = useOrders();
  const deleteOrder = useDeleteOrder();

  if (isLoading) 
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-gray-600">Завантаження замовлень...</div>
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Замовлення</h1>
            <p className="text-gray-600 mt-2">Всього замовлень: {orders?.length || 0}</p>
          </div>
          <Link 
            to="/orders/new" 
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            + Додати замовлення
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          {orders && orders.length > 0 ? (
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Дата</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Статус</th>
                  {/* Змінено заголовок стовпчика */}
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Видання</th> 
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Дії</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, index) => (
                  <tr 
                    key={order.id} 
                    className={`border-b hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {order.dateOrder ? new Date(order.dateOrder).toLocaleDateString('uk-UA') : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{order.status || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {/* ВИПРАВЛЕННЯ 3: Виводимо список книг замість простої кількості */}
                      {order.items && order.items.length > 0 ? (
                        <div className="space-y-1">
                          {order.items.map((item, i) => (
                            <div key={i}>
                              <span className="font-medium">{item.edition?.book?.title}</span>
                              <span className="text-gray-400 text-xs ml-1">x{item.quantity}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400">Пусто</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link 
                        to={`/orders/${order.id}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium transition-colors"
                      >
                        Редагувати
                      </Link>
                      <button 
                        onClick={() => {
                          if (window.confirm('Ви впевнені?')) {
                            deleteOrder.mutate(order.id);
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
              <p className="text-lg">Замовлень не знайдено</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};