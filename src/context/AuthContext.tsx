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
    /* ==============================
       CUSTOMER AUTHENTICATION
    ============================== */

    user: User | null;
    token: string | null;
    isAuthenticated: boolean;

    login: (
        token: string,
        user: User
    ) => void;

    logout: () => void;


    /* ==============================
       ADMIN AUTHENTICATION
    ============================== */

    adminUser: User | null;
    adminToken: string | null;
    isAdminAuthenticated: boolean;

    adminLogin: (
        token: string,
        user: User
    ) => void;

    adminLogout: () => void;
}


const AuthContext =
    createContext<AuthContextType | undefined>(
        undefined
    );


interface AuthProviderProps {
    children: ReactNode;
}


/* =========================================
   CUSTOMER STORAGE
========================================= */

function getStoredUser(): User | null {

    const storedUser =
        localStorage.getItem(
            "capital-bank-user"
        );

    if (!storedUser) {
        return null;
    }

    try {

        return JSON.parse(
            storedUser
        ) as User;

    } catch (error) {

        console.error(
            "Unable to restore stored customer:",
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


/* =========================================
   ADMIN STORAGE
========================================= */

function getStoredAdminUser(): User | null {

    const storedAdminUser =
        localStorage.getItem(
            "capital-bank-admin-user"
        );

    if (!storedAdminUser) {
        return null;
    }

    try {

        return JSON.parse(
            storedAdminUser
        ) as User;

    } catch (error) {

        console.error(
            "Unable to restore stored administrator:",
            error
        );

        localStorage.removeItem(
            "capital-bank-admin-user"
        );

        return null;
    }
}


function getStoredAdminToken(): string | null {

    return localStorage.getItem(
        "capital-bank-admin-token"
    );
}


/* =========================================
   AUTH PROVIDER
========================================= */

export function AuthProvider({
    children,
}: AuthProviderProps) {


    /* =====================================
       CUSTOMER STATE
    ===================================== */

    const [token, setToken] =
        useState<string | null>(
            getStoredToken
        );


    const [user, setUser] =
        useState<User | null>(
            getStoredUser
        );


    /* =====================================
       ADMIN STATE
    ===================================== */

    const [adminToken, setAdminToken] =
        useState<string | null>(
            getStoredAdminToken
        );


    const [adminUser, setAdminUser] =
        useState<User | null>(
            getStoredAdminUser
        );


    /* =====================================
       CUSTOMER LOGIN
    ===================================== */

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


    /* =====================================
       CUSTOMER LOGOUT
    ===================================== */

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


    /* =====================================
       ADMIN LOGIN
    ===================================== */

    const adminLogin = (
        newToken: string,
        newUser: User
    ) => {

        setAdminToken(newToken);
        setAdminUser(newUser);

        localStorage.setItem(
            "capital-bank-admin-token",
            newToken
        );

        localStorage.setItem(
            "capital-bank-admin-user",
            JSON.stringify(newUser)
        );
    };


    /* =====================================
       ADMIN LOGOUT
    ===================================== */

    const adminLogout = () => {

        setAdminToken(null);
        setAdminUser(null);

        localStorage.removeItem(
            "capital-bank-admin-token"
        );

        localStorage.removeItem(
            "capital-bank-admin-user"
        );
    };


    return (
        <AuthContext.Provider
            value={{

                /* Customer */

                user,

                token,

                isAuthenticated:
                    Boolean(token),

                login,

                logout,


                /* Administrator */

                adminUser,

                adminToken,

                isAdminAuthenticated:
                    Boolean(adminToken),

                adminLogin,

                adminLogout,

            }}
        >
            {children}
        </AuthContext.Provider>
    );
}


/* =========================================
   USE AUTH
========================================= */

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