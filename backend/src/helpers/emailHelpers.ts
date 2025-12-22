import nodemailer from "nodemailer";

export class EmailHelper {
  smtpEmail: string;
  smtpPassword: string;
  transporter: nodemailer.Transporter;

  constructor() {
    this.smtpEmail = Bun.env.SMTP_EMAIL!;
    this.smtpPassword = Bun.env.SMTP_PASSWORD!;
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: this.smtpEmail,
        pass: this.smtpPassword
      },
      pool: true
    });
  }

  async sendOtpEmail(toEmail: string, otp: string) {
    const htmlBody = `
            <h2>Xác thực email của bạn</h2>
            <p>Mã OTP của bạn là: <strong>${otp}</strong></p>
            <p>OTP của bạn sẽ hết hạn trong 10 phút</p>
        `;

    const mailOptions = {
      from: `"APP" <${this.smtpEmail}>`,
      toEmail,
      subject: "Xác thực email của bạn",
      text: `Mã OTP của bạn là: ${otp}`,
      html: htmlBody
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`OTP email sent to ${toEmail}`);
    } catch (error) {
      console.error("Error", error);
      throw new Error("Failed to send OTP email");
    }
  }
};