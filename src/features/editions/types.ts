import { IPublisher } from '../publishers/types';
import { IBook } from '../books/types';

// Тип для отримання даних (GET)
export interface IEdition {
  id: number;
  book: IBook | null;
  publisher: IPublisher | null;
  yearPublication: Date;
}


export interface IEditionPayload {
  id_book: number;
  id_publisher: number;
  yearpublication: string; // Валідатор чекає рядок дати
}