import { Response } from "express";
import Account from "../models/Account.js";
import Transaction from "../models/Transaction.js";
import {
    AuthenticatedRequest,
} from "../middleware/authMiddleware.js";

export const getDashboard = async (
    req: AuthenticatedRequest,
    res: Response
) => {

    try {

        if (!req.userId) {

            return res.status(401).json({
                success: false,
                message: "Authentication required.",
            });

        }

        const accounts = await Account
            .find({
                userId: req.userId,
            })
            .sort({
                createdAt: 1,
            })
            .lean();

        const transactions = await Transaction
            .find({
                userId: req.userId,
            })
            .sort({
                createdAt: -1,
            })
            .limit(20)
            .lean();

        const totalBalance = accounts.reduce(
            (total, account) =>
                total + account.balance,
            0
        );

        return res.status(200).json({

            success: true,

            data: {

                accounts,

                transactions,

                totalBalance,

            },

        });

    } catch (error) {

        console.error(
            "Dashboard error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Unable to load dashboard information.",

        });

    }
};