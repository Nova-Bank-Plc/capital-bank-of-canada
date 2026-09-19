import {
    useEffect,
    useMemo,
    useState,
} from "react";

import type {
    FormEvent,
} from "react";

import {
    ArrowLeft,
    CheckCircle2,
    CreditCard,
    History,
    Plus,
    Receipt,
    Wallet,
    X,
} from "lucide-react";

import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import "./Payments.css";


const API_BASE_URL =
    import.meta.env.VITE_API_URL ||
    (
        import.meta.env.PROD
            ? ""
            : "http://localhost:5000"
    );


interface Biller {
    _id: string;
    name: string;
    category: string;
    description?: string;
    status: "active" | "inactive";
}


interface Payee {
    _id: string;

    billerId:
        | string
        | Biller;

    nickname?: string;

    accountReference: string;

    status:
        | "active"
        | "inactive";
}


interface Account {
    _id: string;

    accountType: string;

    accountNumber: string;

    balance: number;

    currency: string;

    status: string;
}


interface Payment {
    _id: string;

    accountId:
        | string
        | Account;

    billerId:
        | string
        | Biller;

    payeeId:
        | string
        | Payee;

    amount: number;

    currency: string;

    reference: string;

    status:
        | "pending"
        | "processing"
        | "completed"
        | "failed"
        | "cancelled";

    description?: string;

    failureReason?: string;

    createdAt: string;

    processedAt?: string;
}


interface ApiEnvelope {
    success?: boolean;

    message?: string;

    data?: unknown;

    billers?: unknown;

    payees?: unknown;

    payments?: unknown;
}


interface BillPaymentResponse {
    payment?: Payment;

    reference?: string;
}


function getBillerName(
    billerId:
        | string
        | Biller,
    billers: Biller[]
): string {

    if (
        typeof billerId !== "string"
    ) {
        return billerId.name;
    }

    return (
        billers.find(
            biller =>
                biller._id === billerId
        )?.name ||
        "Unknown biller"
    );
}


function getPayeeReference(
    payeeId:
        | string
        | Payee,
    payees: Payee[]
): string {

    if (
        typeof payeeId !== "string"
    ) {
        return payeeId.accountReference;
    }

    return (
        payees.find(
            payee =>
                payee._id === payeeId
        )?.accountReference ||
        "—"
    );
}


function getPayeeName(
    payeeId:
        | string
        | Payee,
    payees: Payee[]
): string {

    if (
        typeof payeeId !== "string"
    ) {
        return (
            payeeId.nickname ||
            payeeId.accountReference
        );
    }

    const payee =
        payees.find(
            item =>
                item._id === payeeId
        );

    return (
        payee?.nickname ||
        payee?.accountReference ||
        "Unknown payee"
    );
}


function formatCurrency(
    amount: number,
    currency = "CAD"
): string {

    return new Intl.NumberFormat(
        "en-CA",
        {
            style: "currency",
            currency,
        }
    ).format(amount);
}


function formatDate(
    value: string
): string {

    return new Intl.DateTimeFormat(
        "en-CA",
        {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }
    ).format(
        new Date(value)
    );
}


/*
 * Supports:
 *
 * data: [...]
 *
 * data: {
 *     billers: [...]
 * }
 *
 * data: {
 *     data: [...]
 * }
 *
 * and similar response structures.
 */
function extractList<T>(
    value: unknown,
    possibleKeys: string[]
): T[] {

    if (Array.isArray(value)) {
        return value as T[];
    }

    if (
        !value ||
        typeof value !== "object"
    ) {
        return [];
    }

    const object =
        value as Record<string, unknown>;

    for (
        const key of possibleKeys
    ) {

        const directValue =
            object[key];

        if (
            Array.isArray(
                directValue
            )
        ) {
            return directValue as T[];
        }
    }

    if (
        object.data &&
        typeof object.data === "object"
    ) {

        const nested =
            object.data as Record<
                string,
                unknown
            >;

        if (
            Array.isArray(
                nested.data
            )
        ) {
            return nested.data as T[];
        }

        for (
            const key of possibleKeys
        ) {

            const nestedValue =
                nested[key];

            if (
                Array.isArray(
                    nestedValue
                )
            ) {
                return nestedValue as T[];
            }
        }
    }

    return [];
}


async function readApiResponse(
    response: Response
): Promise<ApiEnvelope> {

    const data =
        await response.json()
            .catch(
                () => ({})
            ) as ApiEnvelope;

    if (!response.ok) {

        throw new Error(
            data.message ||
            `Request failed with status ${response.status}.`
        );
    }

    return data;
}


const Payments = () => {

    const {
        token,
        logout,
    } = useAuth();


    const [
        accounts,
        setAccounts,
    ] = useState<Account[]>([]);


    const [
        billers,
        setBillers,
    ] = useState<Biller[]>([]);


    const [
        payees,
        setPayees,
    ] = useState<Payee[]>([]);


    const [
        payments,
        setPayments,
    ] = useState<Payment[]>([]);


    const [
        selectedAccountId,
        setSelectedAccountId,
    ] = useState("");


    const [
        selectedBillerId,
        setSelectedBillerId,
    ] = useState("");


    const [
        selectedPayeeId,
        setSelectedPayeeId,
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
        showPayeeForm,
        setShowPayeeForm,
    ] = useState(false);


    const [
        payeeNickname,
        setPayeeNickname,
    ] = useState("");


    const [
        payeeReference,
        setPayeeReference,
    ] = useState("");


    const [
        payeeBillerId,
        setPayeeBillerId,
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
        addingPayee,
        setAddingPayee,
    ] = useState(false);


    const [
        message,
        setMessage,
    ] = useState("");


    const [
        error,
        setError,
    ] = useState("");


    const [
        successReference,
        setSuccessReference,
    ] = useState("");


    const selectedAccount =
        useMemo(
            () =>
                accounts.find(
                    account =>
                        account._id ===
                        selectedAccountId
                ),
            [
                accounts,
                selectedAccountId,
            ]
        );


    const selectedBiller =
        useMemo(
            () =>
                billers.find(
                    biller =>
                        biller._id ===
                        selectedBillerId
                ),
            [
                billers,
                selectedBillerId,
            ]
        );


    /*
     * Only active billers should be
     * presented to customers.
     */
    const activeBillers =
        useMemo(
            () =>
                billers.filter(
                    biller =>
                        biller.status ===
                        "active"
                ),
            [billers]
        );


    const filteredPayees =
        useMemo(
            () => {

                if (
                    !selectedBillerId
                ) {
                    return payees;
                }

                return payees.filter(
                    payee => {

                        const billerId =
                            typeof payee.billerId ===
                            "string"
                                ? payee.billerId
                                : payee.billerId._id;

                        return (
                            billerId ===
                            selectedBillerId
                        );
                    }
                );
            },
            [
                payees,
                selectedBillerId,
            ]
        );


    useEffect(() => {

        const loadPaymentData =
            async () => {

                if (!token) {
                    setLoading(false);
                    return;
                }

                try {

                    setError("");
                    setMessage("");

                    const headers = {
                        Authorization:
                            `Bearer ${token}`,
                    };


                    const [
                        dashboardResponse,
                        billersResponse,
                        payeesResponse,
                        historyResponse,
                    ] =
                        await Promise.all([
                            fetch(
                                `${API_BASE_URL}/api/dashboard`,
                                {
                                    headers,
                                }
                            ),

                            fetch(
                                `${API_BASE_URL}/api/payments/billers`,
                                {
                                    headers,
                                }
                            ),

                            fetch(
                                `${API_BASE_URL}/api/payments/payees`,
                                {
                                    headers,
                                }
                            ),

                            fetch(
                                `${API_BASE_URL}/api/payments/history`,
                                {
                                    headers,
                                }
                            ),
                        ]);


                    if (
                        dashboardResponse.status === 401 ||
                        dashboardResponse.status === 403 ||
                        billersResponse.status === 401 ||
                        billersResponse.status === 403 ||
                        payeesResponse.status === 401 ||
                        payeesResponse.status === 403 ||
                        historyResponse.status === 401 ||
                        historyResponse.status === 403
                    ) {

                        logout();
                        return;
                    }


                    const dashboardData =
                        await readApiResponse(
                            dashboardResponse
                        );


                    const billersData =
                        await readApiResponse(
                            billersResponse
                        );


                    const payeesData =
                        await readApiResponse(
                            payeesResponse
                        );


                    const historyData =
                        await readApiResponse(
                            historyResponse
                        );


                    if (
                        dashboardData.success === false ||
                        billersData.success === false ||
                        payeesData.success === false ||
                        historyData.success === false
                    ) {

                        throw new Error(
                            dashboardData.message ||
                            billersData.message ||
                            payeesData.message ||
                            historyData.message ||
                            "Unable to load payment information."
                        );
                    }


                    const loadedAccounts =
                        extractList<Account>(
                            dashboardData.data,
                            [
                                "accounts",
                            ]
                        );


                    const loadedBillers =
                        extractList<Biller>(
                            billersData.data,
                            [
                                "billers",
                            ]
                        ).filter(
                            biller =>
                                biller.status ===
                                "active"
                        );


                    const loadedPayees =
                        extractList<Payee>(
                            payeesData.data,
                            [
                                "payees",
                            ]
                        ).filter(
                            payee =>
                                payee.status ===
                                "active"
                        );


                    const loadedPayments =
                        extractList<Payment>(
                            historyData.data,
                            [
                                "payments",
                                "history",
                            ]
                        );


                    setAccounts(
                        loadedAccounts
                    );


                    setBillers(
                        loadedBillers
                    );


                    setPayees(
                        loadedPayees
                    );


                    setPayments(
                        loadedPayments
                    );


                    if (
                        loadedAccounts.length > 0
                    ) {

                        setSelectedAccountId(
                            current =>
                                current ||
                                loadedAccounts[0]._id
                        );
                    }


                    if (
                        loadedBillers.length > 0
                    ) {

                        setPayeeBillerId(
                            current =>
                                current ||
                                loadedBillers[0]._id
                        );
                    }

                } catch (err) {

                    setError(
                        err instanceof Error
                            ? err.message
                            : "Unable to load payment information."
                    );

                } finally {

                    setLoading(false);
                }
            };


        void loadPaymentData();

    }, [token]);


    const handleAddPayee =
        async (
            event: FormEvent
        ) => {

            event.preventDefault();

            if (!token) {
                return;
            }


            if (!payeeBillerId) {

                setError(
                    "Please select a biller."
                );

                return;
            }


            if (!payeeReference.trim()) {

                setError(
                    "Please enter the bill account reference."
                );

                return;
            }


            try {

                setAddingPayee(true);
                setError("");
                setMessage("");


                const response =
                    await fetch(
                        `${API_BASE_URL}/api/payments/payees`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json",

                                Authorization:
                                    `Bearer ${token}`,
                            },

                            body: JSON.stringify({
                                billerId:
                                    payeeBillerId,

                                nickname:
                                    payeeNickname.trim() ||
                                    undefined,

                                accountReference:
                                    payeeReference.trim(),
                            }),
                        }
                    );


                if (
                    response.status === 401 ||
                    response.status === 403
                ) {

                    logout();
                    return;
                }


                const data =
                    await readApiResponse(
                        response
                    );


                if (
                    data.success === false
                ) {

                    throw new Error(
                        data.message ||
                        "Unable to add payee."
                    );
                }


                const createdPayee =
                    data.data as
                        | Payee
                        | {
                            payee?: Payee;
                        };


                const newPayee =
                    (
                        createdPayee &&
                        typeof createdPayee === "object" &&
                        "payee" in createdPayee
                    )
                        ? createdPayee.payee
                        : createdPayee as Payee;


                if (!newPayee?._id) {

                    throw new Error(
                        "The payee was created, but the server returned an unexpected response."
                    );
                }


                setPayees(
                    current => [
                        newPayee,
                        ...current,
                    ]
                );


                setSelectedBillerId(
                    payeeBillerId
                );


                setSelectedPayeeId(
                    newPayee._id
                );


                setShowPayeeForm(
                    false
                );


                setPayeeNickname("");

                setPayeeReference("");


                setMessage(
                    "Payee added successfully."
                );

            } catch (err) {

                setError(
                    err instanceof Error
                        ? err.message
                        : "Unable to add payee."
                );

            } finally {

                setAddingPayee(false);
            }
        };


    const handleSubmitPayment =
        async (
            event: FormEvent
        ) => {

            event.preventDefault();

            if (!token) {
                return;
            }


            setError("");
            setMessage("");
            setSuccessReference("");


            if (!selectedAccountId) {

                setError(
                    "Please select an account."
                );

                return;
            }


            if (!selectedBillerId) {

                setError(
                    "Please select a biller."
                );

                return;
            }


            if (!selectedPayeeId) {

                setError(
                    "Please select a payee."
                );

                return;
            }


            const numericAmount =
                Number(amount);


            if (
                !Number.isFinite(
                    numericAmount
                ) ||
                numericAmount <= 0
            ) {

                setError(
                    "Please enter a valid payment amount."
                );

                return;
            }


            if (
                selectedAccount &&
                numericAmount >
                    selectedAccount.balance
            ) {

                setError(
                    "Insufficient funds in the selected account."
                );

                return;
            }


            try {

                setSubmitting(true);


                const response =
                    await fetch(
                        `${API_BASE_URL}/api/payments`,
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
                                    selectedAccountId,

                                billerId:
                                    selectedBillerId,

                                payeeId:
                                    selectedPayeeId,

                                amount:
                                    numericAmount,

                                description:
                                    description.trim() ||
                                    undefined,
                            }),
                        }
                    );


                if (
                    response.status === 401 ||
                    response.status === 403
                ) {

                    logout();
                    return;
                }


                const data =
                    await readApiResponse(
                        response
                    );


                if (
                    data.success === false
                ) {

                    throw new Error(
                        data.message ||
                        "Unable to complete bill payment."
                    );
                }


                const responseData =
                    data.data as
                        | BillPaymentResponse
                        | undefined;


                const createdPayment =
                    responseData?.payment;


                const reference =
                    responseData?.reference ||
                    createdPayment?.reference ||
                    "";


                if (
                    createdPayment
                ) {

                    setPayments(
                        current => [
                            createdPayment,
                            ...current,
                        ]
                    );
                }


                setAccounts(
                    current =>
                        current.map(
                            account =>
                                account._id ===
                                selectedAccountId
                                    ? {
                                        ...account,

                                        balance:
                                            account.balance -
                                            numericAmount,
                                    }
                                    : account
                        )
                );


                setAmount("");

                setDescription("");


                setSuccessReference(
                    reference
                );


                setMessage(
                    "Your bill payment was completed successfully."
                );

            } catch (err) {

                setError(
                    err instanceof Error
                        ? err.message
                        : "Unable to complete bill payment."
                );

            } finally {

                setSubmitting(false);
            }
        };


    const handleBillerChange =
        (
            value: string
        ) => {

            setSelectedBillerId(
                value
            );

            setSelectedPayeeId("");
        };


    const handlePayeeChange =
        (
            value: string
        ) => {

            setSelectedPayeeId(
                value
            );
        };


    if (loading) {

        return (
            <div className="payments-page">

                <div className="payments-loading">

                    Loading payments...

                </div>

            </div>
        );
    }


    return (
        <div className="payments-page">

            <header className="payments-header">

                <div className="payments-header-left">

                    <Link
                        to="/dashboard"
                        className="payments-back-button"
                    >
                        <ArrowLeft
                            size={18}
                        />

                        Back to Dashboard
                    </Link>


                    <div className="payments-title">

                        <div className="payments-title-icon">

                            <Receipt
                                size={22}
                            />

                        </div>


                        <div>

                            <h1>
                                Pay a Bill
                            </h1>

                            <p>
                                Pay your bills securely from your Capital Bank account.
                            </p>

                        </div>

                    </div>

                </div>

            </header>


            {error && (

                <div className="payments-alert payments-alert-error">

                    <span>
                        {error}
                    </span>

                    <button
                        type="button"
                        onClick={() =>
                            setError("")
                        }
                        aria-label="Close error"
                    >
                        <X
                            size={18}
                        />
                    </button>

                </div>

            )}


            {message && !error && (

                <div className="payments-alert payments-alert-success">

                    <CheckCircle2
                        size={20}
                    />

                    <span>
                        {message}
                    </span>

                </div>

            )}


            {successReference && (

                <div className="payments-success-card">

                    <div className="payments-success-icon">

                        <CheckCircle2
                            size={30}
                        />

                    </div>


                    <div>

                        <h2>
                            Payment successful
                        </h2>

                        <p>
                            Your bill payment has been completed.
                        </p>

                        <strong>
                            Reference: {successReference}
                        </strong>

                    </div>

                </div>

            )}


            <main className="payments-main">

                <section className="payments-form-card">

                    <div className="payments-card-heading">

                        <div>

                            <h2>
                                Make a Payment
                            </h2>

                            <p>
                                Select the account and biller you want to pay.
                            </p>

                        </div>


                        <CreditCard
                            size={24}
                        />

                    </div>


                    <form
                        onSubmit={
                            handleSubmitPayment
                        }
                        className="payments-form"
                    >

                        <div className="payments-field">

                            <label htmlFor="payment-account">
                                Pay From
                            </label>


                            <div className="payments-input-wrapper">

                                <Wallet
                                    size={18}
                                />


                                <select
                                    id="payment-account"
                                    value={
                                        selectedAccountId
                                    }
                                    onChange={
                                        event =>
                                            setSelectedAccountId(
                                                event.target.value
                                            )
                                    }
                                >

                                    <option value="">
                                        Select an account
                                    </option>


                                    {accounts.map(
                                        account => (

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
                                                ****
                                                {account.accountNumber.slice(-4)}
                                                {" — "}
                                                {formatCurrency(
                                                    account.balance,
                                                    account.currency
                                                )}
                                            </option>

                                        )
                                    )}

                                </select>

                            </div>

                        </div>


                        <div className="payments-field">

                            <label htmlFor="payment-biller">
                                Biller
                            </label>


                            <div className="payments-input-wrapper">

                                <Receipt
                                    size={18}
                                />


                                <select
                                    id="payment-biller"
                                    value={
                                        selectedBillerId
                                    }
                                    onChange={
                                        event =>
                                            handleBillerChange(
                                                event.target.value
                                            )
                                    }
                                    disabled={
                                        activeBillers.length === 0
                                    }
                                >

                                    <option value="">

                                        {
                                            activeBillers.length > 0
                                                ? "Select a biller"
                                                : "No billers available"
                                        }

                                    </option>


                                    {activeBillers.map(
                                        biller => (

                                            <option
                                                key={
                                                    biller._id
                                                }
                                                value={
                                                    biller._id
                                                }
                                            >
                                                {biller.name}
                                                {" — "}
                                                {biller.category}
                                            </option>

                                        )
                                    )}

                                </select>

                            </div>


                            {selectedBiller?.description && (

                                <small>
                                    {
                                        selectedBiller.description
                                    }
                                </small>

                            )}


                            {activeBillers.length === 0 && (

                                <small className="payments-field-note">

                                    Bill payment services are currently being configured.
                                    Please check back later.

                                </small>

                            )}

                        </div>


                        <div className="payments-field">

                            <div className="payments-label-row">

                                <label htmlFor="payment-payee">
                                    Payee
                                </label>


                                <button
                                    type="button"
                                    className="payments-inline-button"
                                    onClick={() =>
                                        setShowPayeeForm(
                                            true
                                        )
                                    }
                                    disabled={
                                        activeBillers.length === 0
                                    }
                                >

                                    <Plus
                                        size={15}
                                    />

                                    Add Payee

                                </button>

                            </div>


                            <div className="payments-input-wrapper">

                                <Receipt
                                    size={18}
                                />


                                <select
                                    id="payment-payee"
                                    value={
                                        selectedPayeeId
                                    }
                                    onChange={
                                        event =>
                                            handlePayeeChange(
                                                event.target.value
                                            )
                                    }
                                    disabled={
                                        !selectedBillerId
                                    }
                                >

                                    <option value="">

                                        {
                                            selectedBillerId
                                                ? (
                                                    filteredPayees.length > 0
                                                        ? "Select a payee"
                                                        : "No payees for this biller"
                                                )
                                                : "Select a biller first"
                                        }

                                    </option>


                                    {filteredPayees.map(
                                        payee => (

                                            <option
                                                key={
                                                    payee._id
                                                }
                                                value={
                                                    payee._id
                                                }
                                            >

                                                {
                                                    payee.nickname ||
                                                    payee.accountReference
                                                }

                                                {" — "}

                                                {
                                                    payee.accountReference
                                                }

                                            </option>

                                        )
                                    )}

                                </select>

                            </div>

                        </div>


                        <div className="payments-field">

                            <label htmlFor="payment-amount">
                                Amount
                            </label>


                            <div className="payments-amount-wrapper">

                                <span>
                                    $
                                </span>


                                <input
                                    id="payment-amount"
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    value={
                                        amount
                                    }
                                    onChange={
                                        event =>
                                            setAmount(
                                                event.target.value
                                            )
                                    }
                                    placeholder="0.00"
                                />


                                <span>
                                    CAD
                                </span>

                            </div>

                        </div>


                        <div className="payments-field">

                            <label htmlFor="payment-description">

                                Description

                                <span>
                                    Optional
                                </span>

                            </label>


                            <textarea
                                id="payment-description"
                                value={
                                    description
                                }
                                onChange={
                                    event =>
                                        setDescription(
                                            event.target.value
                                        )
                                }
                                placeholder="Add a note for this payment"
                                rows={4}
                                maxLength={500}
                            />

                        </div>


                        <div className="payments-submit-row">

                            <div className="payments-balance">

                                <span>
                                    Available balance
                                </span>


                                <strong>

                                    {
                                        selectedAccount
                                            ? formatCurrency(
                                                selectedAccount.balance,
                                                selectedAccount.currency
                                            )
                                            : "—"
                                    }

                                </strong>

                            </div>


                            <button
                                type="submit"
                                className="payments-submit-button"
                                disabled={
                                    submitting ||
                                    accounts.length === 0 ||
                                    activeBillers.length === 0
                                }
                            >

                                {submitting
                                    ? "Processing..."
                                    : "Pay Bill"
                                }

                            </button>

                        </div>

                    </form>

                </section>


                <section className="payments-payees-card">

                    <div className="payments-card-heading">

                        <div>

                            <h2>
                                My Payees
                            </h2>

                            <p>
                                Saved bill payment recipients.
                            </p>

                        </div>


                        <button
                            type="button"
                            className="payments-heading-button"
                            onClick={() =>
                                setShowPayeeForm(
                                    true
                                )
                            }
                            disabled={
                                activeBillers.length === 0
                            }
                        >

                            <Plus
                                size={17}
                            />

                            Add Payee

                        </button>

                    </div>


                    {payees.length === 0 ? (

                        <div className="payments-empty-state">

                            <Receipt
                                size={30}
                            />

                            <h3>
                                No payees yet
                            </h3>

                            <p>
                                Add a bill payment recipient to get started.
                            </p>


                            <button
                                type="button"
                                onClick={() =>
                                    setShowPayeeForm(
                                        true
                                    )
                                }
                                disabled={
                                    activeBillers.length === 0
                                }
                            >
                                Add your first payee
                            </button>

                        </div>

                    ) : (

                        <div className="payments-payee-list">

                            {payees.map(
                                payee => (

                                    <div
                                        className="payments-payee-item"
                                        key={
                                            payee._id
                                        }
                                    >

                                        <div className="payments-payee-icon">

                                            <Receipt
                                                size={19}
                                            />

                                        </div>


                                        <div className="payments-payee-info">

                                            <strong>

                                                {
                                                    getPayeeName(
                                                        payee,
                                                        payees
                                                    )
                                                }

                                            </strong>


                                            <span>

                                                {
                                                    getBillerName(
                                                        payee.billerId,
                                                        billers
                                                    )
                                                }

                                            </span>


                                            <small>

                                                {
                                                    getPayeeReference(
                                                        payee,
                                                        payees
                                                    )
                                                }

                                            </small>

                                        </div>

                                    </div>

                                )
                            )}

                        </div>

                    )}

                </section>


                <section className="payments-history-card">

                    <div className="payments-card-heading">

                        <div>

                            <h2>
                                Payment History
                            </h2>

                            <p>
                                Your recent bill payments.
                            </p>

                        </div>


                        <History
                            size={24}
                        />

                    </div>


                    {payments.length === 0 ? (

                        <div className="payments-empty-state">

                            <History
                                size={30}
                            />

                            <h3>
                                No bill payments yet
                            </h3>

                            <p>
                                Your completed payments will appear here.
                            </p>

                        </div>

                    ) : (

                        <div className="payments-history-list">

                            {payments.map(
                                payment => (

                                    <div
                                        className="payments-history-item"
                                        key={
                                            payment._id
                                        }
                                    >

                                        <div className="payments-history-main">

                                            <div className="payments-history-icon">

                                                <Receipt
                                                    size={18}
                                                />

                                            </div>


                                            <div>

                                                <strong>

                                                    {
                                                        getBillerName(
                                                            payment.billerId,
                                                            billers
                                                        )
                                                    }

                                                </strong>


                                                <span>

                                                    {
                                                        getPayeeName(
                                                            payment.payeeId,
                                                            payees
                                                        )
                                                    }

                                                </span>


                                                <small>

                                                    {
                                                        formatDate(
                                                            payment.createdAt
                                                        )
                                                    }

                                                </small>

                                            </div>

                                        </div>


                                        <div className="payments-history-right">

                                            <strong>

                                                -
                                                {
                                                    formatCurrency(
                                                        payment.amount,
                                                        payment.currency
                                                    )
                                                }

                                            </strong>


                                            <span
                                                className={
                                                    `payments-status payments-status-${payment.status}`
                                                }
                                            >

                                                {
                                                    payment.status
                                                }

                                            </span>


                                            <small>

                                                {
                                                    payment.reference
                                                }

                                            </small>

                                        </div>

                                    </div>

                                )
                            )}

                        </div>

                    )}

                </section>

            </main>


            {showPayeeForm && (

                <div className="payments-modal-backdrop">

                    <div
                        className="payments-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="add-payee-title"
                    >

                        <div className="payments-modal-header">

                            <div>

                                <h2 id="add-payee-title">
                                    Add Payee
                                </h2>

                                <p>
                                    Save a bill payment recipient.
                                </p>

                            </div>


                            <button
                                type="button"
                                onClick={() =>
                                    setShowPayeeForm(
                                        false
                                    )
                                }
                                aria-label="Close"
                            >

                                <X
                                    size={20}
                                />

                            </button>

                        </div>


                        <form
                            onSubmit={
                                handleAddPayee
                            }
                            className="payments-modal-form"
                        >

                            <div className="payments-field">

                                <label htmlFor="payee-biller">
                                    Biller
                                </label>


                                <select
                                    id="payee-biller"
                                    value={
                                        payeeBillerId
                                    }
                                    onChange={
                                        event =>
                                            setPayeeBillerId(
                                                event.target.value
                                            )
                                    }
                                    required
                                >

                                    <option value="">
                                        Select a biller
                                    </option>


                                    {activeBillers.map(
                                        biller => (

                                            <option
                                                key={
                                                    biller._id
                                                }
                                                value={
                                                    biller._id
                                                }
                                            >

                                                {
                                                    biller.name
                                                }

                                                {" — "}

                                                {
                                                    biller.category
                                                }

                                            </option>

                                        )
                                    )}

                                </select>

                            </div>


                            <div className="payments-field">

                                <label htmlFor="payee-nickname">

                                    Payee Name

                                    <span>
                                        Optional
                                    </span>

                                </label>


                                <input
                                    id="payee-nickname"
                                    type="text"
                                    value={
                                        payeeNickname
                                    }
                                    onChange={
                                        event =>
                                            setPayeeNickname(
                                                event.target.value
                                            )
                                    }
                                    placeholder="e.g. Home Internet"
                                    maxLength={100}
                                />

                            </div>


                            <div className="payments-field">

                                <label htmlFor="payee-reference">
                                    Account Reference
                                </label>


                                <input
                                    id="payee-reference"
                                    type="text"
                                    value={
                                        payeeReference
                                    }
                                    onChange={
                                        event =>
                                            setPayeeReference(
                                                event.target.value
                                            )
                                    }
                                    placeholder="Enter your bill account number"
                                    maxLength={100}
                                    required
                                />

                            </div>


                            <div className="payments-modal-actions">

                                <button
                                    type="button"
                                    className="payments-cancel-button"
                                    onClick={() =>
                                        setShowPayeeForm(
                                            false
                                        )
                                    }
                                >
                                    Cancel
                                </button>


                                <button
                                    type="submit"
                                    className="payments-submit-button"
                                    disabled={
                                        addingPayee ||
                                        activeBillers.length === 0
                                    }
                                >

                                    {addingPayee
                                        ? "Saving..."
                                        : "Save Payee"
                                    }

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
    );
};


export default Payments;