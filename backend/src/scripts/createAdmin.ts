import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import User from "../models/User.js";


dotenv.config();


const createAdmin = async () => {

    try {

        const mongoURI =
            process.env.MONGODB_URI;

        const adminEmail =
            process.env.ADMIN_EMAIL;

        const adminPassword =
            process.env.ADMIN_PASSWORD;


        if (!mongoURI) {

            throw new Error(
                "MONGODB_URI is not defined."
            );

        }


        if (!adminEmail) {

            throw new Error(
                "ADMIN_EMAIL is not defined."
            );

        }


        if (!adminPassword) {

            throw new Error(
                "ADMIN_PASSWORD is not defined."
            );

        }


        if (adminPassword.length < 12) {

            throw new Error(
                "ADMIN_PASSWORD must be at least 12 characters."
            );

        }


        console.log(
            "🔄 Connecting to MongoDB..."
        );


        await mongoose.connect(
            mongoURI
        );


        console.log(
            "✅ MongoDB connected."
        );


        const normalizedEmail =
            adminEmail
                .trim()
                .toLowerCase();


        const existingUser =
            await User.findOne({
                email: normalizedEmail,
            });


        /* =================================
           PROMOTE EXISTING USER
        ================================= */

        if (existingUser) {

            const hashedPassword =
                await bcrypt.hash(
                    adminPassword,
                    12
                );


            existingUser.role =
                "admin";


            existingUser.password =
                hashedPassword;


            await existingUser.save();


            console.log(
                `✅ Existing user ${normalizedEmail} has been promoted to administrator.`
            );

            console.log(
                `✅ Administrator password has been updated from ADMIN_PASSWORD.`
            );

            console.log(
                `Administrator client number: ${existingUser.clientNumber}`
            );

        }


        /* =================================
           CREATE NEW ADMIN
        ================================= */

        else {

            const hashedPassword =
                await bcrypt.hash(
                    adminPassword,
                    12
                );


            let clientNumber = "";

            let clientNumberExists = true;


            while (
                clientNumberExists
            ) {

                clientNumber =
                    `ADM-${Math.floor(
                        100000 +
                        Math.random() *
                        900000
                    )}`;


                const existing =
                    await User.findOne({
                        clientNumber,
                    });


                clientNumberExists =
                    Boolean(existing);

            }


            const admin =
                await User.create({

                    clientNumber,

                    firstName:
                        "Capital",

                    lastName:
                        "Administrator",

                    email:
                        normalizedEmail,

                    phone:
                        "ADMIN",

                    password:
                        hashedPassword,

                    role:
                        "admin",

                });


            console.log(
                `✅ Administrator created: ${admin.email}`
            );


            console.log(
                `Administrator client number: ${admin.clientNumber}`
            );

        }


        await mongoose.disconnect();


        console.log(
            "✅ Admin provisioning complete."
        );


        process.exit(0);

    }


    catch (error) {

        console.error(
            "❌ Admin provisioning failed:",
            error
        );


        await mongoose
            .disconnect()
            .catch(
                () => undefined
            );


        process.exit(1);

    }

};


createAdmin();