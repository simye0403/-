export type ToolType = 'text' | 'image' | 'video';

export interface Project {
  id: string;
  title: string;
  type: ToolType;
  content: string;
  createdAt: Date;
  thumbnail?: string;
}

export interface UserStats {
  creditsUsed: number;
  totalCredits: number;
  projectsCount: number;
}
