import { Response } from "express";

import Account from "../models/Account.js";
import Transaction from "../models/Transaction.js";

import {
    AuthenticatedRequest,
} from "../middleware/authMiddleware.js";


export const getAccountById = async (
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

        const { accountId } = req.params;

        if (!accountId) {
            return res.status(400).json({
                success: false,
                message: "Account ID is required.",
            });
        }

        const account = await Account.findOne({
            _id: accountId,
            userId: req.userId,
        }).lean();

        if (!account) {
            return res.status(404).json({
                success: false,
                message: "Account not found.",
            });
        }

        const transactions = await Transaction.find({
            accountId: account._id,
            userId: req.userId,
        })
            .sort({
                createdAt: -1,
            })
            .limit(20)
            .lean();

        return res.status(200).json({
            success: true,
            data: {
                account,
                transactions,
            },
        });
    } catch (error) {
        console.error(
            "Get account error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to load account information.",
        });
    }
};