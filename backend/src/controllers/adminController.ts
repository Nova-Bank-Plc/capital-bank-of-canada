import { Response } from "express";

import {
    AuthenticatedRequest,
} from "../middleware/authMiddleware.js";

export const getAdminTest = (
    req: AuthenticatedRequest,
    res: Response
) => {
    res.json({
        success: true,
        message: "Administrator access confirmed.",
        admin: {
            userId: req.userId,
            role: req.userRole,
        },
    });
};