export interface IAuthor {
  id: number;
  lastname: string;
  firstname: string;
  patronymic?: string | null;
  dateofbirth?: Date | null;
  fullName: string;
}

export interface IAuthorPayload {
  firstname: string;
  lastname: string;
  patronymic?: string | null;
  dateofbirth?: string | null;
}