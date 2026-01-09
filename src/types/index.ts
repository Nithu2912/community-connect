export type UserRole = 'citizen' | 'authority';

export type IssueStatus = 'reported' | 'in-progress' | 'resolved';

export type IssueCategory = 
  | 'road-damage'
  | 'street-light'
  | 'garbage'
  | 'water-supply'
  | 'drainage'
  | 'public-safety'
  | 'other';

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  status: IssueStatus;
  photoUrl?: string;
  resolutionPhotoUrl?: string;
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  ward: string;
  upvotes: number;
  upvotedBy: string[];
  reportedBy: string;
  reportedAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  isOverdue: boolean;
}

export interface Ward {
  id: string;
  name: string;
  totalIssues: number;
  resolvedIssues: number;
  pendingIssues: number;
  inProgressIssues: number;
}

export interface User {
  id: string;
  email: string;
  phone?: string;
  role: UserRole;
  ward?: string;
  displayName?: string;
}
