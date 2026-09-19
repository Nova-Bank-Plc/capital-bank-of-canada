import { Router } from "express";

import {
    requireAuth,
} from "../middleware/authMiddleware.js";

import {
    requireAdmin,
} from "../middleware/adminMiddleware.js";

import {
    getAllSupportTickets,
    getAdminSupportTicket,
    adminReplyToSupportTicket,
    sendAdminSupportNotification,
    updateSupportTicketStatus,
    updateSupportTicketPriority,
    deleteSupportTicket,
    searchCommunicationCustomers,
    sendAdminCommunication,
} from "../controllers/adminSupportController.js";


const router = Router();


// ======================================
// ADMIN COMMUNICATIONS
// ======================================

router.get(
    "/communications/customers",
    requireAuth,
    requireAdmin,
    searchCommunicationCustomers
);


router.post(
    "/communications/send",
    requireAuth,
    requireAdmin,
    sendAdminCommunication
);


// ======================================
// SUPPORT TICKETS
// ======================================

router.get(
    "/",
    requireAuth,
    requireAdmin,
    getAllSupportTickets
);


router.get(
    "/:ticketId",
    requireAuth,
    requireAdmin,
    getAdminSupportTicket
);


router.post(
    "/:ticketId/reply",
    requireAuth,
    requireAdmin,
    adminReplyToSupportTicket
);


router.post(
    "/:ticketId/notify",
    requireAuth,
    requireAdmin,
    sendAdminSupportNotification
);


router.patch(
    "/:ticketId/status",
    requireAuth,
    requireAdmin,
    updateSupportTicketStatus
);


router.patch(
    "/:ticketId/priority",
    requireAuth,
    requireAdmin,
    updateSupportTicketPriority
);


router.delete(
    "/:ticketId",
    requireAuth,
    requireAdmin,
    deleteSupportTicket
);


export default router;