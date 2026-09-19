import mongoose, {
    Schema,
    Document,
    Types,
} from "mongoose";


export interface IPayee
    extends Document {

    userId: Types.ObjectId;

    billerId: Types.ObjectId;

    nickname?: string;

    accountReference: string;

    status:
        | "active"
        | "inactive";

    createdAt: Date;

    updatedAt: Date;

}


const payeeSchema =
    new Schema<IPayee>(
        {

            userId: {

                type:
                    Schema.Types.ObjectId,

                ref: "User",

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


            nickname: {

                type: String,

                trim: true,

                maxlength: 100,

            },


            accountReference: {

                type: String,

                required: true,

                trim: true,

                maxlength: 100,

            },


            status: {

                type: String,

                enum: [
                    "active",
                    "inactive",
                ],

                required: true,

                default: "active",

                index: true,

            },

        },

        {

            timestamps: true,

        }

    );


payeeSchema.index({
    userId: 1,
    billerId: 1,
});


payeeSchema.index({
    userId: 1,
    accountReference: 1,
});


const Payee =
    mongoose.model<IPayee>(
        "Payee",
        payeeSchema
    );


export default Payee;