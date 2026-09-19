import { Response } from "express";
import { Types } from "mongoose";

import SupportTicket from "../models/SupportTicket.js";
import User from "../models/User.js";

import {
    AuthenticatedRequest,
} from "../middleware/authMiddleware.js";


// ======================================
// GENERATE TICKET NUMBER
// ======================================

const generateTicketNumber = (): string => {

    const randomNumber =
        Math.floor(
            100000 +
            Math.random() * 900000
        );

    return `CBA-SUP-${randomNumber}`;

};


// ======================================
// CREATE SUPPORT TICKET
// ======================================

export const createSupportTicket = async (
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
            subject,
            category,
            priority,
            message,
        } = req.body;


        if (!subject || !subject.trim()) {

            return res.status(400).json({
                success: false,
                message: "Subject is required.",
            });

        }


        if (!message || !message.trim()) {

            return res.status(400).json({
                success: false,
                message: "Message is required.",
            });

        }


        const user =
            await User.findById(req.userId);


        if (!user) {

            return res.status(404).json({
                success: false,
                message: "Customer account not found.",
            });

        }


        let ticketNumber =
            generateTicketNumber();


        let existingTicket =
            await SupportTicket.findOne({
                ticketNumber,
            });


        while (existingTicket) {

            ticketNumber =
                generateTicketNumber();

            existingTicket =
                await SupportTicket.findOne({
                    ticketNumber,
                });

        }


        const ticket =
            await SupportTicket.create({

                ticketNumber,

                userId: user._id,

                subject: subject.trim(),

                category:
                    category?.trim() ||
                    "General",

                priority:
                    priority || "normal",

                status: "open",

                messages: [
                    {
                        senderId: user._id,

                        senderType: "customer",

                        message: message.trim(),

                        channel: "chat",

                        createdAt: new Date(),
                    },
                ],

            });


        return res.status(201).json({

            success: true,

            message:
                "Support request created successfully.",

            data: ticket,

        });

    } catch (error) {

        console.error(
            "Create support ticket error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to create support request.",

        });

    }

};


// ======================================
// GET CUSTOMER SUPPORT TICKETS
// ======================================

export const getMySupportTickets = async (
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


        const tickets =
            await SupportTicket.find({
                userId: req.userId,
            })
                .sort({
                    updatedAt: -1,
                })
                .lean();


        return res.status(200).json({

            success: true,

            data: tickets,

        });

    } catch (error) {

        console.error(
            "Get customer support tickets error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to load support requests.",

        });

    }

};


// ======================================
// GET ONE CUSTOMER SUPPORT TICKET
// ======================================

export const getMySupportTicket = async (
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
            ticketId,
        } = req.params;


        if (!ticketId) {

            return res.status(400).json({

                success: false,

                message:
                    "Support ticket ID is required.",

            });

        }


        const ticket =
            await SupportTicket.findOne({

                _id: ticketId,

                userId: req.userId,

            }).lean();


        if (!ticket) {

            return res.status(404).json({

                success: false,

                message:
                    "Support ticket not found.",

            });

        }


        return res.status(200).json({

            success: true,

            data: ticket,

        });

    } catch (error) {

        console.error(
            "Get customer support ticket error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to load support ticket.",

        });

    }

};


// ======================================
// REPLY TO SUPPORT TICKET
// ======================================

export const replyToSupportTicket = async (
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
            ticketId,
        } = req.params;


        const {
            message,
        } = req.body;


        if (!message || !message.trim()) {

            return res.status(400).json({

                success: false,

                message:
                    "Message is required.",

            });

        }


        const ticket =
            await SupportTicket.findOne({

                _id: ticketId,

                userId: req.userId,

            });


        if (!ticket) {

            return res.status(404).json({

                success: false,

                message:
                    "Support ticket not found.",

            });

        }


        if (
            ticket.status === "closed" ||
            ticket.status === "resolved"
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "This support ticket is no longer accepting replies.",

            });

        }


        ticket.messages.push({

    senderId:
        new Types.ObjectId(req.userId),

    senderType:
        "customer",

    message:
        message.trim(),

    channel:
        "chat",

    createdAt:
        new Date(),

});

        ticket.status =
            "in_progress";


        await ticket.save();


        return res.status(200).json({

            success: true,

            message:
                "Reply sent successfully.",

            data: ticket,

        });

    } catch (error) {

        console.error(
            "Reply to support ticket error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to send your reply.",

        });

    }

};