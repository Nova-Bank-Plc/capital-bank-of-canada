import mongoose from "mongoose";

import { Response } from "express";

import Account from "../models/Account.js";
import Transaction from "../models/Transaction.js";

import {
    createCreditNotification,
    createDebitNotification,
} from "../services/notificationService.js";

import {
    AuthenticatedRequest,
} from "../middleware/authMiddleware.js";


const allowedSources = [
    "Direct Transfer",
    "ATM Transfer",
    "Bank Transfer",
    "Wire Transfer",
    "Cash Deposit",
    "Mobile Deposit",
    "Refund",
    "Interest",
    "Loan Disbursement",
    "Account Adjustment",
];


/* =========================================
   CREDIT ACCOUNT
========================================= */

export const creditAccount = async (
    req: AuthenticatedRequest,
    res: Response
) => {

    const session =
        await mongoose.startSession();

    try {

        const {
            accountId,
        } = req.params;

        const {
            amount,
            description,
            source,
        } = req.body;


        /* =====================================
           VALIDATE ACCOUNT ID
        ===================================== */

        if (
            !accountId ||
            !mongoose.isValidObjectId(accountId)
        ) {

            return res.status(400).json({
                success: false,
                message: "Invalid account ID.",
            });

        }


        /* =====================================
           VALIDATE AMOUNT
        ===================================== */

        const creditAmount =
            Number(amount);


        if (
            !Number.isFinite(creditAmount) ||
            creditAmount <= 0
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Credit amount must be greater than zero.",
            });

        }


        const roundedAmount =
            Math.round(
                creditAmount * 100
            ) / 100;


        if (
            roundedAmount <= 0
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Credit amount must be greater than zero.",
            });

        }


        /* =====================================
           VALIDATE SOURCE
        ===================================== */

        if (
            typeof source !== "string" ||
            !allowedSources.includes(
                source.trim()
            )
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "A valid transaction source is required.",
            });

        }


        const transactionSource =
            source.trim();


        /* =====================================
           DESCRIPTION
        ===================================== */

        const transactionDescription =
            typeof description === "string" &&
            description.trim().length > 0
                ? description.trim()
                : transactionSource;


        let notificationUserId:
            | mongoose.Types.ObjectId
            | null = null;

        let notificationAccountId:
            | mongoose.Types.ObjectId
            | null = null;

        let notificationTransactionId:
            | mongoose.Types.ObjectId
            | null = null;

        let notificationAmount = 0;

        let notificationCurrency = "";


        let responseData:
            | {
                account: {
                    id: mongoose.Types.ObjectId;
                    accountNumber: string;
                    accountType: string;
                    previousBalance: number;
                    creditAmount: number;
                    newBalance: number;
                    currency: string;
                };
                transaction: {
                    id: mongoose.Types.ObjectId;
                    name: string;
                    transactionType: string;
                    amount: number;
                    direction: "credit" | "debit";
                    status: string;
                    source: string;
                    createdAt: Date;
                };
            }
            | null = null;


        /* =====================================
           DATABASE TRANSACTION
        ===================================== */

        await session.withTransaction(
            async () => {

                const account =
                    await Account.findById(
                        accountId
                    ).session(session);


                if (!account) {
                    throw new Error(
                        "ACCOUNT_NOT_FOUND"
                    );
                }


                if (
                    account.status !== "active"
                ) {
                    throw new Error(
                        "ACCOUNT_NOT_ACTIVE"
                    );
                }


                const previousBalance =
                    account.balance;


                const newBalance =
                    Math.round(
                        (
                            previousBalance +
                            roundedAmount
                        ) * 100
                    ) / 100;


                account.balance =
                    newBalance;


                await account.save({
                    session,
                });


                /* =================================
                   CREATE CREDIT TRANSACTION
                ================================= */

                const transaction =
                    await Transaction.create(
                        [
                            {
                                userId:
                                    account.userId,

                                accountId:
                                    account._id,

                                name:
                                    transactionDescription,

                                transactionType:
                                    "Credit",

                                amount:
                                    roundedAmount,

                                direction:
                                    "credit",

                                status:
                                    "completed",

                                source:
                                    transactionSource,
                            },
                        ],
                        {
                            session,
                        }
                    );


                const createdTransaction =
                    transaction[0];


                /* =================================
                   SAVE NOTIFICATION INFORMATION
                   BEFORE SESSION ENDS
                ================================= */

                notificationUserId =
                    account.userId;

                notificationAccountId =
                    account._id;

                notificationTransactionId =
                    createdTransaction._id;

                notificationAmount =
                    roundedAmount;

                notificationCurrency =
                    account.currency;


                /* =================================
                   PREPARE RESPONSE
                ================================= */

                responseData = {

                    account: {

                        id:
                            account._id,

                        accountNumber:
                            account.accountNumber,

                        accountType:
                            account.accountType,

                        previousBalance,

                        creditAmount:
                            roundedAmount,

                        newBalance,

                        currency:
                            account.currency,
                    },

                    transaction: {

                        id:
                            createdTransaction._id,

                        name:
                            createdTransaction.name,

                        transactionType:
                            createdTransaction.transactionType,

                        amount:
                            createdTransaction.amount,

                        direction:
                            createdTransaction.direction,

                        status:
                            createdTransaction.status,

                        source:
                            createdTransaction.source,

                        createdAt:
                            createdTransaction.createdAt,
                    },
                };

            }
        );


        if (
            !responseData ||
            !notificationUserId ||
            !notificationAccountId ||
            !notificationTransactionId
        ) {

            return res.status(500).json({
                success: false,
                message:
                    "Unable to complete account credit.",
            });

        }


        /* =====================================
           CREATE DASHBOARD NOTIFICATION
           AFTER FINANCIAL COMMIT
        ===================================== */

        await createCreditNotification(

            notificationUserId,

            notificationAccountId,

            notificationTransactionId,

            notificationAmount,

            notificationCurrency

        );


        return res.status(201).json({

            success: true,

            message:
                "Account credited successfully.",

            data:
                responseData,

        });


    } catch (error) {

        console.error(
            "Admin account credit error:",
            error
        );


        if (
            error instanceof Error &&
            error.message ===
                "ACCOUNT_NOT_FOUND"
        ) {

            return res.status(404).json({
                success: false,
                message:
                    "Account not found.",
            });

        }


        if (
            error instanceof Error &&
            error.message ===
                "ACCOUNT_NOT_ACTIVE"
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Only active accounts can be credited.",
            });

        }


        return res.status(500).json({

            success: false,

            message:
                "Unable to credit account.",

        });

    } finally {

        await session.endSession();

    }

};


/* =========================================
   DEBIT ACCOUNT
========================================= */

export const debitAccount = async (
    req: AuthenticatedRequest,
    res: Response
) => {

    const session =
        await mongoose.startSession();

    try {

        const {
            accountId,
        } = req.params;

        const {
            amount,
            description,
            source,
        } = req.body;


        /* =====================================
           VALIDATE ACCOUNT ID
        ===================================== */

        if (
            !accountId ||
            !mongoose.isValidObjectId(accountId)
        ) {

            return res.status(400).json({
                success: false,
                message: "Invalid account ID.",
            });

        }


        /* =====================================
           VALIDATE AMOUNT
        ===================================== */

        const debitAmount =
            Number(amount);


        if (
            !Number.isFinite(debitAmount) ||
            debitAmount <= 0
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Debit amount must be greater than zero.",
            });

        }


        const roundedAmount =
            Math.round(
                debitAmount * 100
            ) / 100;


        if (
            roundedAmount <= 0
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Debit amount must be greater than zero.",
            });

        }


        /* =====================================
           VALIDATE SOURCE
        ===================================== */

        if (
            typeof source !== "string" ||
            !allowedSources.includes(
                source.trim()
            )
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "A valid transaction source is required.",
            });

        }


        const transactionSource =
            source.trim();


        /* =====================================
           DESCRIPTION
        ===================================== */

        const transactionDescription =
            typeof description === "string" &&
            description.trim().length > 0
                ? description.trim()
                : transactionSource;


        let notificationUserId:
            | mongoose.Types.ObjectId
            | null = null;

        let notificationAccountId:
            | mongoose.Types.ObjectId
            | null = null;

        let notificationTransactionId:
            | mongoose.Types.ObjectId
            | null = null;

        let notificationAmount = 0;

        let notificationCurrency = "";


        let responseData:
            | {
                account: {
                    id: mongoose.Types.ObjectId;
                    accountNumber: string;
                    accountType: string;
                    previousBalance: number;
                    debitAmount: number;
                    newBalance: number;
                    currency: string;
                };
                transaction: {
                    id: mongoose.Types.ObjectId;
                    name: string;
                    transactionType: string;
                    amount: number;
                    direction: "credit" | "debit";
                    status: string;
                    source: string;
                    createdAt: Date;
                };
            }
            | null = null;


        /* =====================================
           DATABASE TRANSACTION
        ===================================== */

        await session.withTransaction(
            async () => {

                const account =
                    await Account.findById(
                        accountId
                    ).session(session);


                if (!account) {
                    throw new Error(
                        "ACCOUNT_NOT_FOUND"
                    );
                }


                if (
                    account.status !== "active"
                ) {
                    throw new Error(
                        "ACCOUNT_NOT_ACTIVE"
                    );
                }


                /* =================================
                   PREVENT OVERDRAFT
                ================================= */

                const previousBalance =
                    account.balance;


                if (
                    roundedAmount >
                    previousBalance
                ) {

                    throw new Error(
                        "INSUFFICIENT_FUNDS"
                    );

                }


                /* =================================
                   UPDATE BALANCE
                ================================= */

                const newBalance =
                    Math.round(
                        (
                            previousBalance -
                            roundedAmount
                        ) * 100
                    ) / 100;


                account.balance =
                    newBalance;


                await account.save({
                    session,
                });


                /* =================================
                   CREATE DEBIT TRANSACTION
                ================================= */

                const transaction =
                    await Transaction.create(
                        [
                            {
                                userId:
                                    account.userId,

                                accountId:
                                    account._id,

                                name:
                                    transactionDescription,

                                transactionType:
                                    "Debit",

                                amount:
                                    roundedAmount,

                                direction:
                                    "debit",

                                status:
                                    "completed",

                                source:
                                    transactionSource,
                            },
                        ],
                        {
                            session,
                        }
                    );


                const createdTransaction =
                    transaction[0];


                /* =================================
                   SAVE NOTIFICATION INFORMATION
                ================================= */

                notificationUserId =
                    account.userId;

                notificationAccountId =
                    account._id;

                notificationTransactionId =
                    createdTransaction._id;

                notificationAmount =
                    roundedAmount;

                notificationCurrency =
                    account.currency;


                /* =================================
                   PREPARE RESPONSE
                ================================= */

                responseData = {

                    account: {

                        id:
                            account._id,

                        accountNumber:
                            account.accountNumber,

                        accountType:
                            account.accountType,

                        previousBalance,

                        debitAmount:
                            roundedAmount,

                        newBalance,

                        currency:
                            account.currency,
                    },

                    transaction: {

                        id:
                            createdTransaction._id,

                        name:
                            createdTransaction.name,

                        transactionType:
                            createdTransaction.transactionType,

                        amount:
                            createdTransaction.amount,

                        direction:
                            createdTransaction.direction,

                        status:
                            createdTransaction.status,

                        source:
                            createdTransaction.source,

                        createdAt:
                            createdTransaction.createdAt,
                    },
                };

            }
        );


        if (
            !responseData ||
            !notificationUserId ||
            !notificationAccountId ||
            !notificationTransactionId
        ) {

            return res.status(500).json({
                success: false,
                message:
                    "Unable to complete account debit.",
            });

        }


        /* =====================================
           CREATE DASHBOARD NOTIFICATION
           AFTER FINANCIAL COMMIT
        ===================================== */

        await createDebitNotification(

            notificationUserId,

            notificationAccountId,

            notificationTransactionId,

            notificationAmount,

            notificationCurrency

        );


        return res.status(201).json({

            success: true,

            message:
                "Account debited successfully.",

            data:
                responseData,

        });


    } catch (error) {

        console.error(
            "Admin account debit error:",
            error
        );


        if (
            error instanceof Error &&
            error.message ===
                "ACCOUNT_NOT_FOUND"
        ) {

            return res.status(404).json({
                success: false,
                message:
                    "Account not found.",
            });

        }


        if (
            error instanceof Error &&
            error.message ===
                "ACCOUNT_NOT_ACTIVE"
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Only active accounts can be debited.",
            });

        }


        if (
            error instanceof Error &&
            error.message ===
                "INSUFFICIENT_FUNDS"
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Insufficient funds for this debit.",
            });

        }


        return res.status(500).json({

            success: false,

            message:
                "Unable to debit account.",

        });

    } finally {

        await session.endSession();

    }

};