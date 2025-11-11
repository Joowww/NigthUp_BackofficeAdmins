export interface UserInterest {
  _id?: string;
  name: string;
  description?: string;
  color: string;
  users: any[];
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserInterestStats {
  total: number;
  active: number;
  inactive: number;
  mostPopular: { interest: UserInterest, count: number }[];
}

export interface UserInterestsResponse {
  interests: UserInterest[];
  pagination: {
    skip: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}