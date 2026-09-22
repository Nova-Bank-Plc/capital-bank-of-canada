import mongoose, {
    Document,
    Schema,
} from "mongoose";


export interface IDigitalAsset extends Document {
    userId: mongoose.Types.ObjectId;
    asset: string;
    symbol: string;
    balance: number;
    averageCost: number;
    createdAt: Date;
    updatedAt: Date;
}


const digitalAssetSchema =
    new Schema<IDigitalAsset>(
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

            balance: {
                type: Number,
                required: true,
                default: 0,
                min: 0,
            },

            averageCost: {
                type: Number,
                required: true,
                default: 0,
                min: 0,
            },
        },

        {
            timestamps: true,
        },
    );


digitalAssetSchema.index(
    {
        userId: 1,
        symbol: 1,
    },
    {
        unique: true,
    },
);


export default mongoose.model<IDigitalAsset>(
    "DigitalAsset",
    digitalAssetSchema,
);