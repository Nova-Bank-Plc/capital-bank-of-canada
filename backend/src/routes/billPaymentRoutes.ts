import { Router } from "express";

import {
    getBillers,
    getPayees,
    addPayee,
    getBillPayments,
    makeBillPayment,
} from "../controllers/billPaymentController.js";

import {
    requireAuth,
} from "../middleware/authMiddleware.js";


const router = Router();


router.get(
    "/billers",
    requireAuth,
    getBillers
);


router.get(
    "/payees",
    requireAuth,
    getPayees
);


router.post(
    "/payees",
    requireAuth,
    addPayee
);


router.get(
    "/history",
    requireAuth,
    getBillPayments
);


router.post(
    "/",
    requireAuth,
    makeBillPayment
);


export default router;