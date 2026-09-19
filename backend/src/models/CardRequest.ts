import mongoose, {
    Schema,
    Document,
    Types,
} from "mongoose";


export interface ICardRequest
    extends Document {

    userId: Types.ObjectId;

    accountId: Types.ObjectId;

    cardType:
        | "debit"
        | "credit";

    requestType:
        | "new"
        | "replacement";

    status:
        | "pending"
        | "approved"
        | "rejected"
        | "completed"
        | "cancelled";

    reason?: string;

    requestedAt: Date;

    processedAt?: Date;

    createdAt: Date;

    updatedAt: Date;

}


const cardRequestSchema =
    new Schema<ICardRequest>(
        {

            userId: {

                type: Schema.Types.ObjectId,

                ref: "User",

                required: true,

                index: true,

            },


            accountId: {

                type: Schema.Types.ObjectId,

                ref: "Account",

                required: true,

                index: true,

            },


            cardType: {

                type: String,

                enum: [
                    "debit",
                    "credit",
                ],

                required: true,

            },


            requestType: {

                type: String,

                enum: [
                    "new",
                    "replacement",
                ],

                required: true,

                default: "new",

            },


            status: {

                type: String,

                enum: [
                    "pending",
                    "approved",
                    "rejected",
                    "completed",
                    "cancelled",
                ],

                required: true,

                default: "pending",

                index: true,

            },


            reason: {

                type: String,

                trim: true,

                maxlength: 500,

            },


            requestedAt: {

                type: Date,

                required: true,

                default: Date.now,

            },


            processedAt: {

                type: Date,

            },

        },

        {

            timestamps: true,

        }

    );


cardRequestSchema.index({
    userId: 1,
    accountId: 1,
    status: 1,
});


const CardRequest =
    mongoose.model<ICardRequest>(
        "CardRequest",
        cardRequestSchema
    );


export default CardRequest;