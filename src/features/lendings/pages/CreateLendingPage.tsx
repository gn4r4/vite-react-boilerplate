import { useState, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useCreateLending } from '../api';
import { useCopybooks } from '../../copybooks/api';
import { useReaders } from '../../readers/api';
import { useEmployees } from '../../employees/api';
import { ILendingPayload } from '../types';
import { ICopybook } from '../../copybooks/types';

// Допоміжна функція для отримання локальної дати у форматі YYYY-MM-DD
const getLocalDateString = (date = new Date()) => {
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - (offset * 60 * 1000));
  return localDate.toISOString().split('T')[0];
};

export const CreateLendingPage = () => {
  const [selectedCopybooks, setSelectedCopybooks] = useState<ICopybook[]>([]);
  const [readerId, setReaderId] = useState<string>('');
  const [employeeId, setEmployeeId] = useState<string>('');
  
  const [datePlanned, setDatePlanned] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return getLocalDateString(d);
  });
  
  const [copySearchQuery, setCopySearchQuery] = useState('');
  const [showSelectedOnly, setShowSelectedOnly] = useState(false);
  const [formErrors, setFormErrors] = useState<string | null>(null);

  const createLending = useCreateLending();
  const navigate = useNavigate();
  
  const { data: copybooks, isLoading: isLoadingBooks } = useCopybooks();
  const { data: readers, isLoading: isLoadingReaders } = useReaders();
  const { data: employees, isLoading: isLoadingEmployees } = useEmployees();

  // Доступні тільки ті, що мають статус "доступний"
  const availableCopybooks = useMemo(() => {
    return copybooks
      ?.filter(cb => cb.status === 'доступний')
      .sort((a, b) => (a.edition?.book?.title || '').localeCompare(b.edition?.book?.title || '')) || [];
  }, [copybooks]);

  const filteredCopybooks = useMemo(() => {
    let list = availableCopybooks;

    // 1. Фільтр "Тільки обрані"
    if (showSelectedOnly) {
        list = list.filter(cb => selectedCopybooks.some(sel => sel.id === cb.id));
    }

    // 2. Фільтр пошуку
    if (copySearchQuery) {
        const lowerQuery = copySearchQuery.toLowerCase();
        list = list.filter(cb => {
            const title = cb.edition?.book?.title?.toLowerCase() || '';
            const id = cb.id.toString();
            return id.includes(lowerQuery) || title.includes(lowerQuery);
        });
    }

    return list;
  }, [availableCopybooks, copySearchQuery, showSelectedOnly, selectedCopybooks]);

  const handleCopybookToggle = (copybook: ICopybook, isChecked: boolean) => {
    if (isChecked) {
      setSelectedCopybooks(prev => [...prev, copybook]);
    } else {
      setSelectedCopybooks(prev => prev.filter(item => item.id !== copybook.id));
      if (showSelectedOnly && selectedCopybooks.length <= 1) {
          setShowSelectedOnly(false);
      }
    }
  };

  const handleClearSelection = () => {
      setSelectedCopybooks([]);
      setShowSelectedOnly(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors(null);

    if (!readerId) return setFormErrors('Будь ласка, оберіть читача');
    if (!employeeId) return setFormErrors('Будь ласка, оберіть працівника');
    if (selectedCopybooks.length === 0) return setFormErrors('Будь ласка, оберіть хоча б одну книгу');
    if (!datePlanned) return setFormErrors('Вкажіть планову дату повернення');

    const today = getLocalDateString();
    if (datePlanned < today) return setFormErrors('Планова дата повернення не може бути в минулому');

    const payload: ILendingPayload = {
      id_reader: Number(readerId),
      id_employee: Number(employeeId),
      datelending: today, 
      datereturn_planned: datePlanned,
      datereturn: null,
      id_copybook: selectedCopybooks.map(item => item.id),
    };

    createLending.mutate(payload, {
      onError: (error: any) => {
        setFormErrors(error?.response?.data?.message || 'Помилка при створенні видачі');
      }
    });
  };

  const isLoading = isLoadingBooks || isLoadingReaders || isLoadingEmployees;

  if (isLoading) return <div className="p-8 text-center text-gray-600">Завантаження довідників...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Створити видачу</h1>
          
          {formErrors && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {formErrors}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Читач *</label>
                <select
                  value={readerId}
                  onChange={(e) => setReaderId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none bg-white"
                >
                  <option value="">Оберіть читача...</option>
                  {readers?.map((reader) => (
                    <option key={reader.id} value={reader.id}>{reader.fullName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Працівник *</label>
                <select
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none bg-white"
                >
                  <option value="">Оберіть працівника...</option>
                  {employees?.map((employee) => (
                    <option key={employee.id} value={employee.id}>{employee.fullName}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Дата видачі</label>
                <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed">
                  {new Date().toLocaleDateString('uk-UA')}
                </div>
              </div>

               <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Планове повернення *</label>
                <input 
                  type="date"
                  value={datePlanned}
                  onChange={(e) => setDatePlanned(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                  min={getLocalDateString()} 
                />
              </div>
            </div>

            {/* Блок вибору книг */}
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-4">
                    <label className="block text-sm font-semibold text-gray-700">Копії книг *</label>
                    <label className="flex items-center text-sm cursor-pointer select-none">
                        <input 
                            type="checkbox" 
                            checked={showSelectedOnly}
                            onChange={(e) => setShowSelectedOnly(e.target.checked)}
                            disabled={selectedCopybooks.length === 0}
                            className="mr-2 w-4 h-4 text-blue-600 rounded"
                        />
                        <span className={`${selectedCopybooks.length === 0 ? 'text-gray-400' : 'text-blue-600 font-medium'}`}>
                            Тільки обрані
                        </span>
                    </label>
                </div>
                
                <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500">
                        Обрано: <span className="font-bold text-gray-800">{selectedCopybooks.length}</span>
                    </span>
                    {selectedCopybooks.length > 0 && (
                        <button 
                            type="button" 
                            onClick={handleClearSelection}
                            className="text-xs text-red-500 hover:text-red-700 hover:underline"
                        >
                            Очистити
                        </button>
                    )}
                </div>
              </div>
              
              <input
                type="text"
                placeholder="Пошук по ID або назві..."
                className="w-full border border-gray-300 p-2 rounded mb-3 text-sm focus:outline-none focus:border-blue-500"
                value={copySearchQuery}
                onChange={(e) => setCopySearchQuery(e.target.value)}
              />

              <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                {availableCopybooks.length === 0 ? (
                   <p className="text-sm text-gray-500 text-center py-4">Немає доступних книг для видачі</p>
                ) : filteredCopybooks.length === 0 ? (
                   <p className="text-sm text-gray-500 text-center py-4">
                       {showSelectedOnly ? 'У вас немає обраних книг' : 'Нічого не знайдено'}
                   </p>
                ) : (
                  filteredCopybooks.map((copybook) => {
                    const isSelected = selectedCopybooks.some(item => item.id === copybook.id);
                    return (
                      <label 
                        key={copybook.id} 
                        className={`flex items-center p-3 rounded cursor-pointer transition border ${
                          isSelected ? 'border-blue-500 bg-blue-50' : 'border-transparent bg-white hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleCopybookToggle(copybook, e.target.checked)}
                          className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                        />
                        <div className="ml-3 flex-1">
                          <p className="text-gray-800 font-medium text-sm">
                            {copybook.edition?.book?.title || 'Без назви'}
                          </p>
                          <div className="flex justify-between mt-1">
                            <p className="text-xs text-gray-500">
                                Копія #{copybook.id}
                            </p>
                            <p className="text-xs text-gray-400">
                                {copybook.edition?.publisher?.name} ({copybook.edition?.yearPublication ? new Date(copybook.edition.yearPublication).getFullYear() : '-'})
                            </p>
                          </div>
                        </div>
                      </label>
                    );
                  })
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button 
                type="submit" 
                disabled={createLending.isPending}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-70"
              >
                {createLending.isPending ? 'Збереження...' : 'Створити видачу'}
              </button>
              <button 
                type="button" 
                onClick={() => navigate({ to: '/lendings' })} 
                className="flex-1 bg-gray-300 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-400 transition-colors font-medium"
              >
                Скасувати
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};