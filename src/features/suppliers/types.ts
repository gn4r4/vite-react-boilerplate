import { IOrder } from "../orders/types";

export interface ISupplier {
  id: number;
  name: string;
  contact?: string | null;
  address?: string | null;
  orders: IOrder[];
}

export interface ISupplierPayload {
  name: string;
  contact?: string | null;
  address?: string | null;
}
