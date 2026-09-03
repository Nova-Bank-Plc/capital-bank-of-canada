import mongoose, {
    Schema,
    Document,
    Types,
} from "mongoose";


export interface ITransaction
    extends Document {

    userId: Types.ObjectId;

    accountId: Types.ObjectId;

    name: string;

    transactionType: string;

    amount: number;

    direction: "credit" | "debit";

    status: string;

    createdAt: Date;

    updatedAt: Date;

}


const transactionSchema =
    new Schema<ITransaction>(
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

            },


            name: {

                type: String,

                required: true,

                trim: true,

            },


            transactionType: {

                type: String,

                required: true,

                trim: true,

            },


            amount: {

                type: Number,

                required: true,

            },


            direction: {

                type: String,

                enum: [
                    "credit",
                    "debit",
                ],

                required: true,

            },


            status: {

                type: String,

                default: "completed",

            },

        },

        {

            timestamps: true,

        }

    );


const Transaction =
    mongoose.model<ITransaction>(
        "Transaction",
        transactionSchema
    );


export default Transaction;