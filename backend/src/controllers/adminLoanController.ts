import mongoose from "mongoose";

import {
    Response,
} from "express";

import Loan from "../models/Loan.js";
import Account from "../models/Account.js";
import Transaction from "../models/Transaction.js";

import {
    AuthenticatedRequest,
} from "../middleware/authMiddleware.js";


// ======================================
// HELPERS
// ======================================

const generateLoanNumber = (): string => {

    const number =
        Math.floor(
            100000 +
            Math.random() * 900000
        );

    return `CBL-${number}`;
};


const roundMoney = (
    value: number
): number => {

    return Math.round(
        (value + Number.EPSILON) * 100
    ) / 100;

};


const calculateMonthlyPayment = (
    principal: number,
    annualInterestRate: number,
    termMonths: number
): number => {

    if (
        principal <= 0 ||
        termMonths <= 0
    ) {
        return 0;
    }


    if (
        annualInterestRate <= 0
    ) {

        return roundMoney(
            principal / termMonths
        );

    }


    const monthlyRate =
        annualInterestRate / 100 / 12;


    const factor =
        Math.pow(
            1 + monthlyRate,
            termMonths
        );


    const payment =
        principal *
        (
            monthlyRate * factor
        ) /
        (
            factor - 1
        );


    return roundMoney(
        payment
    );

};


// ======================================
// GET ALL ADMIN LOANS
// ======================================

export const getAdminLoans = async (
    req: AuthenticatedRequest,
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

            data: loans,

        });

    } catch (error) {

        console.error(
            "Get admin loans error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to load loan applications.",

        });

    }

};


// ======================================
// APPROVE LOAN
// ======================================

export const approveLoan = async (
    req: AuthenticatedRequest,
    res: Response
) => {

    const {
        loanId,
    } = req.params;


    const {
        principalAmount,
        interestRate,
        monthlyPayment,
    } = req.body;


    if (
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


    const session =
        await mongoose.startSession();


    try {

        let approvedLoan:
            any = null;

        let creditedAccount:
            any = null;

        let createdTransaction:
            any = null;


        await session.withTransaction(
            async () => {

                // ==================================
                // ONLY PENDING LOANS CAN BE APPROVED
                // ==================================

                const loan =
                    await Loan.findOne({

                        _id:
                            loanId,

                        status:
                            "pending",

                    })
                        .session(
                            session
                        );


                if (!loan) {

                    throw new Error(
                        "LOAN_NOT_PENDING"
                    );

                }


                // ==================================
                // APPROVED AMOUNT
                // ==================================

                const requestedAmount =
                    Number(
                        loan.requestedAmount
                    );


                const approvedAmount =
                    principalAmount ===
                    undefined

                        ? requestedAmount

                        : Number(
                            principalAmount
                        );


                if (
                    !Number.isFinite(
                        approvedAmount
                    ) ||
                    approvedAmount <= 0
                ) {

                    throw new Error(
                        "Approved amount must be greater than zero."
                    );

                }


                // ==================================
                // INTEREST RATE
                // ==================================

                const approvedInterestRate =
                    interestRate ===
                    undefined

                        ? 0

                        : Number(
                            interestRate
                        );


                if (
                    !Number.isFinite(
                        approvedInterestRate
                    ) ||
                    approvedInterestRate < 0
                ) {

                    throw new Error(
                        "Interest rate cannot be negative."
                    );

                }


                // ==================================
                // MONTHLY PAYMENT
                // ==================================

                let approvedMonthlyPayment =
                    monthlyPayment ===
                    undefined ||
                    monthlyPayment === ""

                        ? calculateMonthlyPayment(

                            approvedAmount,

                            approvedInterestRate,

                            loan.termMonths

                        )

                        : Number(
                            monthlyPayment
                        );


                if (
                    !Number.isFinite(
                        approvedMonthlyPayment
                    ) ||
                    approvedMonthlyPayment < 0
                ) {

                    throw new Error(
                        "Monthly payment is invalid."
                    );

                }


                approvedMonthlyPayment =
                    roundMoney(
                        approvedMonthlyPayment
                    );


                // ==================================
                // FIND CUSTOMER CAD ACCOUNT
                // ==================================

                const account =
                    await Account.findOne({

                        userId:
                            loan.userId,

                        status:
                            "active",

                        currency:
                            "CAD",

                    })
                        .sort({
                            createdAt: 1,
                        })
                        .session(
                            session
                        );


                if (!account) {

                    throw new Error(
                        "No active CAD account was found for this customer."
                    );

                }


                // ==================================
                // GENERATE UNIQUE LOAN NUMBER
                // ==================================

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


                // ==================================
                // CREDIT CUSTOMER ACCOUNT
                // ==================================

                const previousBalance =
                    Number(
                        account.balance
                    );


                const newBalance =
                    roundMoney(

                        previousBalance +
                        approvedAmount

                    );


                account.balance =
                    newBalance;


                await account.save({

                    session,

                });


                // ==================================
                // CREATE LOAN TRANSACTION
                // ==================================

                const transaction =
                    new Transaction({

                        userId:
                            loan.userId,

                        accountId:
                            account._id,

                        name:
                            `Loan Disbursement - ${loan.applicationNumber}`,

                        transactionType:
                            "loan_disbursement",

                        amount:
                            approvedAmount,

                        direction:
                            "credit",

                        status:
                            "completed",

                        source:
                            "Loan Disbursement",

                    });


                await transaction.save({

                    session,

                });


                // ==================================
                // UPDATE LOAN
                // ==================================

                loan.loanNumber =
                    loanNumber;


                loan.principalAmount =
                    approvedAmount;


                loan.outstandingBalance =
                    approvedAmount;


                loan.interestRate =
                    approvedInterestRate;


                loan.monthlyPayment =
                    approvedMonthlyPayment;


                loan.approvedDate =
                    new Date();


                loan.status =
                    "approved";


                await loan.save({

                    session,

                });


                approvedLoan =
                    loan;


                creditedAccount =
                    account;


                createdTransaction =
                    transaction;

            }
        );


        // ==================================
        // SUCCESS
        // ==================================

        return res.status(200).json({

            success: true,

            message:
                "Loan approved and funds disbursed successfully.",

            data: {

                loan:
                    approvedLoan,

                account:
                    creditedAccount,

                transaction:
                    createdTransaction,

            },

        });

    } catch (error: any) {

        // ==================================
        // ALREADY PROCESSED
        // ==================================

        if (
            error?.message ===
            "LOAN_NOT_PENDING"
        ) {

            return res.status(409).json({

                success: false,

                message:
                    "This loan is no longer pending and cannot be approved again.",

            });

        }


        console.error(
            "Approve loan error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error?.message ||
                "Failed to approve loan.",

        });

    } finally {

        await session.endSession();

    }

};


// ======================================
// REJECT LOAN
// ======================================

export const rejectLoan = async (
    req: AuthenticatedRequest,
    res: Response
) => {

    const {
        loanId,
    } = req.params;


    if (
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


    try {

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

            return res.status(409).json({

                success: false,

                message:
                    "This loan is no longer pending and cannot be rejected.",

            });

        }


        return res.status(200).json({

            success: true,

            message:
                "Loan application rejected.",

            data:
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
                "Failed to reject loan.",

        });

    }

};


// ======================================
// ACTIVATE APPROVED LOAN
// ======================================

export const activateLoan = async (
    req: AuthenticatedRequest,
    res: Response
) => {

    const {
        loanId,
    } = req.params;


    if (
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


    try {

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

            data:
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
                "Failed to activate loan.",

        });

    }

};


// ======================================
// MARK LOAN AS PAID
// ======================================

export const markLoanPaid = async (
    req: AuthenticatedRequest,
    res: Response
) => {

    const {
        loanId,
    } = req.params;


    if (
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


    try {

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

            return res.status(409).json({

                success: false,

                message:
                    "Only active loans can be marked as paid.",

            });

        }


        return res.status(200).json({

            success: true,

            message:
                "Loan marked as paid.",

            data:
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
                "Failed to mark loan as paid.",

        });

    }

};