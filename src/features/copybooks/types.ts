import { IEdition } from '../editions/types';
import { IShelf } from '../shelves/types';

export interface ICopybook {
  id: number;
  status: string;
  edition: IEdition | null;
  
  location: {
    id: number;
    shelf: IShelf;
  } | null;
}

export interface CopybookPayload {
  id_edition?: number;
  status?: string;
  id_location?: number | null;
}