import { Router } from "express";
import bcrypt from "bcryptjs";

import User from "../models/User.js";

const router = Router();

router.post("/", async (req, res) => {
    try {
        const provisionKey = req.headers["x-admin-provision-key"];

        if (
            !provisionKey ||
            provisionKey !== process.env.ADMIN_PROVISION_KEY
        ) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized.",
            });
        }

        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (!adminEmail || !adminPassword) {
            return res.status(500).json({
                success: false,
                message:
                    "ADMIN_EMAIL or ADMIN_PASSWORD is not configured.",
            });
        }

        if (adminPassword.length < 12) {
            return res.status(500).json({
                success: false,
                message:
                    "ADMIN_PASSWORD must be at least 12 characters.",
            });
        }

        const normalizedEmail =
            adminEmail.trim().toLowerCase();

        const existingUser = await User.findOne({
            email: normalizedEmail,
        });

        if (existingUser) {
            const hashedPassword =
                await bcrypt.hash(adminPassword, 12);

            existingUser.role = "admin";
            existingUser.password = hashedPassword;

            await existingUser.save();

            return res.status(200).json({
                success: true,
                message:
                    "Existing user promoted to administrator.",
                clientNumber:
                    existingUser.clientNumber,
            });
        }

        const hashedPassword =
            await bcrypt.hash(adminPassword, 12);

        let clientNumber = "";
        let clientNumberExists = true;

        while (clientNumberExists) {
            clientNumber =
                `ADM-${Math.floor(
                    100000 +
                    Math.random() * 900000
                )}`;

            const existing =
                await User.findOne({
                    clientNumber,
                });

            clientNumberExists =
                Boolean(existing);
        }

        const admin = await User.create({
            clientNumber,
            firstName: "Capital",
            lastName: "Administrator",
            email: normalizedEmail,
            phone: "ADMIN",
            password: hashedPassword,
            role: "admin",
        });

        return res.status(201).json({
            success: true,
            message:
                "Administrator created successfully.",
            clientNumber:
                admin.clientNumber,
        });
    } catch (error) {
        console.error(
            "Temporary admin provisioning error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Administrator provisioning failed.",
        });
    }
});

export default router;
