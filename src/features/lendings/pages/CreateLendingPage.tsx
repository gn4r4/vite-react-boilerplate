import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useCreateLending } from '../api';
import { useCopybooks } from '../../copybooks/api';
import { useReaders } from '../../readers/api';
import { useEmployees } from '../../employees/api';
import { ILending } from '../types';

export const CreateLendingPage = () => {
  const [formData, setFormData] = useState<Partial<ILending>>({
    items: [],
  });

  const [readerId, setReaderId] = useState<string>('');
  const [employeeId, setEmployeeId] = useState<string>('');
  const [readerSearch, setReaderSearch] = useState('');
  const [copySearchQuery, setCopySearchQuery] = useState('');
  const [formErrors, setFormErrors] = useState<string | null>(null);

  const createLending = useCreateLending();
  const navigate = useNavigate();
  const { data: copybooks } = useCopybooks();
  const { data: readers } = useReaders();
  const { data: employees } = useEmployees();

  // Фільтруємо тільки доступні копії
  const availableCopybooks = copybooks?.filter(cb => cb.status === 'доступний') || [];

  // Фільтруємо читачів за пошуком
  const filteredReaders = readers?.filter((reader) => {
    const searchLower = readerSearch.toLowerCase();
    const fullName = reader.fullName?.toLowerCase() || '';
    return fullName.includes(searchLower);
  });

  // Фільтруємо копії за пошуком (ID або назва книги)
  const filteredCopybooks = availableCopybooks.filter(cb => {
    const searchLower = copySearchQuery.toLowerCase();
    const bookTitle = cb.edition?.book?.title?.toLowerCase() || '';
    const copybookId = cb.id.toString();
    
    return copybookId.includes(searchLower) || bookTitle.includes(searchLower);
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors(null);

    // Валідація
    if (!readerId) {
      setFormErrors('Будь ласка, оберіть читача');
      return;
    }

    if (!employeeId) {
      setFormErrors('Будь ласка, оберіть працівника');
      return;
    }

    if (!formData.items || formData.items.length === 0) {
      setFormErrors('Будь ласка, оберіть хоча б одну копію');
      return;
    }

    // Відправляємо дані на бекенд
    createLending.mutate({
      id_reader: Number(readerId),
      id_employee: Number(employeeId),
      datelending: new Date().toISOString().split('T')[0],
      copybookIds: formData.items.map(item => item.id),
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Створити видачу</h1>
          <p className="text-gray-600 mb-6">Введіть інформацію про нову видачу книги</p>

          {formErrors && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {formErrors}
            </div>
          )}

          {createLending.isError && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              Помилка: {(createLending.error as any)?.response?.data?.message || 'Невідома помилка'}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Читач */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Читач *</label>
                
                <input
                  type="text"
                  placeholder="Пошук читача..."
                  className="w-full border border-gray-300 p-2 rounded mb-2 text-sm focus:outline-none focus:border-blue-500"
                  value={readerSearch}
                  onChange={(e) => setReaderSearch(e.target.value)}
                />

                <select
                  value={readerId}
                  onChange={(e) => setReaderId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none transition bg-white"
                  required
                >
                  <option value="">Оберіть читача...</option>
                  {filteredReaders?.map((reader) => (
                    <option key={reader.id} value={reader.id}>
                      {reader.fullName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Працівник */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Працівник *</label>
                <select
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none transition bg-white"
                  required
                >
                  <option value="">Оберіть працівника...</option>
                  {employees?.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.fullName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Дата видачі - фіксована, без можливості змінювати */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Дата видачі</label>
              <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed">
                {new Date().toLocaleDateString('uk-UA')}
              </div>
              <p className="text-xs text-gray-500 mt-1">Дата видачі встановлюється як поточна дата</p>
            </div>

            {/* Копії книг */}
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Копії книг *</label>
              
              <input
                type="text"
                placeholder="Пошук по ID або назві..."
                className="w-full border border-gray-300 p-2 rounded mb-3 text-sm focus:outline-none focus:border-blue-500"
                value={copySearchQuery}
                onChange={(e) => setCopySearchQuery(e.target.value)}
              />

              <div className="max-h-64 overflow-y-auto space-y-2">
                {availableCopybooks.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">Немає доступних копій</p>
                )}
                {availableCopybooks.length > 0 && filteredCopybooks.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">Копій не знайдено</p>
                )}
                {filteredCopybooks.map((copybook) => (
                  <label 
                    key={copybook.id} 
                    className={`flex items-center p-3 rounded cursor-pointer transition border ${
                      formData.items?.some(item => item.id === copybook.id) 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-transparent hover:bg-white'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.items?.some(item => item.id === copybook.id) || false}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData(prev => ({
                            ...prev,
                            items: [...(prev.items || []), copybook]
                          }));
                        } else {
                          setFormData(prev => ({
                            ...prev,
                            items: prev.items?.filter(item => item.id !== copybook.id)
                          }));
                        }
                      }}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-3 flex-1">
                      <span className="text-gray-700 font-medium">
                        #{copybook.id} - {copybook.edition?.book?.title || 'Невідомо'}
                      </span>
                      <span className="text-xs text-gray-500 ml-2">
                        ({copybook.edition?.yearPublication ? new Date(copybook.edition.yearPublication).getFullYear() : 'невідомо'})
                      </span>
                    </span>
                  </label>
                ))}
              </div>
              <p className="text-right text-xs text-gray-500 mt-3">
                Обрано: {formData.items?.length || 0}
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <button 
                type="submit" 
                disabled={createLending.isPending}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
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
