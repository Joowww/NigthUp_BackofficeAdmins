import { Event } from './event';

export interface User {
  _id?: string;
  username: string;
  email: string;
  password: string;
  birthday: Date;
  events: (string | Event)[];
  active: boolean;
  role: 'admin' | 'user' | 'manager';
}
