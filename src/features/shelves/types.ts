import { ICabinet } from '../cabinets/types';

export interface IShelf {
  id: number;
  shelfcode: string;
  cabinet: ICabinet | null;
}
