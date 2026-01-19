export interface IEvent {
  _id?: string;
  name: string;
  schedule: Date | string;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  description: string;
  category: string;
  city?: string;
  capacity: number;
  price: number;
  participants?: string[];
  likes?: number;
  likedBy?: string[];
  active: boolean;
  image?: string;
  createdAt?: string;
  updatedAt?: string;
}
