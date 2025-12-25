import { ICabinet } from '../cabinets/types';

export interface IShelf {
  id: number;
  shelfcode: string;
  cabinet: ICabinet | null;
}

export interface IShelfPayload {
  shelfcode: string;
  id_cabinet?: number;
}
