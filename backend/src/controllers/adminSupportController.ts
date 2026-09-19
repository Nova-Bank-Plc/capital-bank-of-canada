import { Response } from "express";
import { Types } from "mongoose";

import SupportTicket from "../models/SupportTicket.js";
import User from "../models/User.js";

import {
    sendEmail,
} from "../services/emailService.js";

import {
    sendSms,
} from "../services/smsService.js";

import {
    AuthenticatedRequest,
} from "../middleware/authMiddleware.js";


// ======================================
// GET ALL SUPPORT TICKETS
// ======================================

export const getAllSupportTickets = async (
    req: AuthenticatedRequest,
    res: Response
) => {

    try {

        const {
            status,
            priority,
            search,
        } = req.query;


        const ticketFilter: Record<string, unknown> = {};


        if (
            typeof status === "string" &&
            status.trim()
        ) {

            ticketFilter.status =
                status.trim();

        }


        if (
            typeof priority === "string" &&
            priority.trim()
        ) {

            ticketFilter.priority =
                priority.trim();

        }


        let tickets;


        if (
            typeof search === "string" &&
            search.trim()
        ) {

            const searchTerm =
                search.trim();


            const users =
                await User.find({

                    $or: [

                        {
                            firstName: {
                                $regex:
                                    searchTerm,
                                $options: "i",
                            },
                        },

                        {
                            lastName: {
                                $regex:
                                    searchTerm,
                                $options: "i",
                            },
                        },

                        {
                            email: {
                                $regex:
                                    searchTerm,
                                $options: "i",
                            },
                        },

                        {
                            clientNumber: {
                                $regex:
                                    searchTerm,
                                $options: "i",
                            },
                        },

                    ],

                })
                    .select("_id")
                    .lean();


            const userIds =
                users.map(
                    (user) => user._id
                );


            ticketFilter.$or = [

                {
                    ticketNumber: {
                        $regex:
                            searchTerm,
                        $options: "i",
                    },
                },

                {
                    subject: {
                        $regex:
                            searchTerm,
                        $options: "i",
                    },
                },

                {
                    userId: {
                        $in: userIds,
                    },
                },

            ];

        }


        tickets =
            await SupportTicket.find(
                ticketFilter
            )
                .populate(
                    "userId",
                    "clientNumber firstName lastName email phone"
                )
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
            "Get all support tickets error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to load support tickets.",

        });

    }

};


// ======================================
// GET ONE SUPPORT TICKET
// ======================================

export const getAdminSupportTicket = async (
    req: AuthenticatedRequest,
    res: Response
) => {

    try {

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
            await SupportTicket.findById(
                ticketId
            )
                .populate(
                    "userId",
                    "clientNumber firstName lastName email phone"
                )
                .lean();


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
            "Get admin support ticket error:",
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
// ADMIN REPLY TO SUPPORT TICKET
// ======================================

export const adminReplyToSupportTicket = async (
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
            ticketId,
        } = req.params;


        const {
            message,
        } = req.body;


        if (
            !message ||
            !message.trim()
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Message is required.",

            });

        }


        const ticket =
            await SupportTicket.findById(
                ticketId
            );


        if (!ticket) {

            return res.status(404).json({

                success: false,

                message:
                    "Support ticket not found.",

            });

        }


        if (
            ticket.status === "closed"
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "This support ticket is closed.",

            });

        }


        ticket.messages.push({

            senderId:
                new Types.ObjectId(
                    req.userId
                ),

            senderType:
                "admin",

            message:
                message.trim(),

            channel:
                "chat",

            createdAt:
                new Date(),

        });


        ticket.status =
            "waiting_customer";


        await ticket.save();


        return res.status(200).json({

            success: true,

            message:
                "Reply sent successfully.",

            data: ticket,

        });

    } catch (error) {

        console.error(
            "Admin reply to support ticket error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to send reply.",

        });

    }

};


// ======================================
// SEND TICKET EMAIL / SMS NOTIFICATION
// ======================================
// This remains available for ticket-specific
// communication. The new Admin Communications
// feature below does NOT use a ticket ID.
// ======================================

export const sendAdminSupportNotification = async (
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
            ticketId,
        } = req.params;


        const {
            channel,
            subject,
            message,
        } = req.body;


        if (
            channel !== "email" &&
            channel !== "sms"
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Notification channel must be email or sms.",

            });

        }


        if (
            !message ||
            typeof message !== "string" ||
            !message.trim()
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Notification message is required.",

            });

        }


        if (
            channel === "email" &&
            (
                !subject ||
                typeof subject !== "string" ||
                !subject.trim()
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Email subject is required.",

            });

        }


        const ticket =
            await SupportTicket.findById(
                ticketId
            )
                .populate(
                    "userId",
                    "clientNumber firstName lastName email phone"
                );


        if (!ticket) {

            return res.status(404).json({

                success: false,

                message:
                    "Support ticket not found.",

            });

        }


        if (
            ticket.status === "closed"
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Closed tickets cannot receive notifications.",

            });

        }


        const customer =
            ticket.userId as unknown as {
                _id: Types.ObjectId;
                firstName?: string;
                lastName?: string;
                email?: string;
                phone?: string;
            };


        if (channel === "email") {

            const email =
                customer.email?.trim();


            if (!email) {

                return res.status(400).json({

                    success: false,

                    message:
                        "This customer does not have an email address.",

                });

            }


            const firstName =
                customer.firstName?.trim() ||
                "Customer";


            const emailSubject =
                subject.trim();


            const emailMessage =
                message.trim();


            const html = `
                <div style="
                    font-family: Arial, sans-serif;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 30px;
                    color: #171a1f;
                    background: #ffffff;
                ">

                    <div style="
                        border-bottom: 4px solid #b5121b;
                        padding-bottom: 15px;
                        margin-bottom: 25px;
                    ">

                        <h1 style="
                            margin: 0;
                            color: #b5121b;
                            font-size: 24px;
                        ">
                            Capital Bank of Canada
                        </h1>

                    </div>

                    <p>
                        Hello ${firstName},
                    </p>

                    <p style="
                        font-size: 16px;
                        line-height: 1.6;
                        white-space: pre-line;
                    ">
                        ${emailMessage}
                    </p>

                    <div style="
                        margin-top: 30px;
                        padding: 18px;
                        background: #f5f6f8;
                        border-left: 4px solid #b5121b;
                    ">

                        <strong>
                            Support Ticket
                        </strong>

                        <p style="
                            margin-bottom: 0;
                            line-height: 1.5;
                        ">
                            Ticket number:
                            ${ticket.ticketNumber}
                        </p>

                    </div>

                    <div style="
                        margin-top: 25px;
                        padding-top: 20px;
                        border-top: 1px solid #dddddd;
                    ">

                        <p style="
                            font-size: 13px;
                            color: #666666;
                            line-height: 1.5;
                        ">
                            Capital Bank of Canada will never
                            ask you to provide your password,
                            PIN, or security codes by email.
                        </p>

                    </div>

                </div>
            `;


            const sent =
                await sendEmail(
                    email,
                    emailSubject,
                    emailMessage,
                    html
                );


            if (!sent) {

                return res.status(502).json({

                    success: false,

                    message:
                        "The email could not be sent. Please verify the email service configuration.",

                });

            }


            ticket.messages.push({

                senderId:
                    new Types.ObjectId(
                        req.userId
                    ),

                senderType:
                    "admin",

                message:
                    emailMessage,

                channel:
                    "email",

                createdAt:
                    new Date(),

            });


            await ticket.save();


            return res.status(200).json({

                success: true,

                message:
                    "Email notification sent successfully.",

                data: ticket,

            });

        }


        const phone =
            customer.phone?.trim();


        if (!phone) {

            return res.status(400).json({

                success: false,

                message:
                    "This customer does not have a phone number.",

            });

        }


        const smsMessage =
            message.trim();


        const sent =
            await sendSms(
                phone,
                `Capital Bank of Canada: ${smsMessage}`
            );


        if (!sent) {

            return res.status(502).json({

                success: false,

                message:
                    "The SMS could not be sent. Please verify the SMS service configuration.",

            });

        }


        ticket.messages.push({

            senderId:
                new Types.ObjectId(
                    req.userId
                ),

            senderType:
                "admin",

            message:
                smsMessage,

            channel:
                "sms",

            createdAt:
                new Date(),

        });


        await ticket.save();


        return res.status(200).json({

            success: true,

            message:
                "SMS notification sent successfully.",

            data: ticket,

        });

    } catch (error) {

        console.error(
            "Admin support notification error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to send notification.",

        });

    }

};


// ======================================
// UPDATE SUPPORT TICKET STATUS
// ======================================

export const updateSupportTicketStatus = async (
    req: AuthenticatedRequest,
    res: Response
) => {

    try {

        const {
            ticketId,
        } = req.params;


        const {
            status,
        } = req.body;


        const allowedStatuses = [

            "open",

            "in_progress",

            "waiting_customer",

            "resolved",

            "closed",

        ];


        if (
            !status ||
            !allowedStatuses.includes(status)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid support ticket status.",

            });

        }


        const ticket =
            await SupportTicket.findByIdAndUpdate(

                ticketId,

                {
                    status,
                },

                {
                    new: true,
                }

            );


        if (!ticket) {

            return res.status(404).json({

                success: false,

                message:
                    "Support ticket not found.",

            });

        }


        return res.status(200).json({

            success: true,

            message:
                "Support ticket status updated.",

            data: ticket,

        });

    } catch (error) {

        console.error(
            "Update support ticket status error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to update ticket status.",

        });

    }

};


// ======================================
// UPDATE SUPPORT TICKET PRIORITY
// ======================================

export const updateSupportTicketPriority = async (
    req: AuthenticatedRequest,
    res: Response
) => {

    try {

        const {
            ticketId,
        } = req.params;


        const {
            priority,
        } = req.body;


        const allowedPriorities = [

            "low",

            "normal",

            "high",

            "urgent",

        ];


        if (
            !priority ||
            !allowedPriorities.includes(priority)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid support ticket priority.",

            });

        }


        const ticket =
            await SupportTicket.findByIdAndUpdate(

                ticketId,

                {
                    priority,
                },

                {
                    new: true,
                }

            );


        if (!ticket) {

            return res.status(404).json({

                success: false,

                message:
                    "Support ticket not found.",

            });

        }


        return res.status(200).json({

            success: true,

            message:
                "Support ticket priority updated.",

            data: ticket,

        });

    } catch (error) {

        console.error(
            "Update support ticket priority error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to update ticket priority.",

        });

    }

};


// ======================================
// DELETE SUPPORT TICKET
// ======================================

export const deleteSupportTicket = async (
    req: AuthenticatedRequest,
    res: Response
) => {

    try {

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
            await SupportTicket.findById(
                ticketId
            );


        if (!ticket) {

            return res.status(404).json({

                success: false,

                message:
                    "Support ticket not found.",

            });

        }


        await SupportTicket.findByIdAndDelete(
            ticketId
        );


        return res.status(200).json({

            success: true,

            message:
                "Support ticket deleted successfully.",

        });

    } catch (error) {

        console.error(
            "Delete support ticket error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to delete support ticket.",

        });

    }

};


// ======================================
// SEARCH CUSTOMERS FOR ADMIN COMMUNICATION
// ======================================

export const searchCommunicationCustomers = async (
    req: AuthenticatedRequest,
    res: Response
) => {

    try {

        const query =
            typeof req.query.q === "string"
                ? req.query.q.trim()
                : "";


        if (!query) {

            return res.status(400).json({

                success: false,

                message:
                    "A customer search query is required.",

            });

        }


        if (query.length < 2) {

            return res.status(400).json({

                success: false,

                message:
                    "Search query must contain at least 2 characters.",

            });

        }


        const searchRegex =
            new RegExp(
                query.replace(
                    /[.*+?^${}()|[\]\\]/g,
                    "\\$&"
                ),
                "i"
            );


        const customers =
            await User.find({

                role: "customer",

                $or: [

                    {
                        clientNumber:
                            searchRegex,
                    },

                    {
                        email:
                            searchRegex,
                    },

                    {
                        phone:
                            searchRegex,
                    },

                    {
                        firstName:
                            searchRegex,
                    },

                    {
                        lastName:
                            searchRegex,
                    },

                ],

            })
                .select(
                    "_id clientNumber firstName lastName email phone"
                )
                .sort({
                    createdAt: -1,
                })
                .limit(20)
                .lean();


        return res.status(200).json({

            success: true,

            data: {

                customers,

            },

        });

    } catch (error) {

        console.error(
            "Search communication customers error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to search customers.",

        });

    }

};


// ======================================
// SEND ADMIN COMMUNICATION
// ======================================
// This is completely independent from
// support tickets.
// ======================================

export const sendAdminCommunication = async (
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
            recipientType,
            customerId,
            channel,
            subject,
            message,
        } = req.body;


        // ----------------------------------
        // VALIDATE RECIPIENT TYPE
        // ----------------------------------

        if (
            recipientType !== "all" &&
            recipientType !== "customer"
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Recipient must be all customers or a specific customer.",

            });

        }


        // ----------------------------------
        // VALIDATE CHANNEL
        // ----------------------------------

        if (
            channel !== "email" &&
            channel !== "sms"
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Communication channel must be email or sms.",

            });

        }


        // ----------------------------------
        // VALIDATE MESSAGE
        // ----------------------------------

        if (
            !message ||
            typeof message !== "string" ||
            !message.trim()
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Message is required.",

            });

        }


        const communicationMessage =
            message.trim();


        // ----------------------------------
        // VALIDATE EMAIL SUBJECT
        // ----------------------------------

        if (
            channel === "email" &&
            (
                !subject ||
                typeof subject !== "string" ||
                !subject.trim()
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Email subject is required.",

            });

        }


        // ----------------------------------
        // LOAD RECIPIENTS
        // ----------------------------------

        let customers;


        if (
            recipientType === "customer"
        ) {

            if (!customerId) {

                return res.status(400).json({

                    success: false,

                    message:
                        "A customer must be selected.",

                });

            }


            if (
                !Types.ObjectId.isValid(
                    customerId
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid customer ID.",

                });

            }


            const customer =
                await User.findOne({

                    _id:
                        customerId,

                    role:
                        "customer",

                })
                    .select(
                        "_id clientNumber firstName lastName email phone"
                    )
                    .lean();


            if (!customer) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Customer not found.",

                });

            }


            customers = [
                customer,
            ];

        } else {

            customers =
                await User.find({

                    role:
                        "customer",

                })
                    .select(
                        "_id clientNumber firstName lastName email phone"
                    )
                    .lean();

        }


        if (
            customers.length === 0
        ) {

            return res.status(404).json({

                success: false,

                message:
                    "No customers were found.",

            });

        }


        // ----------------------------------
        // SEND COMMUNICATIONS
        // ----------------------------------

        let sent = 0;
        let failed = 0;
        let skipped = 0;


        for (
            const customer of customers
        ) {

            const firstName =
                customer.firstName?.trim() ||
                "Customer";


            try {

                if (
                    channel === "email"
                ) {

                    const email =
                        customer.email?.trim();


                    if (!email) {

                        skipped++;

                        continue;

                    }


                    const emailSubject =
                        subject.trim();


                    const html = `
                        <div style="
                            font-family: Arial, sans-serif;
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 30px;
                            color: #171a1f;
                            background: #ffffff;
                        ">

                            <div style="
                                border-bottom: 4px solid #b5121b;
                                padding-bottom: 15px;
                                margin-bottom: 25px;
                            ">

                                <h1 style="
                                    margin: 0;
                                    color: #b5121b;
                                    font-size: 24px;
                                ">
                                    Capital Bank of Canada
                                </h1>

                            </div>

                            <p>
                                Hello ${firstName},
                            </p>

                            <p style="
                                font-size: 16px;
                                line-height: 1.6;
                                white-space: pre-line;
                            ">
                                ${communicationMessage}
                            </p>

                            <div style="
                                margin-top: 25px;
                                padding-top: 20px;
                                border-top: 1px solid #dddddd;
                            ">

                                <p style="
                                    font-size: 13px;
                                    color: #666666;
                                    line-height: 1.5;
                                ">
                                    Capital Bank of Canada will never
                                    ask you to provide your password,
                                    PIN, or security codes by email.
                                </p>

                            </div>

                        </div>
                    `;


                    const emailSent =
                        await sendEmail(
                            email,
                            emailSubject,
                            communicationMessage,
                            html
                        );


                    if (emailSent) {

                        sent++;

                    } else {

                        failed++;

                    }


                } else {

                    const phone =
                        customer.phone?.trim();


                    if (!phone) {

                        skipped++;

                        continue;

                    }


                    const smsSent =
                        await sendSms(
                            phone,
                            `Capital Bank of Canada: ${communicationMessage}`
                        );


                    if (smsSent) {

                        sent++;

                    } else {

                        failed++;

                    }

                }

            } catch (error) {

                console.error(
                    `Communication failed for customer ${customer._id}:`,
                    error
                );

                failed++;

            }

        }


        // ----------------------------------
        // RESPONSE
        // ----------------------------------

        return res.status(200).json({

            success: true,

            message:
                "Admin communication processing completed.",

            data: {

                recipientType,

                channel,

                totalRecipients:
                    customers.length,

                sent,

                failed,

                skipped,

            },

        });

    } catch (error) {

        console.error(
            "Send admin communication error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to send admin communication.",

        });

    }

};