import { Response } from "express";

import User from "../models/User.js";
import Account from "../models/Account.js";
import Transaction from "../models/Transaction.js";
import Loan from "../models/Loan.js";

import {
    AuthenticatedRequest,
} from "../middleware/authMiddleware.js";


export const getAdminDashboard =
    async (
        _req: AuthenticatedRequest,
        res: Response
    ) => {
        try {
            const [
                totalCustomers,
                totalAccounts,
                totalTransactions,
                totalLoans,
                pendingLoans,
                activeLoans,
                approvedLoans,
                rejectedLoans,
                accountBalanceResult,
                recentCustomers,
                recentTransactions,
                recentLoans,
            ] = await Promise.all([
                User.countDocuments({
                    role: "customer",
                }),

                Account.countDocuments(),

                Transaction.countDocuments(),

                Loan.countDocuments(),

                Loan.countDocuments({
                    status: "pending",
                }),

                Loan.countDocuments({
                    status: "active",
                }),

                Loan.countDocuments({
                    status: "approved",
                }),

                Loan.countDocuments({
                    status: "rejected",
                }),

                Account.aggregate([
                    {
                        $group: {
                            _id: null,
                            totalBalance: {
                                $sum: "$balance",
                            },
                        },
                    },
                ]),

                User.find({
                    role: "customer",
                })
                    .select(
                        "clientNumber firstName lastName email createdAt"
                    )
                    .sort({
                        createdAt: -1,
                    })
                    .limit(5)
                    .lean(),

                Transaction.find()
                    .select(
                        "userId accountId name transactionType amount direction status createdAt"
                    )
                    .sort({
                        createdAt: -1,
                    })
                    .limit(10)
                    .lean(),

                Loan.find()
                    .select(
                        "userId loanType applicationNumber requestedAmount termMonths purpose status applicationDate createdAt"
                    )
                    .sort({
                        createdAt: -1,
                    })
                    .limit(10)
                    .lean(),
            ]);


            const totalBalance =
                accountBalanceResult.length > 0
                    ? accountBalanceResult[0]
                          .totalBalance
                    : 0;


            return res.json({
                success: true,

                data: {
                    customers: {
                        total: totalCustomers,
                    },

                    accounts: {
                        total: totalAccounts,
                        totalBalance,
                    },

                    transactions: {
                        total: totalTransactions,
                    },

                    loans: {
                        total: totalLoans,
                        pending: pendingLoans,
                        approved: approvedLoans,
                        active: activeLoans,
                        rejected: rejectedLoans,
                    },

                    recentCustomers,

                    recentTransactions,

                    recentLoans,
                },
            });

        } catch (error) {
            console.error(
                "Admin dashboard error:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Unable to load administrator dashboard.",
            });
        }
    };