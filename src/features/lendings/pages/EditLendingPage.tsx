import { useEffect, useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useLending, useUpdateLending } from '../api';
import type { ILendingPayload } from '../types';

export const EditLendingPage = () => {
  const { lendingId } = useParams({ from: '/lendings/$lendingId' });
  const navigate = useNavigate();
  const id = Number(lendingId);

  const { data: lending, isLoading } = useLending(id);
  const updateLending = useUpdateLending();

  const [formErrors, setFormErrors] = useState<string | null>(null);
  const [dateReturn, setDateReturn] = useState<string>('');
  const [dateReturnPlanned, setDateReturnPlanned] = useState<string>('');
  
  // booksToReturn - список ID книг, які користувач позначає як "повернути зараз"
  const [booksToReturn, setBooksToReturn] = useState<number[]>([]);

  const isClosed = !!lending?.dateReturn;
  const isOverdue = !isClosed && lending?.dateReturnPlanned && new Date(lending.dateReturnPlanned) < new Date();

  useEffect(() => {
    if (lending) {
      if (lending.dateReturn) {
        setDateReturn(new Date(lending.dateReturn).toISOString().split('T')[0]);
      } else {
        setDateReturn('');
      }

      if (lending.dateReturnPlanned) {
        setDateReturnPlanned(new Date(lending.dateReturnPlanned).toISOString().split('T')[0]);
      }
    }
  }, [lending]);

  const toggleBookReturn = (copybookId: number) => {
    if (isClosed) return;

    setBooksToReturn(prev => {
      if (prev.includes(copybookId)) {
        return prev.filter(id => id !== copybookId);
      } else {
        return [...prev, copybookId];
      }
    });
  };

  const normalizeDate = (dateStr: string | Date) => {
    const d = new Date(dateStr);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isClosed) return;

    setFormErrors(null);
    if (!lending) return;

    const lendingDateStart = normalizeDate(lending.dateLending);

    if (dateReturn) {
      const returnDateNorm = normalizeDate(dateReturn);
      if (returnDateNorm < lendingDateStart) {
        setFormErrors('Дата повернення не може бути раніше дати видачі');
        return;
      }
    }

    if (dateReturnPlanned) {
      const plannedDateNorm = normalizeDate(dateReturnPlanned);
      if (plannedDateNorm < lendingDateStart) {
         setFormErrors('Планове повернення не може бути раніше дати видачі');
         return;
      }
    } else {
        setFormErrors('Планова дата повернення обов\'язкова');
        return;
    }

    // Список книг, які ЗАЛИШАЮТЬСЯ в активному стані
    const remainingBooksIds = lending.copybooks
      .filter(cb => !cb.dateReturnActual && !booksToReturn.includes(cb.id))
      .map(cb => cb.id);

    let finalDateReturn = dateReturn ? dateReturn : null;
    
    // Логіка: Якщо всі книги повернуто, закриваємо всю видачу сьогоднішньою датою
    // (якщо користувач сам не вказав іншу дату)
    const allBooksWillBeReturned = remainingBooksIds.length === 0;
    if (allBooksWillBeReturned && !finalDateReturn) {
        const today = new Date();
        const offset = today.getTimezoneOffset();
        const localDate = new Date(today.getTime() - (offset * 60 * 1000));
        finalDateReturn = localDate.toISOString().split('T')[0];
    }

    const payload: Partial<ILendingPayload> = {
        id_reader: lending.reader?.id,
        id_employee: lending.employee?.id, 
        datelending: lending.dateLending.toString(),
        datereturn: finalDateReturn,
        datereturn_planned: dateReturnPlanned,
        id_copybook: remainingBooksIds // Надсилаємо тільки активні
    };

    updateLending.mutate({
      id,
      data: payload
    }, {
        onError: (error: any) => {
            setFormErrors(error?.response?.data?.message || 'Помилка оновлення');
        }
    });
  };

  if (isLoading) return <div className="p-8 text-center">Завантаження...</div>;
  if (!lending) return <div className="p-8 text-center text-red-600">Видачу не знайдено</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Редагувати видачу #{lending.id}</h1>
              {isClosed ? (
                <p className="text-sm text-gray-500 mt-1">Ця видача закрита.</p>
              ) : isOverdue ? (
                <p className="text-sm text-red-600 font-bold mt-1">⚠️ УВАГА: Термін повернення сплив!</p>
              ) : (
                <p className="text-sm text-gray-500 mt-1">Активна видача</p>
              )}
            </div>
            <div className="flex flex-col items-end gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${isClosed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {isClosed ? 'Закрито' : 'Активно'}
                </span>
            </div>
          </div>

          {formErrors && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {formErrors}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Читач</label>
                    <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700">
                        {lending.reader?.fullName || 'Невідомий'}
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Працівник</label>
                    <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700">
                        {lending.employee?.fullName || 'Невідомий'}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Дата видачі</label>
                    <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700">
                        {new Date(lending.dateLending).toLocaleDateString('uk-UA')}
                    </div>
                </div>
                
                <div>
                    <label className={`block text-sm font-semibold mb-2 ${isOverdue ? 'text-red-600' : 'text-gray-700'}`}>
                        Планове повернення
                    </label>
                    <input
                        type="date"
                        value={dateReturnPlanned}
                        onChange={(e) => setDateReturnPlanned(e.target.value)}
                        disabled={isClosed}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 outline-none transition ${
                          isClosed 
                            ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-300' 
                            : isOverdue
                                ? 'border-red-300 bg-red-50 focus:ring-red-500'
                                : 'border-gray-300'
                        }`}
                        required
                    />
                </div>
            </div>

            {/* Блок книг */}
            <div className={`border rounded-lg p-4 ${isOverdue ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-200'}`}>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Книги у видачі
              </label>
              
              <div className="space-y-3">
                {lending.copybooks?.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">Всі книги повернуто</p>
                )}
                
                {lending.copybooks?.map((copybook) => {
                  const isReturnedInDb = !!copybook.dateReturnActual;
                  const isMarkedForReturn = booksToReturn.includes(copybook.id);
                  
                  return (
                    <div 
                      key={copybook.id}
                      className={`flex items-center justify-between p-3 rounded border transition-all ${
                        isReturnedInDb 
                           ? 'bg-green-50 border-green-200 opacity-90'
                           : isMarkedForReturn 
                              ? 'bg-yellow-50 border-yellow-200'
                              : 'bg-white border-gray-300'
                      }`}
                    >
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <span className={`font-medium text-sm ${isMarkedForReturn ? 'text-gray-500' : 'text-gray-800'}`}>
                            #{copybook.id} - {copybook.edition?.book?.title || 'Невідомо'}
                            </span>
                            
                            {isReturnedInDb && (
                                <span className="text-xs px-2 py-0.5 bg-green-200 text-green-800 rounded-full font-medium">
                                    Повернуто: {new Date(copybook.dateReturnActual!).toLocaleDateString('uk-UA')}
                                </span>
                            )}
                        </div>
                        
                        {isMarkedForReturn && (
                           <span className="text-xs text-yellow-700 font-semibold mt-1">
                               Буде повернуто після збереження
                           </span>
                        )}
                      </div>

                      {!isReturnedInDb && !isClosed ? (
                          <button
                            type="button"
                            onClick={() => toggleBookReturn(copybook.id)}
                            className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
                                isMarkedForReturn
                                ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                            }`}
                          >
                            {isMarkedForReturn ? 'Скасувати' : 'Повернути'}
                          </button>
                      ) : isReturnedInDb ? (
                          <span className="text-green-600 text-xl">✓</span>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Дата закриття */}
            <div className={`p-4 border rounded-lg ${isClosed ? 'bg-gray-100 border-gray-300' : 'bg-blue-50 border-blue-200'}`}>
              <label className={`block text-sm font-semibold mb-2 ${isClosed ? 'text-gray-500' : 'text-blue-900'}`}>
                Дата закриття видачі (всіх книг)
              </label>
              <div className="flex gap-2">
                  <input
                    type="date"
                    value={dateReturn}
                    onChange={(e) => setDateReturn(e.target.value)}
                    disabled={isClosed}
                    className={`flex-1 px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-600 ${
                      isClosed 
                        ? 'bg-gray-200 text-gray-600 cursor-not-allowed border-gray-300' 
                        : 'border-blue-300 bg-white'
                    }`}
                  />
                  {dateReturn && !isClosed && (
                      <button 
                        type="button"
                        onClick={() => setDateReturn('')}
                        className="px-3 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200 transition"
                      >
                          ✕
                      </button>
                  )}
              </div>
              {!isClosed && !dateReturn && (
                  <p className="text-xs text-blue-700 mt-2">
                      Якщо ви хочете закрити видачу повністю вручну, вкажіть дату тут. Якщо ви просто повертаєте окремі книги вище, дата закриття встановиться автоматично, коли буде повернута остання книга.
                  </p>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              {!isClosed ? (
                <button
                  type="submit"
                  disabled={updateLending.isPending}
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-70"
                >
                  {updateLending.isPending ? 'Збереження...' : 'Зберегти зміни'}
                </button>
              ) : (
                 <div className="flex-1 bg-gray-100 text-gray-500 px-6 py-3 rounded-lg border border-gray-300 text-center font-medium cursor-not-allowed">
                    Редагування заборонено
                 </div>
              )}
              
              <button
                type="button"
                onClick={() => navigate({ to: '/lendings' })}
                className="flex-1 bg-gray-300 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-400 transition-colors font-medium"
              >
                Назад до списку
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};