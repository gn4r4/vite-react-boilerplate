import { Link } from '@tanstack/react-router';
import { useAuthors, useDeleteAuthor } from '../api';

export const AuthorsListPage = () => {
  const { data: authors, isLoading, error } = useAuthors();
  const deleteAuthor = useDeleteAuthor();

  if (isLoading) return <div>Завантаження авторів...</div>;
  if (error) return <div>Помилка!</div>;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Автори</h1>
        <Link to="/authors/new" className="bg-blue-500 text-white px-4 py-2 rounded">Додати</Link>
      </div>
      <ul className="space-y-2">
        {authors?.map((author) => (
          <li key={author.id} className="border p-2 rounded flex justify-between">
            <span>{author.firstname} {author.lastname}</span>
            <div className="space-x-2">
              <Link 
                to="/authors/$authorId" 
                params={{ authorId: author.id.toString() }} 
                className="text-blue-600"
              >
                Edit
              </Link>
              <button onClick={() => deleteAuthor.mutate(author.id)} className="text-red-600">Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};