import { Response } from "express";

import DigitalAsset from "../models/DigitalAsset.js";

import DigitalAssetTransaction from "../models/DigitalAssetTransaction.js";

import Account from "../models/Account.js";

import {
    AuthenticatedRequest,
} from "../middleware/authMiddleware.js";


// ======================================
// SUPPORTED DIGITAL ASSETS
// ======================================

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


// ======================================
// RATE CONFIGURATION
// ======================================
//
// Rates are intentionally controlled by
// environment variables.
//
// We are NOT pretending these are live
// cryptocurrency market prices.
//
// They can be replaced with a proper
// pricing service later.
//

const getAssetRate = (
    symbol: string,
): number => {

    const environmentKey =
        `DIGITAL_ASSET_RATE_${symbol}`;

    const configuredRate =
        Number(
            process.env[environmentKey] || 0,
        );

    if (
        !Number.isFinite(
            configuredRate,
        ) ||
        configuredRate < 0
    ) {
        return 0;
    }

    return configuredRate;
};


// ======================================
// GET CUSTOMER DIGITAL ASSETS
// ======================================

export const getDigitalAssets = async (
    req: AuthenticatedRequest,
    res: Response,
) => {

    try {

        if (!req.userId) {

            return res.status(401).json({
                success: false,
                message:
                    "Authentication required.",
            });
        }


        // Make sure every supported asset
        // has an account for this customer.

        for (
            const supportedAsset
            of SUPPORTED_ASSETS
        ) {

            await DigitalAsset.findOneAndUpdate(
                {
                    userId: req.userId,
                    symbol:
                        supportedAsset.symbol,
                },
                {
                    $setOnInsert: {
                        userId: req.userId,
                        asset:
                            supportedAsset.asset,
                        symbol:
                            supportedAsset.symbol,
                        balance: 0,
                        averageCost: 0,
                    },
                },
                {
                    upsert: true,
                    new: true,
                    setDefaultsOnInsert: true,
                },
            );
        }


        const digitalAssets =
            await DigitalAsset.find({
                userId: req.userId,
            })
                .sort({
                    symbol: 1,
                })
                .lean();


        const assets =
            SUPPORTED_ASSETS.map(
                (supportedAsset) => {

                    const account =
                        digitalAssets.find(
                            (item) =>
                                item.symbol ===
                                supportedAsset.symbol,
                        );


                    const balance =
                        account?.balance || 0;


                    const rate =
                        getAssetRate(
                            supportedAsset.symbol,
                        );


                    return {
                        id:
                            account?._id
                                .toString() ||
                            "",

                        asset:
                            supportedAsset.asset,

                        symbol:
                            supportedAsset.symbol,

                        balance,

                        rate,

                        cadValue:
                            balance * rate,
                    };
                },
            );


        const totalValue =
            assets.reduce(
                (
                    total,
                    asset,
                ) =>
                    total +
                    asset.cadValue,
                0,
            );


        const transactions =
            await DigitalAssetTransaction
                .find({
                    userId: req.userId,
                })
                .sort({
                    createdAt: -1,
                })
                .limit(50)
                .lean();


        return res.status(200).json({

            success: true,

            data: {

                assets,

                totalValue,

                transactions:
                    transactions.map(
                        (transaction) => ({
                            id:
                                transaction._id
                                    .toString(),

                            asset:
                                transaction.asset,

                            symbol:
                                transaction.symbol,

                            type:
                                transaction.type,

                            quantity:
                                transaction.quantity,

                            reference:
                                transaction.reference,

                            status:
                                transaction.status,

                            createdAt:
                                transaction.createdAt,
                        }),
                    ),

            },

        });

    } catch (error) {

        console.error(
            "Digital assets error:",
            error,
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to load digital asset information.",

        });

    }
};


// ======================================
// CUSTOMER CONVERSION
// ======================================

export const convertDigitalAsset = async (
    req: AuthenticatedRequest,
    res: Response,
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
            asset,
            direction,
            amount,
        } = req.body;


        const normalizedSymbol =
            String(
                asset || "",
            )
                .trim()
                .toUpperCase();


        const numericAmount =
            Number(amount);


        // ----------------------------------
        // VALIDATION
        // ----------------------------------

        if (
            !normalizedSymbol ||
            ![
                "BTC",
                "ETH",
                "SOL",
                "XRP",
                "CBC",
            ].includes(
                normalizedSymbol,
            )
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Unsupported digital asset.",
            });
        }


        if (
            direction !== "toAsset" &&
            direction !== "toCad"
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Invalid conversion direction.",
            });
        }


        if (
            !Number.isFinite(
                numericAmount,
            ) ||
            numericAmount <= 0
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Enter a valid conversion amount.",
            });
        }


        const rate =
            getAssetRate(
                normalizedSymbol,
            );


        if (
            !rate ||
            rate <= 0
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "A conversion rate is not currently available for this asset.",
            });
        }


        const supportedAsset =
            SUPPORTED_ASSETS.find(
                (item) =>
                    item.symbol ===
                    normalizedSymbol,
            );


        if (!supportedAsset) {

            return res.status(400).json({
                success: false,
                message:
                    "Unsupported digital asset.",
            });
        }


        // ----------------------------------
        // CAD → DIGITAL ASSET
        // ----------------------------------

        if (
            direction === "toAsset"
        ) {

            const assetQuantity =
                numericAmount / rate;


            const cadAccount =
                await Account.findOne({
                    userId: req.userId,
                    currency: "CAD",
                    status: "active",
                })
                    .sort({
                        createdAt: 1,
                    });


            if (!cadAccount) {

                return res.status(404).json({
                    success: false,
                    message:
                        "No active CAD account was found.",
                });
            }


            if (
                cadAccount.balance <
                numericAmount
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Insufficient CAD balance.",
                });
            }


            // ----------------------------------
            // UPDATE CAD ACCOUNT
            // ----------------------------------

            cadAccount.balance -=
                numericAmount;

            await cadAccount.save();


            // ----------------------------------
            // UPDATE DIGITAL ASSET
            // ----------------------------------

            const digitalAsset =
                await DigitalAsset.findOneAndUpdate(
                    {
                        userId: req.userId,
                        symbol:
                            normalizedSymbol,
                    },
                    {
                        $inc: {
                            balance:
                                assetQuantity,
                        },
                        $setOnInsert: {
                            userId:
                                req.userId,

                            asset:
                                supportedAsset.asset,

                            symbol:
                                normalizedSymbol,

                            averageCost:
                                rate,
                        },
                    },
                    {
                        new: true,
                        upsert: true,
                        setDefaultsOnInsert: true,
                    },
                );


            if (!digitalAsset) {

                return res.status(500).json({
                    success: false,
                    message:
                        "Unable to update digital asset account.",
                });
            }


            // ----------------------------------
            // RECORD TRANSACTION
            // ----------------------------------

            const reference =
                `CONV-${Date.now()}`;


            await DigitalAssetTransaction.create({

                userId:
                    req.userId,

                asset:
                    supportedAsset.asset,

                symbol:
                    normalizedSymbol,

                type:
                    "conversion",

                quantity:
                    assetQuantity,

                reference,

                status:
                    "completed",

            });


            return res.status(200).json({

                success: true,

                message:
                    "CAD converted successfully.",

                data: {

                    asset:
                        normalizedSymbol,

                    quantity:
                        assetQuantity,

                    cadAmount:
                        numericAmount,

                    rate,

                    reference,

                },

            });
        }


        // ----------------------------------
        // DIGITAL ASSET → CAD
        // ----------------------------------

        const digitalAsset =
            await DigitalAsset.findOne({
                userId: req.userId,
                symbol:
                    normalizedSymbol,
            });


        if (!digitalAsset) {

            return res.status(404).json({
                success: false,
                message:
                    "Digital asset account not found.",
            });
        }


        if (
            digitalAsset.balance <
            numericAmount
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Insufficient digital asset balance.",
            });
        }


        const cadAmount =
            numericAmount * rate;


        const cadAccount =
            await Account.findOne({
                userId: req.userId,
                currency: "CAD",
                status: "active",
            })
                .sort({
                    createdAt: 1,
                });


        if (!cadAccount) {

            return res.status(404).json({
                success: false,
                message:
                    "No active CAD account was found.",
            });
        }


        // ----------------------------------
        // UPDATE DIGITAL ASSET
        // ----------------------------------

        digitalAsset.balance -=
            numericAmount;

        await digitalAsset.save();


        // ----------------------------------
        // UPDATE CAD ACCOUNT
        // ----------------------------------

        cadAccount.balance +=
            cadAmount;

        await cadAccount.save();


        // ----------------------------------
        // RECORD TRANSACTION
        // ----------------------------------

        const reference =
            `CONV-${Date.now()}`;


        await DigitalAssetTransaction.create({

            userId:
                req.userId,

            asset:
                supportedAsset.asset,

            symbol:
                normalizedSymbol,

            type:
                "conversion",

            quantity:
                numericAmount,

            reference,

            status:
                "completed",

        });


        return res.status(200).json({

            success: true,

            message:
                "Digital asset converted successfully.",

            data: {

                asset:
                    normalizedSymbol,

                quantity:
                    numericAmount,

                cadAmount,

                rate,

                reference,

            },

        });

    } catch (error) {

        console.error(
            "Digital asset conversion error:",
            error,
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to complete digital asset conversion.",

        });

    }
};