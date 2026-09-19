import twilio from "twilio";


const twilioAccountSid =
    process.env.TWILIO_ACCOUNT_SID;

const twilioAuthToken =
    process.env.TWILIO_AUTH_TOKEN;

const twilioPhoneNumber =
    process.env.TWILIO_PHONE_NUMBER;


const smsConfigured =
    Boolean(
        twilioAccountSid &&
        twilioAuthToken &&
        twilioPhoneNumber
    );


const twilioClient =
    smsConfigured
        ? twilio(
            twilioAccountSid,
            twilioAuthToken
        )
        : null;


/* =========================================
   SEND SMS
========================================= */

export const sendSms = async (
    to: string,
    message: string
): Promise<boolean> => {

    if (!twilioClient) {

        console.warn(
            "SMS service is not configured."
        );

        return false;
    }


    if (
        typeof to !== "string" ||
        to.trim().length === 0
    ) {

        console.warn(
            "SMS notification skipped: invalid phone number."
        );

        return false;
    }


    try {

        await twilioClient.messages.create({

            body:
                message,

            from:
                twilioPhoneNumber,

            to:
                to.trim(),

        });


        console.log(
            `SMS notification sent to ${to}`
        );


        return true;

    } catch (error) {

        console.error(
            "SMS notification error:",
            error
        );


        return false;
    }
};


/* =========================================
   TRANSACTION SMS
========================================= */

export const sendTransactionSms =
    async (
        phone: string,
        message: string
    ): Promise<boolean> => {

        return sendSms(
            phone,
            `Capital Bank of Canada: ${message}`
        );
    };