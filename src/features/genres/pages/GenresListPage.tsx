import { Link } from '@tanstack/react-router';
import { useGenres, useDeleteGenre } from '../api';

export const GenresListPage = () => {
  const { data: genres, isLoading, error } = useGenres();
  const deleteGenre = useDeleteGenre();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error!</div>;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Жанри</h1>
        <Link to="/genres/new" className="bg-blue-500 text-white px-4 py-2 rounded">Додати</Link>
      </div>
      <ul className="space-y-2">
        {genres?.map((g) => (
          <li key={g.id} className="border p-2 rounded flex justify-between">
            <span>{g.name}</span>
            <div className="space-x-2">
              <Link 
                to="/genres/$genreId" 
                params={{ genreId: g.id.toString() }} 
                className="text-blue-600"
              >
                Edit
              </Link>
              <button onClick={() => deleteGenre.mutate(g.id)} className="text-red-600">Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};