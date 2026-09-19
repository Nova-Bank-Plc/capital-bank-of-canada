import {
    useEffect,
    useState,
} from "react";

import {
    useTheme,
} from "../context/ThemeContext";

import {
    Link,
    useNavigate,
} from "react-router-dom";

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


interface ApiNotification {
    _id: string;
    userId: string;
    type: string;
    title: string;
    message: string;
    read: boolean;
    transactionId?: string;
    accountId?: string;
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


interface NotificationResponse {
    success: boolean;

    data: {
        notifications: ApiNotification[];
        unreadCount: number;
    };
}


// ======================================
// DISPLAY TYPES
// ======================================

interface Account {
    id: string;
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


const formatNotificationDate = (
    date: string
) => {
    return new Intl.DateTimeFormat(
        "en-CA",
        {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
        }
    ).format(new Date(date));
};


const currentHour = new Date().getHours();

const greeting =
    currentHour < 12
        ? "Good morning"
        : currentHour < 18
            ? "Good afternoon"
            : "Good evening";


// ======================================
// ACCOUNT NUMBER FORMATTER
// ======================================

const formatAccountNumber = (
    accountNumber: string
) => {
    if (!accountNumber) {
        return "Not available";
    }

    return accountNumber;
};


// ======================================
// NOTIFICATION ICON
// ======================================

const getNotificationIcon = (
    type: string
) => {
    switch (type) {
        case "transfer":
            return "⇄";

        case "transaction":
            return "$";

        case "loan":
            return "▣";

        case "security":
            return "✓";

        case "account":
            return "◫";

        case "announcement":
            return "◆";

        default:
            return "•";
    }
};


// ======================================
// DASHBOARD
// ======================================

function Dashboard() {

    const {
        user,
        token,
        logout,
    } = useAuth();


    const {
        darkMode,
        toggleDarkMode,
    } = useTheme();


    const navigate = useNavigate();

const [
    searchOpen,
    setSearchOpen,
] = useState(false);

const [
    searchQuery,
    setSearchQuery,
] = useState("");


const searchItems = [
    {
        title: "Dashboard",
        description: "View your banking overview",
        path: "/dashboard",
    },
    {
        title: "Accounts",
        description: "View your accounts and balances",
        path: "/dashboard/accounts",
    },
    {
        title: "Transfers",
        description: "Transfer money between accounts",
        path: "/dashboard/transfers",
    },
    {
        title: "Payments",
        description: "Pay your bills",
        path: "/dashboard/payments",
    },
    {
        title: "Transactions",
        description: "View your transaction history",
        path: "/dashboard/transactions",
    },
    {
        title: "Loans",
        description: "View and manage your loans",
        path: "/dashboard/loans",
    },
    {
        title: "Cards",
        description: "Manage your banking cards",
        path: "/dashboard/cards",
    },
    {
        title: "Help Centre",
        description: "Get help with your banking",
        path: "/dashboard/help",
    },
];

const filteredSearchItems =
    searchItems.filter((item) => {
        const query =
            searchQuery.trim().toLowerCase();

        if (!query) {
            return true;
        }

        return (
            item.title
                .toLowerCase()
                .includes(query) ||
            item.description
                .toLowerCase()
                .includes(query)
        );
    });

const handleSearchNavigation =
    (path: string) => {

        setSearchOpen(false);
        setSearchQuery("");
        setSidebarOpen(false);

        navigate(path);
    };


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
    // NOTIFICATIONS
    // ======================================

    const [
        notifications,
        setNotifications,
    ] = useState<ApiNotification[]>([]);


    const [
        unreadCount,
        setUnreadCount,
    ] = useState(0);


    const [
        notificationsOpen,
        setNotificationsOpen,
    ] = useState(false);


    const [
        notificationsLoading,
        setNotificationsLoading,
    ] = useState(false);


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
                                id:
                                    account._id,

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

    }, [token]);


    // ======================================
    // LOAD NOTIFICATIONS
    // ======================================

    useEffect(() => {

        const loadNotifications =
            async () => {

                if (!token) {
                    return;
                }


                try {

                    setNotificationsLoading(true);


                    const response =
                        await fetch(
                            `${API_BASE_URL}/api/notifications`,
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
                            "Unable to load notifications."
                        );
                    }


                    const data =
                        result as NotificationResponse;


                    if (!data.success) {

                        throw new Error(
                            "Unable to load notifications."
                        );
                    }


                    setNotifications(
                        data.data.notifications
                    );


                    setUnreadCount(
                        data.data.unreadCount
                    );


                } catch (notificationError) {

                    console.error(
                        "Notification request error:",
                        notificationError
                    );

                } finally {

                    setNotificationsLoading(false);

                }
            };


        loadNotifications();

    }, [token]);


    // ======================================
    // MARK ONE NOTIFICATION AS READ
    // ======================================

    const markNotificationAsRead =
        async (
            notificationId: string
        ) => {

            if (!token) {
                return;
            }


            try {

                const response =
                    await fetch(
                        `${API_BASE_URL}/api/notifications/${notificationId}/read`,
                        {
                            method: "PATCH",

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
                        "Unable to update notification."
                    );
                }


                setNotifications(
                    (currentNotifications) =>
                        currentNotifications.map(
                            (notification) =>
                                notification._id ===
                                notificationId
                                    ? {
                                        ...notification,
                                        read: true,
                                    }
                                    : notification
                        )
                );


                setUnreadCount(
                    (currentCount) =>
                        Math.max(
                            0,
                            currentCount - 1
                        )
                );


            } catch (notificationError) {

                console.error(
                    "Mark notification read error:",
                    notificationError
                );

            }
        };


    // ======================================
    // MARK ALL NOTIFICATIONS AS READ
    // ======================================

    const markAllNotificationsAsRead =
        async () => {

            if (!token || unreadCount === 0) {
                return;
            }


            try {

                const response =
                    await fetch(
                        `${API_BASE_URL}/api/notifications/read-all`,
                        {
                            method: "PATCH",

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
                        "Unable to update notifications."
                    );
                }


                setNotifications(
                    (currentNotifications) =>
                        currentNotifications.map(
                            (notification) => ({
                                ...notification,
                                read: true,
                            })
                        )
                );


                setUnreadCount(0);


            } catch (notificationError) {

                console.error(
                    "Mark all notifications read error:",
                    notificationError
                );

            }
        };


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
                        className={`dashboard-menu-button ${
                            sidebarOpen ? "active" : ""
                        }`}
                        onClick={() =>
                            setSidebarOpen(!sidebarOpen)
                        }
                        aria-label="Toggle navigation"
                        aria-expanded={sidebarOpen}
                    >
                        <span />
                        <span />
                        <span />
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
    className={`dashboard-icon-button dashboard-search-button ${
        searchOpen
            ? "search-active"
            : ""
    }`}
    aria-label="Search"
    aria-expanded={searchOpen}
    onClick={() =>
        setSearchOpen(!searchOpen)
    }
>
    ⌕
</button>


{searchOpen && (
    <div
        className="dashboard-search-panel"
        role="dialog"
        aria-label="Dashboard search"
    >

        <div className="dashboard-search-header">

            <div>
                <span>
                    SEARCH
                </span>

                <h3>
                    What are you looking for?
                </h3>
            </div>

            <button
                type="button"
                className="dashboard-search-close"
                aria-label="Close search"
                onClick={() => {
                    setSearchOpen(false);
                    setSearchQuery("");
                }}
            >
                ×
            </button>

        </div>


        <div className="dashboard-search-input-wrapper">

            <span>
                ⌕
            </span>

            <input
                type="search"
                value={searchQuery}
                onChange={(event) =>
                    setSearchQuery(
                        event.target.value
                    )
                }
                placeholder="Search banking services..."
                autoFocus
            />

        </div>


        <div className="dashboard-search-results">

            {filteredSearchItems.length === 0 ? (

                <div className="dashboard-search-empty">

                    <strong>
                        No results found
                    </strong>

                    <span>
                        Try searching for accounts,
                        transfers, loans or payments.
                    </span>

                </div>

            ) : (

                filteredSearchItems.map(
                    (item) => (

                        <button
                            type="button"
                            className="dashboard-search-result"
                            key={item.path}
                            onClick={() =>
                                handleSearchNavigation(
                                    item.path
                                )
                            }
                        >

                            <span className="dashboard-search-result-icon">
                                →
                            </span>

                            <span className="dashboard-search-result-content">

                                <strong>
                                    {item.title}
                                </strong>

                                <span>
                                    {item.description}
                                </span>

                            </span>

                        </button>

                    )
                )

            )}

        </div>

    </div>
)}
                     
                    <button
                          type="button"
                          className="dashboard-icon-button theme-toggle"
                          aria-label={
                          darkMode
                          ? "Switch to light mode"
                          : "Switch to dark mode"
                      }
                title={
                         darkMode
                      ?    "Switch to light mode"
                           : "Switch to dark mode"
                     }
                       onClick={toggleDarkMode}
                   >
                     {darkMode ? "☀" : "☾"}
                   </button>


                    {/* =====================================
                        NOTIFICATION BUTTON
                    ===================================== */}

                    <div className="dashboard-notification-wrapper">

                        <button
                            type="button"
                            className={`dashboard-icon-button notification ${
                                notificationsOpen
                                    ? "notification-active"
                                    : ""
                            }`}
                            aria-label="Notifications"
                            aria-expanded={
                                notificationsOpen
                            }
                            onClick={() =>
                                setNotificationsOpen(
                                    !notificationsOpen
                                )
                            }
                        >

                            ♢

                            {unreadCount > 0 && (
                                <span className="notification-badge">
                                    {unreadCount > 99
                                        ? "99+"
                                        : unreadCount
                                    }
                                </span>
                            )}

                        </button>


                        {/* =================================
                            NOTIFICATION PANEL
                        ================================= */}

                        {notificationsOpen && (

                            <div
                                className="dashboard-notification-panel"
                                role="dialog"
                                aria-label="Notifications"
                            >

                                <div className="notification-panel-header">

                                    <div>

                                        <span>
                                            NOTIFICATIONS
                                        </span>

                                        <h3>
                                            Your notifications
                                        </h3>

                                    </div>


                                    {unreadCount > 0 && (

                                        <button
                                            type="button"
                                            className="notification-mark-all"
                                            onClick={
                                                markAllNotificationsAsRead
                                            }
                                        >
                                            Mark all as read
                                        </button>

                                    )}

                                </div>


                                <div className="notification-panel-list">

                                    {notificationsLoading ? (

                                        <div className="notification-empty">

                                            <span>
                                                Loading notifications...
                                            </span>

                                        </div>

                                    ) : notifications.length === 0 ? (

                                        <div className="notification-empty">

                                            <strong>
                                                No notifications
                                            </strong>

                                            <span>
                                                You're all caught up.
                                            </span>

                                        </div>

                                    ) : (

                                        notifications.map(
                                            (notification) => (

                                                <button
                                                    type="button"
                                                    className={`dashboard-notification-item ${
                                                        notification.read
                                                            ? "read"
                                                            : "unread"
                                                    }`}
                                                    key={
                                                        notification._id
                                                    }
                                                    onClick={() => {

                                                        if (
                                                            !notification.read
                                                        ) {
                                                            markNotificationAsRead(
                                                                notification._id
                                                            );
                                                        }

                                                    }}
                                                >

                                                    <span className="notification-item-icon">

                                                        {getNotificationIcon(
                                                            notification.type
                                                        )}

                                                    </span>


                                                    <span className="notification-item-content">

                                                        <strong>
                                                            {notification.title}
                                                        </strong>


                                                        <span>
                                                            {notification.message}
                                                        </span>


                                                        <small>
                                                            {formatNotificationDate(
                                                                notification.createdAt
                                                            )}
                                                        </small>

                                                    </span>


                                                    {!notification.read && (
                                                        <span className="notification-unread-dot" />
                                                    )}

                                                </button>

                                            )
                                        )

                                    )}

                                </div>

                            </div>

                        )}

                    </div>


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

                {sidebarOpen && (
                    <button
                        type="button"
                        className="dashboard-sidebar-overlay"
                        aria-label="Close navigation"
                        onClick={() =>
                            setSidebarOpen(false)
                        }
                    />
                )}


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


                            <Link
                                to="/dashboard/transfers"
                                onClick={() =>
                                    setSidebarOpen(false)
                                }
                            >
                                <span className="nav-icon">
                                    ⇄
                                </span>

                                Transfers
                            </Link>


                            <Link
                                to="/dashboard/loans"
                                onClick={() =>
                                    setSidebarOpen(false)
                                }
                            >
                                <span className="nav-icon">
                                    $
                                </span>

                                Loans
                            </Link>


                            <Link
                               to="/dashboard/payments"
                               onClick={() =>
                                   setSidebarOpen(false)
                              }
                           >
                            <span className="nav-icon">
                               ◇
                            </span>

                              Payments
                            </Link>


                            <Link
                               to="/dashboard/transactions"
                                onClick={() =>
                              setSidebarOpen(false)
                              }
                           >
                           <span className="nav-icon">
                                ≡
                           </span>

                             Transactions
                           </Link>


                           <Link
                              to="/dashboard/cards"
                              className="sidebar-link"
                            onClick={() => setSidebarOpen(false)}
                       >
                            <span className="nav-icon">▭</span>
                                Cards
                          </Link>

                        </nav>

                    </div>


                    {/* =========================================
                        SUPPORT
                    ========================================= */}

                    <div className="sidebar-section sidebar-bottom">

                        <span className="sidebar-label">
                            SUPPORT
                        </span>


                        <nav className="dashboard-navigation">

                            <a
                                href="#settings"
                                onClick={() =>
                                    setSidebarOpen(false)
                                }
                            >
                                <span className="nav-icon">
                                    ⚙
                                </span>

                                Settings
                            </a>


                            <Link
                                to="/dashboard/help"
                                onClick={() =>
                                   setSidebarOpen(false)
                             }
                          >
                           <span className="nav-icon">
                               ?
                           </span>

                             Help centre
                           </Link>    

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
                                    {greeting}, {firstName}.
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

                            <Link
                                to="/dashboard/transfers"
                                className="quick-action"
                            >
                                <span>
                                    ↗
                                </span>

                                Transfer money
                            </Link>


                             <Link
                                 to="/dashboard/payments"
                                 className="quick-action"
                           >
                              <span>
                            ◇
                            </span>

                                  Pay a bill
                             </Link>


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
                                                    account.id
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


                                                    <Link
                                                        to={`/dashboard/accounts/${account.id}`}
                                                        className="account-view-link"
                                                    >
                                                        View account →
                                                    </Link>

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


                               <Link
                                  to="/dashboard/transactions"
                                  className="view-all"
                               >
                                   View all →
                               </Link>

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

                                    transactions
                                        .slice(0, 5)
                                        .map(
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