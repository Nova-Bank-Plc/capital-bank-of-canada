import {
    Response,
} from "express";

import mongoose from "mongoose";

import Account from "../models/Account.js";
import Biller from "../models/Biller.js";
import Payee from "../models/Payee.js";
import BillPayment from "../models/BillPayment.js";
import Transaction from "../models/Transaction.js";

import {
    AuthenticatedRequest,
} from "../middleware/authMiddleware.js";


/* =========================================
   GENERATE PAYMENT REFERENCE
========================================= */

function generatePaymentReference(): string {

    const timestamp =
        Date.now().toString(36).toUpperCase();

    const random =
        Math.random()
            .toString(36)
            .substring(2, 8)
            .toUpperCase();

    return `CBP-${timestamp}-${random}`;
}


/* =========================================
   GET AVAILABLE BILLERS
========================================= */

export const getBillers = async (
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


        const billers =
            await Biller.find({

                status: "active",

            })
                .sort({
                    name: 1,
                })
                .lean();


        return res.status(200).json({

            success: true,

            data: {
                billers,
            },

        });

    } catch (error) {

        console.error(
            "Get billers error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to load available billers.",

        });

    }

};


/* =========================================
   GET CUSTOMER PAYEES
========================================= */

export const getPayees = async (
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


        const payees =
            await Payee.find({

                userId: req.userId,

                status: "active",

            })
                .populate(
                    "billerId",
                    "name category"
                )
                .sort({
                    createdAt: -1,
                })
                .lean();


        return res.status(200).json({

            success: true,

            data: {
                payees,
            },

        });

    } catch (error) {

        console.error(
            "Get payees error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to load your payees.",

        });

    }

};


/* =========================================
   ADD PAYEE
========================================= */

export const addPayee = async (
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


        const {
            billerId,
            nickname,
            accountReference,
        } = req.body;


        if (
            !billerId ||
            !accountReference
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Biller and account reference are required.",

            });

        }


        if (
            !mongoose.Types.ObjectId.isValid(
                billerId
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid biller.",

            });

        }


        const biller =
            await Biller.findOne({

                _id: billerId,

                status: "active",

            });


        if (!biller) {

            return res.status(404).json({

                success: false,

                message:
                    "Biller not found or unavailable.",

            });

        }


        const cleanedReference =
            String(
                accountReference
            ).trim();


        if (
            cleanedReference.length === 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Account reference is required.",

            });

        }


        if (
            cleanedReference.length > 100
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Account reference cannot exceed 100 characters.",

            });

        }


        let cleanedNickname:
            | string
            | undefined;


        if (
            nickname !== undefined
        ) {

            cleanedNickname =
                String(
                    nickname
                ).trim();


            if (
                cleanedNickname.length > 100
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Nickname cannot exceed 100 characters.",

                });

            }


            if (
                cleanedNickname.length === 0
            ) {

                cleanedNickname =
                    undefined;

            }

        }


        const existingPayee =
            await Payee.findOne({

                userId: req.userId,

                billerId,

                accountReference:
                    cleanedReference,

                status: "active",

            });


        if (existingPayee) {

            return res.status(409).json({

                success: false,

                message:
                    "This payee has already been added.",

                data: {
                    payee: existingPayee,
                },

            });

        }


        const payee =
            await Payee.create({

                userId:
                    req.userId,

                billerId,

                nickname:
                    cleanedNickname,

                accountReference:
                    cleanedReference,

                status:
                    "active",

            });


        return res.status(201).json({

            success: true,

            message:
                "Payee added successfully.",

            data: {
                payee,
            },

        });

    } catch (error) {

        console.error(
            "Add payee error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to add this payee.",

        });

    }

};


/* =========================================
   GET CUSTOMER BILL PAYMENTS
========================================= */

export const getBillPayments = async (
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


        const payments =
            await BillPayment.find({

                userId: req.userId,

            })
                .populate(
                    "billerId",
                    "name category"
                )
                .populate(
                    "payeeId",
                    "nickname accountReference"
                )
                .sort({
                    createdAt: -1,
                })
                .limit(50)
                .lean();


        return res.status(200).json({

            success: true,

            data: {
                payments,
            },

        });

    } catch (error) {

        console.error(
            "Get bill payments error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to load your bill payments.",

        });

    }

};


/* =========================================
   MAKE BILL PAYMENT
========================================= */

export const makeBillPayment = async (
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
            accountId,
            payeeId,
            amount,
            description,
        } = req.body;


        if (
            !accountId ||
            !payeeId ||
            amount === undefined
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Account, payee, and payment amount are required.",

            });

        }


        if (
            !mongoose.Types.ObjectId.isValid(
                accountId
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid account.",

            });

        }


        if (
            !mongoose.Types.ObjectId.isValid(
                payeeId
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid payee.",

            });

        }


        const numericAmount =
            Number(amount);


        if (
            !Number.isFinite(
                numericAmount
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Payment amount must be a valid number.",

            });

        }


        if (
            numericAmount <= 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Payment amount must be greater than zero.",

            });

        }


        if (
            Math.round(
                numericAmount * 100
            ) !==
            numericAmount * 100
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Payment amount cannot contain more than two decimal places.",

            });

        }


        let cleanedDescription:
            | string
            | undefined;


        if (
            description !== undefined
        ) {

            cleanedDescription =
                String(
                    description
                ).trim();


            if (
                cleanedDescription.length > 500
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Description cannot exceed 500 characters.",

                });

            }


            if (
                cleanedDescription.length === 0
            ) {

                cleanedDescription =
                    undefined;

            }

        }


        session.startTransaction();


        const account =
            await Account.findOne({

                _id: accountId,

                userId: req.userId,

            })
                .session(session);


        if (!account) {

            await session.abortTransaction();

            return res.status(404).json({

                success: false,

                message:
                    "Account not found.",

            });

        }


        if (
            account.status.toLowerCase() !==
            "active"
        ) {

            await session.abortTransaction();

            return res.status(400).json({

                success: false,

                message:
                    "Payments cannot be made from an inactive account.",

            });

        }


        const payee =
            await Payee.findOne({

                _id: payeeId,

                userId: req.userId,

                status: "active",

            })
                .session(session);


        if (!payee) {

            await session.abortTransaction();

            return res.status(404).json({

                success: false,

                message:
                    "Payee not found or inactive.",

            });

        }


        const biller =
            await Biller.findOne({

                _id:
                    payee.billerId,

                status: "active",

            })
                .session(session);


        if (!biller) {

            await session.abortTransaction();

            return res.status(400).json({

                success: false,

                message:
                    "The selected biller is currently unavailable.",

            });

        }


        if (
            account.currency !==
            "CAD"
        ) {

            await session.abortTransaction();

            return res.status(400).json({

                success: false,

                message:
                    "This payment currently supports CAD accounts only.",

            });

        }


        if (
            numericAmount >
            account.balance
        ) {

            await session.abortTransaction();

            return res.status(400).json({

                success: false,

                message:
                    "Insufficient funds for this payment.",

            });

        }


        const paymentReference =
            generatePaymentReference();


        account.balance =
            Number(
                (
                    account.balance -
                    numericAmount
                ).toFixed(2)
            );


        await account.save({
            session,
        });


        const billPayment =
            new BillPayment({

                userId:
                    req.userId,

                accountId:
                    account._id,

                billerId:
                    biller._id,

                payeeId:
                    payee._id,

                amount:
                    numericAmount,

                currency:
                    account.currency,

                reference:
                    paymentReference,

                status:
                    "completed",

                description:
                    cleanedDescription,

                processedAt:
                    new Date(),

            });


        await billPayment.save({
            session,
        });


        const transaction =
            new Transaction({

                userId:
                    req.userId,

                accountId:
                    account._id,

                name:
                    biller.name,

                transactionType:
                    "bill_payment",

                amount:
                    numericAmount,

                direction:
                    "debit",

                status:
                    "completed",

                source:
                    paymentReference,

            });


        await transaction.save({
            session,
        });


        await session.commitTransaction();


        return res.status(201).json({

            success: true,

            message:
                "Bill payment completed successfully.",

            data: {

                payment:
                    billPayment,

                transaction,

                account: {

                    _id:
                        account._id,

                    balance:
                        account.balance,

                    currency:
                        account.currency,

                },

            },

        });

    } catch (error) {

        await session.abortTransaction();


        console.error(
            "Make bill payment error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to complete the bill payment.",

        });

    } finally {

        await session.endSession();

    }

};