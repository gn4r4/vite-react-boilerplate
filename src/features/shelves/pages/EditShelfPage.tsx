import { useEffect, useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useShelf, useUpdateShelf } from '../api';
import { useCabinets } from '../../cabinets/api';

export const EditShelfPage = () => {
  const { shelfId } = useParams({ from: '/shelves/$shelfId' });
  const navigate = useNavigate();
  const id = Number(shelfId);

  const { data: shelf, isLoading } = useShelf(id);
  const { data: cabinets } = useCabinets();
  const updateShelf = useUpdateShelf();

  const [formData, setFormData] = useState({
    shelfcode: '',
    id_cabinet: '',
  });

  useEffect(() => {
    if (shelf) {
      setFormData({
        shelfcode: shelf.shelfcode,
        id_cabinet: shelf.cabinet?.id?.toString() || '',
      });
    }
  }, [shelf]);

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
      updateShelf.mutate({
        id,
        data: {
          shelfcode: formData.shelfcode,
          id_cabinet: Number(formData.id_cabinet),
        } as any,
      });
    }
  };

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-gray-600">Завантаження...</div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Редагувати полицю</h1>
          <p className="text-gray-600 mb-6">Оновіть інформацію про полицю</p>

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
                disabled={updateShelf.isPending}
              >
                {updateShelf.isPending ? 'Збереження...' : 'Оновити'}
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
