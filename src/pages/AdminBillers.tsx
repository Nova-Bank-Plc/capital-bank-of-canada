import {
    useEffect,
    useState,
} from "react";

import type {
    FormEvent,
} from "react";

import {
    Link,
} from "react-router-dom";

import {
    ChevronDown,
    Pencil,
    Plus,
    X,
} from "lucide-react";

import {
    useAuth,
} from "../context/AuthContext";

import AdminProtectedRoute from "../components/AdminProtectedRoute";

import "./AdminBillers.css";


const API_BASE_URL =
    import.meta.env.VITE_API_URL ||
    (
        import.meta.env.PROD
            ? ""
            : "http://localhost:5000"
    );


/* =========================================
   PAYMENT OPTION
========================================= */

interface PaymentOption {

    _id: string;

    name: string;

    description?: string;

    status:
        | "active"
        | "inactive";

}


/* =========================================
   BILLER
========================================= */

interface Biller {

    _id: string;

    name: string;

    category: string;

    description?: string;

    paymentOptions:
        PaymentOption[];

    status:
        | "active"
        | "inactive";

    createdAt: string;

    updatedAt: string;

}


/* =========================================
   BILLER FORM
========================================= */

interface BillerForm {

    name: string;

    category: string;

    description: string;

}


/* =========================================
   PAYMENT OPTION FORM
========================================= */

interface PaymentOptionForm {

    name: string;

    description: string;

}


/* =========================================
   ADMIN BILLERS CONTENT
========================================= */

function AdminBillersContent() {

    const {
    adminUser,
    adminToken,
    adminLogout,
} = useAuth();


    /* =========================================
       BILLER STATE
    ========================================= */

    const [
        billers,
        setBillers,
    ] = useState<Biller[]>([]);


    const [
        loading,
        setLoading,
    ] = useState(true);


    const [
        error,
        setError,
    ] = useState("");


    const [
        actionError,
        setActionError,
    ] = useState("");


    const [
        successMessage,
        setSuccessMessage,
    ] = useState("");


    /* =========================================
       BILLER FORM STATE
    ========================================= */

    const [
        showForm,
        setShowForm,
    ] = useState(false);


    const [
        editingBiller,
        setEditingBiller,
    ] = useState<Biller | null>(null);


    const [
        saving,
        setSaving,
    ] = useState(false);


    const [
        form,
        setForm,
    ] = useState<BillerForm>({
        name: "",
        category: "",
        description: "",
    });


    /* =========================================
       PAYMENT OPTION STATE
    ========================================= */

    const [
        expandedBillerId,
        setExpandedBillerId,
    ] = useState<string | null>(null);


    const [
        showPaymentOptionForm,
        setShowPaymentOptionForm,
    ] = useState(false);


    const [
        editingPaymentOption,
        setEditingPaymentOption,
    ] = useState<PaymentOption | null>(null);


    const [
        paymentOptionBillerId,
        setPaymentOptionBillerId,
    ] = useState<string | null>(null);


    const [
        paymentOptionForm,
        setPaymentOptionForm,
    ] = useState<PaymentOptionForm>({
        name: "",
        description: "",
    });


    const [
        savingPaymentOption,
        setSavingPaymentOption,
    ] = useState(false);


    /* =========================================
       LOAD BILLERS
    ========================================= */

    const loadBillers = async () => {

        if (!adminToken) {
            return;
        }


        try {

            setLoading(true);

            setError("");


            const response =
                await fetch(
                    `${API_BASE_URL}/api/admin/billers`,
                    {
                        method: "GET",

                        headers: {
                            Authorization:
                                `Bearer ${adminToken}`,
                        },
                    }
                );


            const data =
                await response.json();


            if (
                response.status === 401 ||
                response.status === 403
            ) {

                adminLogout();

                return;

            }


            if (
                !response.ok ||
                !data.success
            ) {

                throw new Error(
                    data.message ||
                    "Unable to load billers."
                );

            }


            setBillers(
                data.data?.billers || []
            );

        } catch (error) {

            console.error(
                "Admin billers error:",
                error
            );


            setError(
                error instanceof Error
                    ? error.message
                    : "Unable to load billers."
            );

        } finally {

            setLoading(false);

        }

    };


    useEffect(() => {
    if (!adminToken) {
        return;
    }

    loadBillers();
}, [adminToken]);


    /* =========================================
       BILLER FORM HELPERS
    ========================================= */

    const resetForm = () => {

        setForm({
            name: "",
            category: "",
            description: "",
        });

        setEditingBiller(null);

        setShowForm(false);

    };


    const openCreateForm = () => {

        setActionError("");

        setSuccessMessage("");

        setEditingBiller(null);

        setForm({
            name: "",
            category: "",
            description: "",
        });

        setShowForm(true);

    };


    const openEditForm = (
        biller: Biller
    ) => {

        setActionError("");

        setSuccessMessage("");

        setEditingBiller(biller);

        setForm({

            name:
                biller.name,

            category:
                biller.category,

            description:
                biller.description || "",

        });

        setShowForm(true);

    };


    /* =========================================
       BILLER FORM SUBMISSION
    ========================================= */

    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>
    ) => {

        event.preventDefault();


        if (!adminToken) {
            return;
        }


        setSaving(true);

        setActionError("");

        setSuccessMessage("");


        try {

            const isEditing =
                Boolean(
                    editingBiller
                );


            const url =
                isEditing
                    ? `${API_BASE_URL}/api/admin/billers/${editingBiller?._id}`
                    : `${API_BASE_URL}/api/admin/billers`;


            const response =
                await fetch(
                    url,
                    {
                        method:
                            isEditing
                                ? "PATCH"
                                : "POST",

                        headers: {

                            Authorization:
                                `Bearer ${adminToken}`,

                            "Content-Type":
                                "application/json",

                        },

                        body:
                            JSON.stringify({

                                name:
                                    form.name.trim(),

                                category:
                                    form.category.trim(),

                                description:
                                    form.description.trim(),

                            }),

                    }
                );


            const data =
                await response.json();


            if (
                response.status === 401 ||
                response.status === 403
            ) {

                adminLogout();

                return;

            }


            if (
                !response.ok ||
                !data.success
            ) {

                throw new Error(
                    data.message ||
                    "Unable to save biller."
                );

            }


            setSuccessMessage(
                isEditing
                    ? "Biller updated successfully."
                    : "Biller created successfully."
            );


            resetForm();


            await loadBillers();

        } catch (error) {

            console.error(
                "Save biller error:",
                error
            );


            setActionError(
                error instanceof Error
                    ? error.message
                    : "Unable to save biller."
            );

        } finally {

            setSaving(false);

        }

    };


    /* =========================================
       TOGGLE BILLER STATUS
    ========================================= */

    const toggleBillerStatus = async (
        biller: Biller
    ) => {

        if (!adminToken) {
            return;
        }


        setActionError("");

        setSuccessMessage("");


        const nextStatus =
            biller.status === "active"
                ? "inactive"
                : "active";


        try {

            const response =
                await fetch(
                    `${API_BASE_URL}/api/admin/billers/${biller._id}`,
                    {
                        method: "PATCH",

                        headers: {

                            Authorization:
                                `Bearer ${adminToken}`,

                            "Content-Type":
                                "application/json",

                        },

                        body:
                            JSON.stringify({

                                status:
                                    nextStatus,

                            }),

                    }
                );


            const data =
                await response.json();


            if (
                response.status === 401 ||
                response.status === 403
            ) {

                adminLogout();

                return;

            }


            if (
                !response.ok ||
                !data.success
            ) {

                throw new Error(
                    data.message ||
                    "Unable to update biller status."
                );

            }


            setSuccessMessage(
                nextStatus === "active"
                    ? "Biller activated successfully."
                    : "Biller deactivated successfully."
            );


            await loadBillers();

        } catch (error) {

            console.error(
                "Toggle biller status error:",
                error
            );


            setActionError(
                error instanceof Error
                    ? error.message
                    : "Unable to update biller status."
            );

        }

    };


    /* =========================================
       PAYMENT OPTION FORM HELPERS
    ========================================= */

    const closePaymentOptionForm = () => {

        setShowPaymentOptionForm(false);

        setEditingPaymentOption(null);

        setPaymentOptionBillerId(null);

        setPaymentOptionForm({
            name: "",
            description: "",
        });

    };


    const openAddPaymentOption = (
        billerId: string
    ) => {

        setActionError("");

        setSuccessMessage("");

        setPaymentOptionBillerId(
            billerId
        );

        setEditingPaymentOption(null);

        setPaymentOptionForm({
            name: "",
            description: "",
        });

        setShowPaymentOptionForm(true);

        setExpandedBillerId(
            billerId
        );

    };


    const openEditPaymentOption = (
        billerId: string,
        option: PaymentOption
    ) => {

        setActionError("");

        setSuccessMessage("");

        setPaymentOptionBillerId(
            billerId
        );

        setEditingPaymentOption(option);

        setPaymentOptionForm({

            name:
                option.name,

            description:
                option.description || "",

        });

        setShowPaymentOptionForm(true);

        setExpandedBillerId(
            billerId
        );

    };


    /* =========================================
       PAYMENT OPTION SUBMISSION
    ========================================= */

    const handlePaymentOptionSubmit =
        async (
            event: FormEvent<HTMLFormElement>
        ) => {

            event.preventDefault();


            if (
                !adminToken ||
                !paymentOptionBillerId
            ) {

                return;

            }


            setSavingPaymentOption(true);

            setActionError("");

            setSuccessMessage("");


            try {

                const isEditing =
                    Boolean(
                        editingPaymentOption
                    );


                const url =
                    isEditing

                        ? `${API_BASE_URL}/api/admin/billers/${paymentOptionBillerId}/payment-options/${editingPaymentOption?._id}`

                        : `${API_BASE_URL}/api/admin/billers/${paymentOptionBillerId}/payment-options`;


                const response =
                    await fetch(
                        url,
                        {
                            method:
                                isEditing
                                    ? "PATCH"
                                    : "POST",

                            headers: {

                                Authorization:
                                    `Bearer ${adminToken}`,

                                "Content-Type":
                                    "application/json",

                            },

                            body:
                                JSON.stringify({

                                    name:
                                        paymentOptionForm.name.trim(),

                                    description:
                                        paymentOptionForm.description.trim(),

                                }),

                        }
                    );


                const data =
                    await response.json();


                if (
                    response.status === 401 ||
                                       response.status === 403
                ) {

                    adminLogout();

                    return;

                }


                if (
                    !response.ok ||
                    !data.success
                ) {

                    throw new Error(
                        data.message ||
                        "Unable to save payment option."
                    );

                }


                setSuccessMessage(
                    isEditing
                        ? "Payment option updated successfully."
                        : "Payment option added successfully."
                );


                closePaymentOptionForm();


                await loadBillers();

            } catch (error) {

                console.error(
                    "Save payment option error:",
                    error
                );


                setActionError(
                    error instanceof Error
                        ? error.message
                        : "Unable to save payment option."
                );

            } finally {

                setSavingPaymentOption(false);

            }

        };


    /* =========================================
       TOGGLE PAYMENT OPTION STATUS
    ========================================= */

    const togglePaymentOptionStatus =
        async (
            billerId: string,
            option: PaymentOption
        ) => {

            if (!adminToken) {
                return;
            }


            setActionError("");

            setSuccessMessage("");


            const nextStatus =
                option.status === "active"
                    ? "inactive"
                    : "active";


            try {

                const response =
                    await fetch(

                        `${API_BASE_URL}/api/admin/billers/${billerId}/payment-options/${option._id}`,

                        {
                            method: "PATCH",

                            headers: {

                                Authorization: `Bearer ${adminToken}`,

                                "Content-Type":
                                    "application/json",

                            },

                            body:
                                JSON.stringify({

                                    status:
                                        nextStatus,

                                }),

                        }

                    );


                const data =
                    await response.json();


                if (
                    response.status === 401 ||
                    response.status === 403
                ) {

                   adminLogout();

                    return;

                }


                if (
                    !response.ok ||
                    !data.success
                ) {

                    throw new Error(
                        data.message ||
                        "Unable to update payment option status."
                    );

                }


                setSuccessMessage(

                    nextStatus === "active"

                        ? "Payment option activated successfully."

                        : "Payment option deactivated successfully."

                );


                await loadBillers();

            } catch (error) {

                console.error(
                    "Toggle payment option error:",
                    error
                );


                setActionError(

                    error instanceof Error

                        ? error.message

                        : "Unable to update payment option status."

                );

            }

        };


    /* =========================================
       TOGGLE BILLER OPTIONS
    ========================================= */

    const toggleBillerOptions = (
        billerId: string
    ) => {

        setActionError("");

        setSuccessMessage("");

        closePaymentOptionForm();


        setExpandedBillerId(
            current =>
                current === billerId
                    ? null
                    : billerId
        );

    };


    /* =========================================
       FORMAT DATE
    ========================================= */

    const formatDate = (
        date: string
    ) => {

        return new Intl.DateTimeFormat(
            "en-CA",
            {
                year: "numeric",
                month: "short",
                day: "numeric",
            }
        ).format(
            new Date(date)
        );

    };


    /* =========================================
       ACCESS CHECK
    ========================================= */
if (!adminUser || adminUser.role !== "admin") {
    return null;
}

    return (

        <div className="admin-billers-page">

            {/* =====================================
                HEADER
            ===================================== */}

            <header className="admin-billers-header">

                <div className="admin-billers-brand">

                    <Link
                        to="/admin"
                        className="admin-billers-logo-link"
                    >

                        <div className="admin-billers-logo">
                            C
                        </div>

                    </Link>


                    <div>

                        <strong>
                            Capital Bank
                        </strong>

                        <span>
                            Administrator Portal
                        </span>

                    </div>

                </div>


                <div className="admin-billers-header-right">

                    <span className="admin-billers-admin-name">
                        {adminUser.firstName}{" "}
                        {adminUser.lastName}
                    </span>


                    <button
                        type="button"
                        className="admin-billers-logout"
                        onClick={adminLogout}
                    >
                        Sign Out
                    </button>

                </div>

            </header>


            {/* =====================================
                LAYOUT
            ===================================== */}

            
    <div className="admin-billers-layout">

    
    
              {/* =====================================
    CONTENT
===================================== */}

<main className="admin-billers-content">

    <Link
        to="/admin"
        className="admin-billers-back-link"
    >
        ← Back to Dashboard
    </Link>


    <div className="admin-billers-heading">

        <div>

            <span>
                PAYMENTS
            </span>

            <h1>
                Billers
            </h1>

            <p>
                Manage the billers and payment
                options available to Capital
                Bank customers.
            </p>

        </div>


        <button
            type="button"
            className="admin-billers-add-button"
            onClick={openCreateForm}
        >

            <Plus
                size={17}
                strokeWidth={2}
            />

            Add Biller

        </button>

    </div>
                    {/* =====================================
                        MESSAGES
                    ===================================== */}

                    {actionError && (

                        <div
                            className="admin-billers-error"
                            role="alert"
                        >
                            {actionError}
                        </div>

                    )}


                    {successMessage && (

                        <div
                            className="admin-billers-success"
                            role="status"
                        >
                            {successMessage}
                        </div>

                    )}


                    {/* =====================================
                        BILLER FORM
                    ===================================== */}

                    {showForm && (

                        <section className="admin-biller-form-section">

                            <div className="admin-biller-form-heading">

                                <div>

                                    <span>
                                        {editingBiller
                                            ? "EDIT BILLER"
                                            : "NEW BILLER"}
                                    </span>

                                    <h2>
                                        {editingBiller
                                            ? "Update Biller"
                                            : "Add Biller"}
                                    </h2>

                                </div>


                                <button
                                    type="button"
                                    className="admin-biller-close-button"
                                    onClick={resetForm}
                                    aria-label="Close biller form"
                                >

                                    <X
                                        size={18}
                                    />

                                </button>

                            </div>


                            <form
                                className="admin-biller-form"
                                onSubmit={handleSubmit}
                            >

                                <div className="admin-biller-form-grid">


                                    <label>

                                        <span>
                                            Biller Name
                                        </span>

                                        <input
                                            type="text"
                                            value={form.name}
                                            onChange={(event) =>
                                                setForm({
                                                    ...form,
                                                    name:
                                                        event.target.value,
                                                })
                                            }
                                            placeholder="Enter biller name"
                                            maxLength={150}
                                            required
                                        />

                                    </label>


                                    <label>

                                        <span>
                                            Category
                                        </span>

                                        <input
                                            type="text"
                                            value={form.category}
                                            onChange={(event) =>
                                                setForm({
                                                    ...form,
                                                    category:
                                                        event.target.value,
                                                })
                                            }
                                            placeholder="e.g. Utilities"
                                            maxLength={100}
                                            required
                                        />

                                    </label>


                                    <label className="admin-biller-description-field">

                                        <span>
                                            Description
                                        </span>

                                        <textarea
                                            value={form.description}
                                            onChange={(event) =>
                                                setForm({
                                                    ...form,
                                                    description:
                                                        event.target.value,
                                                })
                                            }
                                            placeholder="Optional biller description"
                                            maxLength={500}
                                            rows={4}
                                        />

                                    </label>

                                </div>


                                <div className="admin-biller-form-actions">

                                    <button
                                        type="button"
                                        className="admin-biller-cancel-button"
                                        onClick={resetForm}
                                        disabled={saving}
                                    >
                                        Cancel
                                    </button>


                                    <button
                                        type="submit"
                                        className="admin-biller-save-button"
                                        disabled={saving}
                                    >

                                        {saving
                                            ? "Saving..."
                                            : editingBiller
                                                ? "Save Changes"
                                                : "Create Biller"}

                                    </button>

                                </div>

                            </form>

                        </section>

                    )}


                    {/* =====================================
                        BILLER LIST
                    ===================================== */}

                    <section className="admin-biller-list-section">

                        <div className="admin-biller-list-heading">

                            <div>

                                <span>
                                    BILLER DIRECTORY
                                </span>

                                <h2>
                                    Available Billers
                                </h2>

                            </div>


                            <strong>
                                {billers.length}
                            </strong>

                        </div>


                        {loading && (

                            <div className="admin-biller-state">
                                Loading billers...
                            </div>

                        )}


                        {!loading && error && (

                            <div
                                className="admin-billers-error"
                                role="alert"
                            >
                                {error}
                            </div>

                        )}


                        {!loading &&
                            !error &&
                            billers.length === 0 && (

                                <div className="admin-biller-empty">
                                    No billers have been created yet.
                                </div>

                            )}


                        {!loading &&
                            !error &&
                            billers.length > 0 && (

                                <div className="admin-biller-table-wrapper">

                                    <table>

                                        <thead>

                                            <tr>

                                                <th>
                                                    Biller
                                                </th>

                                                <th>
                                                    Category
                                                </th>

                                                <th>
                                                    Description
                                                </th>

                                                <th>
                                                    Options
                                                </th>

                                                <th>
                                                    Status
                                                </th>

                                                <th>
                                                    Created
                                                </th>

                                                <th>
                                                    Actions
                                                </th>

                                            </tr>

                                        </thead>


                                        <tbody>

                                            {billers.map(
                                                (biller) => {

                                                    const isExpanded =
                                                        expandedBillerId ===
                                                        biller._id;


                                                    const paymentOptions =
                                                        biller.paymentOptions ||
                                                        [];


                                                    return (

                                                        <tr
                                                            key={
                                                                biller._id
                                                            }
                                                            className={
                                                                isExpanded
                                                                    ? "admin-biller-row-expanded"
                                                                    : ""
                                                            }
                                                        >

                                                            <td>

                                                                <strong>
                                                                    {biller.name}
                                                                </strong>

                                                            </td>


                                                            <td>
                                                                {biller.category}
                                                            </td>


                                                            <td>
                                                                {biller.description ||
                                                                    "—"}
                                                            </td>


                                                            <td>

                                                                <button
                                                                    type="button"
                                                                    className="admin-biller-options-toggle"
                                                                    onClick={() =>
                                                                        toggleBillerOptions(
                                                                            biller._id
                                                                        )
                                                                    }
                                                                    aria-expanded={
                                                                        isExpanded
                                                                    }
                                                                >

                                                                    <span>
                                                                        {
                                                                            paymentOptions.length
                                                                        }
                                                                        {" "}
                                                                        {paymentOptions.length === 1
                                                                            ? "option"
                                                                            : "options"}
                                                                    </span>

                                                                    <ChevronDown
                                                                        size={16}
                                                                        className={
                                                                            isExpanded
                                                                                ? "rotated"
                                                                                : ""
                                                                        }
                                                                    />

                                                                </button>

                                                            </td>


                                                            <td>

                                                                <span
                                                                    className={
                                                                        `admin-biller-status ${
                                                                            biller.status
                                                                        }`
                                                                    }
                                                                >
                                                                    {
                                                                        biller.status
                                                                    }
                                                                </span>

                                                            </td>


                                                            <td>
                                                                {formatDate(
                                                                    biller.createdAt
                                                                )}
                                                            </td>


                                                            <td>

                                                                <div className="admin-biller-actions">

                                                                    <button
                                                                        type="button"
                                                                        className="admin-biller-edit-button"
                                                                        onClick={() =>
                                                                            openEditForm(
                                                                                biller
                                                                            )
                                                                        }
                                                                    >

                                                                        <Pencil
                                                                            size={14}
                                                                        />

                                                                        Edit

                                                                    </button>


                                                                    <button
                                                                        type="button"
                                                                        className={
                                                                            `admin-biller-status-button ${
                                                                                biller.status
                                                                            }`
                                                                        }
                                                                        onClick={() =>
                                                                            toggleBillerStatus(
                                                                                biller
                                                                            )
                                                                        }
                                                                    >

                                                                        {biller.status ===
                                                                        "active"
                                                                            ? "Deactivate"
                                                                            : "Activate"}

                                                                    </button>

                                                                </div>

                                                            </td>

                                                        </tr>

                                                    );

                                                }
                                            )}

                                        </tbody>

                                    </table>


                                    {/* =====================================
                                        PAYMENT OPTIONS PANELS
                                    ===================================== */}

                                    {billers.map(
                                        (biller) => {

                                            if (
                                                expandedBillerId !==
                                                biller._id
                                            ) {

                                                return null;

                                            }


                                            const paymentOptions =
                                                biller.paymentOptions ||
                                                [];


                                            return (

                                                <section
                                                    key={
                                                        `options-${biller._id}`
                                                    }
                                                    className="admin-payment-options-panel"
                                                >

                                                    <div className="admin-payment-options-header">

                                                        <div>

                                                            <span>
                                                                PAYMENT OPTIONS
                                                            </span>

                                                            <h3>
                                                                {biller.name}
                                                            </h3>

                                                            <p>
                                                                Manage the payment
                                                                services customers
                                                                can select for this
                                                                biller.
                                                            </p>

                                                        </div>


                                                        <button
                                                            type="button"
                                                            className="admin-payment-option-add-button"
                                                            onClick={() =>
                                                                openAddPaymentOption(
                                                                    biller._id
                                                                )
                                                            }
                                                        >

                                                            <Plus
                                                                size={16}
                                                            />

                                                            Add Payment Option

                                                        </button>

                                                    </div>


                                                    {showPaymentOptionForm &&
                                                        paymentOptionBillerId ===
                                                        biller._id && (

                                                            <div className="admin-payment-option-form">

                                                                <div className="admin-payment-option-form-heading">

                                                                    <div>

                                                                        <span>
                                                                            {editingPaymentOption
                                                                                ? "EDIT OPTION"
                                                                                : "NEW OPTION"}
                                                                        </span>

                                                                        <h4>
                                                                            {editingPaymentOption
                                                                                ? "Update Payment Option"
                                                                                : "Add Payment Option"}
                                                                        </h4>

                                                                    </div>


                                                                    <button
                                                                        type="button"
                                                                        className="admin-biller-close-button"
                                                                        onClick={
                                                                            closePaymentOptionForm
                                                                        }
                                                                        aria-label="Close payment option form"
                                                                    >

                                                                        <X
                                                                            size={17}
                                                                        />

                                                                    </button>

                                                                </div>


                                                                <form
                                                                    onSubmit={
                                                                        handlePaymentOptionSubmit
                                                                    }
                                                                    className="admin-payment-option-form-fields"
                                                                >

                                                                    <label>

                                                                        <span>
                                                                            Option Name
                                                                        </span>

                                                                        <input
                                                                            type="text"
                                                                            value={
                                                                                paymentOptionForm.name
                                                                            }
                                                                            onChange={
                                                                                (event) =>
                                                                                    setPaymentOptionForm({
                                                                                        ...paymentOptionForm,
                                                                                        name:
                                                                                            event.target.value,
                                                                                    })
                                                                            }
                                                                            placeholder="e.g. Prepaid Electricity"
                                                                            maxLength={150}
                                                                            required
                                                                        />

                                                                    </label>


                                                                    <label>

                                                                        <span>
                                                                            Description
                                                                        </span>

                                                                        <textarea
                                                                            value={
                                                                                paymentOptionForm.description
                                                                            }
                                                                            onChange={
                                                                                (event) =>
                                                                                    setPaymentOptionForm({
                                                                                        ...paymentOptionForm,
                                                                                        description:
                                                                                            event.target.value,
                                                                                    })
                                                                            }
                                                                            placeholder="Optional description for customers"
                                                                            maxLength={500}
                                                                            rows={3}
                                                                        />

                                                                    </label>


                                                                    <div className="admin-payment-option-form-actions">

                                                                        <button
                                                                            type="button"
                                                                            className="admin-biller-cancel-button"
                                                                            onClick={
                                                                                closePaymentOptionForm
                                                                            }
                                                                            disabled={
                                                                                savingPaymentOption
                                                                            }
                                                                        >
                                                                            Cancel
                                                                        </button>


                                                                        <button
                                                                            type="submit"
                                                                            className="admin-biller-save-button"
                                                                            disabled={
                                                                                savingPaymentOption
                                                                            }
                                                                        >

                                                                            {
                                                                                savingPaymentOption
                                                                                    ? "Saving..."
                                                                                    : editingPaymentOption
                                                                                        ? "Save Changes"
                                                                                        : "Add Option"
                                                                            }

                                                                        </button>

                                                                    </div>

                                                                </form>

                                                            </div>

                                                        )}


                                                    {paymentOptions.length ===
                                                        0 && (
                                                            <div className="admin-payment-options-empty">

                                                                <strong>
                                                                    No payment options yet
                                                                </strong>

                                                                <p>
                                                                    Add the services
                                                                    customers can use
                                                                    when paying this
                                                                    biller.
                                                                </p>

                                                            </div>
                                                        )}


                                                    {paymentOptions.length >
                                                        0 && (

                                                            <div className="admin-payment-options-list">

                                                                {paymentOptions.map(
                                                                    (option) => (

                                                                        <div
                                                                            key={
                                                                                option._id
                                                                            }
                                                                            className="admin-payment-option-card"
                                                                        >

                                                                            <div className="admin-payment-option-info">

                                                                                <div className="admin-payment-option-title-row">

                                                                                    <strong>
                                                                                        {
                                                                                            option.name
                                                                                        }
                                                                                    </strong>


                                                                                    <span
                                                                                        className={
                                                                                            `admin-payment-option-status ${
                                                                                                option.status
                                                                                            }`
                                                                                        }
                                                                                    >
                                                                                        {
                                                                                            option.status
                                                                                        }
                                                                                    </span>

                                                                                </div>


                                                                                <p>
                                                                                    {
                                                                                        option.description ||
                                                                                        "No description provided."
                                                                                    }
                                                                                </p>

                                                                            </div>


                                                                            <div className="admin-payment-option-actions">

                                                                                <button
                                                                                    type="button"
                                                                                    className="admin-biller-edit-button"
                                                                                    onClick={() =>
                                                                                        openEditPaymentOption(
                                                                                            biller._id,
                                                                                            option
                                                                                        )
                                                                                    }
                                                                                >

                                                                                    <Pencil
                                                                                        size={14}
                                                                                    />

                                                                                    Edit

                                                                                </button>


                                                                                <button
                                                                                    type="button"
                                                                                    className={
                                                                                        `admin-biller-status-button ${
                                                                                            option.status
                                                                                        }`
                                                                                    }
                                                                                    onClick={() =>
                                                                                        togglePaymentOptionStatus(
                                                                                            biller._id,
                                                                                            option
                                                                                        )
                                                                                    }
                                                                                >

                                                                                    {
                                                                                        option.status ===
                                                                                        "active"
                                                                                            ? "Deactivate"
                                                                                            : "Activate"
                                                                                    }

                                                                                </button>

                                                                            </div>

                                                                        </div>

                                                                    )
                                                                )}

                                                            </div>

                                                        )}

                                                </section>

                                            );

                                        }
                                    )}

                                </div>

                            )}

                    </section>

                </main>

            </div>

        </div>

    );

}


/* =========================================
   ADMIN PROTECTION
========================================= */

export default function AdminBillers() {

    return (

        <AdminProtectedRoute>

            <AdminBillersContent />

        </AdminProtectedRoute>

    );

}