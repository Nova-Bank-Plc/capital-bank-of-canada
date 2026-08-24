import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Dashboard.css";

interface Account {
    type: string;
    number: string;
    balance: string;
    change: string;
}

interface Transaction {
    name: string;
    date: string;
    type: string;
    amount: string;
    positive?: boolean;
}

const accounts: Account[] = [
    {
        type: "Everyday Chequing",
        number: "•••• 4821",
        balance: "$12,450.80",
        change: "+$2,840.00 this month",
    },
    {
        type: "High Interest Savings",
        number: "•••• 7314",
        balance: "$8,250.40",
        change: "+$450.00 this month",
    },
];

const transactions: Transaction[] = [
    {
        name: "Maple Market",
        date: "Aug 20, 2026",
        type: "Purchase",
        amount: "-$84.62",
    },
    {
        name: "Payroll Deposit",
        date: "Aug 19, 2026",
        type: "Deposit",
        amount: "+$3,450.00",
        positive: true,
    },
    {
        name: "Northern Utilities",
        date: "Aug 18, 2026",
        type: "Bill payment",
        amount: "-$142.30",
    },
    {
        name: "Capital Bank Transfer",
        date: "Aug 16, 2026",
        type: "Transfer",
        amount: "-$500.00",
    },
];

function Dashboard() {
    const { logout } = useAuth();

    const [sidebarOpen, setSidebarOpen] =
        useState(false);

    const [showBalance, setShowBalance] =
        useState(true);


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
                            setSidebarOpen(!sidebarOpen)
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
                            AH
                        </span>

                        <span className="profile-name">
                            Adam
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
                        sidebarOpen ? "open" : ""
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

                <section className="dashboard-content">

                    <div className="dashboard-container">


                        {/* PAGE INTRO */}

                        <div className="dashboard-intro">

                            <div>

                                <span className="dashboard-eyebrow">
                                    PERSONAL BANKING
                                </span>

                                <h1>
                                    Good morning, Adam.
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
                                    AUGUST 21, 2026
                                </strong>

                            </div>

                        </div>


                        {/* QUICK ACTIONS */}

                        <div className="dashboard-actions">

                            <button type="button">
                                <span>↗</span>
                                Transfer money
                            </button>

                            <button type="button">
                                <span>◇</span>
                                Pay a bill
                            </button>

                            <button type="button">
                                <span>＋</span>
                                Open an account
                            </button>

                        </div>


                        {/* ACCOUNTS */}

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
                                        setShowBalance(!showBalance)
                                    }
                                >
                                    {showBalance
                                        ? "Hide balances"
                                        : "Show balances"
                                    }
                                </button>

                            </div>


                            <div className="account-grid">

                                {accounts.map((account) => (

                                    <article
                                        className="account-card"
                                        key={account.number}
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

                                ))}

                            </div>

                        </section>


                        {/* TRANSACTIONS */}

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

                                {transactions.map(
                                    (transaction) => (

                                        <div
                                            className="transaction-row"
                                            key={
                                                transaction.name +
                                                transaction.date
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
                                )}

                            </div>

                        </section>


                        {/* SECURITY BANNER */}

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