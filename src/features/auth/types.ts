import { z } from 'zod';
import { IUser, Role as UserRole } from '../users/types';

export type Role = UserRole;

export const loginSchema = z.object({
  email: z.string().email('Введіть коректний email'),
  password: z.string().min(5, 'Пароль має бути мінімум 5 символів'),
});

// ОНОВЛЕНА СХЕМА
export const registerSchema = z.object({
  email: z.string().email('Введіть коректний email'),
  password: z.string().min(5, 'Пароль має бути мінімум 5 символів'),
  // 1. Додаємо поле підтвердження
  passwordConfirm: z.string().min(1, 'Підтвердіть пароль'), 
  
  username: z.string().min(2, 'Нікнейм обовʼязковий'),
  name: z.string().optional(),

  createReader: z.boolean().default(false),

  firstname: z.string().optional(),
  lastname: z.string().optional(),
  patronymic: z.string().optional(),
  contact: z.string().optional(),
  address: z.string().optional(),
})
// 2. Валідація: Паролі мають співпадати
.refine((data) => data.password === data.passwordConfirm, {
  message: "Паролі не співпадають",
  path: ["passwordConfirm"],
})
// 3. Валідація: Дані читача (якщо обрано чекбокс)
.refine((data) => {
  if (data.createReader) {
    return !!data.firstname && !!data.lastname && data.firstname.length >= 2 && data.lastname.length >= 2;
  }
  return !!data.name && data.name.length >= 2;
}, {
  message: "Для реєстрації читача необхідно вказати Ім'я та Прізвище",
  path: ["firstname"], 
});

export type LoginCredentials = z.infer<typeof loginSchema>;
export type RegisterCredentials = z.infer<typeof registerSchema>;

export interface AuthResponse {
  token: string;
  user: IUser;
}