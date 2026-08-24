import { useEffect, useState } from "react";
import "./ScrollToTop.css";

function ScrollToTop() {

    const [visible, setVisible] = useState(false);

    useEffect(() => {

        const handleScroll = () => {

            setVisible(window.scrollY > 500);

        };

        window.addEventListener(
            "scroll",
            handleScroll,
            { passive: true }
        );

        handleScroll();

        return () => {
            window.removeEventListener(
                "scroll",
                handleScroll
            );
        };

    }, []);

    const scrollToTop = () => {

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });

    };

    return (
        <button
            type="button"
            className={`scroll-to-top ${
                visible ? "visible" : ""
            }`}
            onClick={scrollToTop}
            aria-label="Scroll to top"
            title="Back to top"
        >
            <span>↑</span>
        </button>
    );
}

export default ScrollToTop;