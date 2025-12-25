import { IEdition } from '../editions/types';
import { ISupplier } from '../suppliers/types';

export interface IEditions {
  edition: IEdition;
  quantity: number;
}

export interface IOrder {
  id: number;
  date: Date;
  status: string;
  supplier: ISupplier | null;
  editions: IEditions[];
}

export interface IOrderEditionsPayload {
  id_edition: number;
  quantity: number;
}

export interface IOrderPayload {
  dateorder: string;
  status: string;
  id_supplier: number;
  id_editions: IOrderEditionsPayload[];
}