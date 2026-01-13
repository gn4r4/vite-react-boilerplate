import { z } from 'zod';

// 1. Визначаємо ролі
export type Role = 'ADMINISTRATOR' | 'LIBRARIAN' | 'RESTORER' | 'READER';

export const loginSchema = z.object({
  email: z.string().email('Введіть коректний email'),
  password: z.string().min(5, 'Пароль має бути мінімум 5 символів'),
});

export type LoginCredentials = z.infer<typeof loginSchema>;

export interface AuthResponse {
  token: string;
  role: Role;
}