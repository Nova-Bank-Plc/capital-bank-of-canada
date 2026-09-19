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


export const ThemeProvider = ({
    children,
}: ThemeProviderProps) => {

    const [
        darkMode,
        setDarkMode,
    ] = useState<boolean>(() => {

        const savedTheme =
            localStorage.getItem(
                "capital-bank-theme"
            );

        if (savedTheme === "dark") {
            return true;
        }

        if (savedTheme === "light") {
            return false;
        }

        return window.matchMedia(
            "(prefers-color-scheme: dark)"
        ).matches;
    });


    useEffect(() => {

        const root =
            document.documentElement;


        if (darkMode) {

            root.classList.add(
                "dark"
            );

            localStorage.setItem(
                "capital-bank-theme",
                "dark"
            );

        } else {

            root.classList.remove(
                "dark"
            );

            localStorage.setItem(
                "capital-bank-theme",
                "light"
            );
        }

    }, [
        darkMode,
    ]);


    const toggleDarkMode =
        () => {

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
};


export const useTheme =
    (): ThemeContextValue => {

        const context =
            useContext(
                ThemeContext
            );


        if (!context) {

            throw new Error(
                "useTheme must be used inside ThemeProvider."
            );
        }


        return context;
    };

