import "dotenv/config";

import nodemailer from "nodemailer";


const emailHost =
    process.env.EMAIL_HOST;

const emailPort =
    Number(
        process.env.EMAIL_PORT || 587
    );

const emailUser =
    process.env.EMAIL_USER;

const emailPassword =
    process.env.EMAIL_PASSWORD;

const emailFrom =
    process.env.EMAIL_FROM ||
    emailUser;


const emailConfigured =
    Boolean(
        emailHost &&
        emailUser &&
        emailPassword
    );


const transporter =
    emailConfigured
        ? nodemailer.createTransport({
            host: emailHost,
            port: emailPort,
            secure:
                emailPort === 465,
            auth: {
                user:
                    emailUser,
                pass:
                    emailPassword,
            },
        })
        : null;

        
         if (transporter) {
    transporter.verify()
        .then(() => {
            console.log(
                "Brevo SMTP connection verified successfully."
            );
        })
        .catch((error) => {
            console.error(
                "Brevo SMTP connection failed:",
                error
            );
        });
} else {
    console.warn(
        "Brevo SMTP is not configured."
    );
}


/* =========================================
   SEND EMAIL
========================================= */

export const sendEmail = async (
    to: string,
    subject: string,
    text: string,
    html?: string
): Promise<boolean> => {

    if (!transporter) {

        console.warn(
            "Email service is not configured."
        );

        return false;
    }


    try {

        await transporter.sendMail({

            from:
                emailFrom,

            to,

            subject,

            text,

            html:
                html || text,

        });


        console.log(
            `Email notification sent to ${to}`
        );


        return true;

    } catch (error) {

        console.error(
            "Email notification error:",
            error
        );


        return false;
    }
};


/* =========================================
   TRANSACTION EMAIL
========================================= */

export const sendTransactionEmail = async (
    to: string,
    firstName: string,
    title: string,
    message: string
): Promise<boolean> => {

    const html = `
        <div style="
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 0 auto;
            padding: 30px;
            color: #171a1f;
            background: #ffffff;
        ">

            <div style="
                border-bottom: 4px solid #b5121b;
                padding-bottom: 15px;
                margin-bottom: 25px;
            ">

                <h1 style="
                    margin: 0;
                    color: #b5121b;
                    font-size: 24px;
                ">
                    Capital Bank of Canada
                </h1>

            </div>


            <p>
                Hello ${firstName},
            </p>


            <h2 style="
                color: #171a1f;
                font-size: 20px;
            ">
                ${title}
            </h2>


            <p style="
                font-size: 16px;
                line-height: 1.6;
            ">
                ${message}
            </p>


            <div style="
                margin-top: 30px;
                padding: 18px;
                background: #f5f6f8;
                border-left: 4px solid #b5121b;
            ">

                <strong>
                    Security reminder
                </strong>

                <p style="
                    margin-bottom: 0;
                    line-height: 1.5;
                ">
                    Capital Bank of Canada will never
                    ask you to provide your password,
                    PIN, or security codes by email.
                </p>

            </div>


            <p style="
                margin-top: 30px;
                font-size: 13px;
                color: #666666;
            ">
                This is an automated notification.
                Please do not reply to this email.
            </p>

        </div>
    `;


    return sendEmail(
        to,
        title,
        message,
        html
    );
};