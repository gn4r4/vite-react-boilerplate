import { IEdition } from '../editions/types';
import { IShelf } from '../shelves/types';

// Те, що приходить від сервера (Response DTO)
export interface ICopybook {
  id: number;
  edition: IEdition | null;
  status: string;
  location: {
    id: number;
    shelf: IShelf;
  } | null;
}

// Загальний Payload для створення та редагування
export interface CopybookPayload {
  id_edition?: number;
  status?: string;
  id_location?: number | null;
}