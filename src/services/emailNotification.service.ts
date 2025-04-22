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
      const today = new Date();
      const formattedDate = today.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      const info = await this.transporter.sendMail({
        from: `"${process.env.EMAIL_FROM_NAME || 'Wake Up India Campaign'}" <${process.env.EMAIL_FROM_ADDRESS || 'noreply@example.com'}>`,
        to,
        subject: 'Thank You for Joining the Fight Against India\'s Unemployment Crisis',
        text: `
          Dear ${firstName} ${lastName},

          Thank you for joining our "India's Jobs Market Is Collapsing" campaign on ${formattedDate}.

          THE CRISIS IN NUMBERS:
          • 5.2 million workers have lost jobs in recent years
          • 56% youth unemployment rate in certain sectors
          • 83% faced salary cuts or delayed payments
          • 72% are unable to pay EMIs and loan installments

          YOUR VOICE MATTERS:
          By registering with us, you've taken an important step toward strengthening our petition to the Indian government. We're advocating for:
          1. Expanded unemployment benefits
          2. Accessible skill development programs
          3. New job creation initiatives

          NEXT STEPS:
          • Your registration has been recorded
          • We'll keep you updated on petition milestones
          • You'll receive information about upcoming advocacy events

          Together, we can ensure the government addresses this critical issue affecting millions of Indian families.

          Thank you for standing with us,
          Wake Up India Team
        `,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <!-- Header with campaign branding -->
            <div style="background-color: #FF9933; padding: 20px; text-align: center; border-radius: 5px 5px 0 0;">
              <h1 style="color: #ffffff; margin: 0; padding: 0;">Thank You for Joining the Fight</h1>
              <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">India's Jobs Crisis Campaign</p>
            </div>

            <!-- Main content -->
            <div style="padding: 20px;">
              <p>Dear <strong>${firstName} ${lastName}</strong>,</p>

              <p>Thank you for registering with our <strong>"India's Jobs Market Is Collapsing"</strong> campaign on <strong>${formattedDate}</strong>. Your support is crucial in our fight against the unemployment crisis affecting millions of Indian families.</p>

              <!-- Crisis statistics in highlighted box - FIXED FOR MOBILE -->
              <div style="background-color: #f8f8f8; border-left: 4px solid #FF9933; padding: 15px; margin: 20px 0;">
                <h3 style="color: #333; margin-top: 0;">THE CRISIS IN NUMBERS:</h3>
                <table cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 0; padding: 0;">
                  <tr>
                    <td width="50%" style="vertical-align: top; padding-bottom: 15px; padding-right: 5px;">
                      <p style="font-size: 24px; font-weight: bold; color: #e74c3c; margin: 0;">5.2 million</p>
                      <p style="margin: 5px 0 0 0;">workers have lost jobs</p>
                    </td>
                    <td width="50%" style="vertical-align: top; padding-bottom: 15px; padding-left: 5px;">
                      <p style="font-size: 24px; font-weight: bold; color: #e74c3c; margin: 0;">56%</p>
                      <p style="margin: 5px 0 0 0;">youth unemployment rate</p>
                    </td>
                  </tr>
                  <tr>
                    <td width="50%" style="vertical-align: top; padding-right: 5px;">
                      <p style="font-size: 24px; font-weight: bold; color: #e74c3c; margin: 0;">83%</p>
                      <p style="margin: 5px 0 0 0;">faced salary cuts</p>
                    </td>
                    <td width="50%" style="vertical-align: top; padding-left: 5px;">
                      <p style="font-size: 24px; font-weight: bold; color: #e74c3c; margin: 0;">72%</p>
                      <p style="margin: 5px 0 0 0;">unable to pay EMIs</p>
                    </td>
                  </tr>
                </table>
              </div>

              <h3 style="color: #138808; border-bottom: 1px solid #e0e0e0; padding-bottom: 10px;">YOUR VOICE MATTERS</h3>
              <p>By registering with us, you've taken an important step toward strengthening our petition to the Indian government. Your participation helps amplify our collective voice.</p>

              <div style="background-color: #f2f9ff; padding: 15px; border-radius: 4px; border-left: 4px solid #138808; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #333;">WE'RE ADVOCATING FOR:</h3>
                <ol style="color: #34495e; padding-left: 20px;">
                  <li style="margin-bottom: 10px;"><strong>Expanded unemployment benefits</strong> to support those who've lost their livelihoods</li>
                  <li style="margin-bottom: 10px;"><strong>Accessible skill development programs</strong> to help workers adapt to changing job markets</li>
                  <li style="margin-bottom: 10px;"><strong>New job creation initiatives</strong> focused on sustainable growth sectors</li>
                </ol>
              </div>

              <h3 style="color: #000080; border-bottom: 1px solid #e0e0e0; padding-bottom: 10px;">NEXT STEPS:</h3>
              <ul style="color: #34495e; padding-left: 20px;">
                <li style="margin-bottom: 10px;">Your registration has been successfully recorded</li>
                <li style="margin-bottom: 10px;">We'll keep you updated on petition milestones and campaign progress</li>
                <li style="margin-bottom: 10px;">You'll receive information about upcoming advocacy events and opportunities</li>
              </ul>

              <p style="margin-top: 20px;">Together, we can ensure the government addresses this critical issue affecting millions of Indian families.</p>
            </div>

            <!-- Footer with call to action -->
            <div style="background-color: #f8f8f8; padding: 20px; text-align: center; border-radius: 0 0 5px 5px;">
              <p style="margin-bottom: 15px; font-weight: bold;">Share our campaign with others affected by the jobs crisis:</p>
              <div style="margin-bottom: 20px;">
                <!-- Social media placeholder buttons -->
                <a href="#" style="display: inline-block; margin: 0 10px; color: #3b5998; text-decoration: none; font-weight: bold;">Facebook</a>
                <a href="#" style="display: inline-block; margin: 0 10px; color: #1da1f2; text-decoration: none; font-weight: bold;">Twitter</a>
                <a href="#" style="display: inline-block; margin: 0 10px; color: #25D366; text-decoration: none; font-weight: bold;">WhatsApp</a>
              </div>
              <p>Thank you for standing with us,<br/><strong>Wake Up India Team</strong></p>
              <p style="margin-top: 20px; font-size: 12px; color: #95a5a6;">© ${today.getFullYear()} Wake Up India Campaign. All rights reserved.</p>
            </div>
          </div>
        `,
      });

      logger.info(`Campaign registration email sent to ${to}: ${info.messageId}`);
      return true;
    } catch (error) {
      logger.error(`Failed to send campaign registration email to ${to}:, error`);
      return false;
    }
  }
}

// Create a singleton instance
export const emailNotificationService = new EmailNotificationService();