import mongoose, {
    Schema,
    Document,
} from "mongoose";


/* =========================================
   BILLER PAYMENT OPTION
========================================= */

export interface IBillerPaymentOption {

    _id?: mongoose.Types.ObjectId;

    name: string;

    description?: string;

    status:
        | "active"
        | "inactive";

}


/* =========================================
   BILLER
========================================= */

export interface IBiller
    extends Document {

    name: string;

    category: string;

    description?: string;

    paymentOptions:
        IBillerPaymentOption[];

    status:
        | "active"
        | "inactive";

    createdAt: Date;

    updatedAt: Date;

}


/* =========================================
   PAYMENT OPTION SCHEMA
========================================= */

const paymentOptionSchema =
    new Schema<IBillerPaymentOption>(
        {

            name: {

                type: String,

                required: true,

                trim: true,

                maxlength: 150,

            },


            description: {

                type: String,

                trim: true,

                maxlength: 500,

            },


            status: {

                type: String,

                enum: [
                    "active",
                    "inactive",
                ],

                required: true,

                default: "active",

            },

        },

        {
            _id: true,
        }

    );


/* =========================================
   BILLER SCHEMA
========================================= */

const billerSchema =
    new Schema<IBiller>(
        {

            name: {

                type: String,

                required: true,

                trim: true,

                maxlength: 150,

            },


            category: {

                type: String,

                required: true,

                trim: true,

                maxlength: 100,

            },


            description: {

                type: String,

                trim: true,

                maxlength: 500,

            },


            paymentOptions: {

                type: [
                    paymentOptionSchema,
                ],

                default: [],

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


/* =========================================
   INDEXES
========================================= */

billerSchema.index({
    name: 1,
});


billerSchema.index({
    category: 1,
});


/* =========================================
   MODEL
========================================= */

const Biller =
    mongoose.model<IBiller>(
        "Biller",
        billerSchema
    );


export default Biller;