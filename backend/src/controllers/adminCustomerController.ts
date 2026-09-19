import { Response } from "express";

import User from "../models/User.js";
import Account from "../models/Account.js";

import {
    AuthenticatedRequest,
} from "../middleware/authMiddleware.js";


export const searchCustomers = async (
    req: AuthenticatedRequest,
    res: Response
) => {

    try {

        const query =
            typeof req.query.q === "string"
                ? req.query.q.trim()
                : "";


        /* =====================================
           VALIDATE SEARCH QUERY
        ===================================== */

        if (!query) {

            return res.status(400).json({
                success: false,
                message:
                    "A customer search query is required.",
            });

        }


        if (query.length < 2) {

            return res.status(400).json({
                success: false,
                message:
                    "Search query must contain at least 2 characters.",
            });

        }


        /* =====================================
           FIND CUSTOMERS
        ===================================== */

        const searchRegex =
            new RegExp(
                query.replace(
                    /[.*+?^${}()|[\]\\]/g,
                    "\\$&"
                ),
                "i"
            );


        const customers =
            await User.find({
                role: "customer",

                $or: [
                    {
                        clientNumber:
                            searchRegex,
                    },
                    {
                        email:
                            searchRegex,
                    },
                    {
                        phone:
                            searchRegex,
                    },
                    {
                        firstName:
                            searchRegex,
                    },
                    {
                        lastName:
                            searchRegex,
                    },
                ],
            })
                .select(
                    "clientNumber firstName lastName email phone role createdAt"
                )
                .sort({
                    createdAt: -1,
                })
                .limit(20)
                .lean();


        /* =====================================
           GET CUSTOMER ACCOUNTS
        ===================================== */

        const customerIds =
            customers.map(
                (customer) =>
                    customer._id
            );


        const accounts =
            customerIds.length > 0
                ? await Account.find({
                    userId: {
                        $in: customerIds,
                    },
                })
                    .select(
                        "userId accountType accountNumber balance currency status createdAt"
                    )
                    .sort({
                        createdAt: -1,
                    })
                    .lean()
                : [];


        /* =====================================
           COMBINE CUSTOMER + ACCOUNT DATA
        ===================================== */

        const results =
            customers.map(
                (customer) => {

                    const customerAccounts =
                        accounts.filter(
                            (account) =>
                                account.userId.toString() ===
                                customer._id.toString()
                        );


                    return {
                        id:
                            customer._id,

                        clientNumber:
                            customer.clientNumber,

                        firstName:
                            customer.firstName,

                        lastName:
                            customer.lastName,

                        email:
                            customer.email,

                        phone:
                            customer.phone,

                        createdAt:
                            customer.createdAt,

                        accounts:
                            customerAccounts.map(
                                (account) => ({
                                    id:
                                        account._id,

                                    accountType:
                                        account.accountType,

                                    accountNumber:
                                        account.accountNumber,

                                    balance:
                                        account.balance,

                                    currency:
                                        account.currency,

                                    status:
                                        account.status,

                                    createdAt:
                                        account.createdAt,
                                })
                            ),
                    };

                }
            );


        /* =====================================
           RESPONSE
        ===================================== */

        return res.json({

            success: true,

            data: {
                customers:
                    results,
            },

        });


    } catch (error) {

        console.error(
            "Admin customer search error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to search customers.",

        });

    }

};