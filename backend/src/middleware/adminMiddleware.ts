import { Response, NextFunction } from "express";

import User from "../models/User.js";

import {
    AuthenticatedRequest,
} from "./authMiddleware.js";


export const requireAdmin = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {

    try {

        if (!req.userId) {

            return res.status(401).json({

                success: false,

                message:
                    "Authentication required.",

            });

        }


        const user =
            await User.findById(
                req.userId
            ).select("role");


        if (!user) {

            return res.status(401).json({

                success: false,

                message:
                    "User account not found.",

            });

        }


        if (user.role !== "admin") {

            return res.status(403).json({

                success: false,

                message:
                    "Administrator access required.",

            });

        }


        req.userRole = "admin";


        next();

    } catch (error) {

        console.error(
            "Admin authorization error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to verify administrator access.",

        });

    }

};