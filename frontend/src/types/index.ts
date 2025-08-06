export interface Promise {
    id: number;
    content: string;
    due_date: string;
    type: string;
    creator_id: number;
  }

  export interface User {
    id: number;
    name: string;
    email: string;
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