import axios from "axios";
import connection from "../config/connectDB.js";

/**
 * Unified SMS Service to send OTP via multiple gateways
 * Supports: AuthKey (SendOTPLess), Twilio, Fast2SMS
 */
export async function sendOTP(phone, otp) {
    try {
        const [settings] = await connection.query(
            "SELECT active_gateway, authkey_api_key, authkey_sid, twilio_sid, twilio_messaging_service_sid, twilio_auth_token, twilio_phone_number, twilio_otp_template, fast2sms_api_key FROM sms_settings WHERE id = 1"
        );

        if (!settings || settings.length === 0) {
            console.error("SMS Settings not found in sms_settings table");
            return false;
        }

        const config = settings[0];
        const gateway = config.active_gateway;

        console.log(`Sending OTP via ${gateway} to ${phone}`);

        switch (gateway) {
            case "authkey":
                return await sendViaAuthKey(phone, otp, config.authkey_api_key, config.authkey_sid);
            case "twilio":
                return await sendViaTwilio(phone, otp, config);
            case "fast2sms":
                return await sendViaFast2SMS(phone, otp, config.fast2sms_api_key);
            case "none":
                console.log("SMS Gateway is set to 'none'. OTP: " + otp);
                return { status: "Success", message: "Gateway disabled, check console" };
            default:
                console.warn(`Unknown gateway: ${gateway}`);
                return false;
        }
    } catch (error) {
        console.error("Error in sendOTP service:", error.message);
        return false;
    }
}

async function sendViaAuthKey(phone, otp, apiKey, sid) {
    try {
        const response = await axios.post(
            "https://console.authkey.io/restapi/requestjson.php",
            {
                country_code: "91",
                mobile: phone,
                sid: sid || "35522",
                otp: otp
            },
            {
                headers: {
                    Authorization: `Basic ${apiKey}`
                }
            }
        );
        return response?.data?.status === "Success" ? response.data : false;
    } catch (error) {
        console.error("AuthKey Error:", error.message);
        return false;
    }
}

async function sendViaTwilio(phone, otp, config) {
    try {
        const { twilio_sid, twilio_auth_token, twilio_phone_number, twilio_messaging_service_sid, twilio_otp_template } = config;
        const formattedPhone = phone.startsWith("+") ? phone : `+91${phone}`;
        const auth = Buffer.from(`${twilio_sid}:${twilio_auth_token}`).toString("base64");
        
        let messageBody = `Your verification code is ${otp}`;
        if (twilio_otp_template) {
            messageBody = twilio_otp_template.replace(/{{otp}}|#OTP#/gi, otp);
        }

        const params = {
            To: formattedPhone,
            Body: messageBody
        };

        if (twilio_messaging_service_sid) {
            params.MessagingServiceSid = twilio_messaging_service_sid;
        } else if (twilio_phone_number) {
            params.From = twilio_phone_number;
        } else {
            console.error("Twilio Error: No From number or MessagingServiceSid provided");
            return false;
        }

        const response = await axios.post(
            `https://api.twilio.com/2010-04-01/Accounts/${twilio_sid}/Messages.json`,
            new URLSearchParams(params).toString(),
            {
                headers: {
                    Authorization: `Basic ${auth}`,
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            }
        );
        return response.status === 201 ? { status: "Success" } : false;
    } catch (error) {
        console.error("Twilio Error:", error.response?.data || error.message);
        return false;
    }
}

async function sendViaFast2SMS(phone, otp, apiKey) {
    try {
        const response = await axios.get("https://www.fast2sms.com/dev/bulkV2", {
            params: {
                authorization: apiKey,
                route: "q",
                message: `Your verification code is ${otp}`,
                flash: 0,
                numbers: phone,
            }
        });
        return response.data.return ? { status: "Success" } : false;
    } catch (error) {
        console.error("Fast2SMS Error:", error.message);
        return false;
    }
}

/**
 * Check if OTP is enabled for a specific feature
 * @param {string} feature - 'register', 'forgot', 'add_bank', 'withdraw'
 */
export async function isOTPEnabled(feature) {
    try {
        let dbFeature = feature;
        if (['bank', 'upi', 'address'].includes(feature)) {
            dbFeature = 'add_bank';
        }
        const [settings] = await connection.query(
            `SELECT otp_on_${dbFeature} as enabled FROM sms_settings WHERE id = 1`
        );
        return settings?.[0]?.enabled === 1;
    } catch (error) {
        return false;
    }
}

/**
 * Get OTP expiry time in minutes from settings
 * @returns {number} expiry time in minutes
 */
export async function getOTPExpiry() {
    try {
        const [settings] = await connection.query(
            "SELECT otp_expiry FROM sms_settings WHERE id = 1"
        );
        return settings?.[0]?.otp_expiry || 5; // Default to 5 minutes
    } catch (error) {
        return 5;
    }
}

/**
 * Get OTP cooldown time in seconds from settings
 * @returns {number} cooldown time in seconds
 */
export async function getOTPCooldown() {
    try {
        const [settings] = await connection.query(
            "SELECT otp_cooldown FROM sms_settings WHERE id = 1"
        );
        return settings?.[0]?.otp_cooldown || 60; // Default to 60 seconds
    } catch (error) {
        return 60;
    }
}
