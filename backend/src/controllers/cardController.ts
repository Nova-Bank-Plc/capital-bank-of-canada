import { Response } from "express";

import Account from "../models/Account.js";
import Card from "../models/Card.js";
import CardRequest from "../models/CardRequest.js";

import {
    AuthenticatedRequest,
} from "../middleware/authMiddleware.js";


/* =========================================
   GET CUSTOMER CARDS
========================================= */

export const getCards = async (
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


        const cards = await Card.find({
            userId: req.userId,
        })
            .sort({
                createdAt: -1,
            })
            .lean();


        return res.status(200).json({

            success: true,

            data: {
                cards,
            },

        });

    } catch (error) {

        console.error(
            "Get cards error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to load your cards.",

        });

    }

};


/* =========================================
   GET CUSTOMER CARD REQUESTS
========================================= */

export const getCardRequests = async (
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


        const requests =
            await CardRequest.find({
                userId: req.userId,
            })
                .sort({
                    createdAt: -1,
                })
                .lean();


        return res.status(200).json({

            success: true,

            data: {
                requests,
            },

        });

    } catch (error) {

        console.error(
            "Get card requests error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to load your card requests.",

        });

    }

};


/* =========================================
   REQUEST NEW CARD
========================================= */

export const requestCard = async (
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


        const {
            accountId,
            cardType = "debit",
            requestType = "new",
            reason,
        } = req.body;


        /* ---------------------------------
           REQUIRED ACCOUNT
        --------------------------------- */

        if (!accountId) {

            return res.status(400).json({

                success: false,

                message:
                    "Account selection is required.",

            });

        }


        /* ---------------------------------
           VALIDATE CARD TYPE
        --------------------------------- */

        if (
            cardType !== "debit" &&
            cardType !== "credit"
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid card type.",

            });

        }


        /* ---------------------------------
           VALIDATE REQUEST TYPE
        --------------------------------- */

        if (
            requestType !== "new" &&
            requestType !== "replacement"
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid card request type.",

            });

        }


        /* ---------------------------------
           VERIFY ACCOUNT OWNERSHIP
        --------------------------------- */

        const account =
            await Account.findOne({

                _id: accountId,

                userId: req.userId,

            });


        if (!account) {

            return res.status(404).json({

                success: false,

                message:
                    "Account not found.",

            });

        }


        /* ---------------------------------
           ACCOUNT STATUS
        --------------------------------- */

        if (
            account.status.toLowerCase() !==
            "active"
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "A card cannot be requested for an inactive account.",

            });

        }


        /* ---------------------------------
           PREVENT DUPLICATE PENDING REQUEST
        --------------------------------- */

        const existingRequest =
            await CardRequest.findOne({

                userId: req.userId,

                accountId: account._id,

                cardType,

                requestType,

                status: "pending",

            });


        if (existingRequest) {

            return res.status(409).json({

                success: false,

                message:
                    "You already have a pending card request for this account.",

                data: {
                    request: existingRequest,
                },

            });

        }


        /* ---------------------------------
           REPLACEMENT VALIDATION
        --------------------------------- */

        if (
            requestType ===
            "replacement"
        ) {

            const existingCard =
                await Card.findOne({

                    userId: req.userId,

                    accountId:
                        account._id,

                    cardType,

                });


            if (!existingCard) {

                return res.status(400).json({

                    success: false,

                    message:
                        "No existing card was found for replacement.",

                });

            }

        }


        /* ---------------------------------
           REASON VALIDATION
        --------------------------------- */

        let cleanedReason:
            | string
            | undefined;


        if (reason !== undefined) {

            cleanedReason =
                String(reason).trim();


            if (
                cleanedReason.length >
                500
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Reason cannot exceed 500 characters.",

                });

            }


            if (
                cleanedReason.length === 0
            ) {

                cleanedReason =
                    undefined;

            }

        }


        /* ---------------------------------
           CREATE CARD REQUEST
        ---------------------------------
        
        IMPORTANT:

        This does NOT create a card.

        The request must be reviewed and
        processed through the bank's
        administrative workflow.

        --------------------------------- */

        const cardRequest =
            await CardRequest.create({

                userId:
                    req.userId,

                accountId:
                    account._id,

                cardType,

                requestType,

                status:
                    "pending",

                reason:
                    cleanedReason,

                requestedAt:
                    new Date(),

            });


        return res.status(201).json({

            success: true,

            message:
                "Card request submitted successfully.",

            data: {
                request:
                    cardRequest,
            },

        });

    } catch (error) {

        console.error(
            "Request card error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to submit your card request.",

        });

    }

};


/* =========================================
   FREEZE / UNFREEZE CARD
========================================= */

export const toggleCardFreeze = async (
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


        const {
            cardId,
        } = req.params;


        if (!cardId) {

            return res.status(400).json({

                success: false,

                message:
                    "Card ID is required.",

            });

        }


        const card =
            await Card.findOne({

                _id: cardId,

                userId: req.userId,

            });


        if (!card) {

            return res.status(404).json({

                success: false,

                message:
                    "Card not found.",

            });

        }


        /* ---------------------------------
           BLOCKED / EXPIRED CARDS
        --------------------------------- */

        if (
            card.status === "blocked" ||
            card.status === "expired"
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "This card cannot be frozen or unfrozen.",

            });

        }


        /* ---------------------------------
           ONLY ACTIVE / FROZEN CARDS
        --------------------------------- */

        if (
            card.status !== "active" &&
            card.status !== "frozen"
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "This card is not currently available for this action.",

            });

        }


        if (
            card.status === "active"
        ) {

            card.status =
                "frozen";

            card.frozenDate =
                new Date();

        } else {

            card.status =
                "active";

            card.frozenDate =
                undefined;

        }


        await card.save();


        return res.status(200).json({

            success: true,

            message:
                card.status === "frozen"
                    ? "Card frozen successfully."
                    : "Card unfrozen successfully.",

            data: {
                card,
            },

        });

    } catch (error) {

        console.error(
            "Toggle card freeze error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to update the card.",

        });

    }

};