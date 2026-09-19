import mongoose, {
    Schema,
    Document,
    Types,
} from "mongoose";


export interface IBillPayment
    extends Document {

    userId: Types.ObjectId;

    accountId: Types.ObjectId;

    billerId: Types.ObjectId;

    payeeId: Types.ObjectId;

    amount: number;

    currency: string;

    reference: string;

    status:
        | "pending"
        | "processing"
        | "completed"
        | "failed"
        | "cancelled";

    description?: string;

    failureReason?: string;

    processedAt?: Date;

    createdAt: Date;

    updatedAt: Date;

}


const billPaymentSchema =
    new Schema<IBillPayment>(
        {

            userId: {

                type:
                    Schema.Types.ObjectId,

                ref: "User",

                required: true,

                index: true,

            },


            accountId: {

                type:
                    Schema.Types.ObjectId,

                ref: "Account",

                required: true,

                index: true,

            },


            billerId: {

                type:
                    Schema.Types.ObjectId,

                ref: "Biller",

                required: true,

                index: true,

            },


            payeeId: {

                type:
                    Schema.Types.ObjectId,

                ref: "Payee",

                required: true,

                index: true,

            },


            amount: {

                type: Number,

                required: true,

                min: 0.01,

            },


            currency: {

                type: String,

                required: true,

                default: "CAD",

                trim: true,

            },


            reference: {

                type: String,

                required: true,

                unique: true,

                index: true,

                trim: true,

            },


            status: {

                type: String,

                enum: [
                    "pending",
                    "processing",
                    "completed",
                    "failed",
                    "cancelled",
                ],

                required: true,

                default: "pending",

                index: true,

            },


            description: {

                type: String,

                trim: true,

                maxlength: 500,

            },


            failureReason: {

                type: String,

                trim: true,

                maxlength: 500,

            },


            processedAt: {

                type: Date,

            },

        },

        {

            timestamps: true,

        }

    );


billPaymentSchema.index({
    userId: 1,
    createdAt: -1,
});


billPaymentSchema.index({
    accountId: 1,
    createdAt: -1,
});


billPaymentSchema.index({
    payeeId: 1,
    createdAt: -1,
});


const BillPayment =
    mongoose.model<IBillPayment>(
        "BillPayment",
        billPaymentSchema
    );


export default BillPayment;