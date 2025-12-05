export interface IAuthor {
  id: number;
  lastname: string;
  firstname: string;
  patronymic?: string;
  dateofbirth?: Date;
  fullName: string;
}