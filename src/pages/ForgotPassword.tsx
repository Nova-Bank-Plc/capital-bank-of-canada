import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import "./ForgotPassword.css";

function ForgotPassword() {

    const [identifier, setIdentifier] = useState("");
    const [error, setError] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (
        event: FormEvent<HTMLFormElement>
    ) => {

        event.preventDefault();

        setError("");

        if (!identifier.trim()) {
            setError(
                "Please enter your client number or email address."
            );
            return;
        }

        setSubmitted(true);
    };


    return (
        <main className="forgot-page">

            <header className="forgot-header">

                <Link
                    to="/"
                    className="forgot-logo"
                >

                    <span className="forgot-logo-mark">
                        C
                    </span>

                    <span className="forgot-logo-text">
                        CAPITAL

                        <small>
                            BANK OF CANADA
                        </small>
                    </span>

                </Link>

                <Link
                    to="/login"
                    className="forgot-login-link"
                >
                    Back to sign in
                    <span>←</span>
                </Link>

            </header>


            <section className="forgot-content">

                {!submitted ? (

                    <>

                        <div className="forgot-icon">
                            ?
                        </div>

                        <div className="forgot-heading">

                            <span className="forgot-eyebrow">
                                ACCOUNT RECOVERY
                            </span>

                            <h1>
                                Forgot your password?
                            </h1>

                            <p>
                                No problem. Enter the client number
                                or email address associated with your
                                Capital Bank account and we'll help
                                you get back in.
                            </p>

                        </div>


                        <form
                            className="forgot-form"
                            onSubmit={handleSubmit}
                        >

                            <div className="forgot-field">

                                <label htmlFor="identifier">
                                    Client number or email
                                </label>

                                <input
                                    id="identifier"
                                    type="text"
                                    value={identifier}
                                    onChange={(event) =>
                                        setIdentifier(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Enter your client number or email"
                                    autoComplete="username"
                                />

                            </div>


                            {error && (

                                <div
                                    className="forgot-error"
                                    role="alert"
                                >
                                    {error}
                                </div>

                            )}


                            <button
                                type="submit"
                                className="forgot-submit"
                            >
                                Continue
                                <span>→</span>
                            </button>

                        </form>


                        <div className="forgot-help">

                            <strong>
                                Need help?
                            </strong>

                            <p>
                                If you're having trouble accessing
                                your account, please contact Capital
                                Bank support.
                            </p>

                        </div>

                    </>

                ) : (

                    <div className="forgot-success">

                        <div className="forgot-success-icon">
                            ✓
                        </div>

                        <span className="forgot-eyebrow">
                            REQUEST RECEIVED
                        </span>

                        <h1>
                            Check your email.
                        </h1>

                        <p>
                            If an account matches the information
                            provided, we'll send instructions for
                            resetting your password.
                        </p>

                        <Link
                            to="/login"
                            className="forgot-return"
                        >
                            Return to sign in
                            <span>→</span>
                        </Link>

                    </div>

                )}

            </section>


            <footer className="forgot-footer">

                <span>
                    © 2026 Capital Bank of Canada
                </span>

                <span>
                    Secure online banking
                </span>

            </footer>

        </main>
    );
}

export default ForgotPassword;