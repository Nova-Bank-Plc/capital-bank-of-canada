import {
    Router,
} from "express";

import {
    getNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
} from "../controllers/notificationController.js";

import {
    requireAuth,
} from "../middleware/authMiddleware.js";


const router =
    Router();


router.get(
    "/",
    requireAuth,
    getNotifications
);


router.patch(
    "/:notificationId/read",
    requireAuth,
    markNotificationAsRead
);


router.patch(
    "/read-all",
    requireAuth,
    markAllNotificationsAsRead
);


export default router;