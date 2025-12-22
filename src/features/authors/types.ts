export interface IAuthor {
  id: number;
  lastname: string;
  firstname: string;
  patronymic?: string | null;
  dateofbirth?: Date | null;
  fullName: string;
}