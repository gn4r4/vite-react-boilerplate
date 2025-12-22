import { IEdition } from '../editions/types';

export interface OrderItem {
  edition: IEdition;
  quantity: number;
}

export interface IOrder {
  id: number;
  dateOrder: Date;
  status: string;
  items: OrderItem[];
}
