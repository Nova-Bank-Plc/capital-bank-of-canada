import {
    type ReactNode,
    useEffect,
    useRef,
    useState,
} from "react";

interface ScrollRevealProps {
    children: ReactNode;
    className?: string;
}

function ScrollReveal({
    children,
    className = "",
}: ScrollRevealProps) {

    const elementRef = useRef<HTMLDivElement>(null);

    const [visible, setVisible] = useState(false);

    useEffect(() => {

        const element = elementRef.current;

        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {

                if (entry.isIntersecting) {

                    setVisible(true);

                    observer.unobserve(element);
                }

            },
            {
                threshold: 0.12,
            }
        );

        observer.observe(element);

        return () => {
            observer.disconnect();
        };

    }, []);

    return (
        <div
            ref={elementRef}
            className={`scroll-reveal ${
                visible ? "is-visible" : ""
            } ${className}`}
        >
            {children}
        </div>
    );
}

export default ScrollReveal;