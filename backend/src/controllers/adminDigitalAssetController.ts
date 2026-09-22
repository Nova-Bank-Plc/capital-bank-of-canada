import mongoose from "mongoose";
import { Response } from "express";

import User from "../models/User.js";
import DigitalAsset from "../models/DigitalAsset.js";
import DigitalAssetTransaction from "../models/DigitalAssetTransaction.js";

import { AuthenticatedRequest } from "../middleware/authMiddleware.js";


const SUPPORTED_ASSETS = [
    {
        asset: "Bitcoin",
        symbol: "BTC",
    },
    {
        asset: "Ethereum",
        symbol: "ETH",
    },
    {
        asset: "Solana",
        symbol: "SOL",
    },
    {
        asset: "XRP",
        symbol: "XRP",
    },
    {
        asset: "Capital Coin",
        symbol: "CBC",
    },
];


const getAssetBySymbol = (
    symbol: string,
) => {
    return SUPPORTED_ASSETS.find(
        (item) =>
            item.symbol === symbol.toUpperCase(),
    );
};


// ======================================
// CREDIT DIGITAL ASSET
// ======================================

export const creditDigitalAsset = async (
    req: AuthenticatedRequest,
    res: Response,
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
            userId,
            symbol,
            quantity,
            reference,
        } = req.body;


        // ======================================
        // VALIDATE CUSTOMER
        // ======================================

        if (!userId) {
            return res.status(400).json({
                success: false,
                message:
                    "Customer ID is required.",
            });
        }


        if (
            !mongoose.Types.ObjectId.isValid(
                userId,
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid customer ID.",
            });
        }


        const customer =
            await User.findById(userId)
                .select("_id")
                .lean();


        if (!customer) {
            return res.status(404).json({
                success: false,
                message:
                    "Customer account not found.",
            });
        }


        // ======================================
        // VALIDATE ASSET
        // ======================================

        if (
            typeof symbol !== "string" ||
            !symbol.trim()
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Asset symbol is required.",
            });
        }


        const normalizedSymbol =
            symbol
                .trim()
                .toUpperCase();


        const selectedAsset =
            getAssetBySymbol(
                normalizedSymbol,
            );


        if (!selectedAsset) {
            return res.status(400).json({
                success: false,
                message:
                    "Unsupported digital asset.",
            });
        }


        // ======================================
        // VALIDATE QUANTITY
        // ======================================

        const numericQuantity =
            Number(quantity);


        if (
            !Number.isFinite(
                numericQuantity,
            ) ||
            numericQuantity <= 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Quantity must be greater than zero.",
            });
        }


        // ======================================
        // REFERENCE
        // ======================================

        const transactionReference =
            typeof reference === "string" &&
            reference.trim()
                ? reference.trim()
                : `ADMIN-CREDIT-${Date.now()}`;


        // ======================================
        // DATABASE TRANSACTION
        // ======================================

        session.startTransaction();


        let digitalAsset;


        digitalAsset =
            await DigitalAsset.findOneAndUpdate(
                {
                    userId,
                    symbol:
                        selectedAsset.symbol,
                },
                {
                    $setOnInsert: {
                        userId,
                        asset:
                            selectedAsset.asset,
                        symbol:
                            selectedAsset.symbol,
                        averageCost: 0,
                    },
                    $inc: {
                        balance:
                            numericQuantity,
                    },
                },
                {
                    new: true,
                    upsert: true,
                    session,
                    setDefaultsOnInsert: true,
                },
            );


        if (!digitalAsset) {
            throw new Error(
                "Unable to update digital asset account.",
            );
        }


        // ======================================
        // CREATE CREDIT TRANSACTION
        // ======================================

        await DigitalAssetTransaction.create(
            [
                {
                    userId,
                    asset:
                        selectedAsset.asset,
                    symbol:
                        selectedAsset.symbol,
                    type: "credit",
                    quantity:
                        numericQuantity,
                    reference:
                        transactionReference,
                    status: "completed",
                },
            ],
            {
                session,
            },
        );


        await session.commitTransaction();


        return res.status(200).json({
            success: true,
            message:
                `${selectedAsset.asset} credited successfully.`,
            data: {
                asset: {
                    id:
                        digitalAsset._id,
                    userId:
                        digitalAsset.userId,
                    asset:
                        digitalAsset.asset,
                    symbol:
                        digitalAsset.symbol,
                    balance:
                        digitalAsset.balance,
                    averageCost:
                        digitalAsset.averageCost,
                },
                transaction: {
                    type: "credit",
                    quantity:
                        numericQuantity,
                    reference:
                        transactionReference,
                    status: "completed",
                },
            },
        });

    } catch (error) {

        await session.abortTransaction();

        console.error(
            "Credit digital asset error:",
            error,
        );


        return res.status(500).json({
            success: false,
            message:
                "Unable to credit digital asset.",
        });

    } finally {

        session.endSession();

    }
};