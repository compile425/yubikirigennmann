import { createContext } from 'react';
import type { User } from '../lib/api';

export interface AuthContextType {
  token: string | null;
  setToken: (token: string | null) => void;
  currentUser: User | null;
  partner: User | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
