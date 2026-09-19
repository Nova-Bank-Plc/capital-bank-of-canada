import { Response } from "express";

import Notification from "../models/Notification.js";

import {
    AuthenticatedRequest,
} from "../middleware/authMiddleware.js";


// ======================================
// GET CUSTOMER NOTIFICATIONS
// ======================================

export const getNotifications = async (
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


        const notifications =
            await Notification.find({
                userId: req.userId,
            })
                .sort({
                    createdAt: -1,
                })
                .limit(50)
                .lean();


        const unreadCount =
            await Notification.countDocuments({
                userId: req.userId,
                read: false,
            });


        return res.status(200).json({

            success: true,

            data: {

                notifications,

                unreadCount,

            },

        });

    } catch (error) {

        console.error(
            "Get notifications error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to load notifications.",

        });

    }

};


// ======================================
// MARK ONE NOTIFICATION AS READ
// ======================================

export const markNotificationAsRead =
    async (
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
                notificationId,
            } = req.params;


            if (!notificationId) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Notification ID is required.",
                });

            }


            const notification =
                await Notification.findOneAndUpdate(
                    {
                        _id:
                            notificationId,

                        userId:
                            req.userId,
                    },

                    {
                        $set: {
                            read: true,
                        },
                    },

                    {
                        new: true,
                    }
                ).lean();


            if (!notification) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Notification not found.",
                });

            }


            return res.status(200).json({

                success: true,

                message:
                    "Notification marked as read.",

                data: {
                    notification,
                },

            });

        } catch (error) {

            console.error(
                "Mark notification as read error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to update notification.",

            });

        }

    };


// ======================================
// MARK ALL NOTIFICATIONS AS READ
// ======================================

export const markAllNotificationsAsRead =
    async (
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


            await Notification.updateMany(
                {
                    userId:
                        req.userId,

                    read: false,
                },

                {
                    $set: {
                        read: true,
                    },
                }
            );


            return res.status(200).json({

                success: true,

                message:
                    "All notifications marked as read.",

            });

        } catch (error) {

            console.error(
                "Mark all notifications as read error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to update notifications.",

            });

        }

    };