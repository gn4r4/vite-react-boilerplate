export interface IPublisher {
  id: number;
  name: string;
  address?: string | null;
  contact?: string | null;
}

export interface IPublisherPayload {
  name: string;
  address?: string | null;
  contact?: string | null;
}