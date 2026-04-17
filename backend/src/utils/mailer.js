import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // Use SSL
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
});

export const sendOTP = async (email, otp) => {
    // Development fallback if credentials are not configured
    if (!process.env.EMAIL_USER || process.env.EMAIL_USER.includes('your-email') || !process.env.EMAIL_PASS || process.env.EMAIL_PASS.length < 5) {
        console.log('--------------------------------------------');
        console.log(`[DEV MODE] Verification Code for ${email}: ${otp}`);
        console.log('--------------------------------------------');
        return Promise.resolve({ message: 'Dev mode: OTP logged to console' });
    }

    const mailOptions = {
        from: `"CodeBite Support" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Your CodeBite Verification Code',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #FF3008; text-align: center;">CodeBite Verification</h2>
                <p>Hello,</p>
                <p>Your verification code for CodeBite is:</p>
                <div style="background: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #333; border-radius: 5px; margin: 20px 0;">
                    ${otp}
                </div>
                <p>This code will expire in 10 minutes. If you did not request this code, please ignore this email.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                <p style="font-size: 12px; color: #777; text-align: center;">
                    &copy; 2026 CodeBite. All rights reserved.
                </p>
            </div>
        `
    };

    try {
        console.log(`📧 Attempting to send real email to ${email}...`);
        await transporter.sendMail(mailOptions);
        console.log('✅ Email sent successfully!');
        return { message: 'OTP sent successfully!' };
    } catch (err) {
        console.error('❌ Real Mailer Error:', err.message);
        console.log('--------------------------------------------');
        console.log(`[FALLBACK CODE FOR ${email}]: ${otp}`);
        console.log('--------------------------------------------');
        return { message: 'Dev mode: OTP logged to terminal (mail service unavailable)' };
    }
};


