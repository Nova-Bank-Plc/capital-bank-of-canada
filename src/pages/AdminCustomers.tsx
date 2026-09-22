import {
    useState,
} from "react";

import type {
    FormEvent,
} from "react";

import {
    Link,
    useNavigate,
} from "react-router-dom";

import {
    ArrowLeft,
    Coins,
    Search,
    UserRound,
    Wallet,
    X,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

import "./AdminCustomers.css";


const API_BASE_URL =
    import.meta.env.VITE_API_URL ||
    (
        import.meta.env.PROD
            ? ""
            : "http://localhost:5000"
    );


interface CustomerAccount {
    id: string;
    accountType: string;
    accountNumber: string;
    balance: number;
    currency: string;
    status: string;
    createdAt: string;
}


interface Customer {
    id: string;
    clientNumber: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    createdAt: string;
    accounts: CustomerAccount[];
}


interface DigitalAssetBalance {
    symbol: string;
    asset: string;
    balance: number;
}


const DIGITAL_ASSETS = [
    {
        asset: "Bitcoin",
        symbol: "BTC",
    },
    {
        asset: "Ethereum",
        symbol: "ETH",
    },
    {
        asset: "Solana",
        symbol: "SOL",
    },
    {
        asset: "XRP",
        symbol: "XRP",
    },
    {
        asset: "Capital Coin",
        symbol: "CBC",
    },
];


const CREDIT_SOURCES = [
    "Direct Transfer",
    "ATM Transfer",
    "Bank Transfer",
    "Wire Transfer",
    "Cash Deposit",
    "Mobile Deposit",
    "Refund",
    "Interest",
    "Loan Disbursement",
    "Account Adjustment",
];


const DEBIT_SOURCES = [
    "Direct Transfer",
    "ATM Transfer",
    "Bank Transfer",
    "Wire Transfer",
    "Cash Withdrawal",
    "Mobile Withdrawal",
    "Refund",
    "Fee",
    "Loan Repayment",
    "Account Adjustment",
];


export default function AdminCustomers() {

    const navigate = useNavigate();

   const {
    adminToken,
    adminLogout,
} = useAuth();


    const [
        searchQuery,
        setSearchQuery,
    ] = useState("");


    const [
        customers,
        setCustomers,
    ] = useState<Customer[]>([]);


    const [
        loading,
        setLoading,
    ] = useState(false);


    const [
        error,
        setError,
    ] = useState("");


    /* =====================================
       DIGITAL ASSET DISPLAY STATE
    ===================================== */

    const [
        digitalAssetBalances,
        setDigitalAssetBalances,
    ] = useState<
        Record<
            string,
            DigitalAssetBalance[]
        >
    >({});


    /* =====================================
       CREDIT FORM STATE
    ===================================== */

    const [
        selectedCustomer,
        setSelectedCustomer,
    ] = useState<Customer | null>(null);


    const [
        selectedAccount,
        setSelectedAccount,
    ] = useState<CustomerAccount | null>(null);


    const [
        creditAmount,
        setCreditAmount,
    ] = useState("");


    const [
        creditSource,
        setCreditSource,
    ] = useState("Direct Transfer");


    const [
        creditDescription,
        setCreditDescription,
    ] = useState("");


    const [
        creditLoading,
        setCreditLoading,
    ] = useState(false);


    const [
        creditError,
        setCreditError,
    ] = useState("");


    const [
        creditSuccess,
        setCreditSuccess,
    ] = useState("");


    /* =====================================
       DEBIT FORM STATE
    ===================================== */

    const [
        selectedDebitCustomer,
        setSelectedDebitCustomer,
    ] = useState<Customer | null>(null);


    const [
        selectedDebitAccount,
        setSelectedDebitAccount,
    ] = useState<CustomerAccount | null>(null);


    const [
        debitAmount,
        setDebitAmount,
    ] = useState("");


    const [
        debitSource,
        setDebitSource,
    ] = useState("Direct Transfer");


    const [
        debitDescription,
        setDebitDescription,
    ] = useState("");


    const [
        debitLoading,
        setDebitLoading,
    ] = useState(false);


    const [
        debitError,
        setDebitError,
    ] = useState("");


    const [
        debitSuccess,
        setDebitSuccess,
    ] = useState("");


    /* =====================================
       DIGITAL ASSET CREDIT FORM STATE
    ===================================== */

    const [
        selectedDigitalCustomer,
        setSelectedDigitalCustomer,
    ] = useState<Customer | null>(null);


    const [
        selectedDigitalAsset,
        setSelectedDigitalAsset,
    ] = useState(
        DIGITAL_ASSETS[0].symbol
    );


    const [
        digitalAssetQuantity,
        setDigitalAssetQuantity,
    ] = useState("");


    const [
        digitalAssetReference,
        setDigitalAssetReference,
    ] = useState("");


    const [
        digitalAssetLoading,
        setDigitalAssetLoading,
    ] = useState(false);


    const [
        digitalAssetError,
        setDigitalAssetError,
    ] = useState("");


    const [
        digitalAssetSuccess,
        setDigitalAssetSuccess,
    ] = useState("");


    /* =====================================
       SEARCH CUSTOMERS
    ===================================== */

const handleSearch = async (
    event: FormEvent<HTMLFormElement>
) => {

    event.preventDefault();


    if (!adminToken) {

        setError(
            "Your administrator session has expired. Please sign in again."
        );

        adminLogout();

        navigate(
            "/admin/login",
            {
                replace: true,
            }
        );

        return;

    }


    const query =
        searchQuery.trim();


    if (query.length < 2) {

        setError(
            "Enter at least 2 characters to search."
        );

        return;

    }


    setLoading(true);
    setError("");


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/api/admin/customers/search?q=${encodeURIComponent(query)}`,
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

            navigate(
                "/admin/login",
                {
                    replace: true,
                }
            );

            return;

        }


        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.message ||
                "Unable to search customers."
            );

        }


        setCustomers(
            data.data.customers || []
        );


        setDigitalAssetBalances({});


    } catch (error) {

        setCustomers([]);

        setError(
            error instanceof Error
                ? error.message
                : "Unable to search customers."
        );

    } finally {

        setLoading(false);

    }

};
    /* =====================================
       OPEN CREDIT FORM
    ===================================== */

    const openCreditForm = (
        customer: Customer,
        account: CustomerAccount
    ) => {

        setSelectedCustomer(customer);
        setSelectedAccount(account);

        setCreditAmount("");
        setCreditSource("Direct Transfer");
        setCreditDescription("");

        setCreditError("");
        setCreditSuccess("");

    };


    /* =====================================
       CLOSE CREDIT FORM
    ===================================== */

    const closeCreditForm = () => {

        if (creditLoading) {
            return;
        }

        setSelectedCustomer(null);
        setSelectedAccount(null);

        setCreditAmount("");
        setCreditSource("Direct Transfer");
        setCreditDescription("");

        setCreditError("");
        setCreditSuccess("");

    };


    /* =====================================
       CREDIT ACCOUNT
    ===================================== */

    const handleCreditAccount = async (
        event: FormEvent<HTMLFormElement>
    ) => {

        event.preventDefault();


        if (
            !selectedAccount ||
            !selectedCustomer
        ) {
            return;
        }


        const amount =
            Number(creditAmount);


        if (
            !Number.isFinite(amount) ||
            amount <= 0
        ) {

            setCreditError(
                "Enter a valid amount greater than zero."
            );

            return;

        }


        setCreditLoading(true);
        setCreditError("");
        setCreditSuccess("");


        try {

            const response =
                await fetch(
                    `${API_BASE_URL}/api/admin/accounts/${selectedAccount.id}/credit`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",

                            Authorization:
                                `Bearer ${adminToken}`,
                        },

                        body: JSON.stringify({
                            amount,

                            source:
                                creditSource,

                            description:
                                creditDescription.trim(),
                        }),
                    }
                );


            const data =
                await response.json();


            if (
                response.status === 401 ||
                response.status === 403
            ) {

                adminLogout();

                navigate(
                    "/admin/login",
                    {
                        replace: true,
                    }
                );

                return;

            }


            if (
                !response.ok ||
                !data.success
            ) {

                throw new Error(
                    data.message ||
                    "Unable to credit account."
                );

            }


            const updatedAccount =
                data.data.account;


            setCustomers(
                (currentCustomers) =>
                    currentCustomers.map(
                        (customer) => {

                            if (
                                customer.id !==
                                selectedCustomer.id
                            ) {
                                return customer;
                            }


                            return {
                                ...customer,

                                accounts:
                                    customer.accounts.map(
                                        (account) =>
                                            account.id ===
                                            selectedAccount.id
                                                ? {
                                                    ...account,

                                                    balance:
                                                        updatedAccount.newBalance,
                                                }
                                                : account
                                    ),
                            };

                        }
                    )
            );


            setSelectedAccount(
                (currentAccount) =>
                    currentAccount
                        ? {
                            ...currentAccount,

                            balance:
                                updatedAccount.newBalance,
                        }
                        : currentAccount
            );


            setCreditSuccess(
                `Account credited successfully. New balance: ${formatCurrency(
                    updatedAccount.newBalance,
                    updatedAccount.currency
                )}.`
            );


            setCreditAmount("");
            setCreditDescription("");


        } catch (error) {

            setCreditError(
                error instanceof Error
                    ? error.message
                    : "Unable to credit account."
            );

        } finally {

            setCreditLoading(false);

        }

    };


    /* =====================================
       OPEN DEBIT FORM
    ===================================== */

    const openDebitForm = (
        customer: Customer,
        account: CustomerAccount
    ) => {

        setSelectedDebitCustomer(customer);
        setSelectedDebitAccount(account);

        setDebitAmount("");
        setDebitSource("Direct Transfer");
        setDebitDescription("");

        setDebitError("");
        setDebitSuccess("");

    };


    /* =====================================
       CLOSE DEBIT FORM
    ===================================== */

    const closeDebitForm = () => {

        if (debitLoading) {
            return;
        }

        setSelectedDebitCustomer(null);
        setSelectedDebitAccount(null);

        setDebitAmount("");
        setDebitSource("Direct Transfer");
        setDebitDescription("");

        setDebitError("");
        setDebitSuccess("");

    };


    /* =====================================
       DEBIT ACCOUNT
    ===================================== */

    const handleDebitAccount = async (
        event: FormEvent<HTMLFormElement>
    ) => {

        event.preventDefault();


        if (
            !selectedDebitAccount ||
            !selectedDebitCustomer
        ) {
            return;
        }


        const amount =
            Number(debitAmount);


        if (
            !Number.isFinite(amount) ||
            amount <= 0
        ) {

            setDebitError(
                "Enter a valid amount greater than zero."
            );

            return;

        }


        if (
            amount >
            selectedDebitAccount.balance
        ) {

            setDebitError(
                "The debit amount cannot exceed the current account balance."
            );

            return;

        }


        setDebitLoading(true);
        setDebitError("");
        setDebitSuccess("");


        try {

            const response =
                await fetch(
                    `${API_BASE_URL}/api/admin/accounts/${selectedDebitAccount.id}/debit`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",

                           Authorization:
                               `Bearer ${adminToken}`,
                        },

                        body: JSON.stringify({
                            amount,

                            source:
                                debitSource,

                            description:
                                debitDescription.trim(),
                        }),
                    }
                );


            const data =
                await response.json();


            if (
                response.status === 401 ||
                response.status === 403
            ) {

                adminLogout();

                navigate(
                    "/admin/login",
                    {
                        replace: true,
                    }
                );

                return;

            }


            if (
                !response.ok ||
                !data.success
            ) {

                throw new Error(
                    data.message ||
                    "Unable to debit account."
                );

            }


            const updatedAccount =
                data.data.account;


            setCustomers(
                (currentCustomers) =>
                    currentCustomers.map(
                        (customer) => {

                            if (
                                customer.id !==
                                selectedDebitCustomer.id
                            ) {
                                return customer;
                            }


                            return {
                                ...customer,

                                accounts:
                                    customer.accounts.map(
                                        (account) =>
                                            account.id ===
                                            selectedDebitAccount.id
                                                ? {
                                                    ...account,

                                                    balance:
                                                        updatedAccount.newBalance,
                                                }
                                                : account
                                    ),
                            };

                        }
                    )
            );


            setSelectedDebitAccount(
                (currentAccount) =>
                    currentAccount
                        ? {
                            ...currentAccount,

                            balance:
                                updatedAccount.newBalance,
                        }
                        : currentAccount
            );


            setDebitSuccess(
                `Account debited successfully. New balance: ${formatCurrency(
                    updatedAccount.newBalance,
                    updatedAccount.currency
                )}.`
            );


            setDebitAmount("");
            setDebitDescription("");


        } catch (error) {

            setDebitError(
                error instanceof Error
                    ? error.message
                    : "Unable to debit account."
            );

        } finally {

            setDebitLoading(false);

        }

    };


    /* =====================================
       OPEN DIGITAL ASSET FORM
    ===================================== */

    const openDigitalAssetForm = (
        customer: Customer
    ) => {

        setSelectedDigitalCustomer(customer);

        setSelectedDigitalAsset(
            DIGITAL_ASSETS[0].symbol
        );

        setDigitalAssetQuantity("");
        setDigitalAssetReference("");

        setDigitalAssetError("");
        setDigitalAssetSuccess("");

    };


    /* =====================================
       CLOSE DIGITAL ASSET FORM
    ===================================== */

    const closeDigitalAssetForm = () => {

        if (digitalAssetLoading) {
            return;
        }

        setSelectedDigitalCustomer(null);

        setSelectedDigitalAsset(
            DIGITAL_ASSETS[0].symbol
        );

        setDigitalAssetQuantity("");
        setDigitalAssetReference("");

        setDigitalAssetError("");
        setDigitalAssetSuccess("");

    };


    /* =====================================
       CREDIT DIGITAL ASSET
    ===================================== */

    const handleCreditDigitalAsset = async (
        event: FormEvent<HTMLFormElement>
    ) => {

        event.preventDefault();


        if (!selectedDigitalCustomer) {
            return;
        }


        const quantity =
            Number(digitalAssetQuantity);


        if (
            !Number.isFinite(quantity) ||
            quantity <= 0
        ) {

            setDigitalAssetError(
                "Enter a valid quantity greater than zero."
            );

            return;

        }


        setDigitalAssetLoading(true);
        setDigitalAssetError("");
        setDigitalAssetSuccess("");


        try {

            const response =
                await fetch(
                    `${API_BASE_URL}/api/admin/digital-assets/credit`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",

                           Authorization:
                               `Bearer ${adminToken}`,
                        },

                        body: JSON.stringify({
                            userId:
                                selectedDigitalCustomer.id,

                            symbol:
                                selectedDigitalAsset,

                            quantity,

                            reference:
                                digitalAssetReference.trim(),
                        }),
                    }
                );


            const data =
                await response.json();


            if (
                response.status === 401 ||
                response.status === 403
            ) {

                adminLogout();

                navigate(
                    "/admin/login",
                    {
                        replace: true,
                    }
                );

                return;

            }


            if (
                !response.ok ||
                !data.success
            ) {

                throw new Error(
                    data.message ||
                    "Unable to credit digital asset."
                );

            }


            const creditedAsset =
                data.data.asset;


            setDigitalAssetBalances(
                (currentBalances) => {

                    const customerBalances =
                        currentBalances[
                            selectedDigitalCustomer.id
                        ] || [];


                    const existingBalance =
                        customerBalances.find(
                            (item) =>
                                item.symbol ===
                                creditedAsset.symbol
                        );


                    if (existingBalance) {

                        return {
                            ...currentBalances,

                            [selectedDigitalCustomer.id]:
                                customerBalances.map(
                                    (item) =>
                                        item.symbol ===
                                        creditedAsset.symbol
                                            ? {
                                                ...item,

                                                balance:
                                                    creditedAsset.balance,
                                            }
                                            : item
                                ),
                        };

                    }


                    return {
                        ...currentBalances,

                        [selectedDigitalCustomer.id]: [
                            ...customerBalances,

                            {
                                symbol:
                                    creditedAsset.symbol,

                                asset:
                                    creditedAsset.asset,

                                balance:
                                    creditedAsset.balance,
                            },
                        ],
                    };

                }
            );


            setDigitalAssetSuccess(
                `${creditedAsset.asset} credited successfully. New balance: ${formatDigitalQuantity(
                    creditedAsset.balance
                )} ${creditedAsset.symbol}.`
            );


            setDigitalAssetQuantity("");
            setDigitalAssetReference("");


        } catch (error) {

            setDigitalAssetError(
                error instanceof Error
                    ? error.message
                    : "Unable to credit digital asset."
            );

        } finally {

            setDigitalAssetLoading(false);

        }

    };


    /* =====================================
       FORMAT CURRENCY
    ===================================== */

    const formatCurrency = (
        amount: number,
        currency: string
    ) => {

        return new Intl.NumberFormat(
            "en-CA",
            {
                style: "currency",
                currency,
            }
        ).format(amount);

    };


    /* =====================================
       FORMAT DIGITAL QUANTITY
    ===================================== */

    const formatDigitalQuantity = (
        quantity: number
    ) => {

        return new Intl.NumberFormat(
            "en-US",
            {
                minimumFractionDigits: 0,
                maximumFractionDigits: 8,
            }
        ).format(quantity);

    };


    /* =====================================
       FORMAT DATE
    ===================================== */

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


    return (
        <main className="admin-customers-page">

            <header className="admin-customers-header">

                <div className="admin-customers-header-left">

                    <Link
                        to="/admin"
                        className="admin-customers-back"
                    >
                        <ArrowLeft size={18} />

                        <span>
                            Dashboard
                        </span>
                    </Link>

                </div>


                <div className="admin-customers-header-title">

                    <span>
                        CAPITAL BANK
                    </span>

                    <h1>
                        Customers
                    </h1>

                </div>

            </header>


            <section className="admin-customers-content">

                <div className="admin-customers-intro">

                    <div>

                        <span className="admin-section-label">
                            CUSTOMER MANAGEMENT
                        </span>

                        <h2>
                            Find a customer
                        </h2>

                        <p>
                            Search customers by client
                            number, name, email, or phone
                            number.
                        </p>

                    </div>

                </div>


                <form
                    className="admin-customer-search"
                    onSubmit={handleSearch}
                >

                    <Search size={20} />

                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(event) =>
                            setSearchQuery(
                                event.target.value
                            )
                        }
                        placeholder="Search by client number, name, email or phone"
                    />

                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Searching..."
                            : "Search"}
                    </button>

                </form>


                {error && (
                    <div
                        className="admin-customers-error"
                        role="alert"
                    >
                        {error}
                    </div>
                )}


                {!loading &&
                    !error &&
                    customers.length === 0 &&
                    searchQuery.trim() && (
                        <div className="admin-customers-empty">

                            <UserRound size={34} />

                            <h3>
                                No customers found
                            </h3>

                            <p>
                                Try another client number,
                                name, email, or phone number.
                            </p>

                        </div>
                    )}


                {customers.length > 0 && (

                    <div className="admin-customer-results">

                        <div className="admin-results-heading">

                            <h2>
                                Search Results
                            </h2>

                            <span>
                                {customers.length}
                                {" "}
                                {customers.length === 1
                                    ? "customer"
                                    : "customers"}
                            </span>

                        </div>


                        {customers.map(
                            (customer) => (

                                <article
                                    key={customer.id}
                                    className="admin-customer-card"
                                >

                                    <div className="admin-customer-main">

                                        <div className="admin-customer-avatar">
                                            <UserRound size={22} />
                                        </div>


                                        <div className="admin-customer-identity">

                                            <h3>
                                                {customer.firstName}
                                                {" "}
                                                {customer.lastName}
                                            </h3>

                                            <span>
                                                {customer.clientNumber}
                                            </span>

                                        </div>

                                    </div>


                                    <div className="admin-customer-details">

                                        <div>
                                            <span>
                                                Email
                                            </span>

                                            <strong>
                                                {customer.email}
                                            </strong>
                                        </div>


                                        <div>
                                            <span>
                                                Phone
                                            </span>

                                            <strong>
                                                {customer.phone}
                                            </strong>
                                        </div>


                                        <div>
                                            <span>
                                                Customer Since
                                            </span>

                                            <strong>
                                                {formatDate(
                                                    customer.createdAt
                                                )}
                                            </strong>
                                        </div>

                                    </div>


                                    <div className="admin-customer-accounts">

                                        <div className="admin-accounts-heading">

                                            <div>
                                                <Wallet size={18} />

                                                <h4>
                                                    Accounts
                                                </h4>
                                            </div>

                                            <span>
                                                {customer.accounts.length}
                                            </span>

                                        </div>


                                        {customer.accounts.length === 0 ? (

                                            <p className="admin-no-accounts">
                                                No accounts found.
                                            </p>

                                        ) : (

                                            <div className="admin-account-list">

                                                {customer.accounts.map(
                                                    (account) => (

                                                        <div
                                                            key={account.id}
                                                            className="admin-account-row"
                                                        >

                                                            <div>

                                                                <strong>
                                                                    {account.accountType}
                                                                </strong>

                                                                <span>
                                                                    {account.accountNumber}
                                                                </span>

                                                            </div>


                                                            <div className="admin-account-balance">

                                                                <strong>
                                                                    {formatCurrency(
                                                                        account.balance,
                                                                        account.currency
                                                                    )}
                                                                </strong>

                                                                <span
                                                                    className={
                                                                        account.status === "active"
                                                                            ? "active"
                                                                            : ""
                                                                    }
                                                                >
                                                                    {account.status}
                                                                </span>

                                                            </div>


                                                            <div className="admin-account-actions">

                                                                <button
                                                                    type="button"
                                                                    className="admin-credit-button"
                                                                    disabled={
                                                                        account.status !==
                                                                        "active"
                                                                    }
                                                                    onClick={() =>
                                                                        openCreditForm(
                                                                            customer,
                                                                            account
                                                                        )
                                                                    }
                                                                >
                                                                    Credit Account
                                                                </button>


                                                                <button
                                                                    type="button"
                                                                    className="admin-debit-button"
                                                                    disabled={
                                                                        account.status !==
                                                                        "active"
                                                                    }
                                                                    onClick={() =>
                                                                        openDebitForm(
                                                                            customer,
                                                                            account
                                                                        )
                                                                    }
                                                                >
                                                                    Debit Account
                                                                </button>

                                                            </div>

                                                        </div>

                                                    )
                                                )}

                                            </div>

                                        )}

                                    </div>


                                    {/* =====================================
                                       DIGITAL ASSETS
                                    ===================================== */}

                                    <div className="admin-customer-digital-assets">

                                        <div className="admin-digital-assets-heading">

                                            <div>

                                                <Coins size={18} />

                                                <div>

                                                    <h4>
                                                        Digital Assets
                                                    </h4>

                                                    <span>
                                                        Cryptocurrency &amp; Capital Coin
                                                    </span>

                                                </div>

                                            </div>


                                            <button
                                                type="button"
                                                className="admin-digital-asset-credit-button"
                                                onClick={() =>
                                                    openDigitalAssetForm(
                                                        customer
                                                    )
                                                }
                                            >
                                                Credit Asset
                                            </button>

                                        </div>


                                        <div className="admin-digital-assets-list">

                                            {DIGITAL_ASSETS.map(
                                                (asset) => {

                                                    const customerBalances =
                                                        digitalAssetBalances[
                                                            customer.id
                                                        ] || [];


                                                    const balance =
                                                        customerBalances.find(
                                                            (item) =>
                                                                item.symbol ===
                                                                asset.symbol
                                                        );


                                                    return (
                                                        <div
                                                            key={asset.symbol}
                                                            className="admin-digital-asset-row"
                                                        >

                                                            <div className="admin-digital-asset-icon">
                                                                <Coins size={16} />
                                                            </div>


                                                            <div className="admin-digital-asset-name">

                                                                <strong>
                                                                    {asset.asset}
                                                                </strong>

                                                                <span>
                                                                    {asset.symbol}
                                                                </span>

                                                            </div>


                                                            <div className="admin-digital-asset-balance">

                                                                <span>
                                                                    Balance
                                                                </span>

                                                                <strong>
                                                                    {balance
                                                                        ? `${formatDigitalQuantity(balance.balance)} ${asset.symbol}`
                                                                        : "—"}
                                                                </strong>

                                                            </div>

                                                        </div>
                                                    );

                                                }
                                            )}

                                        </div>

                                    </div>

                                </article>

                            )
                        )}

                    </div>

                )}

            </section>


            {/* =====================================
               CREDIT ACCOUNT MODAL
            ===================================== */}

            {selectedAccount &&
                selectedCustomer && (

                <div
                    className="admin-credit-overlay"
                    onMouseDown={(event) => {

                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closeCreditForm();
                        }

                    }}
                >

                    <section
                        className="admin-credit-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="admin-credit-title"
                    >

                        <div className="admin-credit-modal-header">

                            <div>

                                <span>
                                    ACCOUNT OPERATION
                                </span>

                                <h2 id="admin-credit-title">
                                    Credit Account
                                </h2>

                            </div>


                            <button
                                type="button"
                                className="admin-credit-close"
                                onClick={closeCreditForm}
                                disabled={creditLoading}
                                aria-label="Close credit form"
                            >
                                <X size={20} />
                            </button>

                        </div>


                        <div className="admin-credit-account-summary">

                            <div>

                                <span>
                                    Customer
                                </span>

                                <strong>
                                    {selectedCustomer.firstName}
                                    {" "}
                                    {selectedCustomer.lastName}
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Account
                                </span>

                                <strong>
                                    {selectedAccount.accountType}
                                </strong>

                                <small>
                                    {selectedAccount.accountNumber}
                                </small>

                            </div>


                            <div>

                                <span>
                                    Current Balance
                                </span>

                                <strong>
                                    {formatCurrency(
                                        selectedAccount.balance,
                                        selectedAccount.currency
                                    )}
                                </strong>

                            </div>

                        </div>


                        {creditError && (

                            <div
                                className="admin-credit-error"
                                role="alert"
                            >
                                {creditError}
                            </div>

                        )}


                        {creditSuccess && (

                            <div
                                className="admin-credit-success"
                                role="status"
                            >
                                {creditSuccess}
                            </div>

                        )}


                        <form
                            className="admin-credit-form"
                            onSubmit={handleCreditAccount}
                        >

                            <label htmlFor="credit-amount">
                                Amount
                            </label>

                            <div className="admin-credit-amount">

                                <span>
                                    {selectedAccount.currency}
                                </span>

                                <input
                                    id="credit-amount"
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    value={creditAmount}
                                    onChange={(event) =>
                                        setCreditAmount(
                                            event.target.value
                                        )
                                    }
                                    placeholder="0.00"
                                    required
                                    disabled={creditLoading}
                                />

                            </div>


                            <label htmlFor="credit-source">
                                Source
                            </label>

                            <select
                                id="credit-source"
                                value={creditSource}
                                onChange={(event) =>
                                    setCreditSource(
                                        event.target.value
                                    )
                                }
                                disabled={creditLoading}
                                required
                            >

                                {CREDIT_SOURCES.map(
                                    (source) => (

                                        <option
                                            key={source}
                                            value={source}
                                        >
                                            {source}
                                        </option>

                                    )
                                )}

                            </select>


                            <label htmlFor="credit-description">
                                Description
                            </label>

                            <input
                                id="credit-description"
                                type="text"
                                value={creditDescription}
                                onChange={(event) =>
                                    setCreditDescription(
                                        event.target.value
                                    )
                                }
                                placeholder="e.g. Initial account funding"
                                maxLength={120}
                                disabled={creditLoading}
                            />


                            <div className="admin-credit-actions">

                                <button
                                    type="button"
                                    className="admin-credit-cancel"
                                    onClick={closeCreditForm}
                                    disabled={creditLoading}
                                >
                                    Cancel
                                </button>


                                <button
                                    type="submit"
                                    className="admin-credit-submit"
                                    disabled={creditLoading}
                                >
                                    {creditLoading
                                        ? "Processing..."
                                        : "Credit Account"}
                                </button>

                            </div>

                        </form>

                    </section>

                </div>

            )}


            {/* =====================================
               DEBIT ACCOUNT MODAL
            ===================================== */}

            {selectedDebitAccount &&
                selectedDebitCustomer && (

                <div
                    className="admin-debit-overlay"
                    onMouseDown={(event) => {

                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closeDebitForm();
                        }

                    }}
                >

                    <section
                        className="admin-debit-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="admin-debit-title"
                    >

                        <div className="admin-debit-modal-header">

                            <div>

                                <span>
                                    ACCOUNT OPERATION
                                </span>

                                <h2 id="admin-debit-title">
                                    Debit Account
                                </h2>

                            </div>


                            <button
                                type="button"
                                className="admin-debit-close"
                                onClick={closeDebitForm}
                                disabled={debitLoading}
                                aria-label="Close debit form"
                            >
                                <X size={20} />
                            </button>

                        </div>


                        <div className="admin-debit-account-summary">

                            <div>

                                <span>
                                    Customer
                                </span>

                                <strong>
                                    {selectedDebitCustomer.firstName}
                                    {" "}
                                    {selectedDebitCustomer.lastName}
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Account
                                </span>

                                <strong>
                                    {selectedDebitAccount.accountType}
                                </strong>

                                <small>
                                    {selectedDebitAccount.accountNumber}
                                </small>

                            </div>


                            <div>

                                <span>
                                    Current Balance
                                </span>

                                <strong>
                                    {formatCurrency(
                                        selectedDebitAccount.balance,
                                        selectedDebitAccount.currency
                                    )}
                                </strong>

                            </div>

                        </div>


                        {debitError && (

                            <div
                                className="admin-debit-error"
                                role="alert"
                            >
                                {debitError}
                            </div>

                        )}


                        {debitSuccess && (

                            <div
                                className="admin-debit-success"
                                role="status"
                            >
                                {debitSuccess}
                            </div>

                        )}


                        <form
                            className="admin-debit-form"
                            onSubmit={handleDebitAccount}
                        >

                            <label htmlFor="debit-amount">
                                Amount
                            </label>

                            <div className="admin-debit-amount">

                                <span>
                                    {selectedDebitAccount.currency}
                                </span>

                                <input
                                    id="debit-amount"
                                    type="number"
                                    min="0.01"
                                    max={selectedDebitAccount.balance}
                                    step="0.01"
                                    value={debitAmount}
                                    onChange={(event) =>
                                        setDebitAmount(
                                            event.target.value
                                        )
                                    }
                                    placeholder="0.00"
                                    required
                                    disabled={debitLoading}
                                />

                            </div>


                            <label htmlFor="debit-source">
                                Source
                            </label>

                            <select
                                id="debit-source"
                                value={debitSource}
                                onChange={(event) =>
                                    setDebitSource(
                                        event.target.value
                                    )
                                }
                                disabled={debitLoading}
                                required
                            >

                                {DEBIT_SOURCES.map(
                                    (source) => (

                                        <option
                                            key={source}
                                            value={source}
                                        >
                                            {source}
                                        </option>

                                    )
                                )}

                            </select>


                            <label htmlFor="debit-description">
                                Description
                            </label>

                            <input
                                id="debit-description"
                                type="text"
                                value={debitDescription}
                                onChange={(event) =>
                                    setDebitDescription(
                                        event.target.value
                                    )
                                }
                                placeholder="e.g. Account withdrawal"
                                maxLength={120}
                                disabled={debitLoading}
                            />


                            <div className="admin-debit-actions">

                                <button
                                    type="button"
                                    className="admin-debit-cancel"
                                    onClick={closeDebitForm}
                                    disabled={debitLoading}
                                >
                                    Cancel
                                </button>


                                <button
                                    type="submit"
                                    className="admin-debit-submit"
                                    disabled={debitLoading}
                                >
                                    {debitLoading
                                        ? "Processing..."
                                        : "Debit Account"}
                                </button>

                            </div>

                        </form>

                    </section>

                </div>

            )}


        {/* =====================================
   CREDIT DIGITAL ASSET MODAL
===================================== */}

{selectedDigitalCustomer && (

    <div
        className="admin-digital-credit-overlay"
        onMouseDown={(event) => {

            if (
                event.target ===
                event.currentTarget
            ) {
                closeDigitalAssetForm();
            }

        }}
    >

        <section
            className="admin-digital-credit-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-digital-credit-title"
        >

            <div className="admin-digital-credit-modal-header">

                <div>

                    <span>
                        DIGITAL ASSET OPERATION
                    </span>

                    <h2 id="admin-digital-credit-title">
                        Credit Digital Asset
                    </h2>

                </div>


                <button
                    type="button"
                    className="admin-digital-credit-close"
                    onClick={closeDigitalAssetForm}
                    disabled={digitalAssetLoading}
                    aria-label="Close digital asset credit form"
                >
                    <X size={20} />
                </button>

            </div>


            <div className="admin-digital-credit-customer">

                <div>

                    <span>
                        Customer
                    </span>

                    <strong>
                        {selectedDigitalCustomer.firstName}
                        {" "}
                        {selectedDigitalCustomer.lastName}
                    </strong>

                </div>


                <div>

                    <span>
                        Client Number
                    </span>

                    <strong>
                        {selectedDigitalCustomer.clientNumber}
                    </strong>

                </div>


                <div className="admin-digital-credit-current-balance">

                    <span>
                        Digital Asset Account
                    </span>

                    <strong>
                        Capital Bank Digital Assets
                    </strong>

                </div>

            </div>


            {digitalAssetError && (

                <div
                    className="admin-digital-credit-error"
                    role="alert"
                >
                    {digitalAssetError}
                </div>

            )}


            {digitalAssetSuccess && (

                <div
                    className="admin-digital-credit-success"
                    role="status"
                >
                    {digitalAssetSuccess}
                </div>

            )}


            <form
                className="admin-digital-credit-form"
                onSubmit={handleCreditDigitalAsset}
            >

                <label htmlFor="digital-asset-symbol">
                    Digital Asset
                </label>


                <select
                    id="digital-asset-symbol"
                    value={selectedDigitalAsset}
                    onChange={(event) =>
                        setSelectedDigitalAsset(
                            event.target.value
                        )
                    }
                    disabled={digitalAssetLoading}
                    required
                >

                    {DIGITAL_ASSETS.map(
                        (asset) => (

                            <option
                                key={asset.symbol}
                                value={asset.symbol}
                            >
                                {asset.asset} ({asset.symbol})
                            </option>

                        )
                    )}

                </select>


                <label htmlFor="digital-asset-quantity">
                    Quantity
                </label>


                <div className="admin-digital-credit-quantity">

                    <span>
                        {selectedDigitalAsset}
                    </span>

                    <input
                        id="digital-asset-quantity"
                        type="number"
                        min="0.00000001"
                        step="0.00000001"
                        value={digitalAssetQuantity}
                        onChange={(event) =>
                            setDigitalAssetQuantity(
                                event.target.value
                            )
                        }
                        placeholder="0.00000000"
                        required
                        disabled={digitalAssetLoading}
                    />

                </div>


                <label htmlFor="digital-asset-reference">
                    Reference
                </label>


                <input
                    id="digital-asset-reference"
                    type="text"
                    value={digitalAssetReference}
                    onChange={(event) =>
                        setDigitalAssetReference(
                            event.target.value
                        )
                    }
                    placeholder="e.g. ADMIN-CREDIT-001"
                    maxLength={120}
                    disabled={digitalAssetLoading}
                />


                <p className="admin-digital-credit-note">
                    This operation credits the selected digital asset directly to the customer's Capital Bank digital asset account.
                </p>


                <div className="admin-digital-credit-actions">

                    <button
                        type="button"
                        className="admin-digital-credit-cancel"
                        onClick={closeDigitalAssetForm}
                        disabled={digitalAssetLoading}
                    >
                        Cancel
                    </button>


                    <button
                        type="submit"
                        className="admin-digital-credit-submit"
                        disabled={digitalAssetLoading}
                    >
                        {digitalAssetLoading
                            ? "Processing..."
                            : "Credit Asset"}
                    </button>

                </div>

            </form>

        </section>

    </div>

)}

        </main>
    );
}




