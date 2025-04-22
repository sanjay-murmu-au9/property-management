import nodemailer from 'nodemailer';
import logger from '../utils/logger';

export class EmailNotificationService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Create a transporter with SMTP configuration
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER || '',
        pass: process.env.EMAIL_PASSWORD || '',
      },
    });
  }

  /**
   * Send campaign registration confirmation email
   * @param to Recipient email address
   * @param firstName Recipient's first name
   * @param lastName Recipient's last name
   * @returns Promise that resolves with the result of the email sending operation
   */
  async sendCampaignRegistrationEmail(to: string, firstName: string, lastName: string): Promise<boolean> {
    try {
      const info = await this.transporter.sendMail({
        from: `${process.env.EMAIL_USER || 'Property Management'} <${process.env.EMAIL_FROM_ADDRESS || 'sanjaymurmu40@gmail.com'}>`,
        to,
        subject: 'Campaign Registration Confirmation',
        text: `
          Dear ${firstName} ${lastName},

          Thank you for registering for our campaign! Your details have been successfully submitted.

          Our team will review your application and get back to you soon.

          Best regards,
          Wake Up India Team
        `,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4a6f8a;">Campaign Registration Confirmation</h2>
            <p>Dear <strong>${firstName} ${lastName}</strong>,</p>
            <p>Thank you for registering for our campaign! Your details have been successfully submitted.</p>
            <p>Our team will connect with you in case Needed in the future.</p>
            <p>Best regards,<br/>Wake Up India Team</p>
          </div>
        `,
      });

      logger.info(`Campaign registration email sent to ${to}: ${info.messageId}`);
      console.log('From',process.env.EMAIL_USER,"To",to,"firstName",firstName,'lastName',lastName,":::::::::::::::::::>>>>")
      return true;
    } catch (error) {
      logger.error(`Failed to send campaign registration email to ${to}:`, error);
      return false;
    }
  }
}

// Create a singleton instance
export const emailNotificationService = new EmailNotificationService();