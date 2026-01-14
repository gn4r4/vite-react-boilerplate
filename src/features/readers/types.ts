import { IUser } from '../users/types';

export interface IReader {
  id: number;
  fullName: string;
  lastname: string;
  firstname: string;
  patronymic: string | null;
  contact: string;
  address: string;

  user?: IUser | null;
  id_user?: number | null;
}

export interface IReaderPayload {
  lastname: string;
  firstname: string;
  patronymic?: string | null;
  contact: string;
  address: string;

  id_user?: number | null;
}