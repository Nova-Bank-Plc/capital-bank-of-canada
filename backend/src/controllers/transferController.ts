import { Response } from "express";
import mongoose from "mongoose";

import Account from "../models/Account.js";
import Transaction from "../models/Transaction.js";

import {
    AuthenticatedRequest,
} from "../middleware/authMiddleware.js";


export const createTransfer = async (
    req: AuthenticatedRequest,
    res: Response
) => {

    const session =
        await mongoose.startSession();

    try {

        if (!req.userId) {
            return res.status(401).json({
                success: false,
                message:
                    "Authentication required.",
            });
        }


        const {
            fromAccountId,
            recipientAccountNumber,
            amount,
            description,
        } = req.body;


        if (
            !fromAccountId ||
            !recipientAccountNumber ||
            amount === undefined ||
            amount === null
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "From account, recipient account and amount are required.",
            });
        }


        const transferAmount =
            Number(amount);


        if (
            !Number.isFinite(
                transferAmount
            ) ||
            transferAmount <= 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Transfer amount must be greater than zero.",
            });
        }


        if (
            !mongoose.Types.ObjectId.isValid(
                fromAccountId
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid source account.",
            });
        }


        session.startTransaction();


        // Find the customer's source account

        const sourceAccount =
            await Account.findOne({
                _id: fromAccountId,
                userId: req.userId,
                status: "active",
            }).session(session);


        if (!sourceAccount) {

            await session.abortTransaction();

            return res.status(404).json({
                success: false,
                message:
                    "Source account not found.",
            });

        }


        // Prevent transferring to the same account

        if (
            sourceAccount.accountNumber ===
            recipientAccountNumber
        ) {

            await session.abortTransaction();

            return res.status(400).json({
                success: false,
                message:
                    "You cannot transfer money to the same account.",
            });

        }


        // Check sufficient balance

        if (
            sourceAccount.balance <
            transferAmount
        ) {

            await session.abortTransaction();

            return res.status(400).json({
                success: false,
                message:
                    "Insufficient funds.",
            });

        }


        // Find recipient account

        const recipientAccount =
            await Account.findOne({
                accountNumber:
                    recipientAccountNumber,
                status: "active",
            }).session(session);


        if (!recipientAccount) {

            await session.abortTransaction();

            return res.status(404).json({
                success: false,
                message:
                    "Recipient account not found.",
            });

        }


        // Deduct money from sender

        sourceAccount.balance -=
            transferAmount;


        // Add money to recipient

        recipientAccount.balance +=
            transferAmount;


        await sourceAccount.save({
            session,
        });

        await recipientAccount.save({
            session,
        });


        // Create sender transaction

        await Transaction.create(
            [
                {
                    userId:
                        sourceAccount.userId,

                    accountId:
                        sourceAccount._id,

                    name:
                        description?.trim() ||
                        "Transfer",

                    transactionType:
                        "transfer",

                    amount:
                        transferAmount,

                    direction:
                        "debit",

                    status:
                        "completed",
                },
            ],
            {
                session,
            }
        );


        // Create recipient transaction

        await Transaction.create(
            [
                {
                    userId:
                        recipientAccount.userId,

                    accountId:
                        recipientAccount._id,

                    name:
                        description?.trim() ||
                        "Transfer received",

                    transactionType:
                        "transfer",

                    amount:
                        transferAmount,

                    direction:
                        "credit",

                    status:
                        "completed",
                },
            ],
            {
                session,
            }
        );


        await session.commitTransaction();


        return res.status(201).json({
            success: true,

            message:
                "Transfer completed successfully.",

            data: {
                amount:
                    transferAmount,

                fromAccountId:
                    sourceAccount._id,

                recipientAccountNumber:
                    recipientAccount.accountNumber,

                newBalance:
                    sourceAccount.balance,
            },
        });

    } catch (error) {

        await session.abortTransaction();

        console.error(
            "Transfer error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to complete transfer.",
        });

    } finally {

        await session.endSession();

    }
};