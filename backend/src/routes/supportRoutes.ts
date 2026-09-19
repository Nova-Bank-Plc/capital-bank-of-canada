import { Router } from "express";

import { requireAuth } from "../middleware/authMiddleware.js";

import {
    createSupportTicket,
    getMySupportTickets,
    getMySupportTicket,
    replyToSupportTicket,
} from "../controllers/supportController.js";


const router = Router();


// ======================================
// CUSTOMER SUPPORT
// ======================================

// Create a new support ticket
router.post(
    "/",
    requireAuth,
    createSupportTicket
);


// Get all support tickets belonging
// to the currently authenticated customer
router.get(
    "/",
    requireAuth,
    getMySupportTickets
);


// Get one support ticket belonging
// to the currently authenticated customer
router.get(
    "/:ticketId",
    requireAuth,
    getMySupportTicket
);


// Reply to a customer's support ticket
router.post(
    "/:ticketId/reply",
    requireAuth,
    replyToSupportTicket
);


export default router;