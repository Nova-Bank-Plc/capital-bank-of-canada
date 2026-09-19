import mongoose, {
    Schema,
    Document,
    Types,
} from "mongoose";


export interface ILoan
    extends Document {

    userId: Types.ObjectId;

    loanType: string;

    applicationNumber: string;

    loanNumber?: string;

    requestedAmount: number;

    principalAmount?: number;

    outstandingBalance?: number;

    interestRate?: number;

    termMonths: number;

    monthlyPayment?: number;

    nextPaymentDate?: Date;

    purpose: string;

    status:
        | "pending"
        | "approved"
        | "active"
        | "rejected"
        | "paid";

    applicationDate: Date;

    approvedDate?: Date;

    /*
     * Identifies the transaction created when
     * an approved loan is disbursed.
     *
     * This prevents the same loan from being
     * financially disbursed more than once.
     */
    disbursementTransactionId?: Types.ObjectId;

    disbursedDate?: Date;

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


            applicationNumber: {
                type: String,
                required: true,
                unique: true,
                trim: true,
            },


            loanNumber: {
                type: String,
                unique: true,
                sparse: true,
                trim: true,
            },


            requestedAmount: {
                type: Number,
                required: true,
                min: 1,
            },


            principalAmount: {
                type: Number,
                min: 0,
            },


            outstandingBalance: {
                type: Number,
                min: 0,
            },


            interestRate: {
                type: Number,
                min: 0,
            },


            termMonths: {
                type: Number,
                required: true,
                min: 1,
            },


            monthlyPayment: {
                type: Number,
                min: 0,
            },


            nextPaymentDate: {
                type: Date,
            },


            purpose: {
                type: String,
                required: true,
                trim: true,
                minlength: 5,
                maxlength: 500,
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


            /*
             * Loan disbursement tracking
             */
            disbursementTransactionId: {
                type: Schema.Types.ObjectId,
                ref: "Transaction",
                unique: true,
                sparse: true,
            },


            disbursedDate: {
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