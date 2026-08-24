import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        document.body.style.overflow = menuOpen ? "hidden" : "";

        return () => {
            document.body.style.overflow = "";
        };
    }, [menuOpen]);

    const closeMenu = () => {
        setMenuOpen(false);
    };

    return (
        <header className="navbar">

            <div className="navbar-container">

                {/* LOGO */}

                <Link
                    to="/"
                    className="bank-logo"
                    onClick={closeMenu}
                >
                    <span className="logo-mark">
                        C
                    </span>

                    <span className="logo-text">
                        CAPITAL

                        <small>
                            BANK OF CANADA
                        </small>
                    </span>
                </Link>


                {/* DESKTOP NAVIGATION */}

                <nav className="main-navigation">

                    <a href="#personal">
                        Personal
                    </a>

                    <a href="#business">
                        Business
                    </a>

                    <a href="#wealth">
                        Wealth
                    </a>

                    <a href="#about">
                        About us
                    </a>

                </nav>


                {/* DESKTOP ACTIONS */}

                <div className="navbar-actions">

                    <Link
                        to="/login"
                        className="sign-in"
                    >
                        Sign in
                    </Link>

                    <Link
                        to="/register"
                        className="open-account"
                    >
                        Open an account

                        <span>
                            →
                        </span>
                    </Link>

                </div>


                {/* MOBILE MENU BUTTON */}

                <button
                    type="button"
                    className={`mobile-menu-button ${
                        menuOpen ? "active" : ""
                    }`}
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label={
                        menuOpen
                            ? "Close navigation"
                            : "Open navigation"
                    }
                    aria-expanded={menuOpen}
                >
                    <span></span>
                    <span></span>
                </button>

            </div>


            {/* MOBILE NAVIGATION */}

            <div
                className={`mobile-menu ${
                    menuOpen ? "active" : ""
                }`}
            >

                <div className="mobile-menu-inner">

                    <div className="mobile-menu-heading">

                        <span>
                            MENU
                        </span>

                        <button
                            type="button"
                            onClick={closeMenu}
                            aria-label="Close menu"
                        >
                            ×
                        </button>

                    </div>


                    <nav className="mobile-navigation">

                        <a
                            href="#personal"
                            onClick={closeMenu}
                        >
                            <span>01</span>
                            Personal
                            <b>→</b>
                        </a>

                        <a
                            href="#business"
                            onClick={closeMenu}
                        >
                            <span>02</span>
                            Business
                            <b>→</b>
                        </a>

                        <a
                            href="#wealth"
                            onClick={closeMenu}
                        >
                            <span>03</span>
                            Wealth
                            <b>→</b>
                        </a>

                        <a
                            href="#about"
                            onClick={closeMenu}
                        >
                            <span>04</span>
                            About us
                            <b>→</b>
                        </a>

                    </nav>


                    {/* MOBILE ACTIONS */}

                    <div className="mobile-menu-actions">

                        <Link
                            to="/login"
                            onClick={closeMenu}
                            className="mobile-sign-in"
                        >
                            Sign in
                        </Link>

                        <Link
                            to="/register"
                            onClick={closeMenu}
                            className="mobile-open-account"
                        >
                            Open an account

                            <span>
                                →
                            </span>
                        </Link>

                    </div>


                    {/* MOBILE FOOTER */}

                    <div className="mobile-menu-footer">

                        <span>
                            CAPITAL BANK OF CANADA
                        </span>

                        <span>
                            CANADA
                        </span>

                    </div>

                </div>

            </div>


            {/* MOBILE OVERLAY */}

            <button
                type="button"
                className={`mobile-overlay ${
                    menuOpen ? "active" : ""
                }`}
                onClick={closeMenu}
                aria-label="Close navigation"
            />

        </header>
    );
}

export default Navbar;