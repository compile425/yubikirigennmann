export interface PromiseItem {
  id: number;
  content: string;
  due_date: string;
  type: string;
  creator_id: number;
  rating?: number;
  evaluation_text?: string;
  evaluation_date?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  avatar_url?: string;
  is_inviter?: boolean;
}

export interface EvaluatedPromise {
  id: number;
  content: string;
  due_date: string;
  type: string;
  creator_id: number;
  rating: number;
  evaluation_date: string;
  evaluator_name: string;
}
