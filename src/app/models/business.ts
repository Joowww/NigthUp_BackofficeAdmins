import { Event } from './event';

export interface IBussines {
  _id?: string;//CIF
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  eventos?: Event[];
  managers?: string[];//id of that users who are managers of the business
  active: boolean;
}
