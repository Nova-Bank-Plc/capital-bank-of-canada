import {
    useEffect,
    useMemo,
    useState,
} from "react";

import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import "./Loans.css";


const API_BASE_URL =
    import.meta.env.VITE_API_URL ||
    (import.meta.env.PROD
        ? ""
        : "http://localhost:5000");


interface ApiLoan {
    _id: string;
    userId: string;
    loanType: string;
    loanNumber: string;
    principalAmount: number;
    outstandingBalance: number;
    interestRate: number;
    termMonths: number;
    monthlyPayment: number;
    nextPaymentDate?: string;
    status:
        | "pending"
        | "approved"
        | "active"
        | "rejected"
        | "paid";
    applicationDate: string;
    approvedDate?: string;
    createdAt: string;
    updatedAt: string;
}


interface LoansResponse {
    success: boolean;
    data: {
        loans: ApiLoan[];
    };
}


function formatCurrency(
    amount: number
) {
    return new Intl.NumberFormat(
        "en-CA",
        {
            style: "currency",
            currency: "CAD",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }
    ).format(amount);
}


function formatDate(
    date?: string
) {
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

    return new Intl.DateTimeFormat(
        "en-CA",
        {
            year: "numeric",
            month: "short",
            day: "numeric",
        }
    ).format(parsedDate);
}


function formatLoanType(
    loanType: string
) {
    return loanType
        .replace(/[-_]/g, " ")
        .replace(
            /\b\w/g,
            (letter) =>
                letter.toUpperCase()
        );
}


function formatStatus(
    status: ApiLoan["status"]
) {
    return status
        .replace(/[-_]/g, " ")
        .replace(
            /\b\w/g,
            (letter) =>
                letter.toUpperCase()
        );
}


function Loans() {

    const { token } = useAuth();

    const [loans, setLoans] =
        useState<ApiLoan[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    useEffect(() => {

        if (!token) {

            setLoading(false);

            setError(
                "Authentication required."
            );

            return;
        }


        const loadLoans =
            async () => {

                try {

                    setLoading(true);
                    setError("");


                    const response =
                        await fetch(
                            `${API_BASE_URL}/api/loans`,
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
                            "Unable to load loans."
                        );
                    }


                    const data =
                        result as LoansResponse;


                    if (
                        !data.success ||
                        !data.data ||
                        !Array.isArray(
                            data.data.loans
                        )
                    ) {

                        throw new Error(
                            "Unable to load loans."
                        );
                    }


                    setLoans(
                        data.data.loans
                    );

                } catch (requestError) {

                    console.error(
                        "Loans loading error:",
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


        loadLoans();

    }, [token]);


    const activeLoans =
        useMemo(
            () =>
                loans.filter(
                    (loan) =>
                        loan.status ===
                        "active"
                ),
            [loans]
        );


    const approvedLoans =
        useMemo(
            () =>
                loans.filter(
                    (loan) =>
                        loan.status ===
                        "approved"
                ),
            [loans]
        );


    const pendingLoans =
        useMemo(
            () =>
                loans.filter(
                    (loan) =>
                        loan.status ===
                        "pending"
                ),
            [loans]
        );


    const completedLoans =
        useMemo(
            () =>
                loans.filter(
                    (loan) =>
                        loan.status ===
                        "paid"
                ),
            [loans]
        );


    const rejectedLoans =
        useMemo(
            () =>
                loans.filter(
                    (loan) =>
                        loan.status ===
                        "rejected"
                ),
            [loans]
        );


    const totalOutstanding =
        useMemo(
            () =>
                activeLoans.reduce(
                    (
                        total,
                        loan
                    ) =>
                        total +
                        loan.outstandingBalance,
                    0
                ),
            [activeLoans]
        );


    const hasCurrentLoans =
        activeLoans.length > 0 ||
        approvedLoans.length > 0;


    const hasApplications =
        pendingLoans.length > 0;


    const hasHistory =
        completedLoans.length > 0 ||
        rejectedLoans.length > 0;


    return (

        <div className="loans-page">

            {/* =========================================
                HEADER
            ========================================= */}

            <header className="loans-header">

                <div className="loans-header-content">

                    <Link
                        to="/dashboard"
                        className="loans-back-link"
                    >
                        ← Dashboard
                    </Link>

                    <h1>
                        Loans
                    </h1>

                    <p>
                        Manage your borrowing,
                        repayments and loan
                        applications.
                    </p>

                </div>


                <button
                    type="button"
                    className="loans-apply-button"
                    disabled
                    title="Loan applications will be enabled in the next step."
                >
                    Apply for a loan
                </button>

            </header>


            {/* =========================================
                LOADING
            ========================================= */}

            {loading && (

                <div className="loans-state-card">

                    <div className="loans-spinner" />

                    <p>
                        Loading your loans...
                    </p>

                </div>

            )}


            {/* =========================================
                ERROR
            ========================================= */}

            {!loading &&
                error && (

                <div className="loans-state-card loans-error">

                    <div className="loans-state-icon">
                        !
                    </div>

                    <h2>
                        Unable to load loans
                    </h2>

                    <p>
                        {error}
                    </p>

                </div>

            )}


            {/* =========================================
                EMPTY
            ========================================= */}

            {!loading &&
                !error &&
                loans.length === 0 && (

                <div className="loans-empty-card">

                    <div className="loans-empty-icon">
                        $
                    </div>

                    <h2>
                        No loans yet
                    </h2>

                    <p>
                        You don't currently have
                        any loans or loan
                        applications.
                    </p>

                    <button
                        type="button"
                        className="loans-apply-button"
                        disabled
                        title="Loan applications will be enabled in the next step."
                    >
                        Apply for a loan
                    </button>

                </div>

            )}


            {/* =========================================
                LOAN CONTENT
            ========================================= */}

            {!loading &&
                !error &&
                loans.length > 0 && (

                <main className="loans-content">

                    {/* =====================================
                        SUMMARY
                    ===================================== */}

                    <section className="loans-summary">

                        <div className="loan-summary-card">

                            <span>
                                Outstanding balance
                            </span>

                            <strong>
                                {formatCurrency(
                                    totalOutstanding
                                )}
                            </strong>

                        </div>


                        <div className="loan-summary-card">

                            <span>
                                Active loans
                            </span>

                            <strong>
                                {activeLoans.length}
                            </strong>

                        </div>


                        <div className="loan-summary-card">

                            <span>
                                Applications
                            </span>

                            <strong>
                                {pendingLoans.length}
                            </strong>

                        </div>

                    </section>


                    {/* =====================================
                        ACTIVE / APPROVED
                    ===================================== */}

                    {hasCurrentLoans && (

                        <section className="loans-section">

                            <div className="loans-section-heading">

                                <div>

                                    <h2>
                                        Current loans
                                    </h2>

                                    <p>
                                        Your current
                                        borrowing and
                                        repayment
                                        information.
                                    </p>

                                </div>

                            </div>


                            <div className="loans-list">

                                {activeLoans.map(
                                    (loan) => (

                                    <article
                                        className="loan-card"
                                        key={loan._id}
                                    >

                                        <div className="loan-card-top">

                                            <div>

                                                <span className="loan-type">
                                                    {formatLoanType(
                                                        loan.loanType
                                                    )}
                                                </span>

                                                <h3>
                                                    {loan.loanNumber}
                                                </h3>

                                            </div>

                                            <span
                                                className={`loan-status loan-status-${loan.status}`}
                                            >
                                                {formatStatus(
                                                    loan.status
                                                )}
                                            </span>

                                        </div>


                                        <div className="loan-details">

                                            <div>
                                                <span>
                                                    Outstanding
                                                </span>

                                                <strong>
                                                    {formatCurrency(
                                                        loan.outstandingBalance
                                                    )}
                                                </strong>
                                            </div>


                                            <div>
                                                <span>
                                                    Monthly payment
                                                </span>

                                                <strong>
                                                    {formatCurrency(
                                                        loan.monthlyPayment
                                                    )}
                                                </strong>
                                            </div>


                                            <div>
                                                <span>
                                                    Interest rate
                                                </span>

                                                <strong>
                                                    {loan.interestRate}%
                                                </strong>
                                            </div>


                                            <div>
                                                <span>
                                                    Next payment
                                                </span>

                                                <strong>
                                                    {formatDate(
                                                        loan.nextPaymentDate
                                                    )}
                                                </strong>
                                            </div>

                                        </div>


                                        <div className="loan-card-footer">

                                            <span>
                                                Original amount
                                            </span>

                                            <strong>
                                                {formatCurrency(
                                                    loan.principalAmount
                                                )}
                                            </strong>

                                            <span>
                                                Term
                                            </span>

                                            <strong>
                                                {loan.termMonths} months
                                            </strong>

                                        </div>

                                    </article>

                                ))}


                                {approvedLoans.map(
                                    (loan) => (

                                    <article
                                        className="loan-card"
                                        key={loan._id}
                                    >

                                        <div className="loan-card-top">

                                            <div>

                                                <span className="loan-type">
                                                    {formatLoanType(
                                                        loan.loanType
                                                    )}
                                                </span>

                                                <h3>
                                                    {loan.loanNumber}
                                                </h3>

                                            </div>

                                            <span
                                                className={`loan-status loan-status-${loan.status}`}
                                            >
                                                {formatStatus(
                                                    loan.status
                                                )}
                                            </span>

                                        </div>


                                        <div className="loan-details">

                                            <div>
                                                <span>
                                                    Approved amount
                                                </span>

                                                <strong>
                                                    {formatCurrency(
                                                        loan.principalAmount
                                                    )}
                                                </strong>
                                            </div>


                                            <div>
                                                <span>
                                                    Monthly payment
                                                </span>

                                                <strong>
                                                    {formatCurrency(
                                                        loan.monthlyPayment
                                                    )}
                                                </strong>
                                            </div>


                                            <div>
                                                <span>
                                                    Interest rate
                                                </span>

                                                <strong>
                                                    {loan.interestRate}%
                                                </strong>
                                            </div>


                                            <div>
                                                <span>
                                                    Approved
                                                </span>

                                                <strong>
                                                    {formatDate(
                                                        loan.approvedDate
                                                    )}
                                                </strong>
                                            </div>

                                        </div>

                                    </article>

                                ))}

                            </div>

                        </section>

                    )}


                    {/* =====================================
                        PENDING APPLICATIONS
                    ===================================== */}

                    {hasApplications && (

                        <section className="loans-section">

                            <div className="loans-section-heading">

                                <div>

                                    <h2>
                                        Loan applications
                                    </h2>

                                    <p>
                                        Applications
                                        currently being
                                        reviewed.
                                    </p>

                                </div>

                            </div>


                            <div className="loan-applications">

                                {pendingLoans.map(
                                    (loan) => (

                                    <article
                                        className="loan-application-card"
                                        key={loan._id}
                                    >

                                        <div>
                                            <span>
                                                Loan type
                                            </span>

                                            <strong>
                                                {formatLoanType(
                                                    loan.loanType
                                                )}
                                            </strong>
                                        </div>


                                        <div>
                                            <span>
                                                Application
                                            </span>

                                            <strong>
                                                {loan.loanNumber}
                                            </strong>
                                        </div>


                                        <div>
                                            <span>
                                                Requested
                                            </span>

                                            <strong>
                                                {formatCurrency(
                                                    loan.principalAmount
                                                )}
                                            </strong>
                                        </div>


                                        <div>
                                            <span>
                                                Applied
                                            </span>

                                            <strong>
                                                {formatDate(
                                                    loan.applicationDate
                                                )}
                                            </strong>
                                        </div>


                                        <span className="loan-status loan-status-pending">
                                            Pending
                                        </span>

                                    </article>

                                ))}

                            </div>

                        </section>

                    )}


                    {/* =====================================
                        LOAN HISTORY
                    ===================================== */}

                    {hasHistory && (

                        <section className="loans-section">

                            <div className="loans-section-heading">

                                <div>

                                    <h2>
                                        Loan history
                                    </h2>

                                    <p>
                                        Previously completed
                                        or declined loan
                                        records.
                                    </p>

                                </div>

                            </div>


                            <div className="loan-history">

                                {completedLoans.map(
                                    (loan) => (

                                    <article
                                        className="loan-history-card"
                                        key={loan._id}
                                    >

                                        <div>

                                            <span>
                                                {formatLoanType(
                                                    loan.loanType
                                                )}
                                            </span>

                                            <strong>
                                                {loan.loanNumber}
                                            </strong>

                                        </div>


                                        <div>

                                            <span>
                                                Amount
                                            </span>

                                            <strong>
                                                {formatCurrency(
                                                    loan.principalAmount
                                                )}
                                            </strong>

                                        </div>


                                        <div>

                                            <span>
                                                Status
                                            </span>

                                            <span className="loan-status loan-status-paid">
                                                Paid
                                            </span>

                                        </div>

                                    </article>

                                ))}


                                {rejectedLoans.map(
                                    (loan) => (

                                    <article
                                        className="loan-history-card"
                                        key={loan._id}
                                    >

                                        <div>

                                            <span>
                                                {formatLoanType(
                                                    loan.loanType
                                                )}
                                            </span>

                                            <strong>
                                                {loan.loanNumber}
                                            </strong>

                                        </div>


                                        <div>

                                            <span>
                                                Requested
                                            </span>

                                            <strong>
                                                {formatCurrency(
                                                    loan.principalAmount
                                                )}
                                            </strong>

                                        </div>


                                        <div>

                                            <span>
                                                Status
                                            </span>

                                            <span className="loan-status loan-status-rejected">
                                                Rejected
                                            </span>

                                        </div>

                                    </article>

                                ))}

                            </div>

                        </section>

                    )}

                </main>

            )}

        </div>

    );

}


export default Loans;
