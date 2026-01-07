import { EventData } from "./event-monitor";

interface WebhookConfig {
  url: string;
  name: string;
  headers?: Record<string, string>;
}

interface NotificationPayload {
  title: string;
  message: string;
  severity: "info" | "warning" | "error" | "critical";
  timestamp: number;
  event?: EventData;
  metadata?: any;
}

class NotificationService {
  private webhooks: WebhookConfig[] = [];
  private rateLimits = new Map<string, number>();

  addWebhook(config: WebhookConfig): void {
    this.webhooks.push(config);
    console.log(`📡 Added webhook: ${config.name}`);
  }

  async sendNotification(payload: NotificationPayload): Promise<void> {
    // Rate limiting: max 1 notification per minute per type
    const key = `${payload.title}_${payload.severity}`;
    const now = Date.now();
    const lastSent = this.rateLimits.get(key) || 0;
    
    if (now - lastSent < 60000) { // 1 minute
      return; // Skip if sent recently
    }
    
    this.rateLimits.set(key, now);

    for (const webhook of this.webhooks) {
      try {
        await this.sendToWebhook(webhook, payload);
      } catch (error) {
        console.error(`❌ Failed to send to ${webhook.name}:`, error);
      }
    }
  }

  private async sendToWebhook(webhook: WebhookConfig, payload: NotificationPayload): Promise<void> {
    const response = await fetch(webhook.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...webhook.headers
      },
      body: JSON.stringify(this.formatPayload(webhook.name, payload))
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    console.log(`✅ Notification sent to ${webhook.name}`);
  }

  private formatPayload(webhookType: string, payload: NotificationPayload): any {
    switch (webhookType.toLowerCase()) {
      case 'discord':
        return this.formatDiscord(payload);
      case 'slack':
        return this.formatSlack(payload);
      case 'telegram':
        return this.formatTelegram(payload);
      default:
        return payload; // Generic format
    }
  }

  private formatDiscord(payload: NotificationPayload): any {
    const color = {
      info: 0x3498db,      // Blue
      warning: 0xf39c12,   // Orange
      error: 0xe74c3c,     // Red
      critical: 0x8e44ad   // Purple
    }[payload.severity];

    return {
      embeds: [{
        title: payload.title,
        description: payload.message,
        color: color,
        timestamp: new Date(payload.timestamp).toISOString(),
        fields: payload.event ? [
          { name: "Contract", value: payload.event.contract, inline: true },
          { name: "Event", value: payload.event.event, inline: true },
          { name: "Block", value: payload.event.blockNumber.toString(), inline: true },
          { name: "Transaction", value: `[View](https://etherscan.io/tx/${payload.event.transactionHash})`, inline: false }
        ] : []
      }]
    };
  }

  private formatSlack(payload: NotificationPayload): any {
    const emoji = {
      info: ":information_source:",
      warning: ":warning:",
      error: ":x:",
      critical: ":rotating_light:"
    }[payload.severity];

    return {
      text: `${emoji} ${payload.title}`,
      attachments: [{
        color: payload.severity === 'error' || payload.severity === 'critical' ? 'danger' : 'good',
        fields: [
          { title: "Message", value: payload.message, short: false },
          ...(payload.event ? [
            { title: "Contract", value: payload.event.contract, short: true },
            { title: "Event", value: payload.event.event, short: true }
          ] : [])
        ],
        ts: Math.floor(payload.timestamp / 1000)
      }]
    };
  }

  private formatTelegram(payload: NotificationPayload): any {
    const emoji = {
      info: "ℹ️",
      warning: "⚠️", 
      error: "❌",
      critical: "🚨"
    }[payload.severity];

    let message = `${emoji} *${payload.title}*\n\n${payload.message}`;
    
    if (payload.event) {
      message += `\n\n📋 *Details:*\n`;
      message += `Contract: ${payload.event.contract}\n`;
      message += `Event: ${payload.event.event}\n`;
      message += `Block: ${payload.event.blockNumber}`;
    }

    return {
      text: message,
      parse_mode: "Markdown"
    };
  }
}

// Predefined notification templates
class AlertTemplates {
  static largeTransfer(amount: string, from: string, to: string): NotificationPayload {
    return {
      title: "Large Transfer Detected",
      message: `Transfer of ${amount} tokens from ${from} to ${to}`,
      severity: "warning",
      timestamp: Date.now()
    };
  }

  static contractPaused(contract: string): NotificationPayload {
    return {
      title: "Contract Paused",
      message: `${contract} has been paused`,
      severity: "critical",
      timestamp: Date.now()
    };
  }

  static highActivity(eventType: string, count: number): NotificationPayload {
    return {
      title: "High Activity Alert",
      message: `${eventType} occurred ${count} times in the last minute`,
      severity: "warning",
      timestamp: Date.now()
    };
  }

  static rewardDistributed(recipient: string, assetType: number): NotificationPayload {
    return {
      title: "Reward Distributed",
      message: `Reward (type ${assetType}) distributed to ${recipient}`,
      severity: "info",
      timestamp: Date.now()
    };
  }

  static emergencyAction(action: string, executor: string): NotificationPayload {
    return {
      title: "Emergency Action",
      message: `${action} executed by ${executor}`,
      severity: "critical",
      timestamp: Date.now()
    };
  }
}

// Configuration helper
class NotificationConfig {
  static setupProduction(service: NotificationService): void {
    // Discord webhook
    if (process.env.DISCORD_WEBHOOK_URL) {
      service.addWebhook({
        name: "discord",
        url: process.env.DISCORD_WEBHOOK_URL
      });
    }

    // Slack webhook
    if (process.env.SLACK_WEBHOOK_URL) {
      service.addWebhook({
        name: "slack",
        url: process.env.SLACK_WEBHOOK_URL
      });
    }

    // Telegram bot
    if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
      service.addWebhook({
        name: "telegram",
        url: `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
        headers: {
          "chat_id": process.env.TELEGRAM_CHAT_ID
        }
      });
    }

    // Custom webhook
    if (process.env.CUSTOM_WEBHOOK_URL) {
      service.addWebhook({
        name: "custom",
        url: process.env.CUSTOM_WEBHOOK_URL,
        headers: {
          "Authorization": `Bearer ${process.env.WEBHOOK_TOKEN || ""}`
        }
      });
    }
  }

  static setupDevelopment(service: NotificationService): void {
    // Local webhook for testing
    service.addWebhook({
      name: "local",
      url: "http://localhost:3001/webhook"
    });
  }
}

export { NotificationService, AlertTemplates, NotificationConfig, NotificationPayload };