import type { ReactNode } from "react";
import "./MainLayout.css";

interface MainLayoutProps {
    children: ReactNode;
}

function MainLayout({
    children,
}: MainLayoutProps) {

    return (
        <div className="main-layout">
            {children}
        </div>
    );
}

export default MainLayout;