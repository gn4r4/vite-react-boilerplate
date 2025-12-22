import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useCreateShelf } from '../api';
import { useCabinets } from '../../cabinets/api';

export const CreateShelfPage = () => {
  const navigate = useNavigate();
  const { data: cabinets } = useCabinets();
  
  const [formData, setFormData] = useState({
    shelfcode: '',
    id_cabinet: '',
  });

  const createShelf = useCreateShelf();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.shelfcode?.trim() && formData.id_cabinet) {
      createShelf.mutate({
        shelfcode: formData.shelfcode,
        id_cabinet: Number(formData.id_cabinet),
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Створити полицю</h1>
          <p className="text-gray-600 mb-6">Введіть інформацію про нову полицю</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Код полиці *</label>
              <input
                type="text"
                name="shelfcode"
                value={formData.shelfcode}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
                required
                placeholder="Введіть код полиці"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Шафа *</label>
              <select
                name="id_cabinet"
                value={formData.id_cabinet}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
                required
              >
                <option value="">Оберіть шафу...</option>
                {cabinets?.map((cabinet) => (
                  <option key={cabinet.id} value={cabinet.id}>
                    {cabinet.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex gap-3 pt-4">
              <button 
                type="submit" 
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                disabled={createShelf.isPending}
              >
                {createShelf.isPending ? 'Збереження...' : 'Зберегти'}
              </button>
              <button 
                type="button" 
                onClick={() => navigate({ to: '/shelves' })} 
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
