import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

import User from "../models/User.js";
import Account from "../models/Account.js";


/* =========================================
   CLIENT NUMBER GENERATOR
========================================= */

function generateClientNumber(): string {

    const number = Math.floor(
        10000000 + Math.random() * 90000000
    );

    return `CCB-${number}`;
}


/* =========================================
   REGISTER
========================================= */

export const register = async (
    req: Request,
    res: Response
) => {

    const session = await User.startSession();

    try {

        const {
            firstName,
            lastName,
            email,
            phone,
            password,
        } = req.body;


        /* ================================
           VALIDATION
        ================================= */

        if (
            !firstName ||
            !lastName ||
            !email ||
            !phone ||
            !password
        ) {

            return res.status(400).json({
                success: false,
                message: "All fields are required.",
            });
        }


        if (password.length < 8) {

            return res.status(400).json({
                success: false,
                message:
                    "Password must be at least 8 characters long.",
            });
        }


        const normalizedEmail =
            email.toLowerCase().trim();


        /* ================================
           CHECK EXISTING USER
        ================================= */

        const existingUser =
            await User.findOne({
                email: normalizedEmail,
            });


        if (existingUser) {

            return res.status(409).json({
                success: false,
                message:
                    "An account with this email already exists.",
            });
        }


        /* ================================
           HASH PASSWORD
        ================================= */

        const hashedPassword =
            await bcrypt.hash(password, 12);


        /* ================================
           GENERATE CLIENT NUMBER
        ================================= */

        let clientNumber = "";

        let clientNumberExists = true;


        while (clientNumberExists) {

            clientNumber =
                generateClientNumber();


            const existingClient =
                await User.findOne({
                    clientNumber,
                });


            clientNumberExists =
                Boolean(existingClient);
        }


        let createdUserId: string | null = null;


        /* ================================
           DATABASE TRANSACTION
        ================================= */

        await session.withTransaction(
            async () => {

                const users =
                    await User.create(
                        [
                            {
                                clientNumber,

                                firstName:
                                    firstName.trim(),

                                lastName:
                                    lastName.trim(),

                                email:
                                    normalizedEmail,

                                phone:
                                    phone.trim(),

                                password:
                                    hashedPassword,
                            },
                        ],
                        {
                            session,
                        }
                    );


                const createdUser =
                    users[0];


                if (!createdUser) {

                    throw new Error(
                        "User creation failed."
                    );
                }


                createdUserId =
                    createdUser._id.toString();


                /* ================================
                   CREATE FIRST BANK ACCOUNT
                ================================= */

                const accountNumber =
                    "CA" +
                    crypto
                        .randomBytes(8)
                        .toString("hex")
                        .toUpperCase();


                await Account.create(
                    [
                        {
                            userId:
                                createdUser._id,

                            accountType:
                                "Chequing Account",

                            accountNumber,

                            balance: 0,

                            currency: "CAD",

                            status: "active",
                        },
                    ],
                    {
                        session,
                    }
                );
            }
        );


        /* ================================
           VERIFY USER CREATION
        ================================= */

        if (!createdUserId) {

            return res.status(500).json({
                success: false,
                message:
                    "Unable to create account.",
            });
        }


        const createdUser =
            await User.findById(
                createdUserId
            );


        if (!createdUser) {

            return res.status(500).json({
                success: false,
                message:
                    "Unable to retrieve newly created account.",
            });
        }


        /* ================================
           SUCCESS RESPONSE
        ================================= */

        return res.status(201).json({

            success: true,

            message:
                "Account created successfully.",

            user: {

                id:
                    createdUser._id.toString(),

                clientNumber:
                    createdUser.clientNumber,

                firstName:
                    createdUser.firstName,

                lastName:
                    createdUser.lastName,

                email:
                    createdUser.email,

                phone:
                    createdUser.phone,

                createdAt:
                    createdUser.createdAt,
            },

        });

    } catch (error) {

        console.error(
            "Registration error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to create account.",

        });

    } finally {

        await session.endSession();

    }
};


/* =========================================
   LOGIN
========================================= */

export const login = async (
    req: Request,
    res: Response
) => {

    try {

        const {
            clientNumber,
            email,
            password,
        } = req.body;


        /* ================================
           VALIDATION
        ================================= */

        const loginIdentifier =
            clientNumber || email;


        if (
            !loginIdentifier ||
            !password
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Client number/email and password are required.",

            });
        }


        const normalizedIdentifier =
            loginIdentifier
                .toLowerCase()
                .trim();


        /* ================================
           FIND USER
        ================================= */

        const user =
            await User.findOne({

                $or: [

                    {
                        email:
                            normalizedIdentifier,
                    },

                    {
                        clientNumber:
                            loginIdentifier
                                .trim()
                                .toUpperCase(),
                    },

                ],

            });


        if (!user) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid login credentials.",

            });
        }


        /* ================================
           CHECK PASSWORD
        ================================= */

        const passwordMatches =
            await bcrypt.compare(
                password,
                user.password
            );


        if (!passwordMatches) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid login credentials.",

            });
        }


        /* ================================
           CREATE JWT
        ================================= */

        const token =
            jwt.sign(

                {
                    userId:
                        user._id.toString(),

                    email:
                        user.email,

                    clientNumber:
                        user.clientNumber,
                },

                process.env.JWT_SECRET ||
                    "capital-bank-development-secret",

                {
                    expiresIn: "7d",
                }

            );


        /* ================================
           LOGIN SUCCESS
        ================================= */

        return res.status(200).json({

            success: true,

            message:
                "Login successful.",

            token,

            user: {

                id:
                    user._id.toString(),

                clientNumber:
                    user.clientNumber,

                firstName:
                    user.firstName,

                lastName:
                    user.lastName,

                email:
                    user.email,

                phone:
                    user.phone,

            },

        });

    } catch (error) {

        console.error(
            "Login error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to login.",

        });

    }

};