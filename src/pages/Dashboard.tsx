import {
    useEffect,
    useState,
} from "react";

import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import "./Dashboard.css";


// ======================================
// API DATA TYPES
// ======================================

interface ApiAccount {
    _id: string;
    userId: string;
    accountType: string;
    accountNumber: string;
    balance: number;
    currency: string;
    status: string;
    createdAt: string;
    updatedAt: string;
}


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
        accounts: ApiAccount[];
        transactions: ApiTransaction[];
        totalBalance: number;
    };
}


// ======================================
// DISPLAY TYPES
// ======================================

interface Account {
    type: string;
    number: string;
    balance: string;
    change: string;
}


interface Transaction {
    id: string;
    name: string;
    date: string;
    type: string;
    amount: string;
    positive: boolean;
}


// ======================================
// API BASE URL
// ======================================

const API_BASE_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000";


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
// ACCOUNT NUMBER FORMATTER
// ======================================

const formatAccountNumber = (
    accountNumber: string
) => {
    if (!accountNumber) {
        return "••••";
    }

    const lastFour =
        accountNumber.slice(-4);

    return `•••• ${lastFour}`;
};


// ======================================
// DASHBOARD
// ======================================

function Dashboard() {

   const { user, token, logout } = useAuth();


    const [
        sidebarOpen,
        setSidebarOpen,
    ] = useState(false);


    const [
        showBalance,
        setShowBalance,
    ] = useState(true);


    const [
        accounts,
        setAccounts,
    ] = useState<Account[]>([]);


    const [
        transactions,
        setTransactions,
    ] = useState<Transaction[]>([]);


    const [
        totalBalance,
        setTotalBalance,
    ] = useState(0);


    const [
        loading,
        setLoading,
    ] = useState(true);


    const [
        error,
        setError,
    ] = useState("");



    // ======================================
    // LOAD DASHBOARD DATA
    // ======================================

    useEffect(() => {

        const loadDashboard =
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
                            "Unable to load dashboard."
                        );
                    }


                    const data =
                        result as DashboardResponse;


                    if (!data.success) {

                        throw new Error(
                            "Unable to load dashboard information."
                        );
                    }


                    // ==================================
                    // TOTAL BALANCE
                    // ==================================

                    setTotalBalance(
                        data.data.totalBalance
                    );


                    // ==================================
                    // ACCOUNTS
                    // ==================================

                    const formattedAccounts =
                        data.data.accounts.map(
                            (account) => ({
                                type:
                                    account.accountType,

                                number:
                                    formatAccountNumber(
                                        account.accountNumber
                                    ),

                                balance:
                                    formatCurrency(
                                        account.balance,
                                        account.currency
                                    ),

                                change:
                                    account.status ===
                                    "active"
                                        ? "Active account"
                                        : account.status,
                            })
                        );


                    setAccounts(
                        formattedAccounts
                    );


                    // ==================================
                    // TRANSACTIONS
                    // ==================================

                    const formattedTransactions =
                        data.data.transactions.map(
                            (transaction) => {

                                const positive =
                                    transaction.direction ===
                                    "credit";


                                const signedAmount =
                                    positive
                                        ? transaction.amount
                                        : -transaction.amount;


                                return {
                                    id:
                                        transaction._id,

                                    name:
                                        transaction.name,

                                    date:
                                        formatTransactionDate(
                                            transaction.createdAt
                                        ),

                                    type:
                                        transaction.transactionType,

                                    amount:
                                        `${signedAmount >= 0 ? "+" : ""}${formatCurrency(
                                            signedAmount
                                        )}`,

                                    positive,
                                };
                            }
                        );


                    setTransactions(
                        formattedTransactions
                    );


                } catch (requestError) {

                    console.error(
                        "Dashboard request error:",
                        requestError
                    );


                    setError(
                        requestError instanceof Error
                            ? requestError.message
                            : "Unable to load dashboard information."
                    );


                } finally {

                    setLoading(false);

                }
            };


        loadDashboard();

    }, []);



    // ======================================
    // TODAY
    // ======================================

    const today =
        new Intl.DateTimeFormat(
            "en-CA",
            {
                month: "long",
                day: "numeric",
                year: "numeric",
            }
        ).format(new Date());


    const firstName =
        user?.firstName ||
        "there";



    return (
        <main className="dashboard-page">

            {/* =========================================
                TOP NAVIGATION
            ========================================= */}

            <header className="dashboard-header">

                <div className="dashboard-header-left">

                    <button
                        type="button"
                        className="dashboard-menu-button"
                        onClick={() =>
                            setSidebarOpen(
                                !sidebarOpen
                            )
                        }
                        aria-label="Toggle navigation"
                    >
                        <span></span>
                        <span></span>
                    </button>


                    <Link
                        to="/"
                        className="dashboard-logo"
                    >

                        <span className="dashboard-logo-mark">
                            C
                        </span>

                        <span className="dashboard-logo-text">

                            CAPITAL

                            <small>
                                BANK OF CANADA
                            </small>

                        </span>

                    </Link>

                </div>


                <div className="dashboard-header-actions">

                    <button
                        type="button"
                        className="dashboard-icon-button"
                        aria-label="Search"
                    >
                        ⌕
                    </button>


                    <button
                        type="button"
                        className="dashboard-icon-button notification"
                        aria-label="Notifications"
                    >
                        ♢
                        <span></span>
                    </button>


                    <button
                        type="button"
                        className="dashboard-profile"
                    >

                        <span className="profile-avatar">
                            {user?.firstName?.charAt(0) || "C"}
                            {user?.lastName?.charAt(0) || "B"}
                        </span>

                        <span className="profile-name">
                            {firstName}
                        </span>

                        <span className="profile-arrow">
                            ↓
                        </span>

                    </button>

                </div>

            </header>



            <div className="dashboard-layout">

                {/* =========================================
                    SIDEBAR
                ========================================= */}

                <aside
                    className={`dashboard-sidebar ${
                        sidebarOpen
                            ? "open"
                            : ""
                    }`}
                >

                    <div className="sidebar-section">

                        <span className="sidebar-label">
                            BANKING
                        </span>


                        <nav className="dashboard-navigation">

                            <a
                                href="#dashboard"
                                className="active"
                                onClick={() =>
                                    setSidebarOpen(false)
                                }
                            >
                                <span className="nav-icon">
                                    ▦
                                </span>

                                Dashboard
                            </a>


                            <a
                                href="#accounts"
                                onClick={() =>
                                    setSidebarOpen(false)
                                }
                            >
                                <span className="nav-icon">
                                    ◫
                                </span>

                                Accounts
                            </a>


                            <a
                                href="#transfers"
                                onClick={() =>
                                    setSidebarOpen(false)
                                }
                            >
                                <span className="nav-icon">
                                    ⇄
                                </span>

                                Transfers
                            </a>


                            <a
                                href="#payments"
                                onClick={() =>
                                    setSidebarOpen(false)
                                }
                            >
                                <span className="nav-icon">
                                    ◇
                                </span>

                                Payments
                            </a>


                            <a
                                href="#transactions"
                                onClick={() =>
                                    setSidebarOpen(false)
                                }
                            >
                                <span className="nav-icon">
                                    ≡
                                </span>

                                Transactions
                            </a>


                            <a
                                href="#cards"
                                onClick={() =>
                                    setSidebarOpen(false)
                                }
                            >
                                <span className="nav-icon">
                                    ▭
                                </span>

                                Cards
                            </a>

                        </nav>

                    </div>



                    <div className="sidebar-section sidebar-bottom">

                        <span className="sidebar-label">
                            SUPPORT
                        </span>


                        <nav className="dashboard-navigation">

                            <a href="#settings">

                                <span className="nav-icon">
                                    ⚙
                                </span>

                                Settings

                            </a>


                            <a href="#help">

                                <span className="nav-icon">
                                    ?
                                </span>

                                Help centre

                            </a>

                        </nav>


                        <button
                            type="button"
                            className="sidebar-signout"
                            onClick={logout}
                        >

                            <span>
                                ↪
                            </span>

                            Sign out

                        </button>

                    </div>

                </aside>



                {/* =========================================
                    MAIN CONTENT
                ========================================= */}

                <section
                    className="dashboard-content"
                    id="dashboard"
                >

                    <div className="dashboard-container">


                        {/* =================================
                            PAGE INTRO
                        ================================= */}

                        <div className="dashboard-intro">

                            <div>

                                <span className="dashboard-eyebrow">
                                    PERSONAL BANKING
                                </span>


                                <h1>
                                    Good morning, {firstName}.
                                </h1>


                                <p>
                                    Here's what's happening
                                    with your finances today.
                                </p>

                            </div>


                            <div className="dashboard-date">

                                <span>
                                    TODAY
                                </span>

                                <strong>
                                    {today}
                                </strong>

                            </div>

                        </div>



                        {/* =================================
                            ERROR
                        ================================= */}

                        {error && (

                            <div
                                role="alert"
                                style={{
                                    marginBottom: "24px",
                                    padding: "16px",
                                    borderRadius: "12px",
                                    background: "#fff1f1",
                                    color: "#b42318",
                                    border: "1px solid #f3c2c2",
                                }}
                            >
                                {error}
                            </div>

                        )}



                        {/* =================================
                            QUICK ACTIONS
                        ================================= */}

                        <div className="dashboard-actions">

                            <button type="button">

                                <span>
                                    ↗
                                </span>

                                Transfer money

                            </button>


                            <button type="button">

                                <span>
                                    ◇
                                </span>

                                Pay a bill

                            </button>


                            <button type="button">

                                <span>
                                    +
                                </span>

                                Open an account

                            </button>

                        </div>



                        {/* =================================
                            ACCOUNTS
                        ================================= */}

                        <section
                            className="dashboard-section"
                            id="accounts"
                        >

                            <div className="dashboard-section-heading">

                                <div>

                                    <span>
                                        YOUR ACCOUNTS
                                    </span>

                                    <h2>
                                        Accounts overview
                                    </h2>

                                </div>


                                <button
                                    type="button"
                                    className="balance-toggle"
                                    onClick={() =>
                                        setShowBalance(
                                            !showBalance
                                        )
                                    }
                                >
                                    {showBalance
                                        ? "Hide balances"
                                        : "Show balances"
                                    }
                                </button>

                            </div>



                            {/* =================================
                                TOTAL BALANCE
                            ================================= */}

                            <div
                                style={{
                                    marginBottom: "24px",
                                }}
                            >

                                <span
                                    style={{
                                        display: "block",
                                        fontSize: "0.75rem",
                                        fontWeight: 600,
                                        letterSpacing: "0.08em",
                                        textTransform: "uppercase",
                                        opacity: 0.65,
                                        marginBottom: "6px",
                                    }}
                                >
                                    TOTAL BALANCE
                                </span>


                                <strong
                                    style={{
                                        display: "block",
                                        fontSize: "2rem",
                                        lineHeight: 1.1,
                                    }}
                                >
                                    {loading
                                        ? "Loading..."
                                        : showBalance
                                            ? formatCurrency(
                                                totalBalance
                                            )
                                            : "••••••••"
                                    }
                                </strong>

                            </div>



                            <div className="account-grid">

                                {loading ? (

                                    <>

                                        <article className="account-card">
                                            <div className="account-card-top">
                                                <span className="account-type">
                                                    Loading account...
                                                </span>
                                            </div>

                                            <div className="account-balance">
                                                <span>
                                                    AVAILABLE BALANCE
                                                </span>

                                                <strong>
                                                    Loading...
                                                </strong>
                                            </div>
                                        </article>


                                        <article className="account-card">
                                            <div className="account-card-top">
                                                <span className="account-type">
                                                    Loading account...
                                                </span>
                                            </div>

                                            <div className="account-balance">
                                                <span>
                                                    AVAILABLE BALANCE
                                                </span>

                                                <strong>
                                                    Loading...
                                                </strong>
                                            </div>
                                        </article>

                                    </>

                                ) : accounts.length === 0 ? (

                                    <article className="account-card">

                                        <div className="account-card-top">

                                            <span className="account-type">
                                                No accounts
                                            </span>

                                        </div>


                                        <div className="account-balance">

                                            <span>
                                                AVAILABLE BALANCE
                                            </span>

                                            <strong>
                                                {showBalance
                                                    ? "$0.00"
                                                    : "••••••••"
                                                }
                                            </strong>

                                        </div>


                                        <div className="account-card-bottom">

                                            <span>
                                                No active accounts found
                                            </span>

                                        </div>

                                    </article>

                                ) : (

                                    accounts.map(
                                        (account) => (

                                            <article
                                                className="account-card"
                                                key={
                                                    account.number
                                                }
                                            >

                                                <div className="account-card-top">

                                                    <span className="account-type">
                                                        {account.type}
                                                    </span>

                                                    <span className="account-number">
                                                        {account.number}
                                                    </span>

                                                </div>


                                                <div className="account-balance">

                                                    <span>
                                                        AVAILABLE BALANCE
                                                    </span>


                                                    <strong>

                                                        {showBalance
                                                            ? account.balance
                                                            : "••••••••"
                                                        }

                                                    </strong>

                                                </div>


                                                <div className="account-card-bottom">

                                                    <span>
                                                        {account.change}
                                                    </span>


                                                    <button type="button">
                                                        View account →
                                                    </button>

                                                </div>

                                            </article>

                                        )
                                    )

                                )}

                            </div>

                        </section>



                        {/* =================================
                            TRANSACTIONS
                        ================================= */}

                        <section
                            className="dashboard-section"
                            id="transactions"
                        >

                            <div className="dashboard-section-heading">

                                <div>

                                    <span>
                                        ACTIVITY
                                    </span>

                                    <h2>
                                        Recent transactions
                                    </h2>

                                </div>


                                <button
                                    type="button"
                                    className="view-all"
                                >
                                    View all →
                                </button>

                            </div>



                            <div className="transactions-card">

                                {loading ? (

                                    <div
                                        className="transaction-row"
                                    >
                                        <div className="transaction-info">
                                            <strong>
                                                Loading transactions...
                                            </strong>

                                            <span>
                                                Please wait
                                            </span>
                                        </div>
                                    </div>

                                ) : transactions.length === 0 ? (

                                    <div
                                        className="transaction-row"
                                    >

                                        <div className="transaction-icon">
                                            —
                                        </div>

                                        <div className="transaction-info">

                                            <strong>
                                                No recent transactions
                                            </strong>

                                            <span>
                                                Your transaction activity
                                                will appear here.
                                            </span>

                                        </div>

                                    </div>

                                ) : (

                                    transactions.map(
                                        (transaction) => (

                                            <div
                                                className="transaction-row"
                                                key={
                                                    transaction.id
                                                }
                                            >

                                                <div className="transaction-icon">

                                                    {transaction.positive
                                                        ? "+"
                                                        : "−"
                                                    }

                                                </div>


                                                <div className="transaction-info">

                                                    <strong>
                                                        {transaction.name}
                                                    </strong>

                                                    <span>

                                                        {transaction.date}

                                                        {" • "}

                                                        {transaction.type}

                                                    </span>

                                                </div>


                                                <strong
                                                    className={
                                                        transaction.positive
                                                            ? "transaction-positive"
                                                            : "transaction-amount"
                                                    }
                                                >
                                                    {transaction.amount}
                                                </strong>

                                            </div>

                                        )
                                    )

                                )}

                            </div>

                        </section>



                        {/* =================================
                            SECURITY BANNER
                        ================================= */}

                        <section className="dashboard-security">

                            <div className="security-shield">
                                ✓
                            </div>


                            <div>

                                <strong>
                                    Your banking is protected.
                                </strong>

                                <p>
                                    Capital Bank continuously
                                    monitors your account for
                                    unusual activity.
                                </p>

                            </div>


                            <button type="button">
                                Security centre →
                            </button>

                        </section>


                    </div>

                </section>

            </div>

        </main>
    );
}


export default Dashboard;