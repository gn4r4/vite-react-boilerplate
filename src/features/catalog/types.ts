export interface ICatalogBook {
  id: number;
  title: string;
  authors: string[]; 
  genre: string;
  category: string;
  publisher: string;
  year: number;
  isAvailable: boolean;
}