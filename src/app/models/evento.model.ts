export interface Evento {
  _id?: string;
  name: string;
  schedule: string | string[];
  address?: string;
  participantes?: string[];
}
