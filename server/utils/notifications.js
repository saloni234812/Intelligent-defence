const nodemailer = require('nodemailer');
const { WebhookClient } = require('discord.js');

class NotificationUtils {
  constructor() {
    this.emailTransporter = null;
    this.discordWebhook = null;
    this.initializeServices();
  }

  /**
   * Initialize notification services
   */
  async initializeServices() {
    // Initialize email transporter
    if (process.env.SMTP_HOST) {
      this.emailTransporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
    }

    // Initialize Discord webhook
    if (process.env.DISCORD_WEBHOOK_URL) {
      this.discordWebhook = new WebhookClient({
        url: process.env.DISCORD_WEBHOOK_URL
      });
    }
  }

  /**
   * Send email notification
   * @param {Object} options - Email options
   * @param {string} options.to - Recipient email
   * @param {string} options.subject - Email subject
   * @param {string} options.text - Plain text content
   * @param {string} options.html - HTML content
   * @returns {Promise<boolean>} Success status
   */
  async sendEmail({ to, subject, text, html }) {
    if (!this.emailTransporter) {
      console.warn('Email service not configured');
      return false;
    }

    try {
      const info = await this.emailTransporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@aegis-system.com',
        to,
        subject,
        text,
        html
      });

      console.log('Email sent:', info.messageId);
      return true;
    } catch (error) {
      console.error('Email sending failed:', error);
      return false;
    }
  }

  /**
   * Send Discord notification
   * @param {Object} options - Discord message options
   * @param {string} options.content - Message content
   * @param {Object} options.embeds - Discord embeds
   * @returns {Promise<boolean>} Success status
   */
  async sendDiscord({ content, embeds }) {
    if (!this.discordWebhook) {
      console.warn('Discord webhook not configured');
      return false;
    }

    try {
      await this.discordWebhook.send({
        content,
        embeds
      });

      console.log('Discord notification sent');
      return true;
    } catch (error) {
      console.error('Discord notification failed:', error);
      return false;
    }
  }

  /**
   * Send alert notification
   * @param {Object} alert - Alert object
   * @param {Array} recipients - List of recipients
   * @returns {Promise<Object>} Notification results
   */
  async sendAlertNotification(alert, recipients = []) {
    const results = {
      email: false,
      discord: false
    };

    const alertMessage = this.formatAlertMessage(alert);

    // Send email notifications
    if (recipients.length > 0) {
      for (const recipient of recipients) {
        if (recipient.type === 'email') {
          results.email = await this.sendEmail({
            to: recipient.address,
            subject: `🚨 ${alert.alert_type} Alert: ${alert.title}`,
            text: alertMessage.text,
            html: alertMessage.html
          });
        }
      }
    }

    // Send Discord notification
    results.discord = await this.sendDiscord({
      content: `🚨 **${alert.alert_type} Alert**`,
      embeds: [{
        title: alert.title,
        description: alert.description,
        color: this.getAlertColor(alert.alert_type),
        fields: [
          { name: 'Location', value: alert.location, inline: true },
          { name: 'Confidence', value: `${alert.confidence}%`, inline: true },
          { name: 'Status', value: alert.status, inline: true },
          { name: 'Threat Type', value: alert.threat_type, inline: true },
          { name: 'Source', value: alert.source, inline: true }
        ],
        timestamp: new Date().toISOString()
      }]
    });

    return results;
  }

  /**
   * Format alert message for notifications
   * @param {Object} alert - Alert object
   * @returns {Object} Formatted message
   */
  formatAlertMessage(alert) {
    const text = `
ALERT: ${alert.alert_type}
Title: ${alert.title}
Description: ${alert.description}
Location: ${alert.location}
Confidence: ${alert.confidence}%
Status: ${alert.status}
Threat Type: ${alert.threat_type}
Source: ${alert.source}
Time: ${new Date(alert.created_at).toLocaleString()}
    `.trim();

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: ${this.getAlertColor(alert.alert_type)};">🚨 ${alert.alert_type} Alert</h2>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 5px;">
          <h3>${alert.title}</h3>
          <p><strong>Description:</strong> ${alert.description}</p>
          <p><strong>Location:</strong> ${alert.location}</p>
          <p><strong>Confidence:</strong> ${alert.confidence}%</p>
          <p><strong>Status:</strong> ${alert.status}</p>
          <p><strong>Threat Type:</strong> ${alert.threat_type}</p>
          <p><strong>Source:</strong> ${alert.source}</p>
          <p><strong>Time:</strong> ${new Date(alert.created_at).toLocaleString()}</p>
        </div>
      </div>
    `;

    return { text, html };
  }

  /**
   * Get color for alert type
   * @param {string} alertType - Alert type
   * @returns {string} Hex color code
   */
  getAlertColor(alertType) {
    const colors = {
      CRITICAL: '#FF0000',
      HIGH: '#FF8C00',
      MEDIUM: '#FFD700',
      LOW: '#00FF00'
    };
    return colors[alertType] || '#808080';
  }

  /**
   * Send system status notification
   * @param {string} status - System status
   * @param {string} message - Status message
   * @returns {Promise<Object>} Notification results
   */
  async sendSystemStatusNotification(status, message) {
    const results = {
      email: false,
      discord: false
    };

    const statusEmoji = status === 'ONLINE' ? '✅' : '❌';
    const statusColor = status === 'ONLINE' ? '#00FF00' : '#FF0000';

    // Send Discord notification
    results.discord = await this.sendDiscord({
      content: `${statusEmoji} **System Status Update**`,
      embeds: [{
        title: `System is ${status}`,
        description: message,
        color: statusColor,
        timestamp: new Date().toISOString()
      }]
    });

    return results;
  }
}

module.exports = NotificationUtils;


