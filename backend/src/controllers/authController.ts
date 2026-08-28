import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

export const register = async (req: Request, res: Response) => {
    try {
        const {
            firstName,
            lastName,
            email,
            phone,
            password,
        } = req.body;

        if (!firstName || !lastName || !email || !phone || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required.",
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters long.",
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        const existingUser = await User.findOne({
            email: normalizedEmail,
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "An account with this email already exists.",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await User.create({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: normalizedEmail,
            phone: phone.trim(),
            password: hashedPassword,
        });

        return res.status(201).json({
            success: true,
            message: "Account created successfully.",
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                createdAt: user.createdAt,
            },
        });
    } catch (error) {
        console.error("Registration error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to create account.",
        });
    }
};