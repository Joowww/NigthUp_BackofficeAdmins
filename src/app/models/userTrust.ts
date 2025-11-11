export interface UserTrust {
  _id?: string;
  rater: any;
  rated: any;
  score: number;
  comment?: string;
  context: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserTrustStats {
  average: number;
  count: number;
  distribution: { score: number, count: number }[];
}

export interface UserTrustSummary {
  userId: string;
  username: string;
  averageTrust: number;
  totalRatings: number;
  trustLevel: 'high' | 'medium' | 'low';
}

export interface UserTrustResponse {
  ratings: UserTrust[];
  pagination: {
    skip: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}