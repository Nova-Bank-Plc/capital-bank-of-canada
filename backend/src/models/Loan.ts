import mongoose, {
    Schema,
    Document,
    Types,
} from "mongoose";


export interface ILoan
    extends Document {

    userId: Types.ObjectId;

    loanType: string;

    loanNumber: string;

    principalAmount: number;

    outstandingBalance: number;

    interestRate: number;

    termMonths: number;

    monthlyPayment: number;

    nextPaymentDate?: Date;

    status:
        | "pending"
        | "approved"
        | "active"
        | "rejected"
        | "paid";

    applicationDate: Date;

    approvedDate?: Date;

    createdAt: Date;

    updatedAt: Date;

}


const loanSchema =
    new Schema<ILoan>(
        {

            userId: {

                type: Schema.Types.ObjectId,

                ref: "User",

                required: true,

                index: true,

            },


            loanType: {

                type: String,

                required: true,

                trim: true,

            },


            loanNumber: {

                type: String,

                required: true,

                unique: true,

                trim: true,

            },


            principalAmount: {

                type: Number,

                required: true,

                min: 0,

            },


            outstandingBalance: {

                type: Number,

                required: true,

                min: 0,

            },


            interestRate: {

                type: Number,

                required: true,

                min: 0,

            },


            termMonths: {

                type: Number,

                required: true,

                min: 1,

            },


            monthlyPayment: {

                type: Number,

                required: true,

                min: 0,

            },


            nextPaymentDate: {

                type: Date,

            },


            status: {

                type: String,

                enum: [
                    "pending",
                    "approved",
                    "active",
                    "rejected",
                    "paid",
                ],

                required: true,

                default: "pending",

            },


            applicationDate: {

                type: Date,

                required: true,

                default: Date.now,

            },


            approvedDate: {

                type: Date,

            },

        },

        {

            timestamps: true,

        }

    );


const Loan =
    mongoose.model<ILoan>(
        "Loan",
        loanSchema
    );


export default Loan;