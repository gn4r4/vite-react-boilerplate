import { IPosition } from '../positions/types';

export interface IEmployee {
  id: number;
  fullName: string;
  lastname: string;
  firstname: string;
  patronymic?: string | null;
  contact: string;
  address: string;
  position?: IPosition | null;
  id_user?: number | null;
}

export interface IEmployeePayload {
  lastname: string;
  firstname: string;
  patronymic?: string | null;
  contact: string;
  address: string;
  id_position?: number | null;
  id_user?: number | null;
}
