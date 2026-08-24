import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";

interface AuthContextType {
    isAuthenticated: boolean;
    login: () => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(
    undefined
);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({
    children,
}: AuthProviderProps) {

    const [isAuthenticated, setIsAuthenticated] =
        useState<boolean>(() => {

            return localStorage.getItem(
                "capital-authenticated"
            ) === "true";

        });


    useEffect(() => {

        if (isAuthenticated) {

            localStorage.setItem(
                "capital-authenticated",
                "true"
            );

        } else {

            localStorage.removeItem(
                "capital-authenticated"
            );

        }

    }, [isAuthenticated]);


    const login = () => {

        setIsAuthenticated(true);

    };


    const logout = () => {

        setIsAuthenticated(false);

    };


    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}


export function useAuth() {

    const context = useContext(AuthContext);

    if (!context) {

        throw new Error(
            "useAuth must be used inside AuthProvider"
        );

    }

    return context;
}