import mongoose, {
    Schema,
    Document,
    Types,
} from "mongoose";


export interface IAccount
    extends Document {

    userId: Types.ObjectId;

    accountType: string;

    accountNumber: string;

    balance: number;

    currency: string;

    status: string;

    createdAt: Date;

    updatedAt: Date;

}


const accountSchema =
    new Schema<IAccount>(
        {

            userId: {

                type: Schema.Types.ObjectId,

                ref: "User",

                required: true,

                index: true,

            },


            accountType: {

                type: String,

                required: true,

                trim: true,

            },


            accountNumber: {

                type: String,

                required: true,

                unique: true,

            },


            balance: {

                type: Number,

                required: true,

                default: 0,

            },


            currency: {

                type: String,

                required: true,

                default: "CAD",

            },


            status: {

                type: String,

                required: true,

                default: "active",

            },

        },

        {

            timestamps: true,

        }

    );


const Account =
    mongoose.model<IAccount>(
        "Account",
        accountSchema
    );


export default Account;