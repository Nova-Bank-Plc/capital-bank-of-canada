import {
    useEffect,
    useState,
} from "react";

import type {
    FormEvent,
} from "react";

import {
    Link,
    useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import "./Transfer.css";


// ======================================
// API
// ======================================

const API_BASE_URL =
    import.meta.env.VITE_API_URL ||
    (import.meta.env.PROD
        ? ""
        : "http://localhost:5000");


// ======================================
// TYPES
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


interface DashboardResponse {
    success: boolean;

    data: {
        accounts: ApiAccount[];
        totalBalance: number;
    };
}


interface TransferResponse {
    success: boolean;
    message: string;

    data?: {
        amount: number;
        fromAccountId: string;
        recipientAccountNumber: string;
        newBalance: number;
    };
}


// ======================================
// HELPERS
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
// TRANSFER PAGE
// ======================================

function Transfer() {

    const {
        user,
        token,
    } = useAuth();

    const navigate = useNavigate();


    const [
        accounts,
        setAccounts,
    ] = useState<ApiAccount[]>([]);


    const [
        selectedAccountId,
        setSelectedAccountId,
    ] = useState("");


    const [
        recipientAccountNumber,
        setRecipientAccountNumber,
    ] = useState("");


    const [
        amount,
        setAmount,
    ] = useState("");


    const [
        description,
        setDescription,
    ] = useState("");


    const [
        loading,
        setLoading,
    ] = useState(true);


    const [
        submitting,
        setSubmitting,
    ] = useState(false);


    const [
        error,
        setError,
    ] = useState("");


    const [
        success,
        setSuccess,
    ] = useState("");


    const [
        newBalance,
        setNewBalance,
    ] = useState<number | null>(null);


    // ======================================
    // LOAD CUSTOMER ACCOUNTS
    // ======================================

    useEffect(() => {

        const loadAccounts =
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
                            "Unable to load your accounts."
                        );

                    }


                    const data =
                        result as DashboardResponse;


                    if (!data.success) {

                        throw new Error(
                            "Unable to load your accounts."
                        );

                    }


                    const activeAccounts =
                        data.data.accounts.filter(
                            (account) =>
                                account.status ===
                                "active"
                        );


                    setAccounts(
                        activeAccounts
                    );


                    if (
                        activeAccounts.length > 0
                    ) {

                        setSelectedAccountId(
                            activeAccounts[0]._id
                        );

                    }

                } catch (
                    requestError
                ) {

                    console.error(
                        "Transfer account loading error:",
                        requestError
                    );


                    setError(
                        requestError instanceof Error
                            ? requestError.message
                            : "Unable to load your accounts."
                    );

                } finally {

                    setLoading(false);

                }

            };


        loadAccounts();

    }, [token]);


    // ======================================
    // SELECTED ACCOUNT
    // ======================================

    const selectedAccount =
        accounts.find(
            (account) =>
                account._id ===
                selectedAccountId
        );


    // ======================================
    // SUBMIT TRANSFER
    // ======================================

    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>
    ) => {

        event.preventDefault();


        setError("");
        setSuccess("");
        setNewBalance(null);


        if (!token) {

            setError(
                "Your session has expired. Please sign in again."
            );

            return;

        }


        if (!selectedAccountId) {

            setError(
                "Please select an account to transfer from."
            );

            return;

        }


        if (!recipientAccountNumber.trim()) {

            setError(
                "Please enter the recipient account number."
            );

            return;

        }


        const transferAmount =
            Number(amount);


        if (
            !Number.isFinite(
                transferAmount
            ) ||
            transferAmount <= 0
        ) {

            setError(
                "Please enter a valid transfer amount."
            );

            return;

        }


        if (
            selectedAccount &&
            transferAmount >
                selectedAccount.balance
        ) {

            setError(
                "You do not have enough funds for this transfer."
            );

            return;

        }


        setSubmitting(true);


        try {

            const response =
                await fetch(
                    `${API_BASE_URL}/api/transfers`,
                    {
                        method: "POST",

                        headers: {
                            Authorization:
                                `Bearer ${token}`,

                            "Content-Type":
                                "application/json",
                        },

                        body: JSON.stringify({
                            fromAccountId:
                                selectedAccountId,

                            recipientAccountNumber:
                                recipientAccountNumber.trim(),

                            amount:
                                transferAmount,

                            description:
                                description.trim(),
                        }),
                    }
                );


            const result =
                await response.json();


            const data =
                result as TransferResponse;


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Unable to complete transfer."
                );

            }


            if (!data.success) {

                throw new Error(
                    data.message ||
                    "Unable to complete transfer."
                );

            }


            setSuccess(
                data.message ||
                "Transfer completed successfully."
            );


            if (
                data.data?.newBalance !==
                undefined
            ) {

                setNewBalance(
                    data.data.newBalance
                );

            }


            // Update the displayed
            // source account balance

            if (
                data.data?.newBalance !==
                undefined
            ) {

                setAccounts(
                    (currentAccounts) =>
                        currentAccounts.map(
                            (account) =>
                                account._id ===
                                selectedAccountId
                                    ? {
                                        ...account,
                                        balance:
                                            data.data!
                                                .newBalance,
                                    }
                                    : account
                        )
                );

            }


            setRecipientAccountNumber("");
            setAmount("");
            setDescription("");

        } catch (
            requestError
        ) {

            console.error(
                "Transfer request error:",
                requestError
            );


            setError(
                requestError instanceof Error
                    ? requestError.message
                    : "Unable to complete transfer."
            );

        } finally {

            setSubmitting(false);

        }

    };


    // ======================================
    // FIRST NAME
    // ======================================

    const firstName =
        user?.firstName ||
        "there";


    // ======================================
    // RENDER
    // ======================================

    return (
        <main className="transfer-page">

            {/* =================================
                HEADER
            ================================= */}

            <header className="transfer-header">

                <Link
                    to="/dashboard"
                    className="transfer-logo"
                >

                    <span className="transfer-logo-mark">
                        C
                    </span>

                    <span className="transfer-logo-text">

                        CAPITAL

                        <small>
                            BANK OF CANADA
                        </small>

                    </span>

                </Link>


                <Link
                    to="/dashboard"
                    className="transfer-back"
                >
                    ← Dashboard
                </Link>

            </header>


            {/* =================================
                CONTENT
            ================================= */}

            <section className="transfer-content">

                <div className="transfer-container">


                    {/* =================================
                        INTRO
                    ================================= */}

                    <div className="transfer-intro">

                        <span className="transfer-eyebrow">
                            PERSONAL BANKING
                        </span>

                        <h1>
                            Transfer money
                        </h1>

                        <p>
                            Send money securely from
                            your Capital Bank account.
                        </p>

                    </div>


                    {/* =================================
                        ALERTS
                    ================================= */}

                    {error && (

                        <div
                            className="transfer-alert transfer-alert-error"
                            role="alert"
                        >

                            <span>
                                !
                            </span>

                            <div>
                                {error}
                            </div>

                        </div>

                    )}


                    {success && (

                        <div
                            className="transfer-alert transfer-alert-success"
                            role="status"
                        >

                            <span>
                                ✓
                            </span>

                            <div>

                                <strong>
                                    Transfer successful
                                </strong>

                                <p>
                                    {success}
                                </p>

                                {newBalance !== null && (
                                    <small>
                                        New available balance:{" "}
                                        {formatCurrency(
                                            newBalance,
                                            selectedAccount?.currency ||
                                            "CAD"
                                        )}
                                    </small>
                                )}

                            </div>

                        </div>

                    )}


                    <div className="transfer-grid">


                        {/* =================================
                            TRANSFER FORM
                        ================================= */}

                        <section className="transfer-card">

                            <div className="transfer-card-heading">

                                <div>

                                    <span>
                                        SEND MONEY
                                    </span>

                                    <h2>
                                        Make a transfer
                                    </h2>

                                </div>

                            </div>


                            <form
                                onSubmit={
                                    handleSubmit
                                }
                            >


                                {/* FROM ACCOUNT */}

                                <div className="transfer-field">

                                    <label htmlFor="fromAccount">
                                        From account
                                    </label>

                                    {loading ? (

                                        <div className="transfer-loading">
                                            Loading accounts...
                                        </div>

                                    ) : (

                                        <select
                                            id="fromAccount"
                                            value={
                                                selectedAccountId
                                            }
                                            onChange={(event) =>
                                                setSelectedAccountId(
                                                    event.target.value
                                                )
                                            }
                                            disabled={
                                                submitting ||
                                                accounts.length === 0
                                            }
                                        >

                                            {accounts.length === 0 ? (

                                                <option value="">
                                                    No active accounts
                                                </option>

                                            ) : (

                                                accounts.map(
                                                    (account) => (

                                                        <option
                                                            key={
                                                                account._id
                                                            }
                                                            value={
                                                                account._id
                                                            }
                                                        >

                                                            {account.accountType}
                                                            {" — "}
                                                            {account.accountNumber}

                                                        </option>

                                                    )
                                                )

                                            )}

                                        </select>

                                    )}

                                </div>


                                {/* AVAILABLE BALANCE */}

                                {selectedAccount && (

                                    <div className="transfer-available">

                                        <span>
                                            AVAILABLE BALANCE
                                        </span>

                                        <strong>
                                            {formatCurrency(
                                                selectedAccount.balance,
                                                selectedAccount.currency
                                            )}
                                        </strong>

                                    </div>

                                )}


                                {/* RECIPIENT */}

                                <div className="transfer-field">

                                    <label htmlFor="recipientAccount">
                                        Recipient account number
                                    </label>

                                    <input
                                        id="recipientAccount"
                                        type="text"
                                        value={
                                            recipientAccountNumber
                                        }
                                        onChange={(event) =>
                                            setRecipientAccountNumber(
                                                event.target.value
                                            )
                                        }
                                        placeholder="Enter account number"
                                        autoComplete="off"
                                        disabled={
                                            submitting
                                        }
                                    />

                                    <small>
                                        Enter the Capital Bank
                                        account number of the recipient.
                                    </small>

                                </div>


                                {/* AMOUNT */}

                                <div className="transfer-field">

                                    <label htmlFor="transferAmount">
                                        Amount
                                    </label>

                                    <div className="transfer-amount-input">

                                        <span>
                                            $
                                        </span>

                                        <input
                                            id="transferAmount"
                                            type="number"
                                            min="0.01"
                                            step="0.01"
                                            value={
                                                amount
                                            }
                                            onChange={(event) =>
                                                setAmount(
                                                    event.target.value
                                                )
                                            }
                                            placeholder="0.00"
                                            disabled={
                                                submitting
                                            }
                                        />

                                        <span>
                                            CAD
                                        </span>

                                    </div>

                                </div>


                                {/* DESCRIPTION */}

                                <div className="transfer-field">

                                    <label htmlFor="description">
                                        Description
                                        <span>
                                            Optional
                                        </span>
                                    </label>

                                    <input
                                        id="description"
                                        type="text"
                                        value={
                                            description
                                        }
                                        onChange={(event) =>
                                            setDescription(
                                                event.target.value
                                            )
                                        }
                                        placeholder="e.g. Rent, family support"
                                        maxLength={100}
                                        disabled={
                                            submitting
                                        }
                                    />

                                </div>


                                {/* SUBMIT */}

                                <button
                                    type="submit"
                                    className="transfer-submit"
                                    disabled={
                                        submitting ||
                                        loading ||
                                        accounts.length === 0
                                    }
                                >

                                    {submitting
                                        ? "Processing transfer..."
                                        : "Continue transfer →"
                                    }

                                </button>

                            </form>

                        </section>


                        {/* =================================
                            SECURITY / INFORMATION
                        ================================= */}

                        <aside className="transfer-side">


                            <div className="transfer-info-card">

                                <div className="transfer-info-icon">
                                    ✓
                                </div>

                                <span>
                                    SECURE BANKING
                                </span>

                                <h2>
                                    Transfer with confidence.
                                </h2>

                                <p>
                                    Your transfer is processed
                                    securely through Capital Bank's
                                    protected banking system.
                                </p>

                            </div>


                            <div className="transfer-summary-card">

                                <span>
                                    TRANSFER SUMMARY
                                </span>

                                <div className="transfer-summary-row">

                                    <span>
                                        From
                                    </span>

                                    <strong>
                                        {selectedAccount
                                            ? selectedAccount.accountNumber
                                            : "—"}
                                    </strong>

                                </div>


                                <div className="transfer-summary-row">

                                    <span>
                                        Recipient
                                    </span>

                                    <strong>
                                        {recipientAccountNumber ||
                                            "—"}
                                    </strong>

                                </div>


                                <div className="transfer-summary-row">

                                    <span>
                                        Amount
                                    </span>

                                    <strong>
                                        {amount
                                            ? formatCurrency(
                                                Number(amount)
                                            )
                                            : "$0.00"}
                                    </strong>

                                </div>

                            </div>


                            <div className="transfer-help-card">

                                <strong>
                                    Need help?
                                </strong>

                                <p>
                                    If you don't recognize an
                                    account or transfer, contact
                                    Capital Bank support immediately.
                                </p>

                            </div>

                        </aside>

                    </div>


                    {/* =================================
                        FOOTER NOTE
                    ================================= */}

                    <div className="transfer-footer">

                        <span>
                            Logged in as {firstName}
                        </span>

                        <button
                            type="button"
                            onClick={() =>
                                navigate("/dashboard")
                            }
                        >
                            Return to dashboard
                        </button>

                    </div>

                </div>

            </section>

        </main>
    );
}


export default Transfer;