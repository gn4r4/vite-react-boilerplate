import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import apiClient from '@/lib/axios';
import { IUser } from './types';

const getUsers = async (): Promise<IUser[]> => {
	const response = await apiClient.get('/users');
	return response.data.data;
};

const getUserById = async (id: number): Promise<IUser> => {
	const response = await apiClient.get(`/users/${id}`);
	return response.data.data;
};

const createUser = async (newUser: Partial<IUser>): Promise<IUser> => {
	const response = await apiClient.post('/users', newUser);
	return response.data.data;
};

const updateUser = async ({ id, data }: { id: number; data: Partial<IUser> }): Promise<IUser> => {
	const response = await apiClient.patch(`/users/${id}`, data);
	return response.data.data;
};

const deleteUser = async (id: number): Promise<void> => {
	await apiClient.delete(`/users/${id}`);
};

export const useUsers = () => useQuery({ queryKey: ['users'], queryFn: getUsers });
export const useUser = (id: number) => useQuery({ queryKey: ['users', id], queryFn: () => getUserById(id), enabled: !!id });

export const useCreateUser = () => {
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	return useMutation({
		mutationFn: createUser,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['users'] });
			navigate({ to: '/users' });
		},
	});
};

export const useUpdateUser = () => {
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	return useMutation({
		mutationFn: updateUser,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['users'] });
			navigate({ to: '/users' });
		},
	});
};

export const useDeleteUser = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: deleteUser,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['users'] });
		},
	});
};
