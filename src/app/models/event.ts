export interface Event {
  _id?: string;
  name: string;
  schedule: string | string[];
  address?: string;
  participantes?: string[];
  active: boolean;
}
