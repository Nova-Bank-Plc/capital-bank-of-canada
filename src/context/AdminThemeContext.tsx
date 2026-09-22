import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";

import {
    useLocation,
} from "react-router-dom";


interface AdminThemeContextValue {

    adminDarkMode: boolean;

    toggleAdminDarkMode: () => void;
}


const AdminThemeContext =
    createContext<
        AdminThemeContextValue | undefined
    >(
        undefined
    );


interface AdminThemeProviderProps {

    children: ReactNode;
}


const ADMIN_THEME_KEY =
    "capital-bank-admin-theme";

const CUSTOMER_THEME_KEY =
    "capital-bank-theme";


export function AdminThemeProvider({
    children,
}: AdminThemeProviderProps) {

    const location =
        useLocation();


    const [
        adminDarkMode,
        setAdminDarkMode,
    ] = useState<boolean>(() => {

        const savedTheme =
            localStorage.getItem(
                ADMIN_THEME_KEY
            );

        return savedTheme === "dark";
    });


    const isAdminRoute =
        location.pathname === "/admin" ||
        location.pathname.startsWith(
            "/admin/"
        );


    useEffect(() => {

        const root =
            document.documentElement;


        if (isAdminRoute) {

            /*
             * ADMIN AREA
             *
             * Remove the customer theme class
             * so customer dark mode cannot control
             * the admin interface.
             */

            root.classList.remove(
                "dark"
            );


            if (adminDarkMode) {

                root.classList.add(
                    "admin-dark"
                );

            } else {

                root.classList.remove(
                    "admin-dark"
                );
            }

        } else {

            /*
             * CUSTOMER AREA
             *
             * Remove the admin theme class and
             * restore the customer's saved theme.
             */

            root.classList.remove(
                "admin-dark"
            );


            const customerTheme =
                localStorage.getItem(
                    CUSTOMER_THEME_KEY
                );


            if (
                customerTheme === "dark"
            ) {

                root.classList.add(
                    "dark"
                );

            } else {

                root.classList.remove(
                    "dark"
                );
            }
        }

    }, [
        isAdminRoute,
        adminDarkMode,
    ]);


    const toggleAdminDarkMode =
        () => {

            setAdminDarkMode(
                current => {

                    const next =
                        !current;


                    localStorage.setItem(
                        ADMIN_THEME_KEY,
                        next
                            ? "dark"
                            : "light"
                    );


                    return next;
                }
            );
        };


    return (
        <AdminThemeContext.Provider
            value={{
                adminDarkMode,
                toggleAdminDarkMode,
            }}
        >
            {children}
        </AdminThemeContext.Provider>
    );
}


export function useAdminTheme() {

    const context =
        useContext(
            AdminThemeContext
        );


    if (!context) {

        throw new Error(
            "useAdminTheme must be used within an AdminThemeProvider"
        );
    }


    return context;
}

