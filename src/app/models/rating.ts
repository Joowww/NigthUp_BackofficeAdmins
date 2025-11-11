export interface Rating {
  _id?: string;
  event: string;           
  username: string;        
  score: number;          
  comment?: string;       
  createdAt?: string;
  updatedAt?: string;
}


export interface RatingStats {
  average: number;        
  count: number;          
}


export interface RatingsResponse {
  ratings: Rating[];
  pagination: {
    skip: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}