import {
    Response,
} from "express";

import mongoose from "mongoose";

import Biller from "../models/Biller.js";

import {
    AuthenticatedRequest,
} from "../middleware/authMiddleware.js";


/* =========================================
   PARAMETER HELPERS
========================================= */

function getParamValue(
    value:
        | string
        | string[]
        | undefined
): string | undefined {

    if (Array.isArray(value)) {

        return value[0];

    }

    return value;

}


/* =========================================
   GET ALL BILLERS
========================================= */

export const getAllBillers = async (
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
            await Biller.find()
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
            "Get admin billers error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to load billers.",

        });

    }

};


/* =========================================
   CREATE BILLER
========================================= */

export const createBiller = async (
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
            name,
            category,
            description,
        } = req.body;


        if (!name || !category) {

            return res.status(400).json({

                success: false,

                message:
                    "Biller name and category are required.",

            });

        }


        const cleanedName =
            String(name).trim();


        const cleanedCategory =
            String(category).trim();


        const cleanedDescription =
            description !== undefined
                ? String(
                    description
                ).trim()
                : undefined;


        if (
            cleanedName.length === 0 ||
            cleanedCategory.length === 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Biller name and category cannot be empty.",

            });

        }


        if (
            cleanedName.length > 150
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Biller name cannot exceed 150 characters.",

            });

        }


        if (
            cleanedCategory.length > 100
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Biller category cannot exceed 100 characters.",

            });

        }


        if (
            cleanedDescription &&
            cleanedDescription.length > 500
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Biller description cannot exceed 500 characters.",

            });

        }


        const existingBiller =
            await Biller.findOne({

                name: {
                    $regex:
                        `^${cleanedName}$`,
                    $options: "i",
                },

            });


        if (existingBiller) {

            return res.status(409).json({

                success: false,

                message:
                    "A biller with this name already exists.",

            });

        }


        const biller =
            await Biller.create({

                name:
                    cleanedName,

                category:
                    cleanedCategory,

                description:
                    cleanedDescription,

                paymentOptions:
                    [],

                status:
                    "active",

            });


        return res.status(201).json({

            success: true,

            message:
                "Biller created successfully.",

            data: {
                biller,
            },

        });

    } catch (error) {

        console.error(
            "Create biller error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to create biller.",

        });

    }

};


/* =========================================
   UPDATE BILLER
========================================= */

export const updateBiller = async (
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


        const billerId =
            getParamValue(
                req.params.billerId
            );


        if (!billerId) {

            return res.status(400).json({

                success: false,

                message:
                    "Biller ID is required.",

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
                    "Invalid biller ID.",

            });

        }


        const {
            name,
            category,
            description,
            status,
        } = req.body;


        const updateData: {

            name?: string;

            category?: string;

            description?: string;

            status?:
                | "active"
                | "inactive";

        } = {};


        if (name !== undefined) {

            const cleanedName =
                String(name).trim();


            if (
                cleanedName.length === 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Biller name cannot be empty.",

                });

            }


            if (
                cleanedName.length > 150
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Biller name cannot exceed 150 characters.",

                });

            }


            updateData.name =
                cleanedName;

        }


        if (category !== undefined) {

            const cleanedCategory =
                String(category).trim();


            if (
                cleanedCategory.length === 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Biller category cannot be empty.",

                });

            }


            if (
                cleanedCategory.length > 100
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Biller category cannot exceed 100 characters.",

                });

            }


            updateData.category =
                cleanedCategory;

        }


        if (
            description !== undefined
        ) {

            const cleanedDescription =
                String(
                    description
                ).trim();


            if (
                cleanedDescription.length > 500
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Biller description cannot exceed 500 characters.",

                });

            }


            updateData.description =
                cleanedDescription;

        }


        if (status !== undefined) {

            if (
                status !== "active" &&
                status !== "inactive"
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid biller status.",

                });

            }


            updateData.status =
                status;

        }


        if (
            Object.keys(updateData).length === 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "No biller changes were provided.",

            });

        }


        const biller =
            await Biller.findByIdAndUpdate(

                billerId,

                {
                    $set:
                        updateData,
                },

                {
                    new: true,

                    runValidators: true,
                }

            );


        if (!biller) {

            return res.status(404).json({

                success: false,

                message:
                    "Biller not found.",

            });

        }


        return res.status(200).json({

            success: true,

            message:
                "Biller updated successfully.",

            data: {
                biller,
            },

        });

    } catch (error) {

        console.error(
            "Update biller error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to update biller.",

        });

    }

};


/* =========================================
   ADD PAYMENT OPTION
========================================= */

export const addPaymentOption = async (
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


        const billerId =
            getParamValue(
                req.params.billerId
            );


        if (!billerId) {

            return res.status(400).json({

                success: false,

                message:
                    "Biller ID is required.",

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
                    "Invalid biller ID.",

            });

        }


        const {
            name,
            description,
        } = req.body;


        if (!name) {

            return res.status(400).json({

                success: false,

                message:
                    "Payment option name is required.",

            });

        }


        const cleanedName =
            String(name).trim();


        const cleanedDescription =
            description !== undefined
                ? String(
                    description
                ).trim()
                : undefined;


        if (
            cleanedName.length === 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Payment option name cannot be empty.",

            });

        }


        if (
            cleanedName.length > 150
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Payment option name cannot exceed 150 characters.",

            });

        }


        if (
            cleanedDescription &&
            cleanedDescription.length > 500
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Payment option description cannot exceed 500 characters.",

            });

        }


        const biller =
            await Biller.findById(
                billerId
            );


        if (!biller) {

            return res.status(404).json({

                success: false,

                message:
                    "Biller not found.",

            });

        }


        const duplicateOption =
            biller.paymentOptions.some(
                (option) =>
                    option.name.toLowerCase() ===
                    cleanedName.toLowerCase()
            );


        if (duplicateOption) {

            return res.status(409).json({

                success: false,

                message:
                    "A payment option with this name already exists for this biller.",

            });

        }


        biller.paymentOptions.push({

            name:
                cleanedName,

            description:
                cleanedDescription,

            status:
                "active",

        });


        await biller.save();


        const addedOption =
            biller.paymentOptions[
                biller.paymentOptions.length - 1
            ];


        return res.status(201).json({

            success: true,

            message:
                "Payment option added successfully.",

            data: {

                biller,

                paymentOption:
                    addedOption,

            },

        });

    } catch (error) {

        console.error(
            "Add payment option error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to add payment option.",

        });

    }

};


/* =========================================
   UPDATE PAYMENT OPTION
========================================= */

export const updatePaymentOption = async (
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


        const billerId =
            getParamValue(
                req.params.billerId
            );


        const optionId =
            getParamValue(
                req.params.optionId
            );


        if (
            !billerId ||
            !optionId
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Biller ID and payment option ID are required.",

            });

        }


        if (
            !mongoose.Types.ObjectId.isValid(
                billerId
            ) ||
            !mongoose.Types.ObjectId.isValid(
                optionId
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid biller or payment option ID.",

            });

        }


        const biller =
            await Biller.findById(
                billerId
            );


        if (!biller) {

            return res.status(404).json({

                success: false,

                message:
                    "Biller not found.",

            });

        }


        const option =
            biller.paymentOptions.find(
                (existingOption) =>
                    existingOption._id?.toString() ===
                    optionId
            );


        if (!option) {

            return res.status(404).json({

                success: false,

                message:
                    "Payment option not found.",

            });

        }


        const {
            name,
            description,
            status,
        } = req.body;


        if (name !== undefined) {

            const cleanedName =
                String(name).trim();


            if (
                cleanedName.length === 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Payment option name cannot be empty.",

                });

            }


            if (
                cleanedName.length > 150
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Payment option name cannot exceed 150 characters.",

                });

            }


            const duplicateOption =
                biller.paymentOptions.some(
                    (existingOption) =>
                        existingOption._id?.toString() !==
                        optionId &&
                        existingOption.name.toLowerCase() ===
                        cleanedName.toLowerCase()
                );


            if (duplicateOption) {

                return res.status(409).json({

                    success: false,

                    message:
                        "A payment option with this name already exists for this biller.",

                });

            }


            option.name =
                cleanedName;

        }


        if (
            description !== undefined
        ) {

            const cleanedDescription =
                String(
                    description
                ).trim();


            if (
                cleanedDescription.length > 500
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Payment option description cannot exceed 500 characters.",

                });

            }


            option.description =
                cleanedDescription;

        }


        if (status !== undefined) {

            if (
                status !== "active" &&
                status !== "inactive"
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid payment option status.",

                });

            }


            option.status =
                status;

        }


        await biller.save();


        return res.status(200).json({

            success: true,

            message:
                "Payment option updated successfully.",

            data: {

                biller,

                paymentOption:
                    option,

            },

        });

    } catch (error) {

        console.error(
            "Update payment option error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to update payment option.",

        });

    }

};