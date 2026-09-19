import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Link,
} from "react-router-dom";

import {
    useAuth,
} from "../context/AuthContext";

import AdminProtectedRoute from "../components/AdminProtectedRoute";

import "./AdminLoans.css";


const API_BASE_URL =
    import.meta.env.VITE_API_URL ||
    (
        import.meta.env.PROD
            ? ""
            : "http://localhost:5000"
    );


/* =========================================
   TYPES
========================================= */

interface AdminLoanCustomer {
    _id?: string;
    clientNumber?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
}


interface AdminLoan {
    _id: string;

    userId:
        | AdminLoanCustomer
        | string;

    loanType: string;

    applicationNumber: string;

    loanNumber?: string;

    requestedAmount: number;

    principalAmount?: number;

    outstandingBalance?: number;

    interestRate?: number;

    termMonths: number;

    monthlyPayment?: number;

    nextPaymentDate?: string;

    purpose: string;

    status:
        | "pending"
        | "approved"
        | "active"
        | "rejected"
        | "paid";

    applicationDate: string;

    approvedDate?: string;

    disbursedDate?: string;

    disbursementTransactionId?: string;

    createdAt: string;

    updatedAt?: string;
}


type LoanFilter =
    | "all"
    | "pending"
    | "approved"
    | "active"
    | "rejected"
    | "paid";


/* =========================================
   HELPERS
========================================= */

const formatCurrency = (
    amount: number | undefined
) => {

    const safeAmount =
        Number(amount || 0);

    return new Intl.NumberFormat(
        "en-CA",
        {
            style: "currency",
            currency: "CAD",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }
    ).format(safeAmount);
};


const formatDate = (
    date?: string
) => {

    if (!date) {
        return "—";
    }

    const parsedDate =
        new Date(date);

    if (
        Number.isNaN(
            parsedDate.getTime()
        )
    ) {
        return "—";
    }

    return parsedDate.toLocaleDateString(
        "en-CA",
        {
            year: "numeric",
            month: "short",
            day: "numeric",
        }
    );
};


const getCustomerName = (
    loan: AdminLoan
) => {

    if (
        typeof loan.userId === "string"
    ) {
        return "Customer";
    }

    const firstName =
        loan.userId?.firstName || "";

    const lastName =
        loan.userId?.lastName || "";

    const fullName =
        `${firstName} ${lastName}`.trim();

    return fullName || "Customer";
};


const getCustomerEmail = (
    loan: AdminLoan
) => {

    if (
        typeof loan.userId === "string"
    ) {
        return "";
    }

    return loan.userId?.email || "";
};


const getCustomerNumber = (
    loan: AdminLoan
) => {

    if (
        typeof loan.userId === "string"
    ) {
        return "";
    }

    return loan.userId?.clientNumber || "";
};


/* =========================================
   MAIN COMPONENT
========================================= */

function AdminLoansContent() {

    const {
        token,
    } = useAuth();


    const [
        loans,
        setLoans,
    ] = useState<AdminLoan[]>([]);


    const [
        loading,
        setLoading,
    ] = useState(true);


    const [
        error,
        setError,
    ] = useState("");


    const [
        actionLoading,
        setActionLoading,
    ] = useState("");


    const [
        filter,
        setFilter,
    ] = useState<LoanFilter>("all");


    const [
        selectedLoan,
        setSelectedLoan,
    ] = useState<AdminLoan | null>(
        null
    );


    const [
        approvedAmount,
        setApprovedAmount,
    ] = useState("");


    const [
        interestRate,
        setInterestRate,
    ] = useState("");


    const [
        monthlyPayment,
        setMonthlyPayment,
    ] = useState("");


    const [
        actionError,
        setActionError,
    ] = useState("");


    const [
        successMessage,
        setSuccessMessage,
    ] = useState("");


    /* =====================================
       LOAD LOANS
    ===================================== */

    const loadLoans = async () => {

        if (!token) {
            return;
        }

        setLoading(true);
        setError("");

        try {

            const response =
                await fetch(
                    `${API_BASE_URL}/api/admin/loans`,
                    {
                        method: "GET",

                        headers: {
                            Authorization:
                                `Bearer ${token}`,
                        },
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data?.message ||
                    "Unable to load loans."
                );

            }


            setLoans(
                Array.isArray(data?.loans)
                    ? data.loans
                    : []
            );

        } catch (requestError) {

            console.error(
                "Admin loans error:",
                requestError
            );

            setError(
                requestError instanceof Error
                    ? requestError.message
                    : "Unable to load loans."
            );

        } finally {

            setLoading(false);

        }

    };


    useEffect(() => {

        loadLoans();

    }, [token]);


    /* =====================================
       LOAN COUNTS
    ===================================== */

    const counts =
        useMemo(() => {

            return {

                all:
                    loans.length,

                pending:
                    loans.filter(
                        loan =>
                            loan.status ===
                            "pending"
                    ).length,

                approved:
                    loans.filter(
                        loan =>
                            loan.status ===
                            "approved"
                    ).length,

                active:
                    loans.filter(
                        loan =>
                            loan.status ===
                            "active"
                    ).length,

                rejected:
                    loans.filter(
                        loan =>
                            loan.status ===
                            "rejected"
                    ).length,

                paid:
                    loans.filter(
                        loan =>
                            loan.status ===
                            "paid"
                    ).length,

            };

        }, [loans]);


    /* =====================================
       FILTERED LOANS
    ===================================== */

    const filteredLoans =
        useMemo(() => {

            if (filter === "all") {
                return loans;
            }

            return loans.filter(
                loan =>
                    loan.status ===
                    filter
            );

        }, [
            loans,
            filter,
        ]);


    /* =====================================
       OPEN APPROVAL
    ===================================== */

    const openApproval =
        (loan: AdminLoan) => {

            setSelectedLoan(loan);

            setApprovedAmount(
                String(
                    loan.requestedAmount
                )
            );

            setInterestRate(
                loan.interestRate !==
                undefined
                    ? String(
                        loan.interestRate
                    )
                    : ""
            );

            setMonthlyPayment(
                loan.monthlyPayment !==
                undefined
                    ? String(
                        loan.monthlyPayment
                    )
                    : ""
            );

            setActionError("");

            setSuccessMessage("");

        };


    /* =====================================
       CLOSE MODAL
    ===================================== */

    const closeModal = () => {

        if (actionLoading) {
            return;
        }

        setSelectedLoan(null);

        setApprovedAmount("");

        setInterestRate("");

        setMonthlyPayment("");

        setActionError("");

    };


    /* =====================================
       APPROVE LOAN
    ===================================== */

    const handleApprove =
        async () => {

            if (!selectedLoan) {
                return;
            }


            const amount =
                Number(
                    approvedAmount
                );


            if (
                !Number.isFinite(amount) ||
                amount <= 0
            ) {

                setActionError(
                    "Enter a valid approved amount."
                );

                return;

            }


            if (
                amount >
                selectedLoan.requestedAmount
            ) {

                setActionError(
                    "The approved amount cannot exceed the requested amount."
                );

                return;

            }


            setActionLoading(
                selectedLoan._id
            );

            setActionError("");

            setSuccessMessage("");


            try {

                const response =
                    await fetch(

                        `${API_BASE_URL}/api/admin/loans/${selectedLoan._id}/approve`,

                        {

                            method: "POST",

                            headers: {

                                "Content-Type":
                                    "application/json",

                                Authorization:
                                    `Bearer ${token}`,

                            },

                            body:
                                JSON.stringify({

                                    approvedAmount:
                                        amount,

                                    interestRate:
                                        interestRate === ""
                                            ? undefined
                                            : Number(
                                                interestRate
                                            ),

                                    monthlyPayment:
                                        monthlyPayment === ""
                                            ? undefined
                                            : Number(
                                                monthlyPayment
                                            ),

                                }),

                        }

                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data?.message ||
                        "Unable to approve loan."
                    );

                }


                setSelectedLoan(null);

                setSuccessMessage(
                    "Loan approved and funds disbursed successfully."
                );


                await loadLoans();


            } catch (requestError) {

                console.error(
                    "Approve loan error:",
                    requestError
                );

                setActionError(
                    requestError instanceof Error
                        ? requestError.message
                        : "Unable to approve loan."
                );

            } finally {

                setActionLoading("");

            }

        };


    /* =====================================
       REJECT LOAN
    ===================================== */

    const handleReject =
        async (
            loan: AdminLoan
        ) => {

            const confirmed =
                window.confirm(
                    `Reject loan application ${loan.applicationNumber}?`
                );


            if (!confirmed) {
                return;
            }


            setActionLoading(
                loan._id
            );

            setActionError("");

            setSuccessMessage("");


            try {

                const response =
                    await fetch(

                        `${API_BASE_URL}/api/admin/loans/${loan._id}/reject`,

                        {

                            method: "POST",

                            headers: {

                                Authorization:
                                    `Bearer ${token}`,

                            },

                        }

                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data?.message ||
                        "Unable to reject loan."
                    );

                }


                setSuccessMessage(
                    "Loan application rejected successfully."
                );


                await loadLoans();


            } catch (requestError) {

                console.error(
                    "Reject loan error:",
                    requestError
                );

                setActionError(
                    requestError instanceof Error
                        ? requestError.message
                        : "Unable to reject loan."
                );

            } finally {

                setActionLoading("");

            }

        };


    /* =====================================
       ACTIVATE LOAN
    ===================================== */

    const handleActivate =
        async (
            loan: AdminLoan
        ) => {

            const confirmed =
                window.confirm(
                    `Activate loan ${loan.loanNumber || loan.applicationNumber}?`
                );


            if (!confirmed) {
                return;
            }


            setActionLoading(
                loan._id
            );

            setActionError("");

            setSuccessMessage("");


            try {

                const response =
                    await fetch(

                        `${API_BASE_URL}/api/admin/loans/${loan._id}/activate`,

                        {

                            method: "POST",

                            headers: {

                                Authorization:
                                    `Bearer ${token}`,

                            },

                        }

                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data?.message ||
                        "Unable to activate loan."
                    );

                }


                setSuccessMessage(
                    "Loan activated successfully."
                );


                await loadLoans();


            } catch (requestError) {

                console.error(
                    "Activate loan error:",
                    requestError
                );

                setActionError(
                    requestError instanceof Error
                        ? requestError.message
                        : "Unable to activate loan."
                );

            } finally {

                setActionLoading("");

            }

        };


    /* =====================================
       MARK PAID
    ===================================== */

    const handleMarkPaid =
        async (
            loan: AdminLoan
        ) => {

            const confirmed =
                window.confirm(
                    `Mark loan ${loan.loanNumber || loan.applicationNumber} as paid?`
                );


            if (!confirmed) {
                return;
            }


            setActionLoading(
                loan._id
            );

            setActionError("");

            setSuccessMessage("");


            try {

                const response =
                    await fetch(

                        `${API_BASE_URL}/api/admin/loans/${loan._id}/paid`,

                        {

                            method: "POST",

                            headers: {

                                Authorization:
                                    `Bearer ${token}`,

                            },

                        }

                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data?.message ||
                        "Unable to mark loan as paid."
                    );

                }


                setSuccessMessage(
                    "Loan marked as paid successfully."
                );


                await loadLoans();


            } catch (requestError) {

                console.error(
                    "Mark loan paid error:",
                    requestError
                );

                setActionError(
                    requestError instanceof Error
                        ? requestError.message
                        : "Unable to mark loan as paid."
                );

            } finally {

                setActionLoading("");

            }

        };


    /* =====================================
       RENDER
    ===================================== */

    return (

        <div className="admin-loans-page">

            <main className="admin-loans-content">

                <Link
                    to="/admin"
                    className="admin-loans-back-link"
                >
                    ← Back to Dashboard
                </Link>


                <header className="admin-loans-header">

                    <div>

                        <span className="admin-loans-eyebrow">
                            Administrator Portal
                        </span>

                        <h1>
                            Loan Management
                        </h1>

                        <p>
                            Review applications, manage approvals,
                            and monitor customer loan activity.
                        </p>

                    </div>


                    <button
                        type="button"
                        className="admin-loans-refresh"
                        onClick={loadLoans}
                        disabled={loading}
                    >
                        {loading
                            ? "Refreshing..."
                            : "Refresh"}
                    </button>

                </header>


                {successMessage && (

                    <div className="admin-loans-alert success">
                        {successMessage}
                    </div>

                )}


                {error && (

                    <div className="admin-loans-alert error">
                        {error}
                    </div>

                )}


                {actionError && !selectedLoan && (

                    <div className="admin-loans-alert error">
                        {actionError}
                    </div>

                )}


                {/* =================================
                    SUMMARY CARDS
                ================================= */}

                <section className="admin-loans-summary">

                    <button
                        type="button"
                        className={
                            `admin-loans-summary-card ${
                                filter === "all"
                                    ? "active"
                                    : ""
                            }`
                        }
                        onClick={() =>
                            setFilter("all")
                        }
                    >

                        <span>
                            Total Applications
                        </span>

                        <strong>
                            {counts.all}
                        </strong>

                    </button>


                    <button
                        type="button"
                        className={
                            `admin-loans-summary-card pending ${
                                filter === "pending"
                                    ? "active"
                                    : ""
                            }`
                        }
                        onClick={() =>
                            setFilter("pending")
                        }
                    >

                        <span>
                            Pending
                        </span>

                        <strong>
                            {counts.pending}
                        </strong>

                    </button>


                    <button
                        type="button"
                        className={
                            `admin-loans-summary-card approved ${
                                filter === "approved"
                                    ? "active"
                                    : ""
                            }`
                        }
                        onClick={() =>
                            setFilter("approved")
                        }
                    >

                        <span>
                            Approved
                        </span>

                        <strong>
                            {counts.approved}
                        </strong>

                    </button>


                    <button
                        type="button"
                        className={
                            `admin-loans-summary-card active-loan ${
                                filter === "active"
                                    ? "active"
                                    : ""
                            }`
                        }
                        onClick={() =>
                            setFilter("active")
                        }
                    >

                        <span>
                            Active
                        </span>

                        <strong>
                            {counts.active}
                        </strong>

                    </button>


                    <button
                        type="button"
                        className={
                            `admin-loans-summary-card rejected ${
                                filter === "rejected"
                                    ? "active"
                                    : ""
                            }`
                        }
                        onClick={() =>
                            setFilter("rejected")
                        }
                    >

                        <span>
                            Rejected
                        </span>

                        <strong>
                            {counts.rejected}
                        </strong>

                    </button>


                    <button
                        type="button"
                        className={
                            `admin-loans-summary-card paid ${
                                filter === "paid"
                                    ? "active"
                                    : ""
                            }`
                        }
                        onClick={() =>
                            setFilter("paid")
                        }
                    >

                        <span>
                            Paid
                        </span>

                        <strong>
                            {counts.paid}
                        </strong>

                    </button>

                </section>


                {/* =================================
                    LOANS TABLE
                ================================= */}

                <section className="admin-loans-table-section">

                    <div className="admin-loans-table-header">

                        <div>

                            <h2>
                                {filter === "all"
                                    ? "All Loan Applications"
                                    : `${filter.charAt(0).toUpperCase()}${filter.slice(1)} Loans`}
                            </h2>

                            <span>
                                {filteredLoans.length}{" "}
                                {filteredLoans.length === 1
                                    ? "application"
                                    : "applications"}
                            </span>

                        </div>

                    </div>


                    {loading ? (

                        <div className="admin-loans-empty">

                            <div className="admin-loans-spinner" />

                            <p>
                                Loading loan applications...
                            </p>

                        </div>

                    ) : filteredLoans.length === 0 ? (

                        <div className="admin-loans-empty">

                            <div className="admin-loans-empty-icon">
                                $
                            </div>

                            <h3>
                                No loan applications
                            </h3>

                            <p>
                                There are no loans in this
                                category yet.
                            </p>

                        </div>

                    ) : (

                        <div className="admin-loans-table-wrapper">

                            <table className="admin-loans-table">

                                <thead>

                                    <tr>

                                        <th>
                                            Application
                                        </th>

                                        <th>
                                            Customer
                                        </th>

                                        <th>
                                            Loan Type
                                        </th>

                                        <th>
                                            Requested
                                        </th>

                                        <th>
                                            Approved
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                        <th>
                                            Date
                                        </th>

                                        <th>
                                            Action
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {filteredLoans.map(
                                        loan => (

                                            <tr
                                                key={
                                                    loan._id
                                                }
                                            >

                                                <td>

                                                    <div className="admin-loans-application">

                                                        <strong>
                                                            {
                                                                loan.applicationNumber
                                                            }
                                                        </strong>

                                                        {loan.loanNumber && (

                                                            <span>
                                                                {
                                                                    loan.loanNumber
                                                                }
                                                            </span>

                                                        )}

                                                    </div>

                                                </td>


                                                <td>

                                                    <div className="admin-loans-customer">

                                                        <strong>
                                                            {
                                                                getCustomerName(
                                                                    loan
                                                                )
                                                            }
                                                        </strong>

                                                        <span>
                                                            {
                                                                getCustomerEmail(
                                                                    loan
                                                                )
                                                            }
                                                        </span>

                                                        {getCustomerNumber(
                                                            loan
                                                        ) && (

                                                            <small>
                                                                {
                                                                    getCustomerNumber(
                                                                        loan
                                                                    )
                                                                }
                                                            </small>

                                                        )}

                                                    </div>

                                                </td>


                                                <td>

                                                    <span className="admin-loans-type">
                                                        {
                                                            loan.loanType
                                                        }
                                                    </span>

                                                </td>


                                                <td>

                                                    <strong className="admin-loans-money">
                                                        {
                                                            formatCurrency(
                                                                loan.requestedAmount
                                                            )
                                                        }
                                                    </strong>

                                                </td>


                                                <td>

                                                    <span className="admin-loans-money">

                                                        {loan.principalAmount !==
                                                        undefined
                                                            ? formatCurrency(
                                                                loan.principalAmount
                                                            )
                                                            : "—"}

                                                    </span>

                                                </td>


                                                <td>

                                                    <span
                                                        className={
                                                            `admin-loan-status ${loan.status}`
                                                        }
                                                    >
                                                        {
                                                            loan.status
                                                        }
                                                    </span>

                                                </td>


                                                <td>

                                                    <span className="admin-loans-date">
                                                        {
                                                            formatDate(
                                                                loan.applicationDate
                                                            )
                                                        }
                                                    </span>

                                                </td>


                                                <td>

                                                    <div className="admin-loans-actions">

                                                        {loan.status ===
                                                            "pending" && (

                                                            <>

                                                                <button
                                                                    type="button"
                                                                    className="admin-loan-action primary"
                                                                    onClick={() =>
                                                                        openApproval(
                                                                            loan
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        actionLoading ===
                                                                        loan._id
                                                                    }
                                                                >
                                                                    Review
                                                                </button>


                                                                <button
                                                                    type="button"
                                                                    className="admin-loan-action danger"
                                                                    onClick={() =>
                                                                        handleReject(
                                                                            loan
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        actionLoading ===
                                                                        loan._id
                                                                    }
                                                                >
                                                                    {actionLoading ===
                                                                    loan._id
                                                                        ? "..."
                                                                        : "Reject"}
                                                                </button>

                                                            </>

                                                        )}


                                                        {loan.status ===
                                                            "approved" && (

                                                            <button
                                                                type="button"
                                                                className="admin-loan-action primary"
                                                                onClick={() =>
                                                                    handleActivate(
                                                                        loan
                                                                    )
                                                                }
                                                                disabled={
                                                                    actionLoading ===
                                                                    loan._id
                                                                }
                                                            >
                                                                {actionLoading ===
                                                                loan._id
                                                                    ? "..."
                                                                    : "Activate"}
                                                            </button>

                                                        )}


                                                        {loan.status ===
                                                            "active" && (

                                                            <button
                                                                type="button"
                                                                className="admin-loan-action success"
                                                                onClick={() =>
                                                                    handleMarkPaid(
                                                                        loan
                                                                    )
                                                                }
                                                                disabled={
                                                                    actionLoading ===
                                                                    loan._id
                                                                }
                                                            >
                                                                {actionLoading ===
                                                                loan._id
                                                                    ? "..."
                                                                    : "Mark Paid"}
                                                            </button>

                                                        )}


                                                        {(loan.status ===
                                                            "rejected" ||
                                                            loan.status ===
                                                            "paid") && (

                                                            <button
                                                                type="button"
                                                                className="admin-loan-action view"
                                                                onClick={() =>
                                                                    openApproval(
                                                                        loan
                                                                    )
                                                                }
                                                            >
                                                                View
                                                            </button>

                                                        )}

                                                    </div>

                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    )}

                </section>

            </main>


            {/* =================================
                APPROVAL MODAL
            ================================= */}

            {selectedLoan && (

                <div
                    className="admin-loans-modal-overlay"
                    onMouseDown={event => {

                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closeModal();
                        }

                    }}
                >

                    <div
                        className="admin-loans-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="admin-loan-modal-title"
                    >

                        <div className="admin-loans-modal-header">

                            <div>

                                <span>
                                    Loan Application
                                </span>

                                <h2 id="admin-loan-modal-title">
                                    {
                                        selectedLoan.applicationNumber
                                    }
                                </h2>

                            </div>


                            <button
                                type="button"
                                className="admin-loans-modal-close"
                                onClick={closeModal}
                                disabled={
                                    Boolean(
                                        actionLoading
                                    )
                                }
                                aria-label="Close"
                            >
                                ×
                            </button>

                        </div>


                        <div className="admin-loans-modal-body">

                            <div className="admin-loans-customer-card">

                                <div className="admin-loans-customer-avatar">
                                    {
                                        getCustomerName(
                                            selectedLoan
                                        )
                                            .charAt(0)
                                            .toUpperCase()
                                    }
                                </div>

                                <div>

                                    <strong>
                                        {
                                            getCustomerName(
                                                selectedLoan
                                            )
                                        }
                                    </strong>

                                    <span>
                                        {
                                            getCustomerEmail(
                                                selectedLoan
                                            )
                                        }
                                    </span>

                                    {getCustomerNumber(
                                        selectedLoan
                                    ) && (

                                        <small>
                                            {
                                                getCustomerNumber(
                                                    selectedLoan
                                                )
                                            }
                                        </small>

                                    )}

                                </div>

                            </div>


                            <div className="admin-loans-detail-grid">

                                <div>

                                    <span>
                                        Loan Type
                                    </span>

                                    <strong>
                                        {
                                            selectedLoan.loanType
                                        }
                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        Requested Amount
                                    </span>

                                    <strong>
                                        {
                                            formatCurrency(
                                                selectedLoan.requestedAmount
                                            )
                                        }
                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        Term
                                    </span>

                                    <strong>
                                        {
                                            selectedLoan.termMonths
                                        }{" "}
                                        {selectedLoan.termMonths ===
                                        1
                                            ? "month"
                                            : "months"}
                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        Application Date
                                    </span>

                                    <strong>
                                        {
                                            formatDate(
                                                selectedLoan.applicationDate
                                            )
                                        }
                                    </strong>

                                </div>

                            </div>


                            <div className="admin-loans-purpose">

                                <span>
                                    Loan Purpose
                                </span>

                                <p>
                                    {
                                        selectedLoan.purpose
                                    }
                                </p>

                            </div>


                            {selectedLoan.status ===
                                "pending" ? (

                                <>

                                    <div className="admin-loans-form">

                                        <div className="admin-loans-form-field">

                                            <label htmlFor="approvedAmount">
                                                Approved Amount
                                            </label>

                                            <div className="admin-loans-input-wrap">

                                                <span>
                                                    CAD
                                                </span>

                                                <input
                                                    id="approvedAmount"
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={
                                                        approvedAmount
                                                    }
                                                    onChange={event =>
                                                        setApprovedAmount(
                                                            event.target.value
                                                        )
                                                    }
                                                />

                                            </div>

                                            <small>
                                                Cannot exceed the requested amount.
                                            </small>

                                        </div>


                                        <div className="admin-loans-form-field">

                                            <label htmlFor="interestRate">
                                                Interest Rate
                                            </label>

                                            <div className="admin-loans-input-wrap">

                                                <input
                                                    id="interestRate"
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    placeholder="e.g. 7.5"
                                                    value={
                                                        interestRate
                                                    }
                                                    onChange={event =>
                                                        setInterestRate(
                                                            event.target.value
                                                        )
                                                    }
                                                />

                                                <span>
                                                    %
                                                </span>

                                            </div>

                                        </div>


                                        <div className="admin-loans-form-field">

                                            <label htmlFor="monthlyPayment">
                                                Monthly Payment
                                            </label>

                                            <div className="admin-loans-input-wrap">

                                                <span>
                                                    CAD
                                                </span>

                                                <input
                                                    id="monthlyPayment"
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    placeholder="e.g. 450.00"
                                                    value={
                                                        monthlyPayment
                                                    }
                                                    onChange={event =>
                                                        setMonthlyPayment(
                                                            event.target.value
                                                        )
                                                    }
                                                />

                                            </div>

                                        </div>

                                    </div>


                                    {actionError && (

                                        <div className="admin-loans-modal-error">
                                            {actionError}
                                        </div>

                                    )}


                                    <div className="admin-loans-modal-actions">

                                        <button
                                            type="button"
                                            className="admin-loan-modal-reject"
                                            onClick={() =>
                                                handleReject(
                                                    selectedLoan
                                                )
                                            }
                                            disabled={
                                                Boolean(
                                                    actionLoading
                                                )
                                            }
                                        >
                                            Reject
                                        </button>


                                        <button
                                            type="button"
                                            className="admin-loan-modal-approve"
                                            onClick={
                                                handleApprove
                                            }
                                            disabled={
                                                Boolean(
                                                    actionLoading
                                                )
                                            }
                                        >
                                            {actionLoading
                                                ? "Processing..."
                                                : "Approve & Disburse"}
                                        </button>

                                    </div>

                                </>

                            ) : (

                                <div className="admin-loans-existing-details">

                                    <div>

                                        <span>
                                            Status
                                        </span>

                                        <strong className={
                                            `admin-loan-status ${selectedLoan.status}`
                                        }>
                                            {
                                                selectedLoan.status
                                            }
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Approved Amount
                                        </span>

                                        <strong>
                                            {
                                                formatCurrency(
                                                    selectedLoan.principalAmount
                                                )
                                            }
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Outstanding Balance
                                        </span>

                                        <strong>
                                            {
                                                formatCurrency(
                                                    selectedLoan.outstandingBalance
                                                )
                                            }
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Interest Rate
                                        </span>

                                        <strong>
                                            {selectedLoan.interestRate !==
                                            undefined
                                                ? `${selectedLoan.interestRate}%`
                                                : "—"}
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Monthly Payment
                                        </span>

                                        <strong>
                                            {
                                                selectedLoan.monthlyPayment !==
                                                undefined
                                                    ? formatCurrency(
                                                        selectedLoan.monthlyPayment
                                                    )
                                                    : "—"
                                            }
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Approved Date
                                        </span>

                                        <strong>
                                            {
                                                formatDate(
                                                    selectedLoan.approvedDate
                                                )
                                            }
                                        </strong>

                                    </div>

                                </div>

                            )}

                        </div>

                    </div>

                </div>

            )}

        </div>

    );

}


/* =========================================
   PROTECTED PAGE
========================================= */

function AdminLoans() {

    return (

        <AdminProtectedRoute>

            <AdminLoansContent />

        </AdminProtectedRoute>

    );

}


export default AdminLoans;