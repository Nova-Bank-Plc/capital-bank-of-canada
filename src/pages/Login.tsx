import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Login.css";


function Login() {

    const [showPassword, setShowPassword] =
        useState(false);

    const [rememberMe, setRememberMe] =
        useState(false);

    const [clientNumber, setClientNumber] =
        useState("");

    const [password, setPassword] =
        useState("");

    const [error, setError] =
        useState("");

    const [isLoading, setIsLoading] =
        useState(false);

    const navigate = useNavigate();

    const { login } = useAuth();


    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>
    ) => {

        event.preventDefault();

        setError("");


        if (!clientNumber.trim()) {

            setError(
                "Please enter your client number or email."
            );

            return;
        }


        if (!password) {

            setError(
                "Please enter your password."
            );

            return;
        }


        setIsLoading(true);


        try {

            const response = await fetch(
                "https://acceptable-comfort-production-46c5.up.railway.app/api/auth/login",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                    },

                    body: JSON.stringify({
                        clientNumber:
                            clientNumber.trim(),

                        password,
                    }),
                }
            );


            const data = await response.json();


            if (
                !response.ok ||
                !data.success
            ) {

                throw new Error(
                    data.message ||
                    "Unable to sign in. Please check your credentials."
                );
            }


            login(
                data.token,
                data.user
            );


            if (rememberMe) {

                localStorage.setItem(
                    "capital-remember-me",
                    "true"
                );

            } else {

                localStorage.removeItem(
                    "capital-remember-me"
                );
            }


            navigate("/dashboard");


        } catch (error) {

            console.error(
                "Login error:",
                error
            );


            setError(
                error instanceof Error
                    ? error.message
                    : "Unable to sign in. Please try again."
            );


        } finally {

            setIsLoading(false);

        }
    };


    return (
        <main className="login-page">


            {/* =========================================
                BRAND PANEL
            ========================================= */}

            <section className="login-brand">

                <div className="login-brand-content">

                    <Link
                        to="/"
                        className="login-brand-logo"
                    >

                        <span className="login-brand-mark">
                            C
                        </span>

                        <div>

                            <strong>
                                CAPITAL
                            </strong>

                            <span>
                                BANK OF CANADA
                            </span>

                        </div>

                    </Link>


                    <div className="login-brand-message">

                        <span className="login-eyebrow">
                            SECURE BANKING
                        </span>

                        <h1>
                            Banking that moves
                            <span>
                                with you.
                            </span>
                        </h1>

                        <p>
                            Secure, simple and trusted banking
                            designed around your financial life.
                        </p>

                    </div>


                    <div className="login-trust">

                        <div className="login-trust-item">

                            <span>
                                ✓
                            </span>

                            <p>
                                Secure banking
                            </p>

                        </div>


                        <div className="login-trust-item">

                            <span>
                                ✓
                            </span>

                            <p>
                                Canadian trusted
                            </p>

                        </div>


                        <div className="login-trust-item">

                            <span>
                                ✓
                            </span>

                            <p>
                                24/7 access
                            </p>

                        </div>

                    </div>

                </div>


                <div className="login-brand-footer">

                    © 2026 Capital Bank of Canada

                </div>

            </section>



            {/* =========================================
                LOGIN PANEL
            ========================================= */}

            <section className="login-form-panel">

                <div className="login-form-container">


                    {/* MOBILE LOGO */}

                    <Link
                        to="/"
                        className="login-mobile-logo"
                    >

                        <span className="login-brand-mark">
                            C
                        </span>

                        <div>

                            <strong>
                                CAPITAL
                            </strong>

                            <span>
                                BANK OF CANADA
                            </span>

                        </div>

                    </Link>



                    {/* HEADING */}

                    <div className="login-heading">

                        <span className="login-eyebrow">
                            ONLINE BANKING
                        </span>

                        <h2>
                            Welcome back
                        </h2>

                        <p>
                            Sign in to access your Capital Bank account.
                        </p>

                    </div>



                    {/* FORM */}

                    <form
                        className="login-form"
                        onSubmit={handleSubmit}
                    >


                        {/* CLIENT NUMBER */}

                        <div className="form-field">

                            <label htmlFor="clientNumber">
                                Client number or email
                            </label>

                            <input
                                id="clientNumber"
                                name="clientNumber"
                                type="text"
                                value={clientNumber}
                                onChange={(event) =>
                                    setClientNumber(
                                        event.target.value
                                    )
                                }
                                placeholder="Enter your client number or email"
                                autoComplete="username"
                                disabled={isLoading}
                            />

                        </div>



                        {/* PASSWORD */}

                        <div className="form-field">

                            <div className="form-label-row">

                                <label htmlFor="password">
                                    Password
                                </label>

                                <Link
                                    to="/forgot-password"
                                    className="forgot-password"
                                >
                                    Forgot password?
                                </Link>

                            </div>


                            <div className="password-input">

                                <input
                                    id="password"
                                    name="password"
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    value={password}
                                    onChange={(event) =>
                                        setPassword(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Enter your password"
                                    autoComplete="current-password"
                                    disabled={isLoading}
                                />


                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() =>
                                        setShowPassword(
                                            !showPassword
                                        )
                                    }
                                    aria-label={
                                        showPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                    disabled={isLoading}
                                >

                                    {
                                        showPassword
                                            ? "Hide"
                                            : "Show"
                                    }

                                </button>

                            </div>

                        </div>



                        {/* REMEMBER ME */}

                        <label className="remember-me">

                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(event) =>
                                    setRememberMe(
                                        event.target.checked
                                    )
                                }
                                disabled={isLoading}
                            />

                            <span className="custom-checkbox"></span>

                            <span>
                                Remember me
                            </span>

                        </label>



                        {/* ERROR */}

                        {error && (

                            <div
                                className="login-error"
                                role="alert"
                            >

                                <span>
                                    !
                                </span>

                                <p>
                                    {error}
                                </p>

                            </div>

                        )}



                        {/* LOGIN BUTTON */}

                        <button
                            type="submit"
                            className="login-submit"
                            disabled={isLoading}
                        >

                            {
                                isLoading
                                    ? "Signing in..."
                                    : "Sign in"
                            }

                            {!isLoading && (

                                <span>
                                    →
                                </span>

                            )}

                        </button>

                    </form>



                    {/* REGISTER */}

                    <div className="login-register">

                        <p>
                            New to Capital Bank?
                        </p>

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



                    {/* SECURITY MESSAGE */}

                    <div className="login-security">

                        <span className="security-icon">
                            ✓
                        </span>

                        <div>

                            <strong>
                                Your security matters
                            </strong>

                            <p>
                                Never share your password or
                                security information with anyone.
                            </p>

                        </div>

                    </div>

                </div>

            </section>

        </main>
    );
}


export default Login;
