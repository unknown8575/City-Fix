import { createContext } from 'react';

export interface IAuthContext {
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;
}

const defaultValue: IAuthContext = {
    isLoggedIn: false,
    login: () => {},
    logout: () => {},
};

export const AuthContext = createContext<IAuthContext>(defaultValue);
