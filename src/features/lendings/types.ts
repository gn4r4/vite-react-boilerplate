import { IEmployee } from '../employees/types';
import { ICopybook } from '../copybooks/types';
import { IReader } from '../readers/types';

export interface ICopybookInLending extends ICopybook {
  dateReturnActual: string | null; 
}

export interface ILending {
  id: number;
  dateLending: Date;
  dateReturnPlanned: Date | null;
  dateReturn: Date | null;
  reader: IReader | null;
  employee: IEmployee | null;
  copybooks: ICopybookInLending[];
}

export interface ILendingPayload {
  id_reader: number;
  id_employee: number;
  datelending: string;
  datereturn_planned: string | null;
  datereturn?: string | null;
  id_copybook: number[];
}
