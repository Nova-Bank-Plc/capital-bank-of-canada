import mongoose, {
    Schema,
    Document,
    Types,
} from "mongoose";


export interface ICard
    extends Document {

    userId: Types.ObjectId;

    accountId: Types.ObjectId;

    cardType:
        | "debit"
        | "credit";

    cardName: string;

    cardNumberLast4: string;

    expiryMonth?: number;

    expiryYear?: number;

    status:
        | "pending"
        | "active"
        | "frozen"
        | "blocked"
        | "expired";

    currency: string;

    issuedDate?: Date;

    frozenDate?: Date;

    blockedDate?: Date;

    createdAt: Date;

    updatedAt: Date;

}


const cardSchema =
    new Schema<ICard>(
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


            cardName: {

                type: String,

                required: true,

                trim: true,

                maxlength: 100,

            },


            cardNumberLast4: {

                type: String,

                required: true,

                trim: true,

                minlength: 4,

                maxlength: 4,

                match: /^\d{4}$/,

            },


            expiryMonth: {

                type: Number,

                min: 1,

                max: 12,

            },


            expiryYear: {

                type: Number,

                min: 0,

            },


            status: {

                type: String,

                enum: [
                    "pending",
                    "active",
                    "frozen",
                    "blocked",
                    "expired",
                ],

                required: true,

                default: "pending",

                index: true,

            },


            currency: {

                type: String,

                required: true,

                default: "CAD",

                trim: true,

            },


            issuedDate: {

                type: Date,

            },


            frozenDate: {

                type: Date,

            },


            blockedDate: {

                type: Date,

            },

        },

        {

            timestamps: true,

        }

    );


cardSchema.index({
    userId: 1,
    accountId: 1,
});


const Card =
    mongoose.model<ICard>(
        "Card",
        cardSchema
    );


export default Card;