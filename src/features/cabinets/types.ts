export interface ICabinet {
  id: number;
  name: string;
  description: string | null;
}

export interface ICabinetPayload {
  name: string;
  description: string | null;
}
