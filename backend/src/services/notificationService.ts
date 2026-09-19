import {
    Types,
} from "mongoose";

import Notification, {
    NotificationType,
} from "../models/Notification.js";

import {
    sendTransactionEmail,
} from "./emailService.js";

import {
    sendTransactionSms,
} from "./smsService.js";

import User from "../models/User.js";

import "dotenv/config";


interface CreateNotificationOptions {

    userId:
        Types.ObjectId |
        string;

    type:
        NotificationType;

    title:
        string;

    message:
        string;

    transactionId?:
        Types.ObjectId |
        string;

    accountId?:
        Types.ObjectId |
        string;
}


/* =========================================
   CREATE DASHBOARD NOTIFICATION
========================================= */

export const createNotification =
    async (
        options:
            CreateNotificationOptions
    ) => {

        try {

            const notification =
                await Notification.create({

                    userId:
                        options.userId,

                    type:
                        options.type,

                    title:
                        options.title,

                    message:
                        options.message,

                    read:
                        false,

                    transactionId:
                        options.transactionId,

                    accountId:
                        options.accountId,

                });


            return notification;

        } catch (error) {

            console.error(
                "Notification creation error:",
                error
            );

            return null;
        }
    };


/* =========================================
   SEND TRANSACTION EMAIL
========================================= */

const sendNotificationEmail =
    async (
        userId:
            Types.ObjectId |
            string,

        title:
            string,

        message:
            string
    ) => {

        console.log(
            "Starting transaction email notification..."
        );


        try {

            const user =
                await User.findById(
                    userId
                ).select(
                    "email firstName"
                );


            if (!user) {

                console.warn(
                    "Notification email skipped: user not found."
                );

                return;
            }


            const recipientEmail =
                user.email;


            if (
                typeof recipientEmail !==
                "string" ||
                recipientEmail.trim()
                    .length === 0
            ) {

                console.warn(
                    "Notification email skipped: user has no valid email."
                );

                return;
            }


            console.log(
                `Notification email recipient: ${recipientEmail}`
            );


            await sendTransactionEmail(

                recipientEmail,

                user.firstName,

                title,

                message

            );

        } catch (error) {

            console.error(
                "Transaction email notification error:",
                error
            );

        }
    };


/* =========================================
   SEND TRANSACTION SMS
========================================= */

const sendNotificationSms =
    async (
        userId:
            Types.ObjectId |
            string,

        message:
            string
    ) => {

        console.log(
            "Starting transaction SMS notification..."
        );


        try {

            const user =
                await User.findById(
                    userId
                ).select(
                    "phone"
                );


            if (!user) {

                console.warn(
                    "Notification SMS skipped: user not found."
                );

                return;
            }


            const recipientPhone =
                user.phone;


            if (
                typeof recipientPhone !==
                "string" ||
                recipientPhone.trim()
                    .length === 0
            ) {

                console.warn(
                    "Notification SMS skipped: user has no valid phone number."
                );

                return;
            }


            console.log(
                `Notification SMS recipient: ${recipientPhone}`
            );


            await sendTransactionSms(

                recipientPhone,

                message

            );

        } catch (error) {

            console.error(
                "Transaction SMS notification error:",
                error
            );

        }
    };


/* =========================================
   TRANSFER SENT
========================================= */

export const createTransferSentNotification =
    async (

        userId:
            Types.ObjectId |
            string,

        accountId:
            Types.ObjectId |
            string,

        transactionId:
            Types.ObjectId |
            string,

        amount:
            number,

        currency:
            string,

        recipientAccountNumber:
            string

    ) => {

        const title =
            "Transfer sent";

        const message =
            `${currency} ${amount.toFixed(2)} was sent to account ${recipientAccountNumber}.`;


        const notification =
            await createNotification({

                userId,

                accountId,

                transactionId,

                type:
                    "transfer",

                title,

                message,

            });


        await sendNotificationEmail(
            userId,
            title,
            message
        );


        await sendNotificationSms(
            userId,
            message
        );


        return notification;
    };


/* =========================================
   TRANSFER RECEIVED
========================================= */

export const createTransferReceivedNotification =
    async (

        userId:
            Types.ObjectId |
            string,

        accountId:
            Types.ObjectId |
            string,

        transactionId:
            Types.ObjectId |
            string,

        amount:
            number,

        currency:
            string,

        senderAccountNumber:
            string

    ) => {

        const title =
            "Transfer received";

        const message =
            `${currency} ${amount.toFixed(2)} was received from account ${senderAccountNumber}.`;


        const notification =
            await createNotification({

                userId,

                accountId,

                transactionId,

                type:
                    "transfer",

                title,

                message,

            });


        await sendNotificationEmail(
            userId,
            title,
            message
        );


        await sendNotificationSms(
            userId,
            message
        );


        return notification;
    };


/* =========================================
   ACCOUNT CREDIT
========================================= */

export const createCreditNotification =
    async (

        userId:
            Types.ObjectId |
            string,

        accountId:
            Types.ObjectId |
            string,

        transactionId:
            Types.ObjectId |
            string,

        amount:
            number,

        currency:
            string

    ) => {

        const title =
            "Account credited";

        const message =
            `${currency} ${amount.toFixed(2)} has been credited to your account.`;


        const notification =
            await createNotification({

                userId,

                accountId,

                transactionId,

                type:
                    "transaction",

                title,

                message,

            });


        await sendNotificationEmail(
            userId,
            title,
            message
        );


        await sendNotificationSms(
            userId,
            message
        );


        return notification;
    };


/* =========================================
   ACCOUNT DEBIT
========================================= */

export const createDebitNotification =
    async (

        userId:
            Types.ObjectId |
            string,

        accountId:
            Types.ObjectId |
            string,

        transactionId:
            Types.ObjectId |
            string,

        amount:
            number,

        currency:
            string

    ) => {

        const title =
            "Account debited";

        const message =
            `${currency} ${amount.toFixed(2)} has been debited from your account.`;


        const notification =
            await createNotification({

                userId,

                accountId,

                transactionId,

                type:
                    "transaction",

                title,

                message,

            });


        await sendNotificationEmail(
            userId,
            title,
            message
        );


        await sendNotificationSms(
            userId,
            message
        );


        return notification;
    };


