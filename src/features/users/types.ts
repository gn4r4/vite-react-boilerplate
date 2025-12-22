export enum Role {
  ADMIN = "admin",
  USER = "user",
  MODERATOR = "moderator",
}

export interface IUser {
  id: number;
  email: string;
  username: string;
  name: string;
  role: Role | string;
  language: string;
  createdAt: Date;
}
