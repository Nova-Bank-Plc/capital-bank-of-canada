import {
    useState,
} from "react";

import type {
    FormEvent,
} from "react";

import {
    Navigate,
    useNavigate,
} from "react-router-dom";

import {
    useAuth,
} from "../context/AuthContext";

import "./AdminLogin.css";


const API_BASE_URL =
    import.meta.env.VITE_API_URL ||
    (
        import.meta.env.PROD
            ? ""
            : "http://localhost:5000"
    );


export default function AdminLogin() {

    const navigate = useNavigate();


    const {
        adminUser,
        isAdminAuthenticated,
        adminLogin,
    } = useAuth();


    const [
        clientNumber,
        setClientNumber,
    ] = useState("");


    const [
        password,
        setPassword,
    ] = useState("");


    const [
        error,
        setError,
    ] = useState("");


    const [
        loading,
        setLoading,
    ] = useState(false);


    /* =====================================
       ALREADY AUTHENTICATED ADMIN
    ===================================== */

    if (
        isAdminAuthenticated &&
        adminUser?.role === "admin"
    ) {

        return (
            <Navigate
                to="/admin"
                replace
            />
        );
    }


    /* =====================================
       ADMIN LOGIN
    ===================================== */

    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>
    ) => {

        event.preventDefault();

        setError("");
        setLoading(true);


        try {

            const response =
                await fetch(
                    `${API_BASE_URL}/api/auth/login`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body: JSON.stringify({
                            clientNumber:
                                clientNumber.trim(),

                            password,
                        }),
                    }
                );


            const data =
                await response.json();


            if (
                !response.ok ||
                !data.success
            ) {

                throw new Error(
                    data.message ||
                    "Administrator login failed."
                );
            }


            if (
                !data.user ||
                data.user.role !== "admin"
            ) {

                throw new Error(
                    "This account does not have administrator access."
                );
            }


            /* ==============================
               IMPORTANT:
               Store admin credentials in
               admin-specific storage.
            ============================== */

            adminLogin(
                data.token,
                data.user
            );


            navigate(
                "/admin",
                {
                    replace: true,
                }
            );


        } catch (error) {

            setError(
                error instanceof Error
                    ? error.message
                    : "Unable to sign in."
            );

        } finally {

            setLoading(false);
        }
    };


    return (
        <main className="admin-login-page">

            <section className="admin-login-card">

                <div className="admin-login-brand">

                    <div className="admin-login-logo">
                        C
                    </div>

                    <div>

                        <h1>
                            Capital Bank
                        </h1>

                        <p>
                            Administrator Portal
                        </p>

                    </div>

                </div>


                <div className="admin-login-heading">

                    <span>
                        SECURE ACCESS
                    </span>

                    <h2>
                        Administrator Sign In
                    </h2>

                    <p>
                        Sign in with your
                        administrator credentials.
                    </p>

                </div>


                {error && (

                    <div
                        className="admin-login-error"
                        role="alert"
                    >
                        {error}
                    </div>

                )}


                <form
                    onSubmit={handleSubmit}
                    className="admin-login-form"
                >

                    <label htmlFor="admin-client-number">
                        Administrator Client Number
                    </label>


                    <input
                        id="admin-client-number"
                        type="text"
                        value={clientNumber}
                        onChange={(event) =>
                            setClientNumber(
                                event.target.value
                            )
                        }
                        placeholder="ADM-XXXXXX"
                        autoComplete="username"
                        required
                    />


                    <label htmlFor="admin-password">
                        Password
                    </label>


                    <input
                        id="admin-password"
                        type="password"
                        value={password}
                        onChange={(event) =>
                            setPassword(
                                event.target.value
                            )
                        }
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        required
                    />


                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Signing in..."
                            : "Sign In"}
                    </button>

                </form>


                <p className="admin-login-security">
                    Authorized administrators only.
                </p>

            </section>

        </main>
    );
}