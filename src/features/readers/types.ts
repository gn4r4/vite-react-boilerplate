export interface IReader {
  id: number;
  fullName: string;
  lastname: string;
  firstname: string;
  patronymic: string | null;
  contact: string;
  address: string;
}

export interface IReaderPayload {
  lastname: string;
  firstname: string;
  patronymic?: string | null;
  contact: string;
  address: string;
}
