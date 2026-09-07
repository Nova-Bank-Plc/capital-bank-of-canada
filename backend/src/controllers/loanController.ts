import { Response } from "express";

import Loan from "../models/Loan.js";

import {
    AuthenticatedRequest,
} from "../middleware/authMiddleware.js";


export const getLoans = async (
    req: AuthenticatedRequest,
    res: Response
) => {

    try {

        if (!req.userId) {

            return res.status(401).json({
                success: false,
                message:
                    "Authentication required.",
            });

        }


        const loans = await Loan
            .find({
                userId: req.userId,
            })
            .sort({
                createdAt: -1,
            })
            .lean();


        return res.status(200).json({

            success: true,

            data: {

                loans,

            },

        });

    } catch (error) {

        console.error(
            "Loans error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to load loan information.",

        });

    }

};