const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: process.env.MAIL_SECURE === 'true',
    auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD
    }
});

/**
 * Send verification email
 * @param {string} to - Recipient email
 * @param {string} code - Verification code
 */
const sendVerificationCode = async (to, code) => {
    const mailOptions = {
        from: `"${process.env.MAIL_FROM_NAME || 'WeShoot AI'}" <${process.env.MAIL_FROM}>`,
        to,
        subject: '🔐 Verify Your WeShoot AI Account',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body { margin: 0; padding: 0; background-color: #F5F8FF; }
                    .container { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px; text-align: center; background-color: #ffffff; border-radius: 32px; margin-top: 40px; margin-bottom: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
                    .logo { margin-bottom: 40px; }
                    .logo-img { height: 40px; }
                    .logo-text { font-size: 24px; font-weight: 900; color: #0F172A; text-decoration: none; letter-spacing: -0.02em; display: inline-flex; align-items: center; gap: 8px; }
                    .logo-dot { color: #4D96FF; }
                    .title { color: #0F172A; font-size: 28px; margin-bottom: 16px; font-weight: 800; letter-spacing: -0.02em; }
                    .subtitle { font-size: 16px; color: #64748B; margin-bottom: 40px; line-height: 1.6; font-weight: 500; }
                    .code-box { background: #F8FAFC; border: 2px dashed #E2E8F0; padding: 32px 20px; border-radius: 24px; margin: 32px 0; }
                    .code-label { font-size: 11px; font-weight: 800; color: #94A3B8; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 16px; }
                    .code-value { font-size: 40px; font-weight: 800; letter-spacing: 8px; color: #0F172A; font-family: monospace; line-height: 1; }
                    .footer { font-size: 12px; color: #94A3B8; text-align: center; margin-top: 48px; font-weight: 500; }
                    .highlight { color: #0F172A; font-weight: 700; }
                    
                    @media only screen and (max-width: 480px) {
                        .container { padding: 32px 20px; border-radius: 0; margin: 0; box-shadow: none; background-color: #ffffff; }
                        .code-value { font-size: 32px; letter-spacing: 4px; }
                        .title { font-size: 24px; }
                        .subtitle { font-size: 15px; }
                    }
                </style>
            </head>
            <body>
                <div style="background-color: #F5F8FF; padding: 20px 0;">
                    <div class="container">
                        <div class="logo">
                            <!-- Using text logo as fallback/primary if image fails or isn't available externally -->
                            <a href="https://weshoot.net" class="logo-text">
                                WESHOOT<span class="logo-dot">.net</span>
                            </a>
                        </div>
                        <h1 class="title">Verify your email</h1>
                        <p class="subtitle">Enter the following code to confirm your email address and start creating stunning visuals.</p>
                        
                        <div class="code-box">
                            <div class="code-label">Verification Code</div>
                            <div class="code-value">${code}</div>
                        </div>
                        
                        <p style="font-size: 13px; color: #64748B; font-weight: 500;">Expires in <span class="highlight">60 minutes</span></p>
                        
                        <div class="footer">
                            &copy; ${new Date().getFullYear()} WeShoot AI. All rights reserved.
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    try {
        console.log(`Attempting to send verification email to: ${to}`);
        const info = await transporter.sendMail(mailOptions);
        console.log('Message sent: %s', info.messageId);
        return true;
    } catch (error) {
        console.error('SMTP Error Detailed:', {
            message: error.message,
            code: error.code,
            command: error.command,
            response: error.response
        });
        return false;
    }
};

/**
 * Send password reset code
 * @param {string} to - Recipient email
 * @param {string} code - Reset code
 */
const sendPasswordResetCode = async (to, code) => {
    const mailOptions = {
        from: `"${process.env.MAIL_FROM_NAME || 'WeShoot AI'}" <${process.env.MAIL_FROM}>`,
        to,
        subject: '🔐 Reset Your WeShoot AI Password',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body { margin: 0; padding: 0; background-color: #F5F8FF; }
                    .container { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px; text-align: center; background-color: #ffffff; border-radius: 32px; margin-top: 40px; margin-bottom: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
                    .logo { margin-bottom: 40px; }
                    .logo-text { font-size: 24px; font-weight: 900; color: #0F172A; text-decoration: none; letter-spacing: -0.02em; display: inline-flex; align-items: center; gap: 8px; }
                    .logo-dot { color: #4D96FF; }
                    .title { color: #0F172A; font-size: 28px; margin-bottom: 16px; font-weight: 800; letter-spacing: -0.02em; }
                    .subtitle { font-size: 16px; color: #64748B; margin-bottom: 40px; line-height: 1.6; font-weight: 500; }
                    .code-box { background: #F8FAFC; border: 2px dashed #E2E8F0; padding: 32px 20px; border-radius: 24px; margin: 32px 0; }
                    .code-label { font-size: 11px; font-weight: 800; color: #94A3B8; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 16px; }
                    .code-value { font-size: 40px; font-weight: 800; letter-spacing: 8px; color: #0F172A; font-family: monospace; line-height: 1; }
                    .footer { font-size: 12px; color: #94A3B8; text-align: center; margin-top: 48px; font-weight: 500; }
                    .highlight { color: #0F172A; font-weight: 700; }
                    
                    @media only screen and (max-width: 480px) {
                        .container { padding: 32px 20px; border-radius: 0; margin: 0; box-shadow: none; background-color: #ffffff; }
                        .code-value { font-size: 32px; letter-spacing: 4px; }
                        .title { font-size: 24px; }
                        .subtitle { font-size: 15px; }
                    }
                </style>
            </head>
            <body>
                <div style="background-color: #F5F8FF; padding: 20px 0;">
                    <div class="container">
                        <div class="logo">
                            <a href="https://weshoot.net" class="logo-text">
                                WESHOOT<span class="logo-dot">.net</span>
                            </a>
                        </div>
                        <h1 class="title">Reset Password</h1>
                        <p class="subtitle">Use the code below to reset your WeShoot AI password. For security, do not share this code.</p>
                        
                        <div class="code-box">
                            <div class="code-label">Reset Code</div>
                            <div class="code-value">${code}</div>
                        </div>
                        
                        <p style="font-size: 13px; color: #64748B; font-weight: 500;">Expires in <span class="highlight">15 minutes</span></p>
                        
                        <div class="footer">
                            &copy; ${new Date().getFullYear()} WeShoot AI. All rights reserved.
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    try {
        console.log(`Attempting to send password reset email to: ${to}`);
        const info = await transporter.sendMail(mailOptions);
        console.log('Message sent: %s', info.messageId);
        return true;
    } catch (error) {
        console.error('SMTP Error Detailed:', {
            message: error.message,
            code: error.code
        });
        return false;
    }
};

module.exports = {
    sendVerificationCode,
    sendPasswordResetCode
};
