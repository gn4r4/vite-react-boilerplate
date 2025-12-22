import { ICopybook } from '../copybooks/types';
import { IShelf } from '../shelves/types'; 

export interface ILocation {
  id: number;
  shelf: IShelf | null;
  copybook: ICopybook | null;
}

// Те, що відправляємо на бекенд
export interface CreateLocationPayload {
  id_shelf: number;
  quantity: number; // <-- Додали поле кількості
}

export interface UpdateLocationPayload {
  id_shelf?: number;
}