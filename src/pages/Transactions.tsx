import {
    useEffect,
    useState,
} from "react";

import {
    Link,
} from "react-router-dom";

import {
    useAuth,
} from "../context/AuthContext";

import {
    useTheme,
} from "../context/ThemeContext";

import "./Transactions.css";


// ======================================
// API DATA TYPES
// ======================================

interface ApiTransaction {
    _id: string;
    userId: string;
    accountId: string;
    name: string;
    transactionType: string;
    amount: number;
    direction: "credit" | "debit";
    status: string;
    createdAt: string;
    updatedAt: string;
}


interface DashboardResponse {
    success: boolean;

    data: {
        transactions: ApiTransaction[];
    };
}


// ======================================
// API BASE URL
// ======================================

const API_BASE_URL =
    import.meta.env.VITE_API_URL ||
    (import.meta.env.PROD
        ? ""
        : "http://localhost:5000");


// ======================================
// CURRENCY FORMATTER
// ======================================

const formatCurrency = (
    amount: number,
    currency = "CAD"
) => {
    return new Intl.NumberFormat(
        "en-CA",
        {
            style: "currency",
            currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }
    ).format(amount);
};


// ======================================
// DATE FORMATTER
// ======================================

const formatTransactionDate = (
    date: string
) => {
    return new Intl.DateTimeFormat(
        "en-CA",
        {
            month: "short",
            day: "numeric",
            year: "numeric",
        }
    ).format(new Date(date));
};


// ======================================
// TRANSACTIONS PAGE
// ======================================

function Transactions() {

    const {
        user,
        token,
        logout,
    } = useAuth();


    const {
        darkMode,
        toggleDarkMode,
    } = useTheme();


    const [
        transactions,
        setTransactions,
    ] = useState<ApiTransaction[]>([]);


    const [
        loading,
        setLoading,
    ] = useState(true);


    const [
        error,
        setError,
    ] = useState("");


    // ==================================
    // LOAD TRANSACTIONS
    // ==================================

    useEffect(() => {

        const loadTransactions =
            async () => {

                try {

                    setLoading(true);
                    setError("");


                    if (!token) {

                        setError(
                            "Your session has expired. Please sign in again."
                        );

                        return;
                    }


                    const response =
                        await fetch(
                            `${API_BASE_URL}/api/dashboard`,
                            {
                                method: "GET",

                                headers: {
                                    Authorization:
                                        `Bearer ${token}`,

                                    "Content-Type":
                                        "application/json",
                                },
                            }
                        );


                    const result =
                        await response.json();


                    if (!response.ok) {

                        throw new Error(
                            result.message ||
                            "Unable to load transactions."
                        );
                    }


                    const data =
                        result as DashboardResponse;


                    if (!data.success) {

                        throw new Error(
                            "Unable to load transactions."
                        );
                    }


                    setTransactions(
                        data.data.transactions
                    );


                } catch (requestError) {

                    console.error(
                        "Transactions request error:",
                        requestError
                    );


                    setError(
                        requestError instanceof Error
                            ? requestError.message
                            : "Unable to load transactions."
                    );


                } finally {

                    setLoading(false);

                }
            };


        loadTransactions();

    }, [token]);


    const firstName =
        user?.firstName ||
        "there";


    return (
        <main className="transactions-page">

            {/* =========================================
                HEADER
            ========================================= */}

            <header className="transactions-header">

                <div className="transactions-header-left">

                    <Link
                        to="/dashboard"
                        className="transactions-back"
                    >
                        ←
                    </Link>


                    <Link
                        to="/dashboard"
                        className="transactions-logo"
                    >

                        <span className="transactions-logo-mark">
                            C
                        </span>

                        <span className="transactions-logo-text">

                            CAPITAL

                            <small>
                                BANK OF CANADA
                            </small>

                        </span>

                    </Link>

                </div>


                <div className="transactions-header-actions">

                    <button
                        type="button"
                        className="transactions-theme-button"
                        onClick={toggleDarkMode}
                        aria-label={
                            darkMode
                                ? "Switch to light mode"
                                : "Switch to dark mode"
                        }
                    >
                        {darkMode ? "☀" : "☾"}
                    </button>


                    <div className="transactions-profile">

                        <span className="transactions-avatar">
                            {user?.firstName?.charAt(0) || "C"}
                            {user?.lastName?.charAt(0) || "B"}
                        </span>

                        <span>
                            {firstName}
                        </span>

                    </div>


                    <button
                        type="button"
                        className="transactions-signout"
                        onClick={logout}
                    >
                        Sign out
                    </button>

                </div>

            </header>


            {/* =========================================
                MAIN
            ========================================= */}

            <section className="transactions-main">

                <div className="transactions-container">

                    <div className="transactions-breadcrumb">

                        <Link to="/dashboard">
                            Dashboard
                        </Link>

                        <span>
                            /
                        </span>

                        <strong>
                            Transactions
                        </strong>

                    </div>


                    <div className="transactions-intro">

                        <div>

                            <span className="transactions-eyebrow">
                                ACCOUNT ACTIVITY
                            </span>

                            <h1>
                                Transactions
                            </h1>

                            <p>
                                Review your recent account activity
                                and transaction history.
                            </p>

                        </div>


                        <Link
                            to="/dashboard"
                            className="transactions-dashboard-link"
                        >
                            ← Back to dashboard
                        </Link>

                    </div>


                    {error && (

                        <div
                            className="transactions-error"
                            role="alert"
                        >
                            {error}
                        </div>

                    )}


                    <section className="transactions-panel">

                        <div className="transactions-panel-header">

                            <div>

                                <span>
                                    ACTIVITY
                                </span>

                                <h2>
                                    Transaction history
                                </h2>

                            </div>


                            <span className="transactions-count">
                                {loading
                                    ? "Loading..."
                                    : `${transactions.length} transaction${
                                        transactions.length === 1
                                            ? ""
                                            : "s"
                                    }`
                                }
                            </span>

                        </div>


                        <div className="transactions-list">

                            {loading ? (

                                <div className="transactions-state">

                                    <strong>
                                        Loading transactions...
                                    </strong>

                                    <span>
                                        Please wait while we retrieve
                                        your account activity.
                                    </span>

                                </div>

                            ) : transactions.length === 0 ? (

                                <div className="transactions-state">

                                    <div className="transactions-empty-icon">
                                        —
                                    </div>

                                    <strong>
                                        No transactions yet
                                    </strong>

                                    <span>
                                        Your transaction activity will
                                        appear here when available.
                                    </span>

                                </div>

                            ) : (

                                transactions.map(
                                    (transaction) => {

                                        const positive =
                                            transaction.direction ===
                                            "credit";


                                        const signedAmount =
                                            positive
                                                ? transaction.amount
                                                : -transaction.amount;


                                        return (

                                            <article
                                                className="transaction-history-row"
                                                key={
                                                    transaction._id
                                                }
                                            >

                                                <div
                                                    className={`transaction-history-icon ${
                                                        positive
                                                            ? "credit"
                                                            : "debit"
                                                    }`}
                                                >
                                                    {positive
                                                        ? "+"
                                                        : "−"
                                                    }
                                                </div>


                                                <div className="transaction-history-info">

                                                    <strong>
                                                        {transaction.name}
                                                    </strong>

                                                    <span>
                                                        {
                                                            formatTransactionDate(
                                                                transaction.createdAt
                                                            )
                                                        }

                                                        {" • "}

                                                        {
                                                            transaction.transactionType
                                                        }
                                                    </span>

                                                </div>


                                                <div className="transaction-history-status">

                                                    <span
                                                        className={`transaction-status ${
                                                            transaction.status
                                                                .toLowerCase()
                                                        }`}
                                                    >
                                                        {
                                                            transaction.status
                                                        }
                                                    </span>

                                                </div>


                                                <strong
                                                    className={
                                                        positive
                                                            ? "transaction-history-amount positive"
                                                            : "transaction-history-amount"
                                                    }
                                                >
                                                    {signedAmount >= 0
                                                        ? "+"
                                                        : ""
                                                    }

                                                    {formatCurrency(
                                                        signedAmount
                                                    )}
                                                </strong>

                                            </article>

                                        );

                                    }
                                )

                            )}

                        </div>

                    </section>

                </div>

            </section>

        </main>
    );
}


export default Transactions;