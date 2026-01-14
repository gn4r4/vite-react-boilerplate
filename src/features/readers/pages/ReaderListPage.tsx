import { useState, useMemo } from 'react';
import { Link } from '@tanstack/react-router';
import { useReaders, useDeleteReader } from '../api';
import { IReader } from '../types';
import { useAuthStore } from '@/store/authStore';

export const ReaderListPage = () => {
  const role = useAuthStore((state) => state.user?.role);
  const isReaderRole = role === 'READER'; 

  const { data: readers, isLoading, error } = useReaders();
  const deleteReader = useDeleteReader();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{ 
    key: keyof IReader | 'user'; 
    direction: 'asc' | 'desc' 
  } | null>(null);

  const handleSort = (key: keyof IReader | 'user') => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const processedReaders = useMemo(() => {
    if (!readers) return [];

    let result = [...readers];

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter((reader) => 
        reader.fullName.toLowerCase().includes(lowerQuery) ||
        reader.contact.toLowerCase().includes(lowerQuery) ||
        reader.address.toLowerCase().includes(lowerQuery) ||
        reader.id.toString().includes(lowerQuery) ||
        reader.user?.email.toLowerCase().includes(lowerQuery)
      );
    }

    if (sortConfig) {
      result.sort((a, b) => {
        let aValue = '';
        let bValue = '';

        if (sortConfig.key === 'user') {
            aValue = a.user?.email || '';
            bValue = b.user?.email || '';
        } else {
            // @ts-ignore
            aValue = a[sortConfig.key] ? String(a[sortConfig.key]) : '';
            // @ts-ignore
            bValue = b[sortConfig.key] ? String(b[sortConfig.key]) : '';
        }

        if (aValue === bValue) return 0;

        if (sortConfig.key === 'id') {
            return sortConfig.direction === 'asc' 
                ? Number(aValue) - Number(bValue) 
                : Number(bValue) - Number(aValue);
        }

        const comparison = aValue.localeCompare(bValue, 'uk');
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [readers, searchQuery, sortConfig]);

  if (isLoading) 
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-gray-500 font-medium">Завантаження списку читачів...</div>
        </div>
      </div>
    );

  if (error) 
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-red-100 text-center">
          <div className="text-4xl mb-2">⚠️</div>
          <h3 className="text-lg font-bold text-gray-800">Виникла помилка</h3>
          <p className="text-red-500">Не вдалося завантажити читачів.</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Читачі</h1>
            <p className="text-slate-500 mt-1">
              Знайдено {processedReaders.length} із {readers?.length || 0} користувачів
            </p>
          </div>
          
          {!isReaderRole && (
            <Link 
              to="/readers/new" 
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 active:scale-95 transition-all shadow-md shadow-blue-200 font-medium"
            >
              <span>+</span> Додати читача
            </Link>
          )}
        </div>

        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
            🔍
          </div>
          <input
            type="text"
            placeholder="Пошук за ім'ям, контактами, адресою, email або ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 bg-white rounded-2xl border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700 placeholder:text-slate-400"
          />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {processedReaders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full whitespace-nowrap">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th onClick={() => handleSort('fullName')} className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors select-none">
                      ПІБ {sortConfig?.key === 'fullName' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th onClick={() => handleSort('contact')} className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors select-none">
                      Контакт {sortConfig?.key === 'contact' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th onClick={() => handleSort('address')} className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors select-none">
                      Адреса {sortConfig?.key === 'address' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    
                    {!isReaderRole && (
                        <th onClick={() => handleSort('user')} className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors select-none">
                        Акаунт {sortConfig?.key === 'user' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                    )}
                    
                    {!isReaderRole && (
                      <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Дії
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {processedReaders.map((reader) => (
                    <tr key={reader.id} className="hover:bg-blue-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-sm">
                            👤
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-800">{reader.fullName}</span>
                            {!isReaderRole && <span className="text-[10px] text-slate-400">ID: #{reader.id}</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {reader.contact ? (
                          <span className="bg-slate-50 px-2 py-1 rounded border border-slate-200 text-xs font-mono">
                            {reader.contact}
                          </span>
                        ) : <span className="text-slate-400 italic">-</span>}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {reader.address || <span className="text-slate-400 italic">-</span>}
                      </td>
                      
                      {!isReaderRole && (
                        <td className="px-6 py-4 text-sm">
                            {reader.user ? (
                                <div className="flex flex-col">
                                    <span className="text-slate-800 font-medium">{reader.user.username}</span>
                                    <span className="text-xs text-slate-400">{reader.user.email}</span>
                                </div>
                            ) : reader.id_user ? (
                                <div className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-1 rounded w-fit border border-amber-100">
                                    <span className="text-xs font-bold">⚠️ Помилка</span>
                                    <span className="text-[10px] opacity-75">(Дані акаунта недоступні)</span>
                                </div>
                            ) : (
                                <span className="text-slate-400 text-xs italic bg-slate-50 px-2 py-1 rounded">Не прив'язано</span>
                            )}
                        </td>
                      )}
                      
                      {!isReaderRole && (
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-3 opacity-80 group-hover:opacity-100 transition-opacity">
                            <Link 
                              to={`/readers/${reader.id}`}
                              className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              Редагувати
                            </Link>
                            <button 
                              onClick={() => {
                                if (window.confirm(`Ви дійсно хочете видалити читача "${reader.fullName}"?`)) {
                                  deleteReader.mutate(reader.id);
                                }
                              }}
                              className="text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              Видалити
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <span className="text-4xl mb-3">👥</span>
              <p className="text-lg font-medium">
                {searchQuery ? 'За вашим запитом нічого не знайдено' : 'Список читачів порожній'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};