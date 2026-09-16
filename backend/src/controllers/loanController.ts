import { Response } from "express";

import Loan from "../models/Loan.js";

import {
    AuthenticatedRequest,
} from "../middleware/authMiddleware.js";


function generateApplicationNumber(): string {

    const randomNumber =
        Math.floor(
            100000 +
            Math.random() * 900000
        );

    return `CBA-${randomNumber}`;
}


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
                    message: "Unauthorized.",
                });

            }


            const {
                loanType,
                requestedAmount,
                termMonths,
                purpose,
            } = req.body;


            /*
             * --------------------------------
             * BASIC VALIDATION
             * --------------------------------
             */

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


            /*
             * --------------------------------
             * NORMALIZE NUMERIC VALUES
             * --------------------------------
             */

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


            /*
             * --------------------------------
             * PURPOSE VALIDATION
             * --------------------------------
             */

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


            /*
             * --------------------------------
             * LOAN TYPE VALIDATION
             * --------------------------------
             */

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


            /*
             * --------------------------------
             * CHECK FOR EXISTING PENDING
             * APPLICATION
             * --------------------------------
             *
             * Prevents the same customer from
             * repeatedly submitting identical
             * pending applications.
             */

            const existingApplication =
                await Loan.findOne({
                    userId,
                    loanType: cleanedLoanType,
                    requestedAmount: amount,
                    termMonths: term,
                    status: "pending",
                });


            if (existingApplication) {

                return res.status(409).json({
                    message:
                        "You already have a pending application for this loan.",
                    application:
                        existingApplication,
                });

            }


            /*
             * --------------------------------
             * GENERATE UNIQUE APPLICATION NUMBER
             * --------------------------------
             */

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


            /*
             * --------------------------------
             * CREATE APPLICATION
             * --------------------------------
             *
             * IMPORTANT:
             *
             * We intentionally do NOT set:
             *
             * principalAmount
             * interestRate
             * monthlyPayment
             * outstandingBalance
             * loanNumber
             * approvedDate
             *
             * Those values belong to the
             * approval process.
             */

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


            /*
             * --------------------------------
             * RESPONSE
             * --------------------------------
             */

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



/*
 * --------------------------------
 * GET CUSTOMER LOANS
 * --------------------------------
 *
 * Returns only loans belonging to
 * the authenticated customer.
 */

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