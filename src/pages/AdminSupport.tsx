import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    ArrowLeft,
    Clock,
    Mail,
    MessageSquare,
    RefreshCw,
    Search,
    Send,
    Trash2,
    User,
} from "lucide-react";

import {
    Link,
} from "react-router-dom";

import {
    useAuth,
} from "../context/AuthContext";

import "./AdminSupport.css";


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
// TYPES
// ======================================

type SupportStatus =
    | "open"
    | "in_progress"
    | "waiting_customer"
    | "resolved"
    | "closed";

type SupportPriority =
    | "low"
    | "normal"
    | "high"
    | "urgent";

type SenderType =
    | "customer"
    | "admin";

type CommunicationChannel =
    | "email"
    | "sms";

type CommunicationRecipient =
    | "all"
    | "customer";


interface SupportCustomer {
    _id?: string;
    clientNumber?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
}


interface SupportMessage {
    _id?: string;
    senderId: string;
    senderType: SenderType;
    message: string;
    channel:
        | "chat"
        | "email"
        | "sms";
    createdAt: string;
}


interface SupportTicket {
    _id: string;
    ticketNumber: string;
    userId: SupportCustomer;
    subject: string;
    category: string;
    priority: SupportPriority;
    status: SupportStatus;
    messages: SupportMessage[];
    createdAt: string;
    updatedAt: string;
}


interface CommunicationCustomer {
    _id: string;
    clientNumber?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
}


// ======================================
// OPTIONS
// ======================================

const STATUS_OPTIONS: {
    value: SupportStatus;
    label: string;
}[] = [

    {
        value: "open",
        label: "Open",
    },

    {
        value: "in_progress",
        label: "In Progress",
    },

    {
        value: "waiting_customer",
        label: "Waiting for Customer",
    },

    {
        value: "resolved",
        label: "Resolved",
    },

    {
        value: "closed",
        label: "Closed",
    },

];


const PRIORITY_OPTIONS: {
    value: SupportPriority;
    label: string;
}[] = [

    {
        value: "low",
        label: "Low",
    },

    {
        value: "normal",
        label: "Normal",
    },

    {
        value: "high",
        label: "High",
    },

    {
        value: "urgent",
        label: "Urgent",
    },

];


// ======================================
// HELPERS
// ======================================

function getStatusLabel(
    status: SupportStatus
) {

    const option =
        STATUS_OPTIONS.find(
            (item) =>
                item.value === status
        );

    return option?.label || status;
}


function getPriorityLabel(
    priority: SupportPriority
) {

    const option =
        PRIORITY_OPTIONS.find(
            (item) =>
                item.value === priority
        );

    return option?.label || priority;
}


function formatDate(
    value: string
) {

    return new Date(
        value
    ).toLocaleDateString(
        "en-CA",
        {
            year: "numeric",
            month: "short",
            day: "numeric",
        }
    );

}


function formatDateTime(
    value: string
) {

    return new Date(
        value
    ).toLocaleString(
        "en-CA",
        {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }
    );

}


function getCustomerName(
    customer?: SupportCustomer
) {

    if (!customer) {
        return "Unknown Customer";
    }


    const name = [
        customer.firstName,
        customer.lastName,
    ]
        .filter(Boolean)
        .join(" ")
        .trim();


    return name ||
        customer.clientNumber ||
        customer.email ||
        "Customer";

}


function getCommunicationCustomerName(
    customer?: CommunicationCustomer | null
) {

    if (!customer) {
        return "";
    }


    const name = [
        customer.firstName,
        customer.lastName,
    ]
        .filter(Boolean)
        .join(" ")
        .trim();


    return name ||
        customer.clientNumber ||
        customer.email ||
        "Customer";

}


function getApiErrorMessage(
    data: unknown,
    fallback: string
) {

    if (
        typeof data === "object" &&
        data !== null &&
        "message" in data
    ) {

        const message =
            (
                data as {
                    message?: unknown;
                }
            ).message;


        if (
            typeof message === "string" &&
            message.trim()
        ) {

            return message;

        }

    }


    return fallback;
}


// ======================================
// COMPONENT
// ======================================

export default function AdminSupport() {

    const {
        token,
        logout,
    } = useAuth();


    // ==================================
    // SUPPORT TICKETS
    // ==================================

    const [
        tickets,
        setTickets,
    ] = useState<SupportTicket[]>([]);


    const [
        selectedTicket,
        setSelectedTicket,
    ] = useState<SupportTicket | null>(
        null
    );


    const [
        search,
        setSearch,
    ] = useState("");


    const [
        appliedSearch,
        setAppliedSearch,
    ] = useState("");


    const [
        statusFilter,
        setStatusFilter,
    ] = useState<
        SupportStatus | ""
    >("");


    const [
        priorityFilter,
        setPriorityFilter,
    ] = useState<
        SupportPriority | ""
    >("");


    const [
        loading,
        setLoading,
    ] = useState(true);


    const [
        loadingTicket,
        setLoadingTicket,
    ] = useState(false);


    const [
        refreshing,
        setRefreshing,
    ] = useState(false);


    const [
        actionLoading,
        setActionLoading,
    ] = useState(false);


    const [
        replyMessage,
        setReplyMessage,
    ] = useState("");


    const [
        error,
        setError,
    ] = useState("");


    const [
        ticketError,
        setTicketError,
    ] = useState("");


    // ==================================
    // ADMIN COMMUNICATIONS
    // ==================================

    const [
        communicationRecipient,
        setCommunicationRecipient,
    ] = useState<
        CommunicationRecipient
    >("all");


    const [
        communicationChannel,
        setCommunicationChannel,
    ] = useState<
        CommunicationChannel
    >("email");


    const [
        communicationCustomerQuery,
        setCommunicationCustomerQuery,
    ] = useState("");


    const [
        communicationCustomers,
        setCommunicationCustomers,
    ] = useState<
        CommunicationCustomer[]
    >([]);


    const [
        selectedCommunicationCustomer,
        setSelectedCommunicationCustomer,
    ] = useState<
        CommunicationCustomer | null
    >(null);


    const [
        communicationSearchLoading,
        setCommunicationSearchLoading,
    ] = useState(false);


    const [
        communicationLoading,
        setCommunicationLoading,
    ] = useState(false);


    const [
        communicationSubject,
        setCommunicationSubject,
    ] = useState("");


    const [
        communicationMessage,
        setCommunicationMessage,
    ] = useState("");


    const [
        communicationError,
        setCommunicationError,
    ] = useState("");


    const [
        communicationSuccess,
        setCommunicationSuccess,
    ] = useState("");


    // ==================================
    // UNAUTHORIZED
    // ==================================

    const handleUnauthorized = useCallback(
        () => {

            logout();

        },
        [
            logout,
        ]
    );


    // ==================================
    // LOAD TICKETS
    // ==================================

    const loadTickets = useCallback(
        async (
            showRefreshing = false
        ) => {

            if (!token) {
                return;
            }


            if (showRefreshing) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }


            setError("");


            try {

                const params =
                    new URLSearchParams();


                if (
                    appliedSearch.trim()
                ) {

                    params.set(
                        "search",
                        appliedSearch.trim()
                    );

                }


                if (statusFilter) {

                    params.set(
                        "status",
                        statusFilter
                    );

                }


                if (priorityFilter) {

                    params.set(
                        "priority",
                        priorityFilter
                    );

                }


                const query =
                    params.toString();


                const response =
                    await fetch(
                        `${API_BASE_URL}/api/admin/support${
                            query
                                ? `?${query}`
                                : ""
                        }`,
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`,
                            },
                        }
                    );


                if (
                    response.status === 401 ||
                    response.status === 403
                ) {

                    handleUnauthorized();
                    return;

                }


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        getApiErrorMessage(
                            data,
                            "Unable to load support tickets."
                        )
                    );

                }


                setTickets(
                    Array.isArray(data?.data)
                        ? data.data
                        : []
                );

            } catch (err) {

                console.error(
                    "Load support tickets error:",
                    err
                );


                setError(
                    err instanceof Error
                        ? err.message
                        : "Unable to load support tickets."
                );

            } finally {

                setLoading(false);
                setRefreshing(false);

            }

        },
        [
            token,
            appliedSearch,
            statusFilter,
            priorityFilter,
            handleUnauthorized,
        ]
    );


    useEffect(() => {

        loadTickets();

    }, [
        loadTickets,
    ]);


    // ==================================
    // LOAD SINGLE TICKET
    // ==================================

    const loadTicket = useCallback(
        async (
            ticketId: string
        ) => {

            if (!token) {
                return;
            }


            setLoadingTicket(true);
            setTicketError("");


            try {

                const response =
                    await fetch(
                        `${API_BASE_URL}/api/admin/support/${ticketId}`,
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`,
                            },
                        }
                    );


                if (
                    response.status === 401 ||
                    response.status === 403
                ) {

                    handleUnauthorized();
                    return;

                }


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        getApiErrorMessage(
                            data,
                            "Unable to load support ticket."
                        )
                    );

                }


                setSelectedTicket(
                    data?.data || null
                );

            } catch (err) {

                console.error(
                    "Load support ticket error:",
                    err
                );


                setTicketError(
                    err instanceof Error
                        ? err.message
                        : "Unable to load support ticket."
                );

            } finally {

                setLoadingTicket(false);

            }

        },
        [
            token,
            handleUnauthorized,
        ]
    );


    // ==================================
    // OPEN TICKET
    // ==================================

    const openTicket = async (
        ticket: SupportTicket
    ) => {

        setSelectedTicket(
            ticket
        );

        setReplyMessage("");
        setTicketError("");


        await loadTicket(
            ticket._id
        );

    };


    // ==================================
    // CLOSE TICKET VIEW
    // ==================================

    const closeTicket = () => {

        setSelectedTicket(null);
        setReplyMessage("");
        setTicketError("");

    };


    // ==================================
    // SEARCH
    // ==================================

    const handleSearchSubmit = (
        event: React.FormEvent
    ) => {

        event.preventDefault();

        setAppliedSearch(
            search.trim()
        );

    };


    // ==================================
    // UPDATE STATUS
    // ==================================

    const updateStatus = async (
        status: SupportStatus
    ) => {

        if (
            !token ||
            !selectedTicket
        ) {
            return;
        }


        setActionLoading(true);
        setTicketError("");


        try {

            const response =
                await fetch(
                    `${API_BASE_URL}/api/admin/support/${selectedTicket._id}/status`,
                    {
                        method: "PATCH",
                        headers: {
                            "Content-Type":
                                "application/json",
                            Authorization:
                                `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                            status,
                        }),
                    }
                );


            if (
                response.status === 401 ||
                response.status === 403
            ) {

                handleUnauthorized();
                return;

            }


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    getApiErrorMessage(
                        data,
                        "Unable to update ticket status."
                    )
                );

            }


            await loadTicket(
                selectedTicket._id
            );


            await loadTickets(
                true
            );

        } catch (err) {

            console.error(
                "Update status error:",
                err
            );


            setTicketError(
                err instanceof Error
                    ? err.message
                    : "Unable to update ticket status."
            );

        } finally {

            setActionLoading(false);

        }

    };


    // ==================================
    // UPDATE PRIORITY
    // ==================================

    const updatePriority = async (
        priority: SupportPriority
    ) => {

        if (
            !token ||
            !selectedTicket
        ) {
            return;
        }


        setActionLoading(true);
        setTicketError("");


        try {

            const response =
                await fetch(
                    `${API_BASE_URL}/api/admin/support/${selectedTicket._id}/priority`,
                    {
                        method: "PATCH",
                        headers: {
                            "Content-Type":
                                "application/json",
                            Authorization:
                                `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                            priority,
                        }),
                    }
                );


            if (
                response.status === 401 ||
                response.status === 403
            ) {

                handleUnauthorized();
                return;

            }


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    getApiErrorMessage(
                        data,
                        "Unable to update ticket priority."
                    )
                );

            }


            await loadTicket(
                selectedTicket._id
            );


            await loadTickets(
                true
            );

        } catch (err) {

            console.error(
                "Update priority error:",
                err
            );


            setTicketError(
                err instanceof Error
                    ? err.message
                    : "Unable to update ticket priority."
            );

        } finally {

            setActionLoading(false);

        }

    };


    // ==================================
    // REPLY TO TICKET
    // ==================================

    const sendReply = async (
        event: React.FormEvent
    ) => {

        event.preventDefault();


        if (
            !token ||
            !selectedTicket ||
            !replyMessage.trim()
        ) {
            return;
        }


        if (
            selectedTicket.status === "closed"
        ) {

            setTicketError(
                "This support ticket is closed."
            );

            return;

        }


        setActionLoading(true);
        setTicketError("");


        try {

            const response =
                await fetch(
                    `${API_BASE_URL}/api/admin/support/${selectedTicket._id}/reply`,
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


            if (
                response.status === 401 ||
                response.status === 403
            ) {

                handleUnauthorized();
                return;

            }


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    getApiErrorMessage(
                        data,
                        "Unable to send reply."
                    )
                );

            }


            setReplyMessage("");


            await loadTicket(
                selectedTicket._id
            );


            await loadTickets(
                true
            );

        } catch (err) {

            console.error(
                "Send reply error:",
                err
            );


            setTicketError(
                err instanceof Error
                    ? err.message
                    : "Unable to send reply."
            );

        } finally {

            setActionLoading(false);

        }

    };


    // ==================================
    // DELETE TICKET
    // ==================================

    const deleteTicket = async (
        ticketId: string
    ) => {

        if (!token) {
            return;
        }


        const confirmed =
            window.confirm(
                "Are you sure you want to permanently delete this support ticket? This action cannot be undone."
            );


        if (!confirmed) {
            return;
        }


        setActionLoading(true);
        setTicketError("");
        setError("");


        try {

            const response =
                await fetch(
                    `${API_BASE_URL}/api/admin/support/${ticketId}`,
                    {
                        method: "DELETE",
                        headers: {
                            Authorization:
                                `Bearer ${token}`,
                        },
                    }
                );


            if (
                response.status === 401 ||
                response.status === 403
            ) {

                handleUnauthorized();
                return;

            }


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    getApiErrorMessage(
                        data,
                        "Unable to delete support ticket."
                    )
                );

            }


            if (
                selectedTicket?._id ===
                ticketId
            ) {

                setSelectedTicket(
                    null
                );

            }


            setReplyMessage("");


            await loadTickets(
                true
            );

        } catch (err) {

            console.error(
                "Delete ticket error:",
                err
            );


            const message =
                err instanceof Error
                    ? err.message
                    : "Unable to delete support ticket.";


            if (selectedTicket) {
                setTicketError(message);
            } else {
                setError(message);
            }

        } finally {

            setActionLoading(false);

        }

    };


    // ==================================
    // SEARCH COMMUNICATION CUSTOMERS
    // ==================================

    useEffect(() => {

        if (
            communicationRecipient !==
            "customer"
        ) {

            setCommunicationCustomers([]);
            setSelectedCommunicationCustomer(null);
            setCommunicationCustomerQuery("");

            return;

        }


        const query =
            communicationCustomerQuery.trim();


        if (query.length < 2) {

            setCommunicationCustomers([]);
            return;

        }


        const controller =
            new AbortController();


        const searchCustomers =
            async () => {

                if (!token) {
                    return;
                }


                setCommunicationSearchLoading(
                    true
                );


                try {

                    const response =
                        await fetch(
                            `${API_BASE_URL}/api/admin/support/communications/customers?q=${encodeURIComponent(query)}`,
                            {
                                headers: {
                                    Authorization:
                                        `Bearer ${token}`,
                                },
                                signal:
                                    controller.signal,
                            }
                        );


                    if (
                        response.status === 401 ||
                        response.status === 403
                    ) {

                        handleUnauthorized();
                        return;

                    }


                    const data =
                        await response.json();


                    if (!response.ok) {

                        throw new Error(
                            getApiErrorMessage(
                                data,
                                "Unable to search customers."
                            )
                        );

                    }


                    setCommunicationCustomers(
                        Array.isArray(
                            data?.data?.customers
                        )
                            ? data.data.customers
                            : []
                    );

                } catch (err) {

                    if (
                        err instanceof DOMException &&
                        err.name === "AbortError"
                    ) {
                        return;
                    }


                    console.error(
                        "Communication customer search error:",
                        err
                    );

                } finally {

                    if (
                        !controller.signal.aborted
                    ) {

                        setCommunicationSearchLoading(
                            false
                        );

                    }

                }

            };


        const timeout =
            window.setTimeout(
                searchCustomers,
                300
            );


        return () => {

            window.clearTimeout(
                timeout
            );

            controller.abort();

        };

    }, [
        communicationRecipient,
        communicationCustomerQuery,
        token,
        handleUnauthorized,
    ]);


    // ==================================
    // RECIPIENT CHANGE
    // ==================================

    const handleCommunicationRecipientChange = (
        value: CommunicationRecipient
    ) => {

        setCommunicationRecipient(
            value
        );

        setCommunicationError("");
        setCommunicationSuccess("");


        if (value === "all") {

            setCommunicationCustomerQuery("");
            setCommunicationCustomers([]);
            setSelectedCommunicationCustomer(
                null
            );

        }

    };


    // ==================================
    // CHANNEL CHANGE
    // ==================================

    const handleCommunicationChannelChange = (
        value: CommunicationChannel
    ) => {

        setCommunicationChannel(
            value
        );

        setCommunicationError("");
        setCommunicationSuccess("");

    };


    // ==================================
    // SELECT COMMUNICATION CUSTOMER
    // ==================================

    const selectCommunicationCustomer = (
        customer: CommunicationCustomer
    ) => {

        setSelectedCommunicationCustomer(
            customer
        );

        setCommunicationCustomerQuery(
            getCommunicationCustomerName(
                customer
            )
        );

        setCommunicationCustomers([]);

        setCommunicationError("");
        setCommunicationSuccess("");

    };


    // ==================================
    // SEND ADMIN COMMUNICATION
    // ==================================

    const sendCommunication = async (
        event: React.FormEvent
    ) => {

        event.preventDefault();


        setCommunicationError("");
        setCommunicationSuccess("");


        if (!token) {
            return;
        }


        if (
            communicationRecipient ===
            "customer" &&
            !selectedCommunicationCustomer
        ) {

            setCommunicationError(
                "Please select a customer."
            );

            return;

        }


        if (
            communicationChannel ===
            "email" &&
            !communicationSubject.trim()
        ) {

            setCommunicationError(
                "Email subject is required."
            );

            return;

        }


        if (
            !communicationMessage.trim()
        ) {

            setCommunicationError(
                "Message is required."
            );

            return;

        }


        if (
            communicationRecipient ===
            "customer"
        ) {

            if (
                communicationChannel ===
                "email" &&
                !selectedCommunicationCustomer?.email?.trim()
            ) {

                setCommunicationError(
                    "The selected customer does not have an email address."
                );

                return;

            }


            if (
                communicationChannel ===
                "sms" &&
                !selectedCommunicationCustomer?.phone?.trim()
            ) {

                setCommunicationError(
                    "The selected customer does not have a phone number."
                );

                return;

            }

        }


        setCommunicationLoading(
            true
        );


        try {

            const response =
                await fetch(
                    `${API_BASE_URL}/api/admin/support/communications/send`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type":
                                "application/json",
                            Authorization:
                                `Bearer ${token}`,
                        },
                        body: JSON.stringify({

                            recipientType:
                                communicationRecipient,

                            customerId:
                                communicationRecipient ===
                                "customer"
                                    ? selectedCommunicationCustomer?._id
                                    : undefined,

                            channel:
                                communicationChannel,

                            subject:
                                communicationChannel ===
                                "email"
                                    ? communicationSubject.trim()
                                    : undefined,

                            message:
                                communicationMessage.trim(),

                        }),
                    }
                );


            if (
                response.status === 401 ||
                response.status === 403
            ) {

                handleUnauthorized();
                return;

            }


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    getApiErrorMessage(
                        data,
                        "Unable to send communication."
                    )
                );

            }


            const result =
                data?.data;


            if (
                result &&
                result.totalRecipients !==
                    undefined
            ) {

                setCommunicationSuccess(
                    `${data.message || "Communication completed."} Sent: ${result.sent}. Skipped: ${result.skipped}. Failed: ${result.failed}.`
                );

            } else {

                setCommunicationSuccess(
                    data?.message ||
                    "Communication sent successfully."
                );

            }


            setCommunicationMessage("");


            if (
                communicationRecipient ===
                "all"
            ) {

                setCommunicationSubject("");

            }

        } catch (err) {

            console.error(
                "Send admin communication error:",
                err
            );


            setCommunicationError(
                err instanceof Error
                    ? err.message
                    : "Unable to send communication."
            );

        } finally {

            setCommunicationLoading(
                false
            );

        }

    };


    // ==================================
    // FILTERED LOCAL TICKETS
    // ==================================

    const visibleTickets =
        useMemo(
            () => tickets,
            [
                tickets,
            ]
        );


    // ==================================
    // SELECTED TICKET VIEW
    // ==================================

    if (selectedTicket) {

        const customer =
            selectedTicket.userId;


        return (

            <div className="admin-support-page">

                <header className="admin-support-header">

                    <div className="admin-support-header-left">

                        <Link
                            to="/admin"
                            className="admin-support-dashboard-link"
                        >
                            Dashboard
                        </Link>

                        <span className="admin-support-header-divider">
                            /
                        </span>

                        <span>
                            Support Centre
                        </span>

                    </div>

                </header>


                <main className="admin-support-container">

                    <div className="admin-support-detail-topbar">

                        <button
                            type="button"
                            className="admin-support-back"
                            onClick={closeTicket}
                        >
                            <ArrowLeft
                                size={17}
                            />

                            <span>
                                Back to Support
                            </span>
                        </button>


                        <div className="admin-support-detail-actions">

                            <button
                                type="button"
                                className="admin-support-refresh-button"
                                onClick={() =>
                                    loadTicket(
                                        selectedTicket._id
                                    )
                                }
                                disabled={
                                    loadingTicket ||
                                    actionLoading
                                }
                            >
                                <RefreshCw
                                    size={16}
                                    className={
                                        loadingTicket
                                            ? "admin-support-spinning"
                                            : ""
                                    }
                                />

                                <span>
                                    Refresh
                                </span>
                            </button>


                            <button
                                type="button"
                                className="admin-support-delete-button"
                                onClick={() =>
                                    deleteTicket(
                                        selectedTicket._id
                                    )
                                }
                                disabled={
                                    actionLoading
                                }
                            >
                                <Trash2
                                    size={16}
                                />

                                <span>
                                    Delete Ticket
                                </span>
                            </button>

                        </div>

                    </div>


                    {ticketError && (

                        <div className="admin-support-alert error">
                            {ticketError}
                        </div>

                    )}


                    <section className="admin-support-ticket-header">

                        <div>

                            <div className="admin-support-ticket-number">
                                {selectedTicket.ticketNumber}
                            </div>

                            <h1>
                                {selectedTicket.subject}
                            </h1>

                            <div className="admin-support-ticket-meta">

                                <span>
                                    {selectedTicket.category}
                                </span>

                                <span>
                                    <Clock
                                        size={14}
                                    />

                                    {formatDateTime(
                                        selectedTicket.updatedAt
                                    )}
                                </span>

                            </div>

                        </div>


                        <div className="admin-support-ticket-badges">

                            <span
                                className={
                                    `admin-support-status-badge status-${selectedTicket.status}`
                                }
                            >
                                {getStatusLabel(
                                    selectedTicket.status
                                )}
                            </span>


                            <span
                                className={
                                    `admin-support-priority-badge priority-${selectedTicket.priority}`
                                }
                            >
                                {getPriorityLabel(
                                    selectedTicket.priority
                                )}
                            </span>

                        </div>

                    </section>


                    <div className="admin-support-detail-grid">

                        <section className="admin-support-conversation-card">

                            <div className="admin-support-card-header">

                                <div>

                                    <h2>
                                        Conversation
                                    </h2>

                                    <p>
                                        Support ticket communication
                                    </p>

                                </div>

                                <MessageSquare
                                    size={20}
                                />

                            </div>


                            {loadingTicket ? (

                                <div className="admin-support-loading-detail">
                                    Loading conversation...
                                </div>

                            ) : (

                                <div className="admin-support-messages">

                                    {selectedTicket.messages?.length ? (

                                        selectedTicket.messages.map(
                                            (
                                                message,
                                                index
                                            ) => (

                                                <div
                                                    key={
                                                        message._id ||
                                                        `${message.createdAt}-${index}`
                                                    }
                                                    className={
                                                        `admin-support-message-row ${
                                                            message.senderType ===
                                                            "admin"
                                                                ? "admin-message"
                                                                : "customer-message"
                                                        }`
                                                    }
                                                >

                                                    <div className="admin-support-message-bubble">

                                                        <div className="admin-support-message-top">

                                                            <strong>
                                                                {
                                                                    message.senderType ===
                                                                    "admin"
                                                                        ? "Capital Bank Support"
                                                                        : getCustomerName(
                                                                            customer
                                                                        )
                                                                }
                                                            </strong>

                                                            <span>
                                                                {
                                                                    formatDateTime(
                                                                        message.createdAt
                                                                    )
                                                                }
                                                            </span>

                                                        </div>


                                                        <p>
                                                            {
                                                                message.message
                                                            }
                                                        </p>


                                                        <small>
                                                            {
                                                                message.channel.toUpperCase()
                                                            }
                                                        </small>

                                                    </div>

                                                </div>

                                            )
                                        )

                                    ) : (

                                        <div className="admin-support-empty-conversation">

                                            <MessageSquare
                                                size={28}
                                            />

                                            <p>
                                                No messages in this ticket yet.
                                            </p>

                                        </div>

                                    )}

                                </div>

                            )}


                            {selectedTicket.status !==
                                "closed" && (

                                <form
                                    className="admin-support-reply-form"
                                    onSubmit={
                                        sendReply
                                    }
                                >

                                    <label>
                                        Reply to customer
                                    </label>

                                    <textarea
                                        value={
                                            replyMessage
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setReplyMessage(
                                                event.target.value
                                            )
                                        }
                                        placeholder="Write your reply..."
                                        rows={5}
                                        disabled={
                                            actionLoading
                                        }
                                    />


                                    <div className="admin-support-reply-footer">

                                        <span>
                                            Your reply will be added to this ticket.
                                        </span>


                                        <button
                                            type="submit"
                                            disabled={
                                                actionLoading ||
                                                !replyMessage.trim()
                                            }
                                        >
                                            <Send
                                                size={16}
                                            />

                                            <span>
                                                Send Reply
                                            </span>
                                        </button>

                                    </div>

                                </form>

                            )}

                        </section>


                        <aside className="admin-support-sidebar">

                            <section className="admin-support-side-card">

                                <div className="admin-support-side-card-header">

                                    <User
                                        size={18}
                                    />

                                    <h3>
                                        Customer
                                    </h3>

                                </div>


                                <div className="admin-support-customer-profile">

                                    <div className="admin-support-avatar">
                                        {(
                                            customer?.firstName?.[0] ||
                                            customer?.lastName?.[0] ||
                                            "C"
                                        ).toUpperCase()}
                                    </div>


                                    <div>

                                        <strong>
                                            {getCustomerName(
                                                customer
                                            )}
                                        </strong>

                                        <span>
                                            {
                                                customer?.clientNumber ||
                                                "No client number"
                                            }
                                        </span>

                                    </div>

                                </div>


                                <div className="admin-support-contact-list">

                                    {customer?.email && (

                                        <div>
                                            <Mail
                                                size={15}
                                            />

                                            <span>
                                                {customer.email}
                                            </span>
                                        </div>

                                    )}


                                    {customer?.phone && (

                                        <div>
                                            <MessageSquare
                                                size={15}
                                            />

                                            <span>
                                                {customer.phone}
                                            </span>
                                        </div>

                                    )}

                                </div>

                            </section>


                            <section className="admin-support-side-card">

                                <div className="admin-support-side-card-header">

                                    <h3>
                                        Ticket Controls
                                    </h3>

                                </div>


                                <div className="admin-support-control">

                                    <label>
                                        Status
                                    </label>

                                    <select
                                        value={
                                            selectedTicket.status
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            updateStatus(
                                                event.target.value as SupportStatus
                                            )
                                        }
                                        disabled={
                                            actionLoading
                                        }
                                    >

                                        {STATUS_OPTIONS.map(
                                            (
                                                option
                                            ) => (

                                                <option
                                                    key={
                                                        option.value
                                                    }
                                                    value={
                                                        option.value
                                                    }
                                                >
                                                    {
                                                        option.label
                                                    }
                                                </option>

                                            )
                                        )}

                                    </select>

                                </div>


                                <div className="admin-support-control">

                                    <label>
                                        Priority
                                    </label>

                                    <select
                                        value={
                                            selectedTicket.priority
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            updatePriority(
                                                event.target.value as SupportPriority
                                            )
                                        }
                                        disabled={
                                            actionLoading
                                        }
                                    >

                                        {PRIORITY_OPTIONS.map(
                                            (
                                                option
                                            ) => (

                                                <option
                                                    key={
                                                        option.value
                                                    }
                                                    value={
                                                        option.value
                                                    }
                                                >
                                                    {
                                                        option.label
                                                    }
                                                </option>

                                            )
                                        )}

                                    </select>

                                </div>

                            </section>


                            <section className="admin-support-side-card">

                                <div className="admin-support-side-card-header">

                                    <h3>
                                        Ticket Information
                                    </h3>

                                </div>


                                <div className="admin-support-info-list">

                                    <div>
                                        <span>
                                            Ticket
                                        </span>

                                        <strong>
                                            {
                                                selectedTicket.ticketNumber
                                            }
                                        </strong>
                                    </div>


                                    <div>
                                        <span>
                                            Category
                                        </span>

                                        <strong>
                                            {
                                                selectedTicket.category
                                            }
                                        </strong>
                                    </div>


                                    <div>
                                        <span>
                                            Created
                                        </span>

                                        <strong>
                                            {
                                                formatDate(
                                                    selectedTicket.createdAt
                                                )
                                            }
                                        </strong>
                                    </div>


                                    <div>
                                        <span>
                                            Updated
                                        </span>

                                        <strong>
                                            {
                                                formatDate(
                                                    selectedTicket.updatedAt
                                                )
                                            }
                                        </strong>
                                    </div>

                                </div>

                            </section>

                        </aside>

                    </div>

                </main>

            </div>

        );

    }


    // ==================================
    // MAIN SUPPORT CENTRE
    // ==================================

    return (

        <div className="admin-support-page">

            <header className="admin-support-header">

                <div className="admin-support-header-left">

                    <Link
                        to="/admin"
                        className="admin-support-dashboard-link"
                    >
                        Dashboard
                    </Link>

                    <span className="admin-support-header-divider">
                        /
                    </span>

                    <span>
                        Support Centre
                    </span>

                </div>

            </header>


            <main className="admin-support-container">

                <section className="admin-support-page-title">

                    <div>

                        <span className="admin-support-eyebrow">
                            ADMINISTRATION
                        </span>

                        <h1>
                            Support Centre
                        </h1>

                        <p>
                            Manage customer support tickets and communicate directly with customers.
                        </p>

                    </div>


                    <button
                        type="button"
                        className="admin-support-refresh-button"
                        onClick={() =>
                            loadTickets(true)
                        }
                        disabled={
                            refreshing
                        }
                    >
                        <RefreshCw
                            size={16}
                            className={
                                refreshing
                                    ? "admin-support-spinning"
                                    : ""
                            }
                        />

                        <span>
                            Refresh
                        </span>
                    </button>

                </section>


                {error && (

                    <div className="admin-support-alert error">
                        {error}
                    </div>

                )}


                {/* =================================
                    ADMIN COMMUNICATIONS
                ================================== */}

                <section className="admin-support-communication-card">

                    <div className="admin-support-communication-header">

                        <div>

                            <div className="admin-support-section-icon">
                                <Send
                                    size={19}
                                />
                            </div>

                            <div>

                                <span className="admin-support-eyebrow">
                                    ADMIN COMMUNICATIONS
                                </span>

                                <h2>
                                    Send a Customer Communication
                                </h2>

                                <p>
                                    Send an email or SMS directly to all customers or one specific customer. No support ticket is required.
                                </p>

                            </div>

                        </div>

                    </div>


                    <form
                        className="admin-support-communication-form"
                        onSubmit={
                            sendCommunication
                        }
                    >

                        <div className="admin-support-form-grid">

                            <div className="admin-support-field">

                                <label>
                                    Recipient
                                </label>

                                <select
                                    value={
                                        communicationRecipient
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        handleCommunicationRecipientChange(
                                            event.target.value as CommunicationRecipient
                                        )
                                    }
                                    disabled={
                                        communicationLoading
                                    }
                                >

                                    <option value="all">
                                        All Customers
                                    </option>

                                    <option value="customer">
                                        Specific Customer
                                    </option>

                                </select>

                            </div>


                            <div className="admin-support-field">

                                <label>
                                    Channel
                                </label>

                                <select
                                    value={
                                        communicationChannel
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        handleCommunicationChannelChange(
                                            event.target.value as CommunicationChannel
                                        )
                                    }
                                    disabled={
                                        communicationLoading
                                    }
                                >

                                    <option value="email">
                                        Email
                                    </option>

                                    <option value="sms">
                                        SMS
                                    </option>

                                </select>

                            </div>

                        </div>


                        {communicationRecipient ===
                            "customer" && (

                            <div className="admin-support-customer-selector">

                                <div className="admin-support-field">

                                    <label>
                                        Select Customer
                                    </label>

                                    <div className="admin-support-customer-search">

                                        <Search
                                            size={17}
                                        />

                                        <input
                                            type="text"
                                            value={
                                                communicationCustomerQuery
                                            }
                                            onChange={(
                                                event
                                            ) => {

                                                setCommunicationCustomerQuery(
                                                    event.target.value
                                                );

                                                if (
                                                    selectedCommunicationCustomer
                                                ) {

                                                    setSelectedCommunicationCustomer(
                                                        null
                                                    );

                                                }

                                            }}
                                            placeholder="Search by name, email, phone or client number..."
                                            disabled={
                                                communicationLoading
                                            }
                                        />

                                    </div>

                                </div>


                                {communicationSearchLoading && (

                                    <div className="admin-support-customer-search-status">
                                        Searching customers...
                                    </div>

                                )}


                                {!communicationSearchLoading &&
                                    communicationCustomerQuery.trim().length >= 2 &&
                                    !selectedCommunicationCustomer &&
                                    communicationCustomers.length === 0 && (

                                    <div className="admin-support-customer-search-status">
                                        No customers found.
                                    </div>

                                )}


                                {communicationCustomers.length > 0 &&
                                    !selectedCommunicationCustomer && (

                                    <div className="admin-support-customer-results">

                                        {communicationCustomers.map(
                                            (
                                                customer
                                            ) => (

                                                <button
                                                    type="button"
                                                    key={
                                                        customer._id
                                                    }
                                                    className="admin-support-customer-result"
                                                    onClick={() =>
                                                        selectCommunicationCustomer(
                                                            customer
                                                        )
                                                    }
                                                >

                                                    <div className="admin-support-customer-result-avatar">
                                                        {(
                                                            customer.firstName?.[0] ||
                                                            customer.lastName?.[0] ||
                                                            "C"
                                                        ).toUpperCase()}
                                                    </div>


                                                    <div>

                                                        <strong>
                                                            {
                                                                getCommunicationCustomerName(
                                                                    customer
                                                                )
                                                            }
                                                        </strong>

                                                        <span>
                                                            {
                                                                customer.clientNumber ||
                                                                customer.email ||
                                                                customer.phone ||
                                                                "Customer"
                                                            }
                                                        </span>

                                                    </div>

                                                </button>

                                            )
                                        )}

                                    </div>

                                )}


                                {selectedCommunicationCustomer && (

                                    <div className="admin-support-selected-customer">

                                        <div className="admin-support-selected-customer-main">

                                            <div className="admin-support-customer-result-avatar">
                                                {(
                                                    selectedCommunicationCustomer.firstName?.[0] ||
                                                    selectedCommunicationCustomer.lastName?.[0] ||
                                                    "C"
                                                ).toUpperCase()}
                                            </div>


                                            <div>

                                                <strong>
                                                    {
                                                        getCommunicationCustomerName(
                                                            selectedCommunicationCustomer
                                                        )
                                                    }
                                                </strong>

                                                <span>
                                                    {
                                                        selectedCommunicationCustomer.clientNumber ||
                                                        "Customer"
                                                    }
                                                </span>

                                            </div>

                                        </div>


                                        <button
                                            type="button"
                                            onClick={() => {

                                                setSelectedCommunicationCustomer(
                                                    null
                                                );

                                                setCommunicationCustomerQuery(
                                                    ""
                                                );

                                            }}
                                            disabled={
                                                communicationLoading
                                            }
                                        >
                                            Change
                                        </button>

                                    </div>

                                )}

                            </div>

                        )}


                        {communicationChannel ===
                            "email" && (

                            <div className="admin-support-field">

                                <label>
                                    Email Subject
                                </label>

                                <input
                                    type="text"
                                    value={
                                        communicationSubject
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setCommunicationSubject(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Enter email subject..."
                                    disabled={
                                        communicationLoading
                                    }
                                />

                            </div>

                        )}


                        <div className="admin-support-field">

                            <label>
                                Message
                            </label>

                            <textarea
                                value={
                                    communicationMessage
                                }
                                onChange={(
                                    event
                                ) =>
                                    setCommunicationMessage(
                                        event.target.value
                                    )
                                }
                                placeholder={
                                    communicationChannel ===
                                    "email"
                                        ? "Write the email message..."
                                        : "Write the SMS message..."
                                }
                                rows={6}
                                disabled={
                                    communicationLoading
                                }
                            />

                        </div>


                        {communicationError && (

                            <div className="admin-support-alert error">
                                {communicationError}
                            </div>

                        )}


                        {communicationSuccess && (

                            <div className="admin-support-alert success">
                                {communicationSuccess}
                            </div>

                        )}


                        <div className="admin-support-communication-footer">

                            <div className="admin-support-communication-note">

                                {communicationRecipient ===
                                "all" ? (
                                    <>
                                        This communication will be sent to all customers who have the selected contact method.
                                    </>
                                ) : (
                                    <>
                                        This communication will be sent only to the selected customer.
                                    </>
                                )}

                            </div>


                            <button
                                type="submit"
                                className="admin-support-send-button"
                                disabled={
                                    communicationLoading ||
                                    (
                                        communicationRecipient ===
                                        "customer" &&
                                        !selectedCommunicationCustomer
                                    ) ||
                                    !communicationMessage.trim()
                                }
                            >

                                {communicationLoading ? (

                                    <>
                                        <RefreshCw
                                            size={16}
                                            className="admin-support-spinning"
                                        />

                                        <span>
                                            Sending...
                                        </span>
                                    </>

                                ) : (

                                    <>
                                        <Send
                                            size={16}
                                        />

                                        <span>
                                            Send Communication
                                        </span>
                                    </>

                                )}

                            </button>

                        </div>

                    </form>

                </section>


                {/* =================================
                    SUPPORT TICKETS
                ================================== */}

                <section className="admin-support-tickets-section">

                    <div className="admin-support-section-heading">

                        <div>

                            <span className="admin-support-eyebrow">
                                CUSTOMER SUPPORT
                            </span>

                            <h2>
                                Support Tickets
                            </h2>

                            <p>
                                Review and manage customer support conversations.
                            </p>

                        </div>


                        <div className="admin-support-ticket-count">

                            <strong>
                                {visibleTickets.length}
                            </strong>

                            <span>
                                {visibleTickets.length === 1
                                    ? "Ticket"
                                    : "Tickets"}
                            </span>

                        </div>

                    </div>


                    <section className="admin-support-filters">

                        <form
                            className="admin-support-search-form"
                            onSubmit={
                                handleSearchSubmit
                            }
                        >

                            <Search
                                size={17}
                            />

                            <input
                                type="text"
                                value={
                                    search
                                }
                                onChange={(
                                    event
                                ) =>
                                    setSearch(
                                        event.target.value
                                    )
                                }
                                placeholder="Search ticket, subject, customer or client number..."
                            />

                            <button
                                type="submit"
                            >
                                Search
                            </button>

                        </form>


                        <div className="admin-support-filter-controls">

                            <select
                                value={
                                    statusFilter
                                }
                                onChange={(
                                    event
                                ) =>
                                    setStatusFilter(
                                        event.target.value as SupportStatus | ""
                                    )
                                }
                            >

                                <option value="">
                                    All Statuses
                                </option>

                                {STATUS_OPTIONS.map(
                                    (
                                        option
                                    ) => (

                                        <option
                                            key={
                                                option.value
                                            }
                                            value={
                                                option.value
                                            }
                                        >
                                            {
                                                option.label
                                            }
                                        </option>

                                    )
                                )}

                            </select>


                            <select
                                value={
                                    priorityFilter
                                }
                                onChange={(
                                    event
                                ) =>
                                    setPriorityFilter(
                                        event.target.value as SupportPriority | ""
                                    )
                                }
                            >

                                <option value="">
                                    All Priorities
                                </option>

                                {PRIORITY_OPTIONS.map(
                                    (
                                        option
                                    ) => (

                                        <option
                                            key={
                                                option.value
                                            }
                                            value={
                                                option.value
                                            }
                                        >
                                            {
                                                option.label
                                            }
                                        </option>

                                    )
                                )}

                            </select>

                        </div>

                    </section>


                    {loading ? (

                        <div className="admin-support-loading">

                            <RefreshCw
                                size={24}
                                className="admin-support-spinning"
                            />

                            <p>
                                Loading support tickets...
                            </p>

                        </div>

                    ) : visibleTickets.length === 0 ? (

                        <div className="admin-support-empty">

                            <MessageSquare
                                size={32}
                            />

                            <h3>
                                No support tickets found
                            </h3>

                            <p>
                                There are no tickets matching your current search and filters.
                            </p>

                        </div>

                    ) : (

                        <div className="admin-support-ticket-list">

                            <div className="admin-support-table">

                                <div className="admin-support-table-head">

                                    <span>
                                        Ticket
                                    </span>

                                    <span>
                                        Customer
                                    </span>

                                    <span>
                                        Subject
                                    </span>

                                    <span>
                                        Status
                                    </span>

                                    <span>
                                        Priority
                                    </span>

                                    <span>
                                        Updated
                                    </span>

                                    <span>
                                        Action
                                    </span>

                                </div>


                                {visibleTickets.map(
                                    (
                                        ticket
                                    ) => (

                                        <div
                                            className="admin-support-table-row"
                                            key={
                                                ticket._id
                                            }
                                        >

                                            <button
                                                type="button"
                                                className="admin-support-ticket-number-button"
                                                onClick={() =>
                                                    openTicket(
                                                        ticket
                                                    )
                                                }
                                            >
                                                {
                                                    ticket.ticketNumber
                                                }
                                            </button>


                                            <div className="admin-support-table-customer">

                                                <strong>
                                                    {
                                                        getCustomerName(
                                                            ticket.userId
                                                        )
                                                    }
                                                </strong>

                                                <span>
                                                    {
                                                        ticket.userId?.clientNumber ||
                                                        ticket.userId?.email ||
                                                        "Customer"
                                                    }
                                                </span>

                                            </div>


                                            <button
                                                type="button"
                                                className="admin-support-subject-button"
                                                onClick={() =>
                                                    openTicket(
                                                        ticket
                                                    )
                                                }
                                            >
                                                {
                                                    ticket.subject
                                                }
                                            </button>


                                            <span
                                                className={
                                                    `admin-support-status-badge status-${ticket.status}`
                                                }
                                            >
                                                {
                                                    getStatusLabel(
                                                        ticket.status
                                                    )
                                                }
                                            </span>


                                            <span
                                                className={
                                                    `admin-support-priority-badge priority-${ticket.priority}`
                                                }
                                            >
                                                {
                                                    getPriorityLabel(
                                                        ticket.priority
                                                    )
                                                }
                                            </span>


                                            <span className="admin-support-table-date">
                                                {
                                                    formatDate(
                                                        ticket.updatedAt
                                                    )
                                                }
                                            </span>


                                            <div className="admin-support-row-actions">

                                                <button
                                                    type="button"
                                                    className="admin-support-view-button"
                                                    onClick={() =>
                                                        openTicket(
                                                            ticket
                                                        )
                                                    }
                                                >
                                                    View
                                                </button>


                                                <button
                                                    type="button"
                                                    className="admin-support-row-delete"
                                                    onClick={() =>
                                                        deleteTicket(
                                                            ticket._id
                                                        )
                                                    }
                                                    disabled={
                                                        actionLoading
                                                    }
                                                    aria-label="Delete ticket"
                                                    title="Delete ticket"
                                                >
                                                    <Trash2
                                                        size={16}
                                                    />
                                                </button>

                                            </div>

                                        </div>

                                    )
                                )}

                            </div>


                            <div className="admin-support-mobile-list">

                                {visibleTickets.map(
                                    (
                                        ticket
                                    ) => (

                                        <article
                                            className="admin-support-mobile-ticket"
                                            key={
                                                ticket._id
                                            }
                                        >

                                            <div className="admin-support-mobile-ticket-top">

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        openTicket(
                                                            ticket
                                                        )
                                                    }
                                                >
                                                    {
                                                        ticket.ticketNumber
                                                    }
                                                </button>


                                                <span
                                                    className={
                                                        `admin-support-status-badge status-${ticket.status}`
                                                    }
                                                >
                                                    {
                                                        getStatusLabel(
                                                            ticket.status
                                                        )
                                                    }
                                                </span>

                                            </div>


                                            <h3>
                                                {
                                                    ticket.subject
                                                }
                                            </h3>


                                            <div className="admin-support-mobile-customer">

                                                <User
                                                    size={15}
                                                />

                                                <span>
                                                    {
                                                        getCustomerName(
                                                            ticket.userId
                                                        )
                                                    }
                                                </span>

                                            </div>


                                            <div className="admin-support-mobile-meta">

                                                <span
                                                    className={
                                                        `admin-support-priority-badge priority-${ticket.priority}`
                                                    }
                                                >
                                                    {
                                                        getPriorityLabel(
                                                            ticket.priority
                                                        )
                                                    }
                                                </span>

                                                <span>
                                                    {
                                                        formatDate(
                                                            ticket.updatedAt
                                                        )
                                                    }
                                                </span>

                                            </div>


                                            <div className="admin-support-mobile-actions">

                                                <button
                                                    type="button"
                                                    className="admin-support-view-button"
                                                    onClick={() =>
                                                        openTicket(
                                                            ticket
                                                        )
                                                    }
                                                >
                                                    Open Ticket
                                                </button>


                                                <button
                                                    type="button"
                                                    className="admin-support-row-delete"
                                                    onClick={() =>
                                                        deleteTicket(
                                                            ticket._id
                                                        )
                                                    }
                                                    disabled={
                                                        actionLoading
                                                    }
                                                >
                                                    <Trash2
                                                        size={16}
                                                    />

                                                    <span>
                                                        Delete
                                                    </span>
                                                </button>

                                            </div>

                                        </article>

                                    )
                                )}

                            </div>

                        </div>

                    )}

                </section>

            </main>

        </div>

    );

}

