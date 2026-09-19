import {
    createContext,
    useContext,
    useState,
    type ReactNode,
} from "react";


interface User {
    id: string;
    clientNumber: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    role: "customer" | "admin";
}


interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (token: string, user: User) => void;
    logout: () => void;
}


const AuthContext =
    createContext<AuthContextType | undefined>(
        undefined
    );


interface AuthProviderProps {
    children: ReactNode;
}


function getStoredUser(): User | null {
    const storedUser =
        localStorage.getItem(
            "capital-bank-user"
        );

    if (!storedUser) {
        return null;
    }

    try {
        return JSON.parse(storedUser) as User;
    } catch (error) {
        console.error(
            "Unable to restore stored user:",
            error
        );

        localStorage.removeItem(
            "capital-bank-user"
        );

        return null;
    }
}


function getStoredToken(): string | null {
    return localStorage.getItem(
        "capital-bank-token"
    );
}


export function AuthProvider({
    children,
}: AuthProviderProps) {

    /*
     * Restore authentication BEFORE the first render.
     *
     * This prevents protected routes from seeing
     * token === null for one render after refresh.
     */

    const [token, setToken] =
        useState<string | null>(
            getStoredToken
        );


    const [user, setUser] =
        useState<User | null>(
            getStoredUser
        );


    const login = (
        newToken: string,
        newUser: User
    ) => {

        setToken(newToken);
        setUser(newUser);

        localStorage.setItem(
            "capital-bank-token",
            newToken
        );

        localStorage.setItem(
            "capital-bank-user",
            JSON.stringify(newUser)
        );
    };


    const logout = () => {

        setToken(null);
        setUser(null);

        localStorage.removeItem(
            "capital-bank-token"
        );

        localStorage.removeItem(
            "capital-bank-user"
        );

        localStorage.removeItem(
            "capital-remember-me"
        );
    };


    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isAuthenticated:
                    Boolean(token),
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}


export function useAuth() {

    const context =
        useContext(AuthContext);

    if (!context) {

        throw new Error(
            "useAuth must be used inside AuthProvider"
        );
    }

    return context;
}