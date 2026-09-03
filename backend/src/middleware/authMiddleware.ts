import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";


export interface AuthenticatedRequest extends Request {

    userId?: string;

}


export const requireAuth = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {

    try {

        const authorization =
            req.headers.authorization;


        if (
            !authorization ||
            !authorization.startsWith("Bearer ")
        ) {

            return res.status(401).json({
                success: false,
                message: "Authentication required.",
            });

        }


        const token =
            authorization.split(" ")[1];


        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET ||
                "capital-bank-development-secret"
        ) as {
            userId: string;
            email: string;
        };


        req.userId =
            decoded.userId;


        next();


    } catch (error) {

        console.error(
            "Authentication error:",
            error
        );


        return res.status(401).json({
            success: false,
            message: "Invalid or expired session.",
        });

    }

};