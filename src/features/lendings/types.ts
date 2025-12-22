import { IEmployee } from '../employees/types';
import { ICopybook} from '../copybooks/types';

export interface IReader {
  id: number;
  fullName: string;
  lastname: string;
  firstname: string;
  patronymic: string | null;
  contact: string;
  address: string;
}

export interface ILending {
  id: number;
  dateLending: Date;
  dateReturn: Date | null;
  reader: IReader | null;
  employee: IEmployee | null;
  items: ICopybook[];
}
