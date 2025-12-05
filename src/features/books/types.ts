import { IAuthor } from "../authors/types";
import { ICategory } from "../categories/types";
import { IGenre } from "../genres/types";

export interface IBook {
  id: number;
  title: string;
  category: ICategory;
  genre: IGenre;
  authors: IAuthor[];
}