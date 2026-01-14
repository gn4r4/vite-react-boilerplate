import { IReader } from '../readers/types'; // Проверь правильность пути к типам читателя
import { IEmployee } from '../employees/types'; // Проверь путь к типам сотрудника

export enum Role {
  ADMINISTRATOR = "ADMINISTRATOR",
  LIBRARIAN = "LIBRARIAN",
  RESTORER = "RESTORER",
  READER = "READER",
}

export enum Language {
  enUS = 'en-US',
  slSI = 'sl-SI',
  frFR = 'fr-FR',
  deDE = 'de-DE',
  esES = 'es-ES',
  itIT = 'it-IT',
  ptPT = 'pt-PT',
  ukUA = 'uk-UA'
}

export interface IUser {
  id: number;
  email: string;
  username: string;
  name: string;
  role: Role;
  language: Language;
  createdAt: Date;

  reader?: IReader;
  employee?: IEmployee;
}