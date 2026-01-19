export interface IBusiness {
  _id?: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  events?: string[];
  managers?: string[];
  active: boolean;
  avatar?: string;
}
