import { createContext } from 'react';

export const UserContext = createContext({
    user: {},
    isSignedIn: false,
    saveUser: () => {},
    resetUser: () => {},
    onRouteChange: () => {},
    fetchUserData: () => {}
});