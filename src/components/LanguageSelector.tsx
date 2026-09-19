import { useEffect, useState } from "react";

interface LanguageSelectorProps {
    elementId?: string;
}

declare global {
    interface Window {
        google?: {
            translate?: {
                TranslateElement: new (
                    options: {
                        pageLanguage: string;
                        includedLanguages?: string;
                        autoDisplay?: boolean;
                        layout?: number;
                    },
                    elementId: string
                ) => void;
            };
        };

        googleTranslateElementInit?: () => void;
    }
}

const languages = [
    { code: "en", name: "English" },
    { code: "fr", name: "Français" },
    { code: "es", name: "Español" },
    { code: "de", name: "Deutsch" },
    { code: "it", name: "Italiano" },
    { code: "pt", name: "Português" },
    { code: "ru", name: "Русский" },
    { code: "zh-CN", name: "中文" },
    { code: "ja", name: "日本語" },
    { code: "ko", name: "한국어" },
    { code: "ar", name: "العربية" },
    { code: "hi", name: "हिन्दी" },
];

function LanguageSelector({
    elementId = "google_translate_element",
}: LanguageSelectorProps) {

    const [language, setLanguage] =
        useState("en");

    useEffect(() => {

        const initializeTranslator = () => {

            const element =
                document.getElementById(
                    elementId
                );

            if (!element) {
                return;
            }

            if (
                !window.google?.translate
                    ?.TranslateElement
            ) {
                return;
            }

            /*
             * Prevent duplicate Google widgets
             * inside this engine.
             */

            if (
                element.querySelector(
                    ".goog-te-gadget"
                )
            ) {
                return;
            }

            new window.google.translate.TranslateElement(
                {
                    pageLanguage: "en",

                    includedLanguages:
                        "en,fr,es,de,it,pt,ru,zh-CN,ja,ko,ar,hi",

                    autoDisplay: false,

                    layout: 0,
                },

                elementId
            );
        };


        /*
         * GOOGLE TRANSLATE IS ALREADY LOADED
         */

        if (
            window.google?.translate
                ?.TranslateElement
        ) {

            initializeTranslator();

        } else {

            /*
             * GOOGLE TRANSLATE CALLBACK
             */

            window.googleTranslateElementInit =
                initializeTranslator;


            /*
             * LOAD GOOGLE SCRIPT ONCE
             */

            if (
                !document.getElementById(
                    "google-translate-script"
                )
            ) {

                const script =
                    document.createElement(
                        "script"
                    );

                script.id =
                    "google-translate-script";

                script.src =
                    "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";

                script.async = true;

                document.body.appendChild(
                    script
                );
            }
        }


        /*
         * Small delay handles React/Vite
         * DOM timing after navigation.
         */

        const timer =
            window.setTimeout(
                initializeTranslator,
                500
            );


        return () => {

            window.clearTimeout(timer);

            if (
                window.googleTranslateElementInit ===
                initializeTranslator
            ) {
                delete window
                    .googleTranslateElementInit;
            }

        };

    }, [elementId]);


    const changeLanguage = (
        selectedLanguage: string
    ) => {

        setLanguage(selectedLanguage);

        const googleSelect =
            document.querySelector(
                ".goog-te-combo"
            ) as HTMLSelectElement | null;

        if (!googleSelect) {
            return;
        }

        googleSelect.value =
            selectedLanguage;

        googleSelect.dispatchEvent(
            new Event(
                "change",
                {
                    bubbles: true,
                }
            )
        );
    };


    return (
        <>
            {/* Visible language selector */}

            <div
                className="language-selector"
                aria-label="Website language"
            >

                <span
                    className="language-icon"
                    aria-hidden="true"
                >
                    ◉
                </span>

                <select
                    className="custom-language-select"
                    value={language}
                    onChange={(event) =>
                        changeLanguage(
                            event.target.value
                        )
                    }
                    aria-label="Select website language"
                >

                    {languages.map(
                        (item) => (
                            <option
                                key={item.code}
                                value={item.code}
                            >
                                {item.name}
                            </option>
                        )
                    )}

                </select>

            </div>


            {/* 
                Google Translate engine is completely
                separate from the visible selector.
            */}

            <div
                id={elementId}
                className="google-translate-engine"
                aria-hidden="true"
            />
        </>
    );
}

export default LanguageSelector;