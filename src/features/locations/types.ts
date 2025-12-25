import { ICopybook } from '../copybooks/types';
import { IShelf } from '../shelves/types'; 

export interface ILocation {
  id: number;
  shelf: IShelf | null;
  copybook: ICopybook | null;
}

export interface ICreateLocationPayload {
  id_shelf: number;
  quantity: number;
}

export interface IUpdateLocationPayload {
  id_shelf?: number;
}