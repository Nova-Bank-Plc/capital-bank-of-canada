import {
    useEffect,
    useState,
} from "react";

import {
    Navigate,
    Link,
} from "react-router-dom";

import {
    Moon,
    Sun,
} from "lucide-react";

import {
    useAuth,
} from "../context/AuthContext";

import AdminProtectedRoute from "../components/AdminProtectedRoute";

import {
    useAdminTheme,
} from "../context/AdminThemeContext";

import "./AdminDashboard.css";


const API_BASE_URL =
    import.meta.env.VITE_API_URL ||
    (
        import.meta.env.PROD
            ? ""
            : "http://localhost:5000"
    );


// ======================================
// API DATA TYPES
// ======================================

interface AdminDashboardData {

    customers: {
        total: number;
    };

    accounts: {
        total: number;
        totalBalance: number;
    };

    transactions: {
        total: number;
    };

    loans: {
        total: number;
        pending: number;
        approved: number;
        active: number;
        rejected: number;
    };

    recentCustomers: Array<{
        _id: string;
        clientNumber: string;
        firstName: string;
        lastName: string;
        email: string;
        createdAt: string;
    }>;

    recentTransactions: Array<{
        _id: string;
        userId: string;
        accountId: string;
        name: string;
        transactionType: string;
        amount: number;
        direction: "credit" | "debit";
        status: string;
        createdAt: string;
    }>;

    recentLoans: Array<{
        _id: string;
        userId: string;
        loanType: string;
        applicationNumber: string;
        requestedAmount: number;
        termMonths: number;
        purpose: string;
        status:
            | "pending"
            | "approved"
            | "active"
            | "rejected"
            | "paid";
        applicationDate: string;
        createdAt: string;
    }>;
}


// ======================================
// ADMIN DASHBOARD CONTENT
// ======================================

function AdminDashboardContent() {

    const {
        adminUser,
        adminToken,
        adminLogout,
    } = useAuth();


    // ======================================
    // ADMIN THEME
    // ======================================

    const {
        adminDarkMode,
        toggleAdminDarkMode,
    } = useAdminTheme();


    const [
        dashboard,
        setDashboard,
    ] = useState<AdminDashboardData | null>(
        null
    );


    const [
        loading,
        setLoading,
    ] = useState(true);


    const [
        error,
        setError,
    ] = useState("");


    // ======================================
    // LOAD ADMIN DASHBOARD
    // ======================================

    useEffect(() => {

        const loadDashboard = async () => {

            try {

                setLoading(true);
                setError("");


                const response =
                    await fetch(
                        `${API_BASE_URL}/api/admin/dashboard`,
                        {
                            method: "GET",

                            headers: {
                                Authorization:
                                    `Bearer ${adminToken}`,
                            },
                        }
                    );


                const data =
                    await response.json();


                if (
                    response.status === 401 ||
                    response.status === 403
                ) {

                    adminLogout();

                    return;

                }


                if (
                    !response.ok ||
                    !data.success
                ) {

                    throw new Error(
                        data.message ||
                        "Unable to load administrator dashboard."
                    );

                }


                setDashboard(
                    data.data
                );

            } catch (error) {

                console.error(
                    "Admin dashboard error:",
                    error
                );

                setError(
                    error instanceof Error
                        ? error.message
                        : "Unable to load administrator dashboard."
                );

            } finally {

                setLoading(false);

            }

        };


        if (adminToken) {

            loadDashboard();

        }

    }, [
        adminToken,
        adminLogout,
    ]);


    // ======================================
    // FORMAT CURRENCY
    // ======================================

    const formatCurrency = (
        amount: number
    ) => {

        return new Intl.NumberFormat(
            "en-CA",
            {
                style: "currency",
                currency: "CAD",
            }
        ).format(amount);

    };


    // ======================================
    // FORMAT DATE
    // ======================================

    const formatDate = (
        date: string
    ) => {

        return new Date(
            date
        ).toLocaleDateString(
            "en-CA",
            {
                year: "numeric",
                month: "short",
                day: "numeric",
            }
        );

    };


    // ======================================
    // ADMIN ACCESS CHECK
    // ======================================

    if (
        !adminUser ||
        adminUser.role !== "admin"
    ) {

        return (
            <Navigate
                to="/dashboard"
                replace
            />
        );

    }


    // ======================================
    // RENDER
    // ======================================

    return (

        <div
            className={
                `admin-dashboard-page ${
                    adminDarkMode
                        ? "admin-dark-mode"
                        : ""
                }`
            }
        >

            {/* =====================================
                HEADER
            ===================================== */}

            <header className="admin-dashboard-header">

                <div className="admin-dashboard-brand">

                    <div className="admin-dashboard-logo">
                        C
                    </div>

                    <div>

                        <strong>
                            Capital Bank
                        </strong>

                        <span>
                            Administrator Portal
                        </span>

                    </div>

                </div>


                <div className="admin-dashboard-header-right">

                    <span className="admin-dashboard-admin-name">
                        {adminUser.firstName}{" "}
                        {adminUser.lastName}
                    </span>


                    {/* THEME TOGGLE */}

                    <button
                        type="button"
                        className="admin-dashboard-theme-button"
                        onClick={
                            toggleAdminDarkMode
                        }
                        aria-label={
                            adminDarkMode
                                ? "Switch to light mode"
                                : "Switch to dark mode"
                        }
                        title={
                            adminDarkMode
                                ? "Switch to light mode"
                                : "Switch to dark mode"
                        }
                    >

                        {adminDarkMode ? (

                            <Sun
                                size={18}
                                strokeWidth={2}
                            />

                        ) : (

                            <Moon
                                size={18}
                                strokeWidth={2}
                            />

                        )}

                    </button>


                    {/* SIGN OUT */}

                    <button
                        type="button"
                        className="admin-dashboard-logout"
                        onClick={
                            adminLogout
                        }
                    >
                        Sign Out
                    </button>

                </div>

            </header>


            {/* =====================================
                MAIN LAYOUT
            ===================================== */}

            <div className="admin-dashboard-layout">


                {/* =====================================
                    SIDEBAR
                ===================================== */}

                <aside className="admin-dashboard-sidebar">

                    <div className="admin-sidebar-label">
                        ADMINISTRATION
                    </div>


                    <nav>

                        <Link
                            to="/admin"
                            className="admin-sidebar-link active"
                        >
                            Overview
                        </Link>


                        <Link
                            to="/admin/customers"
                            className="admin-sidebar-link"
                        >
                            Customers
                        </Link>


                        <button
                            type="button"
                            className="admin-sidebar-link"
                            disabled
                        >
                            Accounts
                        </button>


                        <button
                            type="button"
                            className="admin-sidebar-link"
                            disabled
                        >
                            Transactions
                        </button>


                        <button
                            type="button"
                            className="admin-sidebar-link"
                            disabled
                        >
                            Transfers
                        </button>


                        <Link
                            to="/admin/loans"
                            className="admin-sidebar-link"
                        >
                            Loans
                        </Link>


                        <Link
                            to="/admin/billers"
                            className="admin-sidebar-link"
                        >
                            Billers
                        </Link>


                        <Link
                            to="/admin/support"
                            className="admin-sidebar-link"
                        >
                            Support
                        </Link>


                        <div className="admin-sidebar-divider" />


                        <div className="admin-sidebar-label">
                            WEBSITE
                        </div>


                        <button
                            type="button"
                            className="admin-sidebar-link"
                            disabled
                        >
                            Website Management
                        </button>


                        <button
                            type="button"
                            className="admin-sidebar-link"
                            disabled
                        >
                            Settings
                        </button>

                    </nav>

                </aside>


                {/* =====================================
                    CONTENT
                ===================================== */}

                <main className="admin-dashboard-content">


                    {/* =================================
                        PAGE HEADING
                    ================================= */}

                    <div className="admin-dashboard-heading">

                        <div>

                            <span>
                                ADMINISTRATION
                            </span>

                            <h1>
                                Dashboard Overview
                            </h1>

                            <p>
                                Monitor Capital Bank operations,
                                customers, accounts and lending activity.
                            </p>

                        </div>

                    </div>


                    {/* =================================
                        LOADING
                    ================================= */}

                    {loading && (

                        <div className="admin-dashboard-state">
                            Loading administrator dashboard...
                        </div>

                    )}


                    {/* =================================
                        ERROR
                    ================================= */}

                    {!loading && error && (

                        <div
                            className="admin-dashboard-error"
                            role="alert"
                        >
                            {error}
                        </div>

                    )}


                    {/* =================================
                        DATA
                    ================================= */}

                    {!loading &&
                        !error &&
                        dashboard && (

                        <>


                            {/* =================================
                                SUMMARY CARDS
                            ================================= */}

                            <section className="admin-stat-grid">


                                <div className="admin-stat-card">

                                    <span>
                                        CUSTOMERS
                                    </span>

                                    <strong>
                                        {
                                            dashboard.customers.total
                                        }
                                    </strong>

                                </div>


                                <div className="admin-stat-card">

                                    <span>
                                        ACCOUNTS
                                    </span>

                                    <strong>
                                        {
                                            dashboard.accounts.total
                                        }
                                    </strong>

                                </div>


                                <div className="admin-stat-card">

                                    <span>
                                        TOTAL BALANCE
                                    </span>

                                    <strong>
                                        {
                                            formatCurrency(
                                                dashboard
                                                    .accounts
                                                    .totalBalance
                                            )
                                        }
                                    </strong>

                                </div>


                                <div className="admin-stat-card">

                                    <span>
                                        TRANSACTIONS
                                    </span>

                                    <strong>
                                        {
                                            dashboard
                                                .transactions
                                                .total
                                        }
                                    </strong>

                                </div>

                            </section>


                            {/* =================================
                                LOAN SUMMARY
                            ================================= */}

                            <section className="admin-section">

                                <div className="admin-section-heading">

                                    <div>

                                        <span>
                                            LENDING
                                        </span>

                                        <h2>
                                            Loan Activity
                                        </h2>

                                    </div>

                                </div>


                                <div className="admin-loan-grid">


                                    <div>

                                        <span>
                                            Total Loans
                                        </span>

                                        <strong>
                                            {
                                                dashboard
                                                    .loans
                                                    .total
                                            }
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Pending
                                        </span>

                                        <strong>
                                            {
                                                dashboard
                                                    .loans
                                                    .pending
                                            }
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Approved
                                        </span>

                                        <strong>
                                            {
                                                dashboard
                                                    .loans
                                                    .approved
                                            }
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Active
                                        </span>

                                        <strong>
                                            {
                                                dashboard
                                                    .loans
                                                    .active
                                            }
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Rejected
                                        </span>

                                        <strong>
                                            {
                                                dashboard
                                                    .loans
                                                    .rejected
                                            }
                                        </strong>

                                    </div>

                                </div>

                            </section>


                            {/* =================================
                                RECENT CUSTOMERS
                            ================================= */}

                            <section className="admin-section">

                                <div className="admin-section-heading">

                                    <div>

                                        <span>
                                            CUSTOMERS
                                        </span>

                                        <h2>
                                            Recent Customers
                                        </h2>

                                    </div>

                                </div>


                                {
                                    dashboard
                                        .recentCustomers
                                        .length === 0
                                ? (

                                    <div className="admin-empty-state">
                                        No customers have registered yet.
                                    </div>

                                ) : (

                                    <div className="admin-table-wrapper">

                                        <table>

                                            <thead>

                                                <tr>

                                                    <th>
                                                        Client Number
                                                    </th>

                                                    <th>
                                                        Customer
                                                    </th>

                                                    <th>
                                                        Email
                                                    </th>

                                                    <th>
                                                        Registered
                                                    </th>

                                                </tr>

                                            </thead>


                                            <tbody>

                                                {
                                                    dashboard
                                                        .recentCustomers
                                                        .map(
                                                            (
                                                                customer
                                                            ) => (

                                                                <tr
                                                                    key={
                                                                        customer._id
                                                                    }
                                                                >

                                                                    <td>
                                                                        {
                                                                            customer.clientNumber
                                                                        }
                                                                    </td>

                                                                    <td>
                                                                        {
                                                                            customer.firstName
                                                                        }{" "}
                                                                        {
                                                                            customer.lastName
                                                                        }
                                                                    </td>

                                                                    <td>
                                                                        {
                                                                            customer.email
                                                                        }
                                                                    </td>

                                                                    <td>
                                                                        {
                                                                            formatDate(
                                                                                customer.createdAt
                                                                            )
                                                                        }
                                                                    </td>

                                                                </tr>

                                                            )
                                                        )
                                                }

                                            </tbody>

                                        </table>

                                    </div>

                                )}

                            </section>


                            {/* =================================
                                RECENT TRANSACTIONS
                            ================================= */}

                            <section className="admin-section">

                                <div className="admin-section-heading">

                                    <div>

                                        <span>
                                            ACTIVITY
                                        </span>

                                        <h2>
                                            Recent Transactions
                                        </h2>

                                    </div>

                                </div>


                                {
                                    dashboard
                                        .recentTransactions
                                        .length === 0
                                ? (

                                    <div className="admin-empty-state">
                                        No transactions have been recorded yet.
                                    </div>

                                ) : (

                                    <div className="admin-table-wrapper">

                                        <table>

                                            <thead>

                                                <tr>

                                                    <th>
                                                        Name
                                                    </th>

                                                    <th>
                                                        Type
                                                    </th>

                                                    <th>
                                                        Direction
                                                    </th>

                                                    <th>
                                                        Amount
                                                    </th>

                                                    <th>
                                                        Status
                                                    </th>

                                                    <th>
                                                        Date
                                                    </th>

                                                </tr>

                                            </thead>


                                            <tbody>

                                                {
                                                    dashboard
                                                        .recentTransactions
                                                        .map(
                                                            (
                                                                transaction
                                                            ) => (

                                                                <tr
                                                                    key={
                                                                        transaction._id
                                                                    }
                                                                >

                                                                    <td>
                                                                        {
                                                                            transaction.name
                                                                        }
                                                                    </td>

                                                                    <td>
                                                                        {
                                                                            transaction.transactionType
                                                                        }
                                                                    </td>

                                                                    <td>
                                                                        {
                                                                            transaction.direction
                                                                        }
                                                                    </td>

                                                                    <td>
                                                                        {
                                                                            formatCurrency(
                                                                                transaction.amount
                                                                            )
                                                                        }
                                                                    </td>

                                                                    <td>
                                                                        {
                                                                            transaction.status
                                                                        }
                                                                    </td>

                                                                    <td>
                                                                        {
                                                                            formatDate(
                                                                                transaction.createdAt
                                                                            )
                                                                        }
                                                                    </td>

                                                                </tr>

                                                            )
                                                        )
                                                }

                                            </tbody>

                                        </table>

                                    </div>

                                )}

                            </section>


                            {/* =================================
                                RECENT LOANS
                            ================================= */}

                            <section className="admin-section">

                                <div className="admin-section-heading">

                                    <div>

                                        <span>
                                            LENDING
                                        </span>

                                        <h2>
                                            Recent Loan Applications
                                        </h2>

                                    </div>

                                </div>


                                {
                                    dashboard
                                        .recentLoans
                                        .length === 0
                                ? (

                                    <div className="admin-empty-state">
                                        No loan applications have been submitted yet.
                                    </div>

                                ) : (

                                    <div className="admin-table-wrapper">

                                        <table>

                                            <thead>

                                                <tr>

                                                    <th>
                                                        Application
                                                    </th>

                                                    <th>
                                                        Loan Type
                                                    </th>

                                                    <th>
                                                        Amount
                                                    </th>

                                                    <th>
                                                        Term
                                                    </th>

                                                    <th>
                                                        Status
                                                    </th>

                                                    <th>
                                                        Date
                                                    </th>

                                                </tr>

                                            </thead>


                                            <tbody>

                                                {
                                                    dashboard
                                                        .recentLoans
                                                        .map(
                                                            (
                                                                loan
                                                            ) => (

                                                                <tr
                                                                    key={
                                                                        loan._id
                                                                    }
                                                                >

                                                                    <td>
                                                                        {
                                                                            loan.applicationNumber
                                                                        }
                                                                    </td>

                                                                    <td>
                                                                        {
                                                                            loan.loanType
                                                                        }
                                                                    </td>

                                                                    <td>
                                                                        {
                                                                            formatCurrency(
                                                                                loan.requestedAmount
                                                                            )
                                                                        }
                                                                    </td>

                                                                    <td>
                                                                        {
                                                                            loan.termMonths
                                                                        }{" "}
                                                                        months
                                                                    </td>

                                                                    <td>
                                                                        {
                                                                            loan.status
                                                                        }
                                                                    </td>

                                                                    <td>
                                                                        {
                                                                            formatDate(
                                                                                loan.applicationDate
                                                                            )
                                                                        }
                                                                    </td>

                                                                </tr>

                                                            )
                                                        )
                                                }

                                            </tbody>

                                        </table>

                                    </div>

                                )}

                            </section>

                        </>

                    )}

                </main>

            </div>

        </div>

    );
}


// ======================================
// ADMIN DASHBOARD ROUTE
// ======================================

export default function AdminDashboard() {

    return (

        <AdminProtectedRoute>

            <AdminDashboardContent />

        </AdminProtectedRoute>

    );

}

