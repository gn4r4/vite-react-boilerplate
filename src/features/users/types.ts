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
}
