export interface User {
  id: number;
  username: string;
  email: string;
}

export interface Contributor {
  id: number;
  story_id: number;
  user_id: number;
  username: string;
}

export interface Story {
  id: number;
  title: string;
  content: string;
  author_id: number;
  author: User | null;
  contributors: Contributor[];
  created_at: string;
  updated_at: string;
}
