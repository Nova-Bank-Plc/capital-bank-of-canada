import {
    useEffect,
    useState,
} from "react";

import type {
    SubmitEvent,
} from "react";

import {
    Link,
} from "react-router-dom";

import {
    useAuth,
} from "../context/AuthContext";

import {
    useTheme,
} from "../context/ThemeContext";

import "./HelpCenter.css";


// ======================================
// API
// ======================================

const API_BASE_URL =
    import.meta.env.VITE_API_URL ||
    (
        import.meta.env.PROD
            ? ""
            : "http://localhost:5000"
    );


// ======================================
// HELP CENTRE TYPES
// ======================================

interface HelpItem {
    title: string;
    description: string;
    questions: string[];
}


interface SupportMessage {
    _id?: string;
    senderId: string;
    senderType: "customer" | "admin";
    message: string;
    channel: "chat" | "email" | "sms";
    createdAt: string;
}


interface SupportTicket {
    _id: string;
    ticketNumber: string;
    userId: string;
    subject: string;
    category: string;
    priority:
        | "low"
        | "normal"
        | "high"
        | "urgent";
    status:
        | "open"
        | "in_progress"
        | "waiting_customer"
        | "resolved"
        | "closed";
    messages: SupportMessage[];
    createdAt: string;
    updatedAt: string;
}


// ======================================
// FAQ DATA
// ======================================

const helpItems: HelpItem[] = [

    {
        title: "Accounts",
        description:
            "Find information about your Capital Bank accounts, balances, and account details.",
        questions: [
            "How do I view my account details?",
            "Where can I find my account number?",
            "How do I check my available balance?",
        ],
    },

    {
        title: "Payments & transfers",
        description:
            "Get help with sending money, paying bills, and understanding payment activity.",
        questions: [
            "How do I make a transfer?",
            "How do I pay a bill?",
            "Where can I view my transaction history?",
        ],
    },

    {
        title: "Loans",
        description:
            "Learn more about loan applications, loan status, and repayments.",
        questions: [
            "How do I apply for a loan?",
            "Where can I check my loan status?",
            "How can I view my loan information?",
        ],
    },

    {
        title: "Cards",
        description:
            "Get assistance with your Capital Bank cards and card-related services.",
        questions: [
            "Where can I view my cards?",
            "How do I manage my card?",
            "What should I do if I have a card issue?",
        ],
    },

    {
        title: "Security",
        description:
            "Learn how to keep your banking information and account secure.",
        questions: [
            "How does Capital Bank protect my account?",
            "What should I do if I notice unusual activity?",
            "How can I keep my sign-in information secure?",
        ],
    },

];


// ======================================
// STATUS LABEL
// ======================================

const getStatusLabel = (
    status: SupportTicket["status"]
): string => {

    switch (status) {

        case "in_progress":
            return "In progress";

        case "waiting_customer":
            return "Waiting for you";

        case "resolved":
            return "Resolved";

        case "closed":
            return "Closed";

        default:
            return "Open";

    }

};


// ======================================
// DATE FORMAT
// ======================================

const formatSupportDate = (
    date: string
): string => {

    return new Date(date).toLocaleDateString(
        "en-CA",
        {
            year: "numeric",
            month: "short",
            day: "numeric",
        }
    );

};


// ======================================
// HELP CENTRE
// ======================================

function HelpCenter() {

    const {
        user,
        logout,
    } = useAuth();


    const {
        darkMode,
        toggleDarkMode,
    } = useTheme();


    const [
        openItem,
        setOpenItem,
    ] = useState<number | null>(null);


    // ==================================
    // SUPPORT STATE
    // ==================================

    const [
        tickets,
        setTickets,
    ] = useState<SupportTicket[]>([]);


    const [
        selectedTicket,
        setSelectedTicket,
    ] = useState<SupportTicket | null>(null);


    const [
        supportLoading,
        setSupportLoading,
    ] = useState(false);


    const [
        supportError,
        setSupportError,
    ] = useState("");


    const [
        supportSuccess,
        setSupportSuccess,
    ] = useState("");


    const [
        showContactForm,
        setShowContactForm,
    ] = useState(false);


    const [
        newSubject,
        setNewSubject,
    ] = useState("");


    const [
        newCategory,
        setNewCategory,
    ] = useState("General");


    const [
        newPriority,
        setNewPriority,
    ] = useState<
        "low"
        | "normal"
        | "high"
        | "urgent"
    >("normal");


    const [
        newMessage,
        setNewMessage,
    ] = useState("");


    const [
        replyMessage,
        setReplyMessage,
    ] = useState("");


    const [
        replyLoading,
        setReplyLoading,
    ] = useState(false);


    const firstName =
        user?.firstName ||
        "there";


    const token =
        localStorage.getItem(
            "capital-bank-token"
        );


    // ==================================
    // LOAD SUPPORT TICKETS
    // ==================================

    const loadTickets = async () => {

        if (!token) {
            return;
        }


        try {

            setSupportLoading(true);

            setSupportError("");


            const response =
                await fetch(
                    `${API_BASE_URL}/api/support`,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`,
                        },
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                if (
                    response.status === 401 ||
                    response.status === 403
                ) {

                    logout();

                    return;

                }


                throw new Error(
                    data.message ||
                    "Unable to load support requests."
                );

            }


            setTickets(
                data.data || []
            );

        } catch (error) {

            console.error(
                "Load support tickets error:",
                error
            );


            setSupportError(
                error instanceof Error
                    ? error.message
                    : "Unable to load support requests."
            );

        } finally {

            setSupportLoading(false);

        }

    };


    useEffect(() => {

        loadTickets();

    }, []);


    // ==================================
    // FAQ TOGGLE
    // ==================================

    const toggleItem = (
        index: number
    ) => {

        setOpenItem(
            current =>
                current === index
                    ? null
                    : index
        );

    };


    // ==================================
    // CREATE SUPPORT TICKET
    // ==================================

   const handleCreateTicket = async (
    event: SubmitEvent
   ) => {

        event.preventDefault();


        if (
            !newSubject.trim() ||
            !newMessage.trim()
        ) {

            setSupportError(
                "Please enter a subject and message."
            );

            return;

        }


        try {

            setSupportLoading(true);

            setSupportError("");

            setSupportSuccess("");


            const response =
                await fetch(
                    `${API_BASE_URL}/api/support`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",

                            Authorization:
                                `Bearer ${token}`,
                        },

                        body: JSON.stringify({

                            subject:
                                newSubject.trim(),

                            category:
                                newCategory,

                            priority:
                                newPriority,

                            message:
                                newMessage.trim(),

                        }),

                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                if (
                    response.status === 401 ||
                    response.status === 403
                ) {

                    logout();

                    return;

                }


                throw new Error(
                    data.message ||
                    "Unable to create support request."
                );

            }


            setSupportSuccess(
                "Your support request has been submitted successfully."
            );


            setNewSubject("");

            setNewCategory(
                "General"
            );

            setNewPriority(
                "normal"
            );

            setNewMessage("");

            setShowContactForm(
                false
            );


            await loadTickets();


            if (data.data) {

                setSelectedTicket(
                    data.data
                );

            }

        } catch (error) {

            console.error(
                "Create support ticket error:",
                error
            );


            setSupportError(
                error instanceof Error
                    ? error.message
                    : "Unable to create support request."
            );

        } finally {

            setSupportLoading(false);

        }

    };


    // ==================================
    // OPEN SUPPORT TICKET
    // ==================================

    const openTicket = async (
        ticketId: string
    ) => {

        try {

            setSupportLoading(true);

            setSupportError("");


            const response =
                await fetch(
                    `${API_BASE_URL}/api/support/${ticketId}`,
                    {
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
                    data.message ||
                    "Unable to open support request."
                );

            }


            setSelectedTicket(
                data.data
            );


        } catch (error) {

            console.error(
                "Open support ticket error:",
                error
            );


            setSupportError(
                error instanceof Error
                    ? error.message
                    : "Unable to open support request."
            );

        } finally {

            setSupportLoading(false);

        }

    };


    // ==================================
    // REPLY TO SUPPORT TICKET
    // ==================================

    const handleReply = async (
    event: SubmitEvent
    ) => {

        event.preventDefault();


        if (
            !selectedTicket ||
            !replyMessage.trim()
        ) {

            return;

        }


        try {

            setReplyLoading(true);

            setSupportError("");

            setSupportSuccess("");


            const response =
                await fetch(
                    `${API_BASE_URL}/api/support/${selectedTicket._id}/reply`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",

                            Authorization:
                                `Bearer ${token}`,
                        },

                        body: JSON.stringify({

                            message:
                                replyMessage.trim(),

                        }),

                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Unable to send reply."
                );

            }


            setSelectedTicket(
                data.data
            );


            setReplyMessage("");

            setSupportSuccess(
                "Your reply has been sent."
            );


            await loadTickets();

        } catch (error) {

            console.error(
                "Reply error:",
                error
            );


            setSupportError(
                error instanceof Error
                    ? error.message
                    : "Unable to send reply."
            );

        } finally {

            setReplyLoading(false);

        }

    };


    // ==================================
    // RENDER
    // ==================================

    return (
        <main className="help-center-page">

            {/* =========================================
                HEADER
            ========================================= */}

            <header className="help-center-header">

                <div className="help-center-header-left">

                    <Link
                        to="/dashboard"
                        className="help-center-back"
                        aria-label="Back to dashboard"
                    >
                        ←
                    </Link>


                    <Link
                        to="/dashboard"
                        className="help-center-logo"
                    >

                        <span className="help-center-logo-mark">
                            C
                        </span>

                        <span className="help-center-logo-text">

                            CAPITAL

                            <small>
                                BANK OF CANADA
                            </small>

                        </span>

                    </Link>

                </div>


                <div className="help-center-header-actions">

                    <button
                        type="button"
                        className="help-center-theme-button"
                        onClick={toggleDarkMode}
                        aria-label={
                            darkMode
                                ? "Switch to light mode"
                                : "Switch to dark mode"
                        }
                    >
                        {darkMode ? "☀" : "☾"}
                    </button>


                    <div className="help-center-profile">

                        <span className="help-center-avatar">
                            {user?.firstName?.charAt(0) || "C"}
                            {user?.lastName?.charAt(0) || "B"}
                        </span>

                        <span>
                            {firstName}
                        </span>

                    </div>


                    <button
                        type="button"
                        className="help-center-signout"
                        onClick={logout}
                    >
                        Sign out
                    </button>

                </div>

            </header>


            {/* =========================================
                MAIN
            ========================================= */}

            <section className="help-center-main">

                <div className="help-center-container">

                    {/* =================================
                        BREADCRUMB
                    ================================= */}

                    <div className="help-center-breadcrumb">

                        <Link to="/dashboard">
                            Dashboard
                        </Link>

                        <span>
                            /
                        </span>

                        <strong>
                            Help centre
                        </strong>

                    </div>


                    {/* =================================
                        HERO
                    ================================= */}

                    <div className="help-center-hero">

                        <span className="help-center-eyebrow">
                            CAPITAL BANK SUPPORT
                        </span>

                        <h1>
                            How can we help?
                        </h1>

                        <p>
                            Find answers and guidance for your
                            Capital Bank online banking experience.
                        </p>

                    </div>


                    {/* =================================
                        HELP CATEGORIES
                    ================================= */}

                    <div className="help-center-grid">

                        {helpItems.map(
                            (
                                item,
                                index
                            ) => (

                                <article
                                    className={`help-card ${
                                        openItem === index
                                            ? "open"
                                            : ""
                                    }`}
                                    key={item.title}
                                >

                                    <button
                                        type="button"
                                        className="help-card-button"
                                        onClick={() =>
                                            toggleItem(index)
                                        }
                                        aria-expanded={
                                            openItem === index
                                        }
                                    >

                                        <span className="help-card-icon">
                                            ?
                                        </span>


                                        <span className="help-card-title">

                                            <strong>
                                                {item.title}
                                            </strong>

                                            <small>
                                                {item.description}
                                            </small>

                                        </span>


                                        <span className="help-card-arrow">
                                            {openItem === index
                                                ? "−"
                                                : "+"
                                            }
                                        </span>

                                    </button>


                                    {openItem === index && (

                                        <div className="help-card-content">

                                            {item.questions.map(
                                                question => (

                                                    <button
                                                        type="button"
                                                        key={question}
                                                        className="help-question"
                                                    >

                                                        <span>
                                                            {question}
                                                        </span>

                                                        <span>
                                                            →
                                                        </span>

                                                    </button>

                                                )
                                            )}

                                        </div>

                                    )}

                                </article>

                            )
                        )}

                    </div>


                    {/* =================================
                        SUPPORT REQUESTS
                    ================================= */}

                    <section className="help-support-section">

                        <div className="help-support-heading">

                            <div>

                                <span className="help-center-eyebrow">
                                    CUSTOMER SUPPORT
                                </span>

                                <h2>
                                    My support requests
                                </h2>

                                <p>
                                    Contact our support team and
                                    continue your conversations here.
                                </p>

                            </div>


                            <button
                                type="button"
                                className="help-contact-button"
                                onClick={() => {

                                    setShowContactForm(
                                        current => !current
                                    );

                                    setSupportError("");

                                    setSupportSuccess("");

                                }}
                            >
                                {showContactForm
                                    ? "Close form"
                                    : "Contact support"
                                }
                            </button>

                        </div>


                        {/* =============================
                            SUCCESS / ERROR
                        ============================= */}

                        {supportSuccess && (

                            <div className="help-support-success">
                                {supportSuccess}
                            </div>

                        )}


                        {supportError && (

                            <div className="help-support-error">
                                {supportError}
                            </div>

                        )}


                        {/* =============================
                            CONTACT FORM
                        ============================= */}

                        {showContactForm && (

                            <form
                                className="help-support-form"
                                onSubmit={handleCreateTicket}
                            >

                                <div className="help-support-form-grid">

                                    <label>

                                        <span>
                                            Subject
                                        </span>

                                        <input
                                            type="text"
                                            value={newSubject}
                                            onChange={event =>
                                                setNewSubject(
                                                    event.target.value
                                                )
                                            }
                                            placeholder="What can we help you with?"
                                            required
                                        />

                                    </label>


                                    <label>

                                        <span>
                                            Category
                                        </span>

                                        <select
                                            value={newCategory}
                                            onChange={event =>
                                                setNewCategory(
                                                    event.target.value
                                                )
                                            }
                                        >

                                            <option value="General">
                                                General
                                            </option>

                                            <option value="Accounts">
                                                Accounts
                                            </option>

                                            <option value="Payments & transfers">
                                                Payments & transfers
                                            </option>

                                            <option value="Loans">
                                                Loans
                                            </option>

                                            <option value="Cards">
                                                Cards
                                            </option>

                                            <option value="Security">
                                                Security
                                            </option>

                                        </select>

                                    </label>


                                    <label>

                                        <span>
                                            Priority
                                        </span>

                                        <select
                                            value={newPriority}
                                            onChange={event =>
                                                setNewPriority(
                                                    event.target.value as
                                                        | "low"
                                                        | "normal"
                                                        | "high"
                                                        | "urgent"
                                                )
                                            }
                                        >

                                            <option value="low">
                                                Low
                                            </option>

                                            <option value="normal">
                                                Normal
                                            </option>

                                            <option value="high">
                                                High
                                            </option>

                                            <option value="urgent">
                                                Urgent
                                            </option>

                                        </select>

                                    </label>

                                </div>


                                <label>

                                    <span>
                                        Message
                                    </span>

                                    <textarea
                                        value={newMessage}
                                        onChange={event =>
                                            setNewMessage(
                                                event.target.value
                                            )
                                        }
                                        placeholder="Tell us how we can help..."
                                        rows={6}
                                        required
                                    />

                                </label>


                                <div className="help-support-form-actions">

                                    <button
                                        type="button"
                                        className="help-support-cancel"
                                        onClick={() =>
                                            setShowContactForm(false)
                                        }
                                    >
                                        Cancel
                                    </button>


                                    <button
                                        type="submit"
                                        className="help-support-submit"
                                        disabled={supportLoading}
                                    >
                                        {supportLoading
                                            ? "Sending..."
                                            : "Submit request"
                                        }
                                    </button>

                                </div>

                            </form>

                        )}


                        {/* =============================
                            TICKET LIST
                        ============================= */}

                        <div className="help-ticket-list">

                            {supportLoading &&
                                tickets.length === 0 && (

                                    <div className="help-support-state">
                                        Loading your support requests...
                                    </div>

                                )}


                            {!supportLoading &&
                                tickets.length === 0 && (

                                    <div className="help-support-empty">

                                        <div>
                                            ?
                                        </div>

                                        <h3>
                                            No support requests yet
                                        </h3>

                                        <p>
                                            If you need help, contact our
                                            support team and we'll be happy
                                            to assist you.
                                        </p>

                                    </div>

                                )}


                            {tickets.map(ticket => (

                                <button
                                    type="button"
                                    className={`help-ticket-card ${
                                        selectedTicket?._id === ticket._id
                                            ? "selected"
                                            : ""
                                    }`}
                                    key={ticket._id}
                                    onClick={() =>
                                        openTicket(ticket._id)
                                    }
                                >

                                    <div className="help-ticket-main">

                                        <span className="help-ticket-number">
                                            {ticket.ticketNumber}
                                        </span>

                                        <h3>
                                            {ticket.subject}
                                        </h3>

                                        <p>
                                            {ticket.messages?.[0]?.message ||
                                                "Support request"}
                                        </p>

                                    </div>


                                    <div className="help-ticket-meta">

                                        <span
                                            className={`help-ticket-status status-${ticket.status}`}
                                        >
                                            {getStatusLabel(
                                                ticket.status
                                            )}
                                        </span>

                                        <small>
                                            {formatSupportDate(
                                                ticket.updatedAt
                                            )}
                                        </small>

                                    </div>

                                </button>

                            ))}

                        </div>


                        {/* =============================
                            TICKET CONVERSATION
                        ============================= */}

                        {selectedTicket && (

                            <div className="help-ticket-conversation">

                                <div className="help-conversation-header">

                                    <div>

                                        <span>
                                            {selectedTicket.ticketNumber}
                                        </span>

                                        <h2>
                                            {selectedTicket.subject}
                                        </h2>

                                    </div>


                                    <button
                                        type="button"
                                        onClick={() =>
                                            setSelectedTicket(null)
                                        }
                                    >
                                        ×
                                    </button>

                                </div>


                                <div className="help-conversation-info">

                                    <span>
                                        {selectedTicket.category}
                                    </span>

                                    <span>
                                        {selectedTicket.priority}
                                    </span>

                                    <span
                                        className={`help-ticket-status status-${selectedTicket.status}`}
                                    >
                                        {getStatusLabel(
                                            selectedTicket.status
                                        )}
                                    </span>

                                </div>


                                <div className="help-message-list">

                                    {selectedTicket.messages.map(
                                        message => (

                                            <div
                                                className={`help-message ${
                                                    message.senderType ===
                                                    "customer"
                                                        ? "customer"
                                                        : "admin"
                                                }`}
                                                key={
                                                    message._id ||
                                                    `${message.createdAt}-${message.message}`
                                                }
                                            >

                                                <div className="help-message-bubble">

                                                    <span className="help-message-sender">
                                                        {message.senderType ===
                                                        "customer"
                                                            ? "You"
                                                            : "Capital Bank Support"
                                                        }
                                                    </span>

                                                    <p>
                                                        {message.message}
                                                    </p>

                                                    <small>
                                                        {new Date(
                                                            message.createdAt
                                                        ).toLocaleString()}
                                                    </small>

                                                </div>

                                            </div>

                                        )
                                    )}

                                </div>


                                {selectedTicket.status !==
                                    "closed" &&
                                    selectedTicket.status !==
                                        "resolved" && (

                                        <form
                                            className="help-reply-form"
                                            onSubmit={handleReply}
                                        >

                                            <textarea
                                                value={replyMessage}
                                                onChange={event =>
                                                    setReplyMessage(
                                                        event.target.value
                                                    )
                                                }
                                                placeholder="Write a reply..."
                                                rows={4}
                                                required
                                            />


                                            <button
                                                type="submit"
                                                disabled={replyLoading}
                                            >
                                                {replyLoading
                                                    ? "Sending..."
                                                    : "Send reply"
                                                }
                                            </button>

                                        </form>

                                    )}

                            </div>

                        )}

                    </section>


                    {/* =================================
                        CONTACT SUPPORT INTRO
                    ================================= */}

                    <section className="help-contact">

                        <div className="help-contact-icon">
                            ?
                        </div>


                        <div className="help-contact-content">

                            <span>
                                STILL NEED HELP?
                            </span>

                            <h2>
                                Our support team is here for you
                            </h2>

                            <p>
                                Submit a support request above and
                                continue the conversation securely
                                from your Capital Bank account.
                            </p>

                        </div>


                        <button
                            type="button"
                            className="help-contact-button"
                            onClick={() =>
                                setShowContactForm(true)
                            }
                        >
                            Contact support
                        </button>

                    </section>

                </div>

            </section>

        </main>
    );
}


export default HelpCenter;
