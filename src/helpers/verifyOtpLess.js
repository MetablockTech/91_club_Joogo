export async function verifyOtpLess(requestId,otp){
    try {
        const options = {
            method: 'POST',
            headers: {
                clientId: 'UPC06R2XA6YKVCB8HEQPAZNYXU69DV5J',
                clientSecret: 'jylk407yxtguyvedajcplloh3d8e9at8',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                requestId: requestId,
                otp: otp,
            })
        };

        const response = await fetch('https://auth.otpless.app/auth/v1/verify/otp', options);
        const data = await response.json();

        console.log(data);
        return data;

    } catch (e) {
        console.error(e);
        return { status: false, message: e.message };
    }
};



