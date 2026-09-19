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

import "./Cards.css";


interface ApiAccount {
    _id: string;
    accountType: string;
    accountNumber: string;
    balance: number;
    currency: string;
    status: string;
}


interface ApiCard {
    _id: string;
    userId: string;
    accountId: string;

    cardType:
        | "debit"
        | "credit";

    cardName: string;

    cardNumberLast4: string;

    expiryMonth?: number;

    expiryYear?: number;

    status:
        | "pending"
        | "active"
        | "frozen"
        | "blocked"
        | "expired";

    currency: string;

    issuedDate?: string;

    frozenDate?: string;

    blockedDate?: string;

    createdAt: string;

    updatedAt: string;
}


interface CardRequest {
    _id: string;

    userId: string;

    accountId: string;

    cardType:
        | "debit"
        | "credit";

    requestType:
        | "new"
        | "replacement";

    status:
        | "pending"
        | "approved"
        | "rejected"
        | "completed"
        | "cancelled";

    reason?: string;

    requestedAt: string;

    processedAt?: string;

    createdAt: string;

    updatedAt: string;
}


interface DashboardResponse {
    success: boolean;

    data: {
        accounts: ApiAccount[];
    };
}


interface CardsResponse {
    success: boolean;

    data: {
        cards: ApiCard[];
    };
}


interface CardRequestsResponse {
    success: boolean;

    data: {
        requests: CardRequest[];
    };
}


interface RequestCardResponse {
    success: boolean;

    message: string;

    data: {
        request: CardRequest;
    };
}


interface CardActionResponse {
    success: boolean;

    message: string;

    data: {
        card: ApiCard;
    };
}


const API_BASE_URL =
    import.meta.env.VITE_API_URL ||
    (
        import.meta.env.PROD
            ? ""
            : "http://localhost:5000"
    );


function formatAccountType(
    accountType: string
) {

    return accountType
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, (letter) =>
            letter.toUpperCase()
        );

}


function formatDate(
    value: string
) {

    if (!value) {
        return "";
    }

    return new Intl.DateTimeFormat(
        "en-CA",
        {
            year: "numeric",
            month: "short",
            day: "numeric",
        }
    ).format(
        new Date(value)
    );

}


function formatStatus(
    status: string
) {

    return status
        .charAt(0)
        .toUpperCase() +
        status.slice(1);

}


function Cards() {

    const {
        token,
    } = useAuth();


    const [
        accounts,
        setAccounts,
    ] = useState<ApiAccount[]>([]);


    const [
        cards,
        setCards,
    ] = useState<ApiCard[]>([]);


    const [
        requests,
        setRequests,
    ] = useState<CardRequest[]>([]);


    const [
        loading,
        setLoading,
    ] = useState(true);


    const [
        error,
        setError,
    ] = useState("");


    const [
        submitting,
        setSubmitting,
    ] = useState(false);


    const [
        actionLoading,
        setActionLoading,
    ] = useState("");


    const [
        showRequestForm,
        setShowRequestForm,
    ] = useState(false);


    const [
        selectedAccount,
        setSelectedAccount,
    ] = useState("");


    const [
        cardType,
        setCardType,
    ] = useState<
        "debit" | "credit"
    >("debit");


    const [
        requestType,
        setRequestType,
    ] = useState<
        "new" | "replacement"
    >("new");


    const [
        reason,
        setReason,
    ] = useState("");


    const loadData =
        async () => {

            if (!token) {
                setLoading(false);
                return;
            }


            try {

                setLoading(true);

                setError("");


                const [
                    dashboardResponse,
                    cardsResponse,
                    requestsResponse,
                ] = await Promise.all([

                    fetch(
                        `${API_BASE_URL}/api/dashboard`,
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`,
                            },
                        }
                    ),

                    fetch(
                        `${API_BASE_URL}/api/cards`,
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`,
                            },
                        }
                    ),

                    fetch(
                        `${API_BASE_URL}/api/cards/requests`,
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`,
                            },
                        }
                    ),

                ]);


                 const dashboardResult: DashboardResponse =
    await dashboardResponse.json();


                 const cardsResult: CardsResponse =
    await cardsResponse.json();


                const requestsResult: CardRequestsResponse =
                    await requestsResponse.json();


                if (
                    !dashboardResponse.ok ||
                    !dashboardResult.success
                ) {

                    throw new Error(
                        "Unable to load your accounts."
                    );

                }


                if (
                    !cardsResponse.ok ||
                    !cardsResult.success
                ) {

                    throw new Error(
                        "Unable to load your cards."
                    );

                }


                if (
                    !requestsResponse.ok ||
                    !requestsResult.success
                ) {

                    throw new Error(
                        "Unable to load your card requests."
                    );

                }


                setAccounts(
                    dashboardResult.data.accounts
                );


                setCards(
                    cardsResult.data.cards
                );


                setRequests(
                    requestsResult.data.requests
                );


            } catch (err) {

                console.error(
                    "Cards page error:",
                    err
                );


                setError(
                    err instanceof Error
                        ? err.message
                        : "Unable to load your card information."
                );


            } finally {

                setLoading(false);

            }

        };


    useEffect(() => {

        loadData();

    }, [token]);


    const submitCardRequest =
        async () => {

            if (!token) {
                return;
            }


            if (!selectedAccount) {

                setError(
                    "Please select the account you want the card connected to."
                );

                return;

            }


            try {

                setSubmitting(true);

                setError("");


                const response =
                    await fetch(
                        `${API_BASE_URL}/api/cards/requests`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json",

                                Authorization:
                                    `Bearer ${token}`,
                            },

                            body: JSON.stringify({

                                accountId:
                                    selectedAccount,

                                cardType,

                                requestType,

                                reason:
                                    reason.trim() ||
                                    undefined,

                            }),

                        }
                    );


                 const result: RequestCardResponse =
    await response.json();


                if (
                    !response.ok ||
                    !result.success
                ) {

                    throw new Error(
                        result.message ||
                        "Unable to submit your card request."
                    );

                }


                setRequests(
                    (current) => [
                        result.data.request,
                        ...current,
                    ]
                );


                setShowRequestForm(false);

                setSelectedAccount("");

                setCardType("debit");

                setRequestType("new");

                setReason("");


            } catch (err) {

                console.error(
                    "Card request error:",
                    err
                );


                setError(
                    err instanceof Error
                        ? err.message
                        : "Unable to submit your card request."
                );


            } finally {

                setSubmitting(false);

            }

        };


    const toggleFreeze =
        async (
            card: ApiCard
        ) => {

            if (!token) {
                return;
            }


            if (
                card.status !== "active" &&
                card.status !== "frozen"
            ) {

                return;

            }


            try {

                setActionLoading(
                    card._id
                );

                setError("");


                const response =
                    await fetch(
                        `${API_BASE_URL}/api/cards/${card._id}/freeze`,
                        {
                            method: "PATCH",

                            headers: {
                                Authorization:
                                    `Bearer ${token}`,
                            },
                        }
                    );


                const result: CardActionResponse =
    await response.json();


                if (
                    !response.ok ||
                    !result.success
                ) {

                    throw new Error(
                        result.message ||
                        "Unable to update your card."
                    );

                }


                setCards(
                    (current) =>
                        current.map(
                            (item) =>
                                item._id === card._id
                                    ? result.data.card
                                    : item
                        )
                );


            } catch (err) {

                console.error(
                    "Freeze card error:",
                    err
                );


                setError(
                    err instanceof Error
                        ? err.message
                        : "Unable to update your card."
                );


            } finally {

                setActionLoading("");

            }

        };


    const getAccount =
        (accountId: string) => {

            return accounts.find(
                (account) =>
                    account._id === accountId
            );

        };


    const getCardTypeLabel =
        (type: "debit" | "credit") =>
            type === "credit"
                ? "Credit"
                : "Debit";


    if (loading) {

        return (

            <div className="cards-page">

                <header className="cards-header">

                    <div className="cards-header-inner">

                        <Link
                            to="/dashboard"
                            className="cards-back-link"
                        >
                            ← Dashboard
                        </Link>


                        <div className="cards-header-title">

                            <span className="cards-header-icon">
                                ▭
                            </span>

                            <div>

                                <h1>
                                    Cards
                                </h1>

                                <p>
                                    Manage your Capital Bank cards
                                </p>

                            </div>

                        </div>

                    </div>

                </header>


                <main className="cards-main">

                    <div className="cards-loading">

                        <div className="cards-loading-spinner" />

                        <span>
                            Loading your card information...
                        </span>

                    </div>

                </main>

            </div>

        );

    }


    return (

        <div className="cards-page">

            {/* =========================================
                HEADER
            ========================================= */}

            <header className="cards-header">

                <div className="cards-header-inner">

                    <Link
                        to="/dashboard"
                        className="cards-back-link"
                    >
                        ← Dashboard
                    </Link>


                    <div className="cards-header-title">

                        <span className="cards-header-icon">
                            ▭
                        </span>

                        <div>

                            <h1>
                                Cards
                            </h1>

                            <p>
                                Manage your Capital Bank cards
                            </p>

                        </div>

                    </div>

                </div>

            </header>


            {/* =========================================
                MAIN
            ========================================= */}

            <main className="cards-main">

                <section className="cards-intro">

                    <div>

                        <span className="cards-eyebrow">
                            CARD SERVICES
                        </span>

                        <h2>
                            Manage your cards
                        </h2>

                        <p>
                            View your issued cards, manage
                            card controls, and request a new
                            card securely.
                        </p>

                    </div>


                    <button
                        type="button"
                        className="cards-primary-button"
                        onClick={() =>
                            setShowRequestForm(
                                true
                            )
                        }
                    >
                        + Request a card
                    </button>

                </section>


                {error && (

                    <div className="cards-error">

                        <span>
                            !
                        </span>

                        <p>
                            {error}
                        </p>

                        <button
                            type="button"
                            onClick={() =>
                                setError("")
                            }
                            aria-label="Dismiss error"
                        >
                            ×
                        </button>

                    </div>

                )}


                {/* =========================================
                    CARD REQUEST FORM
                ========================================= */}

                {showRequestForm && (

                    <section className="cards-request-panel">

                        <div className="cards-request-heading">

                            <div>

                                <span className="cards-eyebrow">
                                    NEW REQUEST
                                </span>

                                <h2>
                                    Request a card
                                </h2>

                                <p>
                                    Your request will be reviewed
                                    and processed by Capital Bank.
                                </p>

                            </div>


                            <button
                                type="button"
                                className="cards-close-button"
                                onClick={() =>
                                    setShowRequestForm(false)
                                }
                                aria-label="Close card request form"
                            >
                                ×
                            </button>

                        </div>


                        <div className="cards-form-grid">

                            <label className="cards-form-field">

                                <span>
                                    Account
                                </span>

                                <select
                                    value={selectedAccount}
                                    onChange={(event) =>
                                        setSelectedAccount(
                                            event.target.value
                                        )
                                    }
                                >

                                    <option value="">
                                        Select an account
                                    </option>

                                    {accounts
                                        .filter(
                                            (account) =>
                                                account.status
                                                    .toLowerCase() ===
                                                "active"
                                        )
                                        .map(
                                            (account) => (

                                                <option
                                                    key={account._id}
                                                    value={account._id}
                                                >
                                                    {formatAccountType(
                                                        account.accountType
                                                    )}{" "}
                                                    ••••{" "}
                                                    {account.accountNumber.slice(
                                                        -4
                                                    )}
                                                </option>

                                            )
                                        )}

                                </select>

                            </label>


                            <label className="cards-form-field">

                                <span>
                                    Card type
                                </span>

                                <select
                                    value={cardType}
                                    onChange={(event) =>
                                        setCardType(
                                            event.target.value as
                                                | "debit"
                                                | "credit"
                                        )
                                    }
                                >

                                    <option value="debit">
                                        Debit card
                                    </option>

                                    <option value="credit">
                                        Credit card
                                    </option>

                                </select>

                            </label>


                            <label className="cards-form-field">

                                <span>
                                    Request type
                                </span>

                                <select
                                    value={requestType}
                                    onChange={(event) =>
                                        setRequestType(
                                            event.target.value as
                                                | "new"
                                                | "replacement"
                                        )
                                    }
                                >

                                    <option value="new">
                                        New card
                                    </option>

                                    <option value="replacement">
                                        Replacement card
                                    </option>

                                </select>

                            </label>


                            <label className="cards-form-field cards-form-field-full">

                                <span>
                                    Reason{" "}
                                    <small>
                                        Optional
                                    </small>
                                </span>

                                <textarea
                                    value={reason}
                                    onChange={(event) =>
                                        setReason(
                                            event.target.value
                                        )
                                    }
                                    maxLength={500}
                                    placeholder={
                                        requestType ===
                                        "replacement"
                                            ? "Tell us why you need a replacement card..."
                                            : "Add any information relevant to your request..."
                                    }
                                />

                                <small className="cards-character-count">
                                    {reason.length}/500
                                </small>

                            </label>

                        </div>


                        <div className="cards-request-security">

                            <span className="cards-security-icon">
                                ✓
                            </span>

                            <div>

                                <strong>
                                    Secure card request
                                </strong>

                                <p>
                                    No card number or CVV is
                                    created in your browser.
                                    Card credentials are issued
                                    only through the bank's
                                    authorized card process.
                                </p>

                            </div>

                        </div>


                        <div className="cards-form-actions">

                            <button
                                type="button"
                                className="cards-secondary-button"
                                onClick={() =>
                                    setShowRequestForm(false)
                                }
                                disabled={submitting}
                            >
                                Cancel
                            </button>


                            <button
                                type="button"
                                className="cards-primary-button"
                                onClick={
                                    submitCardRequest
                                }
                                disabled={
                                    submitting ||
                                    !selectedAccount
                                }
                            >
                                {submitting
                                    ? "Submitting..."
                                    : "Submit request"}
                            </button>

                        </div>

                    </section>

                )}


                {/* =========================================
                    ISSUED CARDS
                ========================================= */}

                <section className="cards-list-section">

                    <div className="cards-section-heading">

                        <div>

                            <span className="cards-eyebrow">
                                ISSUED CARDS
                            </span>

                            <h2>
                                Your cards
                            </h2>

                        </div>

                    </div>


                    {cards.length === 0 ? (

                        <div className="cards-empty-card">

                            <div className="cards-empty-icon">
                                ▭
                            </div>

                            <h3>
                                No issued cards
                            </h3>

                            <p>
                                You don't currently have an
                                issued Capital Bank card.
                                Submit a card request to begin
                                the application process.
                            </p>

                            <button
                                type="button"
                                className="cards-empty-button"
                                onClick={() =>
                                    setShowRequestForm(true)
                                }
                            >
                                Request a card
                            </button>

                        </div>

                    ) : (

                        <div className="cards-list">

                            {cards.map(
                                (card) => {

                                    const account =
                                        getAccount(
                                            card.accountId
                                        );


                                    return (

                                        <article
                                            key={card._id}
                                            className={`bank-card-wrapper ${
                                                card.status ===
                                                "frozen"
                                                    ? "is-frozen"
                                                    : ""
                                            }`}
                                        >

                                            <div className="bank-card">

                                                <div className="bank-card-top">

                                                    <span>
                                                        CAPITAL BANK
                                                    </span>

                                                    <span className="bank-card-type">
                                                        {getCardTypeLabel(
                                                            card.cardType
                                                        )}
                                                    </span>

                                                </div>


                                                <div className="bank-card-chip">
                                                    ▦
                                                </div>


                                                <div className="bank-card-number">

                                                    •••• •••• ••••{" "}
                                                    {card.cardNumberLast4}

                                                </div>


                                                <div className="bank-card-bottom">

                                                    <div>

                                                        <small>
                                                            CARD
                                                        </small>

                                                        <strong>
                                                            {card.cardName}
                                                        </strong>

                                                    </div>


                                                    <div>

                                                        <small>
                                                            STATUS
                                                        </small>

                                                        <strong>
                                                            {formatStatus(
                                                                card.status
                                                            )}
                                                        </strong>

                                                    </div>

                                                </div>

                                            </div>


                                            <div className="bank-card-details">

                                                <div className="bank-card-title-row">

                                                    <div>

                                                        <h3>
                                                            {card.cardName}
                                                        </h3>

                                                        <span
                                                            className={`card-status status-${card.status}`}
                                                        >
                                                            {formatStatus(
                                                                card.status
                                                            )}
                                                        </span>

                                                    </div>

                                                </div>


                                                <div className="bank-card-info-grid">

                                                    <div>

                                                        <span>
                                                            Card number
                                                        </span>

                                                        <strong>
                                                            ••••{" "}
                                                            {card.cardNumberLast4}
                                                        </strong>

                                                    </div>


                                                    <div>

                                                        <span>
                                                            Connected account
                                                        </span>

                                                        <strong>
                                                            {account
                                                                ? `${formatAccountType(
                                                                    account.accountType
                                                                )} •••• ${account.accountNumber.slice(
                                                                    -4
                                                                )}`
                                                                : "Account"}
                                                        </strong>

                                                    </div>


                                                    <div>

                                                        <span>
                                                            Currency
                                                        </span>

                                                        <strong>
                                                            {card.currency}
                                                        </strong>

                                                    </div>


                                                    <div>

                                                        <span>
                                                            Issued
                                                        </span>

                                                        <strong>
                                                            {card.issuedDate
                                                                ? formatDate(
                                                                    card.issuedDate
                                                                )
                                                                : "Pending"}
                                                        </strong>

                                                    </div>

                                                </div>


                                                {card.status ===
                                                    "active" ||
                                                card.status ===
                                                    "frozen" ? (

                                                    <div className="bank-card-actions">

                                                        <button
                                                            type="button"
                                                            className={
                                                                card.status ===
                                                                "frozen"
                                                                    ? "card-action-button"
                                                                    : "card-action-button danger"
                                                            }
                                                            onClick={() =>
                                                                toggleFreeze(
                                                                    card
                                                                )
                                                            }
                                                            disabled={
                                                                actionLoading ===
                                                                card._id
                                                            }
                                                        >
                                                            {actionLoading ===
                                                            card._id
                                                                ? "Updating..."
                                                                : card.status ===
                                                                  "frozen"
                                                                    ? "Unfreeze card"
                                                                    : "Freeze card"}
                                                        </button>

                                                    </div>

                                                ) : null}


                                                {card.status ===
                                                    "frozen" && (

                                                    <div className="cards-status-note">

                                                        <span>
                                                            !
                                                        </span>

                                                        <p>
                                                            This card is
                                                            currently frozen.
                                                            Card transactions
                                                            should remain
                                                            disabled until
                                                            you unfreeze it.
                                                        </p>

                                                    </div>

                                                )}

                                            </div>

                                        </article>

                                    );

                                }
                            )}

                        </div>

                    )}

                </section>


                {/* =========================================
                    REQUEST HISTORY
                ========================================= */}

                {requests.length > 0 && (

                    <section className="cards-requests-section">

                        <div className="cards-section-heading">

                            <div>

                                <span className="cards-eyebrow">
                                    REQUEST HISTORY
                                </span>

                                <h2>
                                    Card requests
                                </h2>

                            </div>

                        </div>


                        <div className="cards-request-list">

                            {requests.map(
                                (request) => {

                                    const account =
                                        getAccount(
                                            request.accountId
                                        );


                                    return (

                                        <article
                                            key={request._id}
                                            className="cards-request-item"
                                        >

                                            <div className="cards-request-item-icon">
                                                ▭
                                            </div>


                                            <div className="cards-request-item-main">

                                                <div className="cards-request-item-title">

                                                    <h3>
                                                        {getCardTypeLabel(
                                                            request.cardType
                                                        )}{" "}
                                                        card
                                                    </h3>

                                                    <span
                                                        className={`request-status request-${request.status}`}
                                                    >
                                                        {formatStatus(
                                                            request.status
                                                        )}
                                                    </span>

                                                </div>


                                                <p>
                                                    {request.requestType ===
                                                    "replacement"
                                                        ? "Replacement request"
                                                        : "New card request"}

                                                    {account
                                                        ? ` • ${formatAccountType(
                                                            account.accountType
                                                        )} •••• ${account.accountNumber.slice(
                                                            -4
                                                        )}`
                                                        : ""}

                                                </p>


                                                <small>
                                                    Requested{" "}
                                                    {formatDate(
                                                        request.requestedAt
                                                    )}
                                                </small>

                                                {request.reason && (

                                                    <div className="cards-request-reason">

                                                        <span>
                                                            Reason
                                                        </span>

                                                        <p>
                                                            {request.reason}
                                                        </p>

                                                    </div>

                                                )}

                                            </div>

                                        </article>

                                    );

                                }
                            )}

                        </div>

                    </section>

                )}


                {/* =========================================
                    CARD SERVICES
                ========================================= */}

                <section className="cards-services">

                    <div className="cards-section-heading">

                        <div>

                            <span className="cards-eyebrow">
                                CARD SERVICES
                            </span>

                            <h2>
                                Need help?
                            </h2>

                        </div>

                    </div>


                    <div className="cards-service-grid">

                        <button
                            type="button"
                            className="cards-service-card"
                            onClick={() =>
                                setShowRequestForm(true)
                            }
                        >

                            <span className="cards-service-icon">
                                +
                            </span>

                            <span className="cards-service-content">

                                <strong>
                                    Request a card
                                </strong>

                                <small>
                                    Submit a new or replacement
                                    card request securely.
                                </small>

                            </span>

                            <span className="cards-service-arrow">
                                →
                            </span>

                        </button>


                        <Link
                            to="/dashboard"
                            className="cards-service-card"
                        >

                            <span className="cards-service-icon">
                                ?
                            </span>

                            <span className="cards-service-content">

                                <strong>
                                    Card support
                                </strong>

                                <small>
                                    Return to your banking dashboard
                                    for support and assistance.
                                </small>

                            </span>

                            <span className="cards-service-arrow">
                                →
                            </span>

                        </Link>

                    </div>

                </section>

            </main>

        </div>

    );

}


export default Cards;