import { IAuthor } from "../authors/types";
import { ICategory } from "../categories/types";
import { IGenre } from "../genres/types";

export interface IBook {
  id: number;
  title: string;
  category: ICategory | null;
  genre: IGenre | null;
  authors: IAuthor[];
}

export interface IBookPayload {
  title?: string;
  id_category?: number;
  id_genre?: number;
  id_author?: Array<number>;
}