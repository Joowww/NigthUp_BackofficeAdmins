export interface IUser {
  _id?: string;
  username: string;
  email: string;
  password?: string;
  birthday: Date | string;
  phoneNumber?: string;
  events?: string[];
  active: boolean;
  role: 'admin' | 'user' | 'manager';
  googleId?: string;
  authProvider?: 'local' | 'google';
  isOnline?: boolean;
  lastSeen?: Date | string;
  emergencyContacts?: string[];
  location?: {
    type: string;
    coordinates: [number, number];
  };
  isVisibleOnMap?: boolean;
  avatar?: string;
  firstName?: string;
  lastName?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  city?: string;
  country?: string;
  comunidad?: string;
  intereses?: string[];
  onboardingCompleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
