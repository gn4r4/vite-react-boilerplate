import { Link } from '@tanstack/react-router';
import { useCategories, useDeleteCategory } from '../api';

export const CategoriesListPage = () => {
  const { data: categories, isLoading, error } = useCategories();
  const deleteCategory = useDeleteCategory();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error!</div>;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Категорії</h1>
        <Link to="/categories/new" className="bg-blue-500 text-white px-4 py-2 rounded">Додати</Link>
      </div>
      <ul className="space-y-2">
        {categories?.map((cat) => (
          <li key={cat.id} className="border p-2 rounded flex justify-between">
            <span>{cat.name}</span>
            <div className="space-x-2">
              <Link 
                to="/categories/$categoryId" 
                params={{ categoryId: cat.id.toString() }} 
                className="text-blue-600"
              >
                Edit
              </Link>
              <button onClick={() => deleteCategory.mutate(cat.id)} className="text-red-600">Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};