import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";


interface ThemeContextValue {

    darkMode: boolean;

    toggleDarkMode: () => void;

}


const ThemeContext =
    createContext<ThemeContextValue | undefined>(
        undefined
    );


interface ThemeProviderProps {

    children: ReactNode;

}


export function ThemeProvider({
    children,
}: ThemeProviderProps) {

    const [
        darkMode,
        setDarkMode,
    ] = useState<boolean>(() => {

        const savedTheme =
            localStorage.getItem(
                "capital-bank-theme"
            );

        return savedTheme === "dark";

    });


    useEffect(() => {

        const root =
            document.documentElement;


        if (darkMode) {

            root.classList.add("dark");

        } else {

            root.classList.remove("dark");

        }


        localStorage.setItem(
            "capital-bank-theme",
            darkMode
                ? "dark"
                : "light"
        );

    }, [
        darkMode,
    ]);


    const toggleDarkMode = () => {

        setDarkMode(
            current =>
                !current
        );

    };


    return (

        <ThemeContext.Provider
            value={{
                darkMode,
                toggleDarkMode,
            }}
        >

            {children}

        </ThemeContext.Provider>

    );

}


export function useTheme() {

    const context =
        useContext(
            ThemeContext
        );


    if (!context) {

        throw new Error(
            "useTheme must be used within a ThemeProvider"
        );

    }


    return context;

}