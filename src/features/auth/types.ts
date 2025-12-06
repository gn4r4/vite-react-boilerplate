import { z } from 'zod';

// Схема валідації для форми
export const loginSchema = z.object({
  email: z.string().email('Введіть коректний email'),
  password: z.string().min(5, 'Пароль має бути мінімум 5 символів'),
});

// Тип, виведений зі схеми (для TypeScript)
export type LoginCredentials = z.infer<typeof loginSchema>;

// Відповідь сервера (підлаштуйте під ваш бекенд, якщо там { data: { token: ... } })
export interface AuthResponse {
  token: string;
}