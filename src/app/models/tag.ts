export interface Tag {
  _id?: string;
  name: string;
  description?: string;
  color: string;
  events: any[];
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TagStats {
  total: number;
  active: number;
  inactive: number;
  mostUsed: { tag: Tag, count: number }[];
}

export interface TagsResponse {
  tags: Tag[];
  pagination: {
    skip: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}