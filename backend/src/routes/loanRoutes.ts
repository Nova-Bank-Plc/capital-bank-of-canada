import { Router } from "express";

import {
    getLoans,
    createLoanApplication,
} from "../controllers/loanController.js";

import {
    requireAuth,
} from "../middleware/authMiddleware.js";


const router = Router();


/*
 * GET /api/loans
 *
 * Returns the authenticated customer's
 * loan applications and loans.
 */

router.get(
    "/",
    requireAuth,
    getLoans
);


/*
 * POST /api/loans
 *
 * Creates a new loan application for
 * the authenticated customer.
 */

router.post(
    "/",
    requireAuth,
    createLoanApplication
);


export default router;