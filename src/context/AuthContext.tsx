import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";

interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (token: string, user: User) => void;
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

    const [user, setUser] = useState<User | null>(null);

    const [token, setToken] = useState<string | null>(
        null
    );


    useEffect(() => {

        const storedToken =
            localStorage.getItem("capital-bank-token");

        const storedUser =
            localStorage.getItem("capital-bank-user");

        if (storedToken && storedUser) {

            try {

                const parsedUser: User =
                    JSON.parse(storedUser);

                setToken(storedToken);
                setUser(parsedUser);

            } catch (error) {

                console.error(
                    "Unable to restore login session:",
                    error
                );

                localStorage.removeItem(
                    "capital-bank-token"
                );

                localStorage.removeItem(
                    "capital-bank-user"
                );
            }
        }

    }, []);


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
                isAuthenticated: Boolean(token),
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
            "useAuth must be used inside an AuthProvider"
        );
    }

    return context;
}