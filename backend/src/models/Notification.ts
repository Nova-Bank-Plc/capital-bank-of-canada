import mongoose, {
    Document,
    Schema,
    Types,
} from "mongoose";


export type NotificationType =
    | "transaction"
    | "transfer"
    | "loan"
    | "security"
    | "account"
    | "announcement"
    | "system";


export interface INotification
    extends Document {

    userId: Types.ObjectId;

    type: NotificationType;

    title: string;

    message: string;

    read: boolean;

    transactionId?: Types.ObjectId;

    accountId?: Types.ObjectId;

    createdAt: Date;

    updatedAt: Date;

}


const notificationSchema =
    new Schema<INotification>(
        {

            userId: {

                type:
                    Schema.Types.ObjectId,

                ref: "User",

                required: true,

                index: true,

            },


            type: {

                type: String,

                enum: [
                    "transaction",
                    "transfer",
                    "loan",
                    "security",
                    "account",
                    "announcement",
                    "system",
                ],

                required: true,

                index: true,

            },


            title: {

                type: String,

                required: true,

                trim: true,

                maxlength: 150,

            },


            message: {

                type: String,

                required: true,

                trim: true,

                maxlength: 500,

            },


            read: {

                type: Boolean,

                default: false,

                index: true,

            },


            transactionId: {

                type:
                    Schema.Types.ObjectId,

                ref: "Transaction",

                required: false,

            },


            accountId: {

                type:
                    Schema.Types.ObjectId,

                ref: "Account",

                required: false,

            },

        },

        {

            timestamps: true,

        }

    );


const Notification =
    mongoose.model<INotification>(
        "Notification",
        notificationSchema
    );


export default Notification;