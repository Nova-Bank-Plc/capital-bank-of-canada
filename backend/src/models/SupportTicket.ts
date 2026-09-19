import mongoose, {
    Document,
    Schema,
    Types,
} from "mongoose";


// ======================================
// SUPPORT MESSAGE
// ======================================

export interface ISupportMessage {

    senderId: Types.ObjectId;

    senderType: "customer" | "admin";

    message: string;

    channel: "chat" | "email" | "sms";

    createdAt: Date;

}


// ======================================
// SUPPORT TICKET
// ======================================

export interface ISupportTicket
    extends Document {

    ticketNumber: string;

    userId: Types.ObjectId;

    subject: string;

    category: string;

    priority:
        | "low"
        | "normal"
        | "high"
        | "urgent";

    status:
        | "open"
        | "in_progress"
        | "waiting_customer"
        | "resolved"
        | "closed";

    messages: ISupportMessage[];

    createdAt: Date;

    updatedAt: Date;

}


// ======================================
// MESSAGE SCHEMA
// ======================================

const supportMessageSchema =
    new Schema<ISupportMessage>(
        {

            senderId: {
                type: Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },


            senderType: {
                type: String,
                enum: [
                    "customer",
                    "admin",
                ],
                required: true,
            },


            message: {
                type: String,
                required: true,
                trim: true,
            },


            channel: {
                type: String,
                enum: [
                    "chat",
                    "email",
                    "sms",
                ],
                default: "chat",
                required: true,
            },


            createdAt: {
                type: Date,
                default: Date.now,
            },

        },

        {
            _id: true,
        }
    );


// ======================================
// TICKET SCHEMA
// ======================================

const supportTicketSchema =
    new Schema<ISupportTicket>(
        {

            ticketNumber: {
                type: String,
                required: true,
                unique: true,
                trim: true,
                index: true,
            },


            userId: {
                type: Schema.Types.ObjectId,
                ref: "User",
                required: true,
                index: true,
            },


            subject: {
                type: String,
                required: true,
                trim: true,
            },


            category: {
                type: String,
                required: true,
                trim: true,
                default: "General",
            },


            priority: {
                type: String,
                enum: [
                    "low",
                    "normal",
                    "high",
                    "urgent",
                ],
                default: "normal",
                required: true,
            },


            status: {
                type: String,
                enum: [
                    "open",
                    "in_progress",
                    "waiting_customer",
                    "resolved",
                    "closed",
                ],
                default: "open",
                required: true,
                index: true,
            },


            messages: {
                type: [supportMessageSchema],
                default: [],
            },

        },

        {
            timestamps: true,
        }
    );


// ======================================
// MODEL
// ======================================

const SupportTicket =
    mongoose.model<ISupportTicket>(
        "SupportTicket",
        supportTicketSchema
    );


export default SupportTicket;