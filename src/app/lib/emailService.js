import nodemailer from 'nodemailer';

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendWelcomeEmail(email, name) {
    if (!email) return { success: true }; // Skip if no email

    try {
      const mailOptions = {
        from: process.env.FROM_EMAIL,
        to: email,
        subject: 'Welcome to WoodenStreet!',
        html: this.getWelcomeEmailTemplate(name),
      };

      await this.transporter.sendMail(mailOptions);
      return { success: true };
    } catch (error) {
      console.error('Email sending failed:', error);
      return { success: false, error: error.message };
    }
  }

  async sendPasswordResetEmail(email, otp) {
    if (!email) return { success: true }; // Skip if no email

    try {
      const mailOptions = {
        from: process.env.FROM_EMAIL,
        to: email,
        subject: 'Password Reset - WoodenStreet',
        html: this.getPasswordResetEmailTemplate(otp),
      };

      await this.transporter.sendMail(mailOptions);
      return { success: true };
    } catch (error) {
      console.error('Email sending failed:', error);
      return { success: false, error: error.message };
    }
  }

  getWelcomeEmailTemplate(name) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Welcome to WoodenStreet</title>
          <style>
            .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
            .header { background: linear-gradient(135deg, #f59e0b, #ea580c); padding: 40px; text-align: center; }
            .header h1 { color: white; margin: 0; font-size: 32px; }
            .content { padding: 40px; background: #f8f9fa; }
            .button { display: inline-block; padding: 12px 24px; background: #f59e0b; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🌳 WoodenStreet</h1>
            </div>
            <div class="content">
              <h2>Welcome ${name}!</h2>
              <p>Thank you for joining WoodenStreet. We're excited to help you transform your home with premium wooden furniture.</p>
              <p>Your account has been successfully created and you can now:</p>
              <ul>
                <li>Browse our premium furniture collection</li>
                <li>Save your favorite items</li>
                <li>Track your orders</li>
                <li>Access exclusive member offers</li>
              </ul>
              <a href="${process.env.FRONTEND_URL}" class="button">Start Shopping</a>
              <p>If you have any questions, feel free to contact our support team.</p>
              <p>Best regards,<br>The WoodenStreet Team</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  getPasswordResetEmailTemplate(otp) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Password Reset - WoodenStreet</title>
          <style>
            .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
            .header { background: linear-gradient(135deg, #f59e0b, #ea580c); padding: 40px; text-align: center; }
            .header h1 { color: white; margin: 0; font-size: 32px; }
            .content { padding: 40px; background: #f8f9fa; }
            .otp { font-size: 32px; font-weight: bold; color: #f59e0b; text-align: center; background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border: 2px dashed #f59e0b; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🌳 WoodenStreet</h1>
            </div>
            <div class="content">
              <h2>Password Reset Request</h2>
              <p>We received a request to reset your password. Use the code below to reset your password:</p>
              <div class="otp">${otp}</div>
              <p><strong>This code expires in 10 minutes.</strong></p>
              <p>If you didn't request this password reset, please ignore this email or contact our support team if you have concerns.</p>
              <p>Best regards,<br>The WoodenStreet Team</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}

export default new EmailService();
