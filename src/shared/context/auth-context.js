import { createContext } from 'react';

export const AuthContext = createContext({
    user: {},
    isSignedIn: false,
    login: () => {},
    logout: () => {},
    saveUser: () => {},
    onRouteChange: () => {}
});