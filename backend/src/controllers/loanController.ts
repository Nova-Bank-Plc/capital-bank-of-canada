import mongoose, {
    Types,
} from "mongoose";

import { Response } from "express";

import Loan from "../models/Loan.js";
import Account from "../models/Account.js";
import Transaction from "../models/Transaction.js";

import {
    createCreditNotification,
} from "../services/notificationService.js";

import {
    AuthenticatedRequest,
} from "../middleware/authMiddleware.js";


/* =========================================
   APPLICATION NUMBER
========================================= */

function generateApplicationNumber(): string {

    const randomNumber =
        Math.floor(
            100000 +
            Math.random() * 900000
        );

    return `CBA-${randomNumber}`;
}


/* =========================================
   LOAN NUMBER
========================================= */

function generateLoanNumber(): string {

    const randomNumber =
        Math.floor(
            100000 +
            Math.random() * 900000
        );

    return `CBL-${randomNumber}`;
}


/* =========================================
   CUSTOMER:
   CREATE LOAN APPLICATION
========================================= */

export const createLoanApplication =
    async (
        req: AuthenticatedRequest,
        res: Response
    ) => {

        try {

            const userId =
                req.userId;

            if (!userId) {

                return res.status(401).json({
                    message:
                        "Unauthorized.",
                });

            }


            const {
                loanType,
                requestedAmount,
                termMonths,
                purpose,
            } = req.body;


            if (
                !loanType ||
                requestedAmount === undefined ||
                !termMonths ||
                !purpose
            ) {

                return res.status(400).json({
                    message:
                        "Loan type, requested amount, term and purpose are required.",
                });

            }


            const amount =
                Number(requestedAmount);

            const term =
                Number(termMonths);


            if (
                !Number.isFinite(amount) ||
                amount <= 0
            ) {

                return res.status(400).json({
                    message:
                        "Requested amount must be greater than zero.",
                });

            }


            if (
                !Number.isInteger(term) ||
                term <= 0
            ) {

                return res.status(400).json({
                    message:
                        "Term must be a valid number of months.",
                });

            }


            const cleanedPurpose =
                String(purpose).trim();


            if (
                cleanedPurpose.length < 5
            ) {

                return res.status(400).json({
                    message:
                        "Loan purpose must be at least 5 characters.",
                });

            }


            if (
                cleanedPurpose.length > 500
            ) {

                return res.status(400).json({
                    message:
                        "Loan purpose cannot exceed 500 characters.",
                });

            }


            const cleanedLoanType =
                String(loanType).trim();


            if (
                cleanedLoanType.length === 0
            ) {

                return res.status(400).json({
                    message:
                        "Loan type is required.",
                });

            }


            const existingApplication =
                await Loan.findOne({
                    userId,
                    loanType:
                        cleanedLoanType,
                    requestedAmount:
                        amount,
                    termMonths:
                        term,
                    status:
                        "pending",
                });


            if (existingApplication) {

                return res.status(409).json({
                    message:
                        "You already have a pending application for this loan.",
                    application:
                        existingApplication,
                });

            }


            let applicationNumber =
                generateApplicationNumber();


            let existingNumber =
                await Loan.findOne({
                    applicationNumber,
                });


            while (existingNumber) {

                applicationNumber =
                    generateApplicationNumber();

                existingNumber =
                    await Loan.findOne({
                        applicationNumber,
                    });

            }


            const loan =
                await Loan.create({

                    userId,

                    loanType:
                        cleanedLoanType,

                    applicationNumber,

                    requestedAmount:
                        amount,

                    termMonths:
                        term,

                    purpose:
                        cleanedPurpose,

                    status:
                        "pending",

                    applicationDate:
                        new Date(),

                });


            return res.status(201).json({

                message:
                    "Loan application submitted successfully.",

                loan,

            });

        } catch (error) {

            console.error(
                "Create loan application error:",
                error
            );

            return res.status(500).json({
                message:
                    "Failed to submit loan application.",
            });

        }

    };


/* =========================================
   CUSTOMER:
   GET OWN LOANS
========================================= */

export const getLoans =
    async (
        req: AuthenticatedRequest,
        res: Response
    ) => {

        try {

            const userId =
                req.userId;


            if (!userId) {

                return res.status(401).json({
                    message:
                        "Unauthorized.",
                });

            }


            const loans =
                await Loan.find({
                    userId,
                })
                    .sort({
                        createdAt: -1,
                    });


            return res.status(200).json({

                loans,

            });

        } catch (error) {

            console.error(
                "Get loans error:",
                error
            );

            return res.status(500).json({
                message:
                    "Failed to retrieve loans.",
            });

        }

    };


/* =========================================
   ADMIN:
   GET ALL LOANS
========================================= */

export const getAdminLoans =
    async (
        _req: AuthenticatedRequest,
        res: Response
    ) => {

        try {

            const loans =
                await Loan.find()
                    .populate(
                        "userId",
                        "clientNumber firstName lastName email"
                    )
                    .sort({
                        createdAt: -1,
                    })
                    .lean();


            return res.status(200).json({

                success: true,

                loans,

            });

        } catch (error) {

            console.error(
                "Get admin loans error:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Unable to load administrator loans.",

            });

        }

    };


/* =========================================
   ADMIN:
   APPROVE LOAN + DISBURSE FUNDS
========================================= */

export const approveLoan =
    async (
        req: AuthenticatedRequest,
        res: Response
    ) => {

        const session =
            await mongoose.startSession();

        let notificationUserId:
            | Types.ObjectId
            | null = null;

        let notificationAccountId:
            | Types.ObjectId
            | null = null;

        let notificationTransactionId:
            | Types.ObjectId
            | null = null;

        let notificationAmount = 0;

        let notificationCurrency = "";


        try {

            const {
                loanId,
            } = req.params;


            const {
                approvedAmount,
                interestRate,
                monthlyPayment,
            } = req.body;


            /* =====================================
               VALIDATE LOAN ID
            ===================================== */

            if (
                !loanId ||
                !mongoose.isValidObjectId(
                    loanId
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid loan ID.",

                });

            }


            /* =====================================
               VALIDATE APPROVED AMOUNT
            ===================================== */

            const amount =
                Number(approvedAmount);


            if (
                !Number.isFinite(amount) ||
                amount <= 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Approved amount must be greater than zero.",

                });

            }


            const roundedAmount =
                Math.round(
                    amount * 100
                ) / 100;


            /* =====================================
               VALIDATE INTEREST RATE
            ===================================== */

            let normalizedInterestRate:
                | number
                | undefined;


            if (
                interestRate !== undefined &&
                interestRate !== null &&
                interestRate !== ""
            ) {

                const parsedRate =
                    Number(
                        interestRate
                    );


                if (
                    !Number.isFinite(
                        parsedRate
                    ) ||
                    parsedRate < 0
                ) {

                    return res.status(400).json({

                        success: false,

                        message:
                            "Interest rate must be a valid non-negative number.",

                    });

                }


                normalizedInterestRate =
                    Math.round(
                        parsedRate * 100
                    ) / 100;

            }


            /* =====================================
               VALIDATE MONTHLY PAYMENT
            ===================================== */

            let normalizedMonthlyPayment:
                | number
                | undefined;


            if (
                monthlyPayment !== undefined &&
                monthlyPayment !== null &&
                monthlyPayment !== ""
            ) {

                const parsedPayment =
                    Number(
                        monthlyPayment
                    );


                if (
                    !Number.isFinite(
                        parsedPayment
                    ) ||
                    parsedPayment < 0
                ) {

                    return res.status(400).json({

                        success: false,

                        message:
                            "Monthly payment must be a valid non-negative number.",

                    });

                }


                normalizedMonthlyPayment =
                    Math.round(
                        parsedPayment * 100
                    ) / 100;

            }


            /* =====================================
               DATABASE TRANSACTION
            ===================================== */

            await session.withTransaction(
                async () => {

                    const loan =
                        await Loan.findById(
                            loanId
                        ).session(
                            session
                        );


                    if (!loan) {

                        throw new Error(
                            "LOAN_NOT_FOUND"
                        );

                    }


                    /*
                     * IMPORTANT:
                     *
                     * Only pending applications
                     * can be approved.
                     *
                     * This prevents a second
                     * approval from creating
                     * another account credit.
                     */

                    if (
                        loan.status !==
                        "pending"
                    ) {

                        throw new Error(
                            "LOAN_NOT_PENDING"
                        );

                    }


                    /*
                     * Never allow an already
                     * disbursed loan to be
                     * disbursed again.
                     */

                    if (
                        loan.disbursementTransactionId
                    ) {

                        throw new Error(
                            "LOAN_ALREADY_DISBURSED"
                        );

                    }


                    /* =================================
                       FIND CUSTOMER ACCOUNT
                    ================================= */

                    let account =
                        await Account.findOne({

                            userId:
                                loan.userId,

                            status:
                                "active",

                            accountType:
                                /chequing/i,

                        })
                            .sort({
                                createdAt: 1,
                            })
                            .session(
                                session
                            );


                    /*
                     * If no active chequing account
                     * exists, use the customer's
                     * first active account.
                     */

                    if (!account) {

                        account =
                            await Account.findOne({

                                userId:
                                    loan.userId,

                                status:
                                    "active",

                            })
                                .sort({
                                    createdAt: 1,
                                })
                                .session(
                                    session
                                );

                    }


                    if (!account) {

                        throw new Error(
                            "CUSTOMER_ACCOUNT_NOT_FOUND"
                        );

                    }


                    if (
                        account.currency
                            .toUpperCase() !==
                        "CAD"
                    ) {

                        throw new Error(
                            "ACCOUNT_CURRENCY_NOT_SUPPORTED"
                        );

                    }


                    /* =================================
                       GENERATE UNIQUE LOAN NUMBER
                    ================================= */

                    let loanNumber =
                        generateLoanNumber();


                    let existingLoanNumber =
                        await Loan.findOne({
                            loanNumber,
                        })
                            .session(
                                session
                            );


                    while (
                        existingLoanNumber
                    ) {

                        loanNumber =
                            generateLoanNumber();

                        existingLoanNumber =
                            await Loan.findOne({
                                loanNumber,
                            })
                                .session(
                                    session
                                );

                    }


                    /* =================================
                       UPDATE ACCOUNT BALANCE
                    ================================= */

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
                       CREATE LOAN TRANSACTION
                    ================================= */

                    const transactionResult =
                        await Transaction.create(
                            [
                                {

                                    userId:
                                        account.userId,

                                    accountId:
                                        account._id,

                                    name:
                                        "Loan Disbursement",

                                    transactionType:
                                        "Loan",

                                    amount:
                                        roundedAmount,

                                    direction:
                                        "credit",

                                    status:
                                        "completed",

                                    source:
                                        "Loan Disbursement",

                                },
                            ],
                            {
                                session,
                            }
                        );


                    const transaction =
                        transactionResult[0];


                    /* =================================
                       UPDATE LOAN
                    ================================= */

                    loan.loanNumber =
                        loanNumber;

                    loan.principalAmount =
                        roundedAmount;

                    loan.outstandingBalance =
                        roundedAmount;

                    if (
                        normalizedInterestRate !==
                        undefined
                    ) {

                        loan.interestRate =
                            normalizedInterestRate;

                    }

                    if (
                        normalizedMonthlyPayment !==
                        undefined
                    ) {

                        loan.monthlyPayment =
                            normalizedMonthlyPayment;

                    }

                    loan.approvedDate =
                        new Date();

                    loan.disbursedDate =
                        new Date();

                    loan.disbursementTransactionId =
                        transaction._id;

                    loan.status =
                        "approved";


                    await loan.save({
                        session,
                    });


                    /* =================================
                       SAVE NOTIFICATION DATA
                    ================================= */

                    notificationUserId =
                        account.userId;

                    notificationAccountId =
                        account._id;

                    notificationTransactionId =
                        transaction._id;

                    notificationAmount =
                        roundedAmount;

                    notificationCurrency =
                        account.currency;

                }
            );


            if (
                !notificationUserId ||
                !notificationAccountId ||
                !notificationTransactionId
            ) {

                return res.status(500).json({

                    success: false,

                    message:
                        "Loan approval completed but notification information was unavailable.",

                });

            }


            /*
             * Notification is intentionally
             * created AFTER the financial
             * transaction has committed.
             */

            await createCreditNotification(

                notificationUserId,

                notificationAccountId,

                notificationTransactionId,

                notificationAmount,

                notificationCurrency

            );


            return res.status(200).json({

                success: true,

                message:
                    "Loan approved and funds disbursed successfully.",

            });

        } catch (error) {

            console.error(
                "Approve loan error:",
                error
            );


            if (
                error instanceof Error &&
                error.message ===
                    "LOAN_NOT_FOUND"
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Loan application not found.",

                });

            }


            if (
                error instanceof Error &&
                error.message ===
                    "LOAN_NOT_PENDING"
            ) {

                return res.status(409).json({

                    success: false,

                    message:
                        "Only pending loan applications can be approved.",

                });

            }


            if (
                error instanceof Error &&
                error.message ===
                    "LOAN_ALREADY_DISBURSED"
            ) {

                return res.status(409).json({

                    success: false,

                    message:
                        "This loan has already been disbursed.",

                });

            }


            if (
                error instanceof Error &&
                error.message ===
                    "CUSTOMER_ACCOUNT_NOT_FOUND"
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "The customer does not have an active account for loan disbursement.",

                });

            }


            if (
                error instanceof Error &&
                error.message ===
                    "ACCOUNT_CURRENCY_NOT_SUPPORTED"
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Loan disbursement requires an active CAD account.",

                });

            }


            return res.status(500).json({

                success: false,

                message:
                    "Unable to approve loan application.",

            });

        } finally {

            await session.endSession();

        }

    };


/* =========================================
   ADMIN:
   REJECT LOAN
========================================= */

export const rejectLoan =
    async (
        req: AuthenticatedRequest,
        res: Response
    ) => {

        try {

            const {
                loanId,
            } = req.params;


            if (
                !loanId ||
                !mongoose.isValidObjectId(
                    loanId
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid loan ID.",

                });

            }


            /*
             * Only pending applications can
             * be rejected.
             */

            const loan =
                await Loan.findOneAndUpdate(

                    {
                        _id:
                            loanId,

                        status:
                            "pending",

                    },

                    {
                        $set: {
                            status:
                                "rejected",
                        },
                    },

                    {
                        new: true,
                    }

                );


            if (!loan) {

                const existingLoan =
                    await Loan.findById(
                        loanId
                    )
                        .select(
                            "status"
                        )
                        .lean();


                if (!existingLoan) {

                    return res.status(404).json({

                        success: false,

                        message:
                            "Loan application not found.",

                    });

                }


                return res.status(409).json({

                    success: false,

                    message:
                        "Only pending loan applications can be rejected.",

                });

            }


            return res.status(200).json({

                success: true,

                message:
                    "Loan application rejected successfully.",

                loan,

            });

        } catch (error) {

            console.error(
                "Reject loan error:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Unable to reject loan application.",

            });

        }

    };


/* =========================================
   ADMIN:
   ACTIVATE APPROVED LOAN
========================================= */

export const activateLoan =
    async (
        req: AuthenticatedRequest,
        res: Response
    ) => {

        try {

            const {
                loanId,
            } = req.params;


            if (
                !loanId ||
                !mongoose.isValidObjectId(
                    loanId
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid loan ID.",

                });

            }


            const loan =
                await Loan.findOneAndUpdate(

                    {
                        _id:
                            loanId,

                        status:
                            "approved",

                    },

                    {
                        $set: {
                            status:
                                "active",
                        },
                    },

                    {
                        new: true,
                    }

                );


            if (!loan) {

                const existingLoan =
                    await Loan.findById(
                        loanId
                    )
                        .select(
                            "status"
                        )
                        .lean();


                if (!existingLoan) {

                    return res.status(404).json({

                        success: false,

                        message:
                            "Loan not found.",

                    });

                }


                return res.status(409).json({

                    success: false,

                    message:
                        "Only approved loans can be activated.",

                });

            }


            return res.status(200).json({

                success: true,

                message:
                    "Loan activated successfully.",

                loan,

            });

        } catch (error) {

            console.error(
                "Activate loan error:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Unable to activate loan.",

            });

        }

    };


/* =========================================
   ADMIN:
   MARK LOAN AS PAID
========================================= */

export const markLoanPaid =
    async (
        req: AuthenticatedRequest,
        res: Response
    ) => {

        try {

            const {
                loanId,
            } = req.params;


            if (
                !loanId ||
                !mongoose.isValidObjectId(
                    loanId
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid loan ID.",

                });

            }


            const loan =
                await Loan.findOneAndUpdate(

                    {
                        _id:
                            loanId,

                        status:
                            "active",

                    },

                    {
                        $set: {
                            status:
                                "paid",

                            outstandingBalance:
                                0,
                        },
                    },

                    {
                        new: true,
                    }

                );


            if (!loan) {

                const existingLoan =
                    await Loan.findById(
                        loanId
                    )
                        .select(
                            "status"
                        )
                        .lean();


                if (!existingLoan) {

                    return res.status(404).json({

                        success: false,

                        message:
                            "Loan not found.",

                    });

                }


                return res.status(409).json({

                    success: false,

                    message:
                        "Only active loans can be marked as paid.",

                });

            }


            return res.status(200).json({

                success: true,

                message:
                    "Loan marked as paid successfully.",

                loan,

            });

        } catch (error) {

            console.error(
                "Mark loan paid error:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Unable to mark loan as paid.",

            });

        }

    };