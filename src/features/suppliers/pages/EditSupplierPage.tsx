import { useState, useEffect } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useSupplier, useUpdateSupplier } from '../api';
import type { ISupplierPayload, ISupplier } from '../types';

export const EditSupplierPage = () => {
  const navigate = useNavigate();
  const { supplierId } = useParams({ strict: false });
  const id = Number(supplierId);

  const { data: supplier, isLoading } = useSupplier(id);
  const updateSupplier = useUpdateSupplier();
  
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    contact: '',
  });
  
  const [formErrors, setFormErrors] = useState<string | null>(null);

  useEffect(() => {
    if (supplier) {
      setFormData({
        name: supplier.name || '',
        address: supplier.address || '',
        contact: supplier.contact || '',
      });
    }
  }, [supplier]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors(null);
    
    if (!formData.name.trim()) {
      setFormErrors('Введіть назву постачальника');
      return;
    }

    const payload: ISupplierPayload = {
      name: formData.name.trim(),
      address: formData.address.trim() || null,
      contact: formData.contact.trim() || null,
    };

    updateSupplier.mutate({
      id: id,
      data: payload as unknown as Partial<ISupplier>,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-gray-600">Завантаження...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Редагувати постачальника</h1>
          <p className="text-gray-600 mb-6">Оновіть інформацію про постачальника</p>
          
          {formErrors && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">{formErrors}</div>
          )}
          
          {updateSupplier.isError && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              Помилка: {(updateSupplier.error as any)?.response?.data?.message || 'Невідома помилка'}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Назва *</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none transition"
                placeholder="Введіть назву..."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Адреса</label>
              <input
                type="text"
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none transition"
                placeholder="Введіть адресу..."
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Контакт</label>
              <input
                type="text"
                value={formData.contact}
                onChange={e => setFormData({ ...formData, contact: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none transition"
                placeholder="Введіть контакт..."
              />
            </div>
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-70"
                disabled={updateSupplier.isPending}
              >
                {updateSupplier.isPending ? 'Збереження...' : 'Зберегти'}
              </button>
              <button
                type="button"
                onClick={() => navigate({ to: '/suppliers' })}
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