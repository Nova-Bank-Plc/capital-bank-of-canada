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

import { useAuth } from "../context/AuthContext";

import "./LoanApplication.css";


const API_BASE_URL =
    import.meta.env.VITE_API_URL ||
    (import.meta.env.PROD
        ? ""
        : "http://localhost:5000");


function LoanApplication() {

    const { token } = useAuth();

    const navigate =
        useNavigate();


    const [loanType, setLoanType] =
        useState("Personal");


    const [requestedAmount, setRequestedAmount] =
        useState("");


    const [termMonths, setTermMonths] =
        useState("");


    const [purpose, setPurpose] =
        useState("");


    const [submitting, setSubmitting] =
        useState(false);


    const [error, setError] =
        useState("");


    const [success, setSuccess] =
        useState("");


    const handleSubmit =
        async (
            event: FormEvent<HTMLFormElement>
        ) => {

            event.preventDefault();


            setError("");
            setSuccess("");


            if (!token) {

                setError(
                    "Authentication required."
                );

                return;

            }


            const amount =
                Number(requestedAmount);


            const term =
                Number(termMonths);


            if (
                !Number.isFinite(amount) ||
                amount <= 0
            ) {

                setError(
                    "Please enter a valid requested amount."
                );

                return;

            }


            if (
                !Number.isInteger(term) ||
                term <= 0
            ) {

                setError(
                    "Please enter a valid loan term."
                );

                return;

            }


            if (
                purpose.trim().length < 5
            ) {

                setError(
                    "Please provide a loan purpose of at least 5 characters."
                );

                return;

            }


            try {

                setSubmitting(true);


                const response =
                    await fetch(
                        `${API_BASE_URL}/api/loans`,
                        {
                            method: "POST",

                            headers: {
                                Authorization:
                                    `Bearer ${token}`,

                                "Content-Type":
                                    "application/json",
                            },

                            body:
                                JSON.stringify({
                                    loanType,
                                    requestedAmount:
                                        amount,
                                    termMonths:
                                        term,
                                    purpose:
                                        purpose.trim(),
                                }),
                        }
                    );


                const result =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        result.message ||
                        "Unable to submit loan application."
                    );

                }


                setSuccess(
                    result.message ||
                    "Loan application submitted successfully."
                );


                setRequestedAmount("");
                setTermMonths("");
                setPurpose("");


                setTimeout(() => {

                    navigate(
                        "/dashboard/loans"
                    );

                }, 1200);

            } catch (requestError) {

                console.error(
                    "Loan application error:",
                    requestError
                );


                setError(
                    requestError instanceof Error
                        ? requestError.message
                        : "Unable to submit loan application."
                );

            } finally {

                setSubmitting(false);

            }

        };


    return (

        <div className="loan-application-page">

            <header className="loan-application-header">

                <Link
                    to="/dashboard/loans"
                    className="loan-application-back"
                >
                    ← Back to Loans
                </Link>


                <div>

                    <h1>
                        Apply for a loan
                    </h1>


                    <p>
                        Tell us about the financing
                        you are requesting.
                    </p>

                </div>

            </header>


            <main className="loan-application-content">

                <section className="loan-application-card">

                    <form
                        onSubmit={handleSubmit}
                    >

                        <div className="loan-form-group">

                            <label htmlFor="loanType">
                                Loan type
                            </label>


                            <select
                                id="loanType"
                                value={loanType}
                                onChange={(event) =>
                                    setLoanType(
                                        event.target.value
                                    )
                                }
                                disabled={submitting}
                            >

                                <option value="Personal">
                                    Personal
                                </option>

                                <option value="Home">
                                    Home
                                </option>

                                <option value="Auto">
                                    Auto
                                </option>

                                <option value="Education">
                                    Education
                                </option>

                                <option value="Business">
                                    Business
                                </option>

                            </select>

                        </div>


                        <div className="loan-form-group">

                            <label htmlFor="requestedAmount">
                                Requested amount
                            </label>


                            <div className="loan-input-prefix">

                                <span>
                                    $
                                </span>


                                <input
                                    id="requestedAmount"
                                    type="number"
                                    min="1"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={
                                        requestedAmount
                                    }
                                    onChange={(event) =>
                                        setRequestedAmount(
                                            event.target.value
                                        )
                                    }
                                    disabled={submitting}
                                    required
                                />

                            </div>

                        </div>


                        <div className="loan-form-group">

                            <label htmlFor="termMonths">
                                Repayment term
                            </label>


                            <select
                                id="termMonths"
                                value={termMonths}
                                onChange={(event) =>
                                    setTermMonths(
                                        event.target.value
                                    )
                                }
                                disabled={submitting}
                                required
                            >

                                <option value="">
                                    Select a term
                                </option>

                                <option value="12">
                                    12 months
                                </option>

                                <option value="24">
                                    24 months
                                </option>

                                <option value="36">
                                    36 months
                                </option>

                                <option value="48">
                                    48 months
                                </option>

                                <option value="60">
                                    60 months
                                </option>

                                <option value="72">
                                    72 months
                                </option>

                            </select>

                        </div>


                        <div className="loan-form-group">

                            <label htmlFor="purpose">
                                Purpose of the loan
                            </label>


                            <textarea
                                id="purpose"
                                rows={5}
                                maxLength={500}
                                placeholder="Tell us how you plan to use the funds."
                                value={purpose}
                                onChange={(event) =>
                                    setPurpose(
                                        event.target.value
                                    )
                                }
                                disabled={submitting}
                                required
                            />


                            <span className="loan-character-count">
                                {purpose.length}/500
                            </span>

                        </div>


                        {error && (

                            <div className="loan-form-message loan-form-error">
                                {error}
                            </div>

                        )}


                        {success && (

                            <div className="loan-form-message loan-form-success">
                                {success}
                            </div>

                        )}


                        <div className="loan-application-actions">

                            <Link
                                to="/dashboard/loans"
                                className="loan-cancel-button"
                            >
                                Cancel
                            </Link>


                            <button
                                type="submit"
                                className="loan-submit-button"
                                disabled={submitting}
                            >
                                {submitting
                                    ? "Submitting..."
                                    : "Submit application"}
                            </button>

                        </div>

                    </form>

                </section>


                <aside className="loan-application-information">

                    <h2>
                        Before you apply
                    </h2>


                    <p>
                        Your application will be
                        reviewed by Capital Bank of
                        Canada before any loan terms
                        are established.
                    </p>


                    <ul>

                        <li>
                            Your requested amount is
                            not an approved loan amount.
                        </li>

                        <li>
                            Interest rates and monthly
                            payments are determined
                            during the approval process.
                        </li>

                        <li>
                            Submitting an application
                            does not guarantee approval.
                        </li>

                    </ul>

                </aside>

            </main>

        </div>

    );

}


export default LoanApplication;

