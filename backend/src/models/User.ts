import mongoose, {
    Document,
    Schema,
} from "mongoose";


export interface IUser
    extends Document {

    clientNumber: string;

    firstName: string;

    lastName: string;

    email: string;

    phone: string;

    password: string;

    role: "customer" | "admin";

    createdAt: Date;

    updatedAt: Date;

}


const userSchema =
    new Schema<IUser>(
        {

            clientNumber: {

                type: String,

                required: true,

                unique: true,

                trim: true,

                index: true,

            },


            firstName: {

                type: String,

                required: true,

                trim: true,

            },


            lastName: {

                type: String,

                required: true,

                trim: true,

            },


            email: {

                type: String,

                required: true,

                unique: true,

                lowercase: true,

                trim: true,

            },


            phone: {

                type: String,

                required: true,

                trim: true,

            },


            password: {

                type: String,

                required: true,

                minlength: 8,

            },


            role: {

                type: String,

                enum: [
                    "customer",
                    "admin",
                ],

                default: "customer",

                required: true,

                index: true,

            },

        },

        {

            timestamps: true,

        }

    );


const User =
    mongoose.model<IUser>(
        "User",
        userSchema
    );


export default User;