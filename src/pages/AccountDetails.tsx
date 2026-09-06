import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./AccountDetails.css";

interface Account {
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

interface Transaction {
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

interface AccountResponse {
    success: boolean;
    data: {
        account: Account;
        transactions: Transaction[];
    };
    message?: string;
}

const API_BASE_URL =
    import.meta.env.VITE_API_URL ||
    (import.meta.env.PROD
        ? ""
        : "http://localhost:5000");

function AccountDetails() {
    const { accountId } = useParams();
    const { token } = useAuth();

    const [account, setAccount] =
        useState<Account | null>(null);

    const [transactions, setTransactions] =
        useState<Transaction[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    useEffect(() => {
        const loadAccount = async () => {
            if (!token || !accountId) {
                setError(
                    "Unable to load account information."
                );
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(
                    `${API_BASE_URL}/api/accounts/${accountId}`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type":
                                "application/json",
                        },
                    }
                );

                const data: AccountResponse =
                    await response.json();

                if (!response.ok || !data.success) {
                    throw new Error(
                        data.message ||
                            "Unable to load account."
                    );
                }

                setAccount(data.data.account);
                setTransactions(
                    data.data.transactions || []
                );
            } catch (err) {
                console.error(
                    "Account details error:",
                    err
                );

                setError(
                    err instanceof Error
                        ? err.message
                        : "Unable to load account information."
                );
            } finally {
                setLoading(false);
            }
        };

        loadAccount();
    }, [token, accountId]);

    const formatCurrency = (
        amount: number,
        currency: string
    ) => {
        try {
            return new Intl.NumberFormat(
                "en-CA",
                {
                    style: "currency",
                    currency:
                        currency || "CAD",
                }
            ).format(amount);
        } catch {
            return `${currency || "CAD"} ${amount.toFixed(
                2
            )}`;
        }
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString(
            "en-CA",
            {
                year: "numeric",
                month: "long",
                day: "numeric",
            }
        );
    };

    const formatDateTime = (date: string) => {
        return new Date(date).toLocaleDateString(
            "en-CA",
            {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
            }
        );
    };

    if (loading) {
        return (
            <div className="account-details-page">
                <div className="account-details-loading">
                    <div className="account-loader"></div>
                    <p>
                        Loading account
                        information...
                    </p>
                </div>
            </div>
        );
    }

    if (error || !account) {
        return (
            <div className="account-details-page">
                <div className="account-details-error">
                    <div className="error-icon">
                        !
                    </div>

                    <h2>
                        Unable to load
                        account
                    </h2>

                    <p>
                        {error ||
                            "The requested account could not be found."}
                    </p>

                    <Link
                        to="/dashboard"
                        className="account-back-button"
                    >
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="account-details-page">

            <header className="account-details-header">
                <div>
                    <Link
                        to="/dashboard"
                        className="account-back-link"
                    >
                        ← Back to Dashboard
                    </Link>

                    <div className="account-title">
                        <span className="account-icon">
                            C
                        </span>

                        <div>
                            <p className="account-label">
                                Account
                            </p>

                            <h1>
                                {account.accountType}
                            </h1>
                        </div>
                    </div>
                </div>

                <div
                    className={`account-status ${
                        account.status.toLowerCase()
                    }`}
                >
                    <span></span>
                    {account.status}
                </div>
            </header>

            <main className="account-details-container">

                {/* BALANCE CARD */}

                <section className="account-balance-card">

                    <div>
                        <p className="balance-label">
                            Available balance
                        </p>

                        <h2>
                            {formatCurrency(
                                account.balance,
                                account.currency
                            )}
                        </h2>

                        <p className="balance-currency">
                            {account.currency}
                        </p>
                    </div>

                    <div className="balance-symbol">
                        $
                    </div>

                </section>

                {/* ACCOUNT INFORMATION */}

                <section className="account-information-card">

                    <div className="section-heading">
                        <div>
                            <p className="section-eyebrow">
                                Account information
                            </p>

                            <h2>
                                Account details
                            </h2>
                        </div>
                    </div>

                    <div className="account-information-grid">

                        <div className="information-item">
                            <span>
                                Account type
                            </span>

                            <strong>
                                {account.accountType}
                            </strong>
                        </div>

                        <div className="information-item">
                            <span>
                                Account number
                            </span>

                            <strong className="account-number">
                                {account.accountNumber}
                            </strong>
                        </div>

                        <div className="information-item">
                            <span>
                                Currency
                            </span>

                            <strong>
                                {account.currency}
                            </strong>
                        </div>

                        <div className="information-item">
                            <span>
                                Status
                            </span>

                            <strong>
                                {account.status}
                            </strong>
                        </div>

                        <div className="information-item">
                            <span>
                                Date opened
                            </span>

                            <strong>
                                {formatDate(
                                    account.createdAt
                                )}
                            </strong>
                        </div>

                        <div className="information-item">
                            <span>
                                Last updated
                            </span>

                            <strong>
                                {formatDateTime(
                                    account.updatedAt
                                )}
                            </strong>
                        </div>

                    </div>

                </section>

                {/* RECENT ACTIVITY */}

                <section className="account-information-card">

                    <div className="section-heading">
                        <div>
                            <p className="section-eyebrow">
                                Account activity
                            </p>

                            <h2>
                                Recent transactions
                            </h2>
                        </div>
                    </div>

                    {transactions.length === 0 ? (
                        <div className="no-transactions">
                            <div className="no-transactions-icon">
                                $
                            </div>

                            <h3>
                                No transactions yet
                            </h3>

                            <p>
                                Transactions for this
                                account will appear
                                here.
                            </p>
                        </div>
                    ) : (
                        <div className="account-transactions">

                            {transactions.map(
                                (transaction) => (
                                    <div
                                        className="account-transaction"
                                        key={
                                            transaction._id
                                        }
                                    >

                                        <div className="transaction-left">

                                            <div
                                                className={`transaction-icon ${
                                                    transaction.direction
                                                }`}
                                            >
                                                {transaction.direction ===
                                                "credit"
                                                    ? "+"
                                                    : "−"}
                                            </div>

                                            <div>
                                                <strong>
                                                    {
                                                        transaction.name
                                                    }
                                                </strong>

                                                <span>
                                                    {
                                                        transaction.transactionType
                                                    }
                                                </span>
                                            </div>

                                        </div>

                                        <div className="transaction-right">

                                            <strong
                                                className={
                                                    transaction.direction ===
                                                    "credit"
                                                        ? "credit"
                                                        : "debit"
                                                }
                                            >
                                                {transaction.direction ===
                                                "credit"
                                                    ? "+"
                                                    : "−"}

                                                {formatCurrency(
                                                    transaction.amount,
                                                    account.currency
                                                )}
                                            </strong>

                                            <span>
                                                {
                                                    transaction.status
                                                }
                                            </span>

                                        </div>

                                    </div>
                                )
                            )}

                        </div>
                    )}

                </section>

            </main>

        </div>
    );
}

export default AccountDetails;