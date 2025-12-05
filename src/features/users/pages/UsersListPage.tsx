import { Link } from '@tanstack/react-router';
import { useUsers, useDeleteUser } from '../api';

export const UsersListPage = () => {
  const { data: users, isLoading, error } = useUsers();
  const deleteUser = useDeleteUser();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error!</div>;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Користувачі</h1>
        <Link to="/users/new" className="bg-blue-500 text-white px-4 py-2 rounded">Додати</Link>
      </div>
      <ul className="space-y-2">
        {users?.map((u) => (
          <li key={u.id} className="border p-2 rounded flex justify-between">
            {/* Припускаю, що у користувача є email або username */}
            <span>{u.username || u.email} (ID: {u.id})</span>
            <div className="space-x-2">
              <Link to={`/users/${u.id}`} className="text-blue-600">Edit</Link>
              <button onClick={() => deleteUser.mutate(u.id)} className="text-red-600">Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};