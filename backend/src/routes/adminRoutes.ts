import { Router } from "express";


import {

    requireAuth,

} from "../middleware/authMiddleware.js";


import {

    requireAdmin,

} from "../middleware/adminMiddleware.js";


import {

    getAdminTest,

} from "../controllers/adminController.js";


import {

    getAdminDashboard,

} from "../controllers/adminDashboardController.js";


import {

    creditAccount,
    debitAccount,

} from "../controllers/adminAccountController.js";


import {

    searchCustomers,

} from "../controllers/adminCustomerController.js";


import adminSupportRoutes from "./adminSupportRoutes.js";

import {
    getAllBillers,
    createBiller,
    updateBiller,
    addPaymentOption,
    updatePaymentOption,
} from "../controllers/adminBillerController.js";

import {
    getAdminLoans,
    approveLoan,
    rejectLoan,
    activateLoan,
    markLoanPaid,
} from "../controllers/adminLoanController.js";

const router = Router();


/* =====================================
   ADMIN SECURITY TEST
===================================== */

router.get(

    "/test",

    requireAuth,

    requireAdmin,

    getAdminTest

);


/* =====================================
   ADMIN DASHBOARD
===================================== */

router.get(

    "/dashboard",

    requireAuth,

    requireAdmin,

    getAdminDashboard

);


/* =====================================
   CREDIT CUSTOMER ACCOUNT
===================================== */

router.post(

    "/accounts/:accountId/credit",

    requireAuth,

    requireAdmin,

    creditAccount

);


/* =====================================
   DEBIT CUSTOMER ACCOUNT
===================================== */

router.post(

    "/accounts/:accountId/debit",

    requireAuth,

    requireAdmin,

    debitAccount

);


/* =====================================
   SEARCH CUSTOMERS
===================================== */

router.get(

    "/customers/search",

    requireAuth,

    requireAdmin,

    searchCustomers

);


/* =====================================
   ADMIN BILLER MANAGEMENT
===================================== */

router.get(
    "/billers",
    requireAuth,
    requireAdmin,
    getAllBillers
);


router.post(
    "/billers",
    requireAuth,
    requireAdmin,
    createBiller
);


router.patch(
    "/billers/:billerId",
    requireAuth,
    requireAdmin,
    updateBiller
);


/* =====================================
   ADMIN BILLER PAYMENT OPTIONS
===================================== */

router.post(
    "/billers/:billerId/payment-options",
    requireAuth,
    requireAdmin,
    addPaymentOption
);


router.patch(
    "/billers/:billerId/payment-options/:optionId",
    requireAuth,
    requireAdmin,
    updatePaymentOption
);


router.get(
    "/loans",
    requireAuth,
    requireAdmin,
    getAdminLoans
);

router.patch(
    "/loans/:loanId/approve",
    requireAuth,
    requireAdmin,
    approveLoan
);

router.patch(
    "/loans/:loanId/reject",
    requireAuth,
    requireAdmin,
    rejectLoan
);

router.patch(
    "/loans/:loanId/activate",
    requireAuth,
    requireAdmin,
    activateLoan
);

router.patch(
    "/loans/:loanId/paid",
    requireAuth,
    requireAdmin,
    markLoanPaid
);


router.use(
    "/support",
    adminSupportRoutes
);

export default router;

