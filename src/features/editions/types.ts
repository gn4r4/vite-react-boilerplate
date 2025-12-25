import { IPublisher } from '../publishers/types';
import { IBook } from '../books/types';

export interface IEdition {
  id: number;
  book: IBook | null;
  publisher: IPublisher | null;
  yearPublication: Date;
  ISBN?: string | null;
  pages?: number | null;
}

export interface IEditionPayload {
  id_book: number;
  id_publisher: number;
  yearpublication: string;
  ISBN?: string | null;
  pages?: number | null;
}