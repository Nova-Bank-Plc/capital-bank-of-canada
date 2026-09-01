import { useState } from "react";
import { Link } from "react-router-dom";
import "./Register.css";


interface FormData {

    firstName: string;
    middleName: string;
    lastName: string;
    dateOfBirth: string;

    email: string;
    phone: string;
    address: string;
    city: string;
    province: string;
    postalCode: string;

    employmentStatus: string;
    annualIncome: string;
    accountPurpose: string;

    username: string;
    password: string;
}


const initialFormData: FormData = {

    firstName: "",
    middleName: "",
    lastName: "",
    dateOfBirth: "",

    email: "",
    phone: "",
    address: "",
    city: "",
    province: "",
    postalCode: "",

    employmentStatus: "",
    annualIncome: "",
    accountPurpose: "",

    username: "",
    password: "",
};


function Register() {

    const [step, setStep] =
        useState(1);

    const [formData, setFormData] =
        useState<FormData>(initialFormData);

    const [showErrors, setShowErrors] =
        useState(false);

    const [submitted, setSubmitted] =
        useState(false);

    const [isSubmitting, setIsSubmitting] =
        useState(false);

    const [submitError, setSubmitError] =
        useState("");



    const updateField = (
        field: keyof FormData,
        value: string
    ) => {

        setFormData((current) => ({
            ...current,
            [field]: value,
        }));

        setShowErrors(false);
        setSubmitError("");
    };



    const validateStep = () => {

        if (step === 1) {

            return (
                formData.firstName.trim() !== "" &&
                formData.lastName.trim() !== "" &&
                formData.dateOfBirth !== ""
            );

        }


        if (step === 2) {

            return (
                formData.email.trim() !== "" &&
                formData.phone.trim() !== "" &&
                formData.address.trim() !== "" &&
                formData.city.trim() !== "" &&
                formData.province !== "" &&
                formData.postalCode.trim() !== ""
            );

        }


        if (step === 3) {

            return (
                formData.employmentStatus !== "" &&
                formData.annualIncome !== "" &&
                formData.accountPurpose !== ""
            );

        }


        if (step === 4) {

            return (
                formData.username.trim() !== "" &&
                formData.password.length >= 8
            );

        }


        return true;
    };



    const handleContinue = (
        event: React.FormEvent<HTMLFormElement>
    ) => {

        event.preventDefault();

        setSubmitError("");


        if (!validateStep()) {

            setShowErrors(true);

            return;
        }


        setShowErrors(false);


        if (step < 5) {

            setStep(
                (current) => current + 1
            );
        }
    };



    const handleBack = () => {

        if (step > 1) {

            setStep(
                (current) => current - 1
            );

            setShowErrors(false);
            setSubmitError("");
        }
    };



    const handleSubmit = async () => {

        setSubmitError("");
        setIsSubmitting(true);


        try {

            const response = await fetch(
                "https://acceptable-comfort-production-46c5.up.railway.app/api/auth/register",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                    },

                    body: JSON.stringify({

                        firstName:
                            formData.firstName.trim(),

                        lastName:
                            formData.lastName.trim(),

                        email:
                            formData.email
                                .toLowerCase()
                                .trim(),

                        phone:
                            formData.phone.trim(),

                        password:
                            formData.password,

                    }),
                }
            );


            const data =
                await response.json();


            if (
                !response.ok ||
                !data.success
            ) {

                setSubmitError(
                    data.message ||
                    "Unable to create your account."
                );

                return;
            }


            setSubmitted(true);


        } catch (error) {

            console.error(
                "Registration error:",
                error
            );


            setSubmitError(
                "Unable to connect to Capital Bank. Please try again."
            );


        } finally {

            setIsSubmitting(false);

        }
    };



    if (submitted) {

        return (

            <main className="register-page">

                <header className="register-header">

                    <Link
                        to="/"
                        className="register-logo"
                    >

                        <span className="register-logo-mark">
                            C
                        </span>

                        <span className="register-logo-text">

                            CAPITAL

                            <small>
                                BANK OF CANADA
                            </small>

                        </span>

                    </Link>

                </header>


                <div className="register-success">

                    <div className="success-icon">
                        ✓
                    </div>

                    <span className="register-eyebrow">
                        APPLICATION RECEIVED
                    </span>

                    <h1>
                        Thank you for choosing
                        Capital Bank.
                    </h1>

                    <p>
                        Your account application has been
                        received. We will review the information
                        provided and guide you through the next
                        steps.
                    </p>

                    <Link
                        to="/"
                        className="success-home"
                    >

                        Return to homepage

                        <span>
                            →
                        </span>

                    </Link>

                </div>

            </main>
        );
    }



    return (

        <main className="register-page">


            {/* =========================================
                HEADER
            ========================================= */}

            <header className="register-header">

                <Link
                    to="/"
                    className="register-logo"
                >

                    <span className="register-logo-mark">
                        C
                    </span>

                    <span className="register-logo-text">

                        CAPITAL

                        <small>
                            BANK OF CANADA
                        </small>

                    </span>

                </Link>


                <div className="register-header-right">

                    <span>
                        Already a client?
                    </span>

                    <Link to="/login">
                        Sign in
                    </Link>

                </div>

            </header>



            {/* =========================================
                MAIN CONTAINER
            ========================================= */}

            <div className="register-container">


                {/* =========================================
                    PROGRESS
                ========================================= */}

                <div className="register-progress">

                    <div className="progress-top">

                        <span>
                            ACCOUNT APPLICATION
                        </span>

                        <strong>
                            STEP {step} OF 5
                        </strong>

                    </div>


                    <div className="progress-track">

                        <div
                            className="progress-fill"
                            style={{
                                width:
                                    `${step * 20}%`,
                            }}
                        />

                    </div>

                </div>



                {/* =========================================
                    STEP 1
                ========================================= */}

                {step === 1 && (

                    <>

                        <div className="register-heading">

                            <span className="register-eyebrow">
                                PERSONAL INFORMATION
                            </span>

                            <h1>
                                Let's get to know you.
                            </h1>

                            <p>
                                Tell us a little about yourself.
                                This information will help us
                                set up your Capital Bank account.
                            </p>

                        </div>


                        <form
                            className="register-form"
                            onSubmit={handleContinue}
                        >

                            <div className="form-section">

                                <div className="form-section-heading">

                                    <span>
                                        01
                                    </span>

                                    <div>

                                        <h2>
                                            Your name
                                        </h2>

                                        <p>
                                            Enter your legal name
                                            as it appears on your
                                            identification.
                                        </p>

                                    </div>

                                </div>


                                <div className="form-grid">


                                    <div className="register-field">

                                        <label htmlFor="firstName">
                                            First name
                                        </label>

                                        <input
                                            id="firstName"
                                            type="text"
                                            value={
                                                formData.firstName
                                            }
                                            onChange={(event) =>
                                                updateField(
                                                    "firstName",
                                                    event.target.value
                                                )
                                            }
                                            placeholder="Enter your first name"
                                            autoComplete="given-name"
                                        />

                                        {showErrors &&
                                            !formData.firstName.trim() && (

                                                <small className="field-error">
                                                    First name is required.
                                                </small>

                                            )}

                                    </div>



                                    <div className="register-field">

                                        <label htmlFor="middleName">

                                            Middle name

                                            <span>
                                                Optional
                                            </span>

                                        </label>

                                        <input
                                            id="middleName"
                                            type="text"
                                            value={
                                                formData.middleName
                                            }
                                            onChange={(event) =>
                                                updateField(
                                                    "middleName",
                                                    event.target.value
                                                )
                                            }
                                            placeholder="Enter your middle name"
                                            autoComplete="additional-name"
                                        />

                                    </div>



                                    <div className="register-field">

                                        <label htmlFor="lastName">
                                            Last name
                                        </label>

                                        <input
                                            id="lastName"
                                            type="text"
                                            value={
                                                formData.lastName
                                            }
                                            onChange={(event) =>
                                                updateField(
                                                    "lastName",
                                                    event.target.value
                                                )
                                            }
                                            placeholder="Enter your last name"
                                            autoComplete="family-name"
                                        />

                                        {showErrors &&
                                            !formData.lastName.trim() && (

                                                <small className="field-error">
                                                    Last name is required.
                                                </small>

                                            )}

                                    </div>



                                    <div className="register-field">

                                        <label htmlFor="dateOfBirth">
                                            Date of birth
                                        </label>

                                        <input
                                            id="dateOfBirth"
                                            type="date"
                                            value={
                                                formData.dateOfBirth
                                            }
                                            onChange={(event) =>
                                                updateField(
                                                    "dateOfBirth",
                                                    event.target.value
                                                )
                                            }
                                            autoComplete="bday"
                                        />

                                        {showErrors &&
                                            !formData.dateOfBirth && (

                                                <small className="field-error">
                                                    Date of birth is required.
                                                </small>

                                            )}

                                    </div>

                                </div>

                            </div>


                            <div className="register-actions">

                                <Link
                                    to="/"
                                    className="register-back"
                                >
                                    ← Back
                                </Link>

                                <button
                                    type="submit"
                                    className="register-continue"
                                >

                                    Continue

                                    <span>
                                        →
                                    </span>

                                </button>

                            </div>

                        </form>

                    </>
                )}



                {/* =========================================
                    STEP 2
                ========================================= */}

                {step === 2 && (

                    <>

                        <div className="register-heading">

                            <span className="register-eyebrow">
                                CONTACT INFORMATION
                            </span>

                            <h1>
                                How can we reach you?
                            </h1>

                            <p>
                                Provide your current contact and
                                residential information.
                            </p>

                        </div>


                        <form
                            className="register-form"
                            onSubmit={handleContinue}
                        >

                            <div className="form-section">

                                <div className="form-section-heading">

                                    <span>
                                        02
                                    </span>

                                    <div>

                                        <h2>
                                            Contact details
                                        </h2>

                                        <p>
                                            We'll use these details
                                            when communicating with you.
                                        </p>

                                    </div>

                                </div>


                                <div className="form-grid">


                                    <div className="register-field">

                                        <label htmlFor="email">
                                            Email address
                                        </label>

                                        <input
                                            id="email"
                                            type="email"
                                            value={
                                                formData.email
                                            }
                                            onChange={(event) =>
                                                updateField(
                                                    "email",
                                                    event.target.value
                                                )
                                            }
                                            placeholder="name@example.com"
                                            autoComplete="email"
                                        />

                                    </div>



                                    <div className="register-field">

                                        <label htmlFor="phone">
                                            Phone number
                                        </label>

                                        <input
                                            id="phone"
                                            type="tel"
                                            value={
                                                formData.phone
                                            }
                                            onChange={(event) =>
                                                updateField(
                                                    "phone",
                                                    event.target.value
                                                )
                                            }
                                            placeholder="+1 (000) 000-0000"
                                            autoComplete="tel"
                                        />

                                    </div>



                                    <div className="register-field full-width">

                                        <label htmlFor="address">
                                            Residential address
                                        </label>

                                        <input
                                            id="address"
                                            type="text"
                                            value={
                                                formData.address
                                            }
                                            onChange={(event) =>
                                                updateField(
                                                    "address",
                                                    event.target.value
                                                )
                                            }
                                            placeholder="Street address"
                                            autoComplete="street-address"
                                        />

                                    </div>



                                    <div className="register-field">

                                        <label htmlFor="city">
                                            City
                                        </label>

                                        <input
                                            id="city"
                                            type="text"
                                            value={
                                                formData.city
                                            }
                                            onChange={(event) =>
                                                updateField(
                                                    "city",
                                                    event.target.value
                                                )
                                            }
                                            placeholder="City"
                                            autoComplete="address-level2"
                                        />

                                    </div>



                                    <div className="register-field">

                                        <label htmlFor="province">
                                            Province
                                        </label>

                                        <select
                                            id="province"
                                            value={
                                                formData.province
                                            }
                                            onChange={(event) =>
                                                updateField(
                                                    "province",
                                                    event.target.value
                                                )
                                            }
                                        >

                                            <option value="">
                                                Select province
                                            </option>

                                            <option value="AB">
                                                Alberta
                                            </option>

                                            <option value="BC">
                                                British Columbia
                                            </option>

                                            <option value="MB">
                                                Manitoba
                                            </option>

                                            <option value="NB">
                                                New Brunswick
                                            </option>

                                            <option value="NL">
                                                Newfoundland and Labrador
                                            </option>

                                            <option value="NS">
                                                Nova Scotia
                                            </option>

                                            <option value="ON">
                                                Ontario
                                            </option>

                                            <option value="PE">
                                                Prince Edward Island
                                            </option>

                                            <option value="QC">
                                                Quebec
                                            </option>

                                            <option value="SK">
                                                Saskatchewan
                                            </option>

                                            <option value="NT">
                                                Northwest Territories
                                            </option>

                                            <option value="NU">
                                                Nunavut
                                            </option>

                                            <option value="YT">
                                                Yukon
                                            </option>

                                        </select>

                                    </div>



                                    <div className="register-field">

                                        <label htmlFor="postalCode">
                                            Postal code
                                        </label>

                                        <input
                                            id="postalCode"
                                            type="text"
                                            value={
                                                formData.postalCode
                                            }
                                            onChange={(event) =>
                                                updateField(
                                                    "postalCode",
                                                    event.target.value
                                                )
                                            }
                                            placeholder="A1A 1A1"
                                            autoComplete="postal-code"
                                        />

                                    </div>

                                </div>

                            </div>


                            <div className="register-actions">

                                <button
                                    type="button"
                                    className="register-back"
                                    onClick={handleBack}
                                >
                                    ← Back
                                </button>

                                <button
                                    type="submit"
                                    className="register-continue"
                                >

                                    Continue

                                    <span>
                                        →
                                    </span>

                                </button>

                            </div>

                        </form>

                    </>
                )}



                {/* =========================================
                    STEP 3
                ========================================= */}

                {step === 3 && (

                    <>

                        <div className="register-heading">

                            <span className="register-eyebrow">
                                FINANCIAL INFORMATION
                            </span>

                            <h1>
                                Tell us about your finances.
                            </h1>

                            <p>
                                This helps us understand how you
                                plan to use your Capital Bank account.
                            </p>

                        </div>


                        <form
                            className="register-form"
                            onSubmit={handleContinue}
                        >

                            <div className="form-section">

                                <div className="form-section-heading">

                                    <span>
                                        03
                                    </span>

                                    <div>

                                        <h2>
                                            Financial profile
                                        </h2>

                                        <p>
                                            Select the options that
                                            best describe your situation.
                                        </p>

                                    </div>

                                </div>


                                <div className="form-grid">


                                    <div className="register-field">

                                        <label htmlFor="employmentStatus">
                                            Employment status
                                        </label>

                                        <select
                                            id="employmentStatus"
                                            value={
                                                formData.employmentStatus
                                            }
                                            onChange={(event) =>
                                                updateField(
                                                    "employmentStatus",
                                                    event.target.value
                                                )
                                            }
                                        >

                                            <option value="">
                                                Select status
                                            </option>

                                            <option value="employed">
                                                Employed
                                            </option>

                                            <option value="self-employed">
                                                Self-employed
                                            </option>

                                            <option value="student">
                                                Student
                                            </option>

                                            <option value="retired">
                                                Retired
                                            </option>

                                            <option value="unemployed">
                                                Not currently employed
                                            </option>

                                        </select>

                                    </div>



                                    <div className="register-field">

                                        <label htmlFor="annualIncome">
                                            Annual income
                                        </label>

                                        <select
                                            id="annualIncome"
                                            value={
                                                formData.annualIncome
                                            }
                                            onChange={(event) =>
                                                updateField(
                                                    "annualIncome",
                                                    event.target.value
                                                )
                                            }
                                        >

                                            <option value="">
                                                Select range
                                            </option>

                                            <option value="under-25k">
                                                Under $25,000
                                            </option>

                                            <option value="25k-50k">
                                                $25,000 – $49,999
                                            </option>

                                            <option value="50k-100k">
                                                $50,000 – $99,999
                                            </option>

                                            <option value="100k-250k">
                                                $100,000 – $249,999
                                            </option>

                                            <option value="250k-plus">
                                                $250,000+
                                            </option>

                                        </select>

                                    </div>



                                    <div className="register-field full-width">

                                        <label htmlFor="accountPurpose">
                                            Primary reason for opening an account
                                        </label>

                                        <select
                                            id="accountPurpose"
                                            value={
                                                formData.accountPurpose
                                            }
                                            onChange={(event) =>
                                                updateField(
                                                    "accountPurpose",
                                                    event.target.value
                                                )
                                            }
                                        >

                                            <option value="">
                                                Select purpose
                                            </option>

                                            <option value="everyday">
                                                Everyday banking
                                            </option>

                                            <option value="saving">
                                                Saving
                                            </option>

                                            <option value="investing">
                                                Investing
                                            </option>

                                            <option value="business">
                                                Business banking
                                            </option>

                                            <option value="other">
                                                Other
                                            </option>

                                        </select>

                                    </div>

                                </div>

                            </div>


                            <div className="register-actions">

                                <button
                                    type="button"
                                    className="register-back"
                                    onClick={handleBack}
                                >
                                    ← Back
                                </button>

                                <button
                                    type="submit"
                                    className="register-continue"
                                >

                                    Continue

                                    <span>
                                        →
                                    </span>

                                </button>

                            </div>

                        </form>

                    </>
                )}



                {/* =========================================
                    STEP 4
                ========================================= */}

                {step === 4 && (

                    <>

                        <div className="register-heading">

                            <span className="register-eyebrow">
                                SECURITY
                            </span>

                            <h1>
                                Secure your account.
                            </h1>

                            <p>
                                Create the credentials you'll use
                                to access Capital Bank online banking.
                            </p>

                        </div>


                        <form
                            className="register-form"
                            onSubmit={handleContinue}
                        >

                            <div className="form-section">

                                <div className="form-section-heading">

                                    <span>
                                        04
                                    </span>

                                    <div>

                                        <h2>
                                            Online banking access
                                        </h2>

                                        <p>
                                            Choose secure credentials
                                            for your account.
                                        </p>

                                    </div>

                                </div>


                                <div className="form-grid">


                                    <div className="register-field full-width">

                                        <label htmlFor="username">
                                            Username
                                        </label>

                                        <input
                                            id="username"
                                            type="text"
                                            value={
                                                formData.username
                                            }
                                            onChange={(event) =>
                                                updateField(
                                                    "username",
                                                    event.target.value
                                                )
                                            }
                                            placeholder="Choose a username"
                                            autoComplete="username"
                                        />

                                    </div>



                                    <div className="register-field full-width">

                                        <label htmlFor="password">
                                            Password
                                        </label>

                                        <input
                                            id="password"
                                            type="password"
                                            value={
                                                formData.password
                                            }
                                            onChange={(event) =>
                                                updateField(
                                                    "password",
                                                    event.target.value
                                                )
                                            }
                                            placeholder="Create a secure password"
                                            autoComplete="new-password"
                                        />

                                        <small className="password-hint">
                                            Password must contain at least
                                            8 characters.
                                        </small>

                                    </div>

                                </div>

                            </div>


                            <div className="register-actions">

                                <button
                                    type="button"
                                    className="register-back"
                                    onClick={handleBack}
                                >
                                    ← Back
                                </button>

                                <button
                                    type="submit"
                                    className="register-continue"
                                >

                                    Review application

                                    <span>
                                        →
                                    </span>

                                </button>

                            </div>

                        </form>

                    </>
                )}



                {/* =========================================
                    STEP 5
                ========================================= */}

                {step === 5 && (

                    <>

                        <div className="register-heading">

                            <span className="register-eyebrow">
                                REVIEW
                            </span>

                            <h1>
                                Review your application.
                            </h1>

                            <p>
                                Make sure your information is correct
                                before submitting your application.
                            </p>

                        </div>



                        <div className="review-card">


                            {/* PERSONAL */}

                            <div className="review-section">

                                <div className="review-heading">

                                    <span>
                                        Personal
                                    </span>

                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                    >
                                        Edit
                                    </button>

                                </div>


                                <div className="review-grid">

                                    <div>

                                        <small>
                                            Full name
                                        </small>

                                        <strong>
                                            {formData.firstName}{" "}
                                            {formData.middleName}{" "}
                                            {formData.lastName}
                                        </strong>

                                    </div>


                                    <div>

                                        <small>
                                            Date of birth
                                        </small>

                                        <strong>
                                            {formData.dateOfBirth}
                                        </strong>

                                    </div>

                                </div>

                            </div>



                            {/* CONTACT */}

                            <div className="review-section">

                                <div className="review-heading">

                                    <span>
                                        Contact
                                    </span>

                                    <button
                                        type="button"
                                        onClick={() => setStep(2)}
                                    >
                                        Edit
                                    </button>

                                </div>


                                <div className="review-grid">

                                    <div>

                                        <small>
                                            Email
                                        </small>

                                        <strong>
                                            {formData.email}
                                        </strong>

                                    </div>


                                    <div>

                                        <small>
                                            Phone
                                        </small>

                                        <strong>
                                            {formData.phone}
                                        </strong>

                                    </div>


                                    <div>

                                        <small>
                                            Address
                                        </small>

                                        <strong>
                                            {formData.address},{" "}
                                            {formData.city},{" "}
                                            {formData.province}
                                        </strong>

                                    </div>

                                </div>

                            </div>



                            {/* FINANCIAL */}

                            <div className="review-section">

                                <div className="review-heading">

                                    <span>
                                        Financial
                                    </span>

                                    <button
                                        type="button"
                                        onClick={() => setStep(3)}
                                    >
                                        Edit
                                    </button>

                                </div>


                                <div className="review-grid">

                                    <div>

                                        <small>
                                            Employment
                                        </small>

                                        <strong>
                                            {formData.employmentStatus}
                                        </strong>

                                    </div>


                                    <div>

                                        <small>
                                            Annual income
                                        </small>

                                        <strong>
                                            {formData.annualIncome}
                                        </strong>

                                    </div>

                                </div>

                            </div>



                            {/* ONLINE BANKING */}

                            <div className="review-section">

                                <div className="review-heading">

                                    <span>
                                        Online banking
                                    </span>

                                    <button
                                        type="button"
                                        onClick={() => setStep(4)}
                                    >
                                        Edit
                                    </button>

                                </div>


                                <div className="review-grid">

                                    <div>

                                        <small>
                                            Username
                                        </small>

                                        <strong>
                                            {formData.username}
                                        </strong>

                                    </div>

                                </div>

                            </div>

                        </div>



                        {/* SUBMISSION ERROR */}

                        {submitError && (

                            <div
                                className="login-error"
                                role="alert"
                            >

                                <span>
                                    !
                                </span>

                                <p>
                                    {submitError}
                                </p>

                            </div>

                        )}



                        {/* ACTIONS */}

                        <div className="register-actions">

                            <button
                                type="button"
                                className="register-back"
                                onClick={handleBack}
                                disabled={isSubmitting}
                            >
                                ← Back
                            </button>


                            <button
                                type="button"
                                className="register-continue"
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                            >

                                {isSubmitting
                                    ? "Submitting..."
                                    : "Submit application"
                                }

                                {!isSubmitting && (

                                    <span>
                                        →
                                    </span>

                                )}

                            </button>

                        </div>

                    </>
                )}



                {/* =========================================
                    SECURITY
                ========================================= */}

                <div className="register-security">

                    <div className="security-mark">
                        ✓
                    </div>

                    <div>

                        <strong>
                            Your information is protected
                        </strong>

                        <p>
                            Capital Bank uses industry-standard
                            security measures to help protect
                            your personal information.
                        </p>

                    </div>

                </div>

            </div>

        </main>
    );
}


export default Register;