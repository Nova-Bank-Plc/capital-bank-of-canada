import mongoose, {
    Document,
    Schema,
} from "mongoose";


export interface IDigitalAssetTransaction
    extends Document {

    userId: mongoose.Types.ObjectId;

    asset: string;

    symbol: string;

    type:
        | "credit"
        | "debit"
        | "conversion";

    quantity: number;

    reference: string;

    status:
        | "completed"
        | "pending"
        | "failed";

    createdAt: Date;

    updatedAt: Date;
}


const digitalAssetTransactionSchema =
    new Schema<IDigitalAssetTransaction>(
        {
            userId: {
                type: Schema.Types.ObjectId,
                ref: "User",
                required: true,
                index: true,
            },

            asset: {
                type: String,
                required: true,
                trim: true,
            },

            symbol: {
                type: String,
                required: true,
                uppercase: true,
                trim: true,
            },

            type: {
                type: String,
                enum: [
                    "credit",
                    "debit",
                    "conversion",
                ],
                required: true,
            },

            quantity: {
                type: Number,
                required: true,
                min: 0,
            },

            reference: {
                type: String,
                required: true,
                trim: true,
            },

            status: {
                type: String,
                enum: [
                    "completed",
                    "pending",
                    "failed",
                ],
                default: "completed",
            },
        },

        {
            timestamps: true,
        },
    );


digitalAssetTransactionSchema.index(
    {
        userId: 1,
        createdAt: -1,
    },
);


export default mongoose.model<IDigitalAssetTransaction>(
    "DigitalAssetTransaction",
    digitalAssetTransactionSchema,
);