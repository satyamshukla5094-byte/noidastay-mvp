import axios from "axios";

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK;

export type AlertType = "KYC" | "PAYMENT" | "SECURITY";

const ALERT_COLORS = {
  KYC: 0x3b82f6, // Blue
  PAYMENT: 0x10b981, // Green
  SECURITY: 0xef4444, // Red
};

export async function sendDiscordAlert(type: AlertType, title: string, description: string, fields?: { name: string; value: string; inline?: boolean }[]) {
  if (!DISCORD_WEBHOOK_URL) {
    console.warn("DISCORD_WEBHOOK is missing. Alert silenced:", title);
    return;
  }

  try {
    const embed = {
      title: `${getEmoji(type)} ${title}`,
      description,
      color: ALERT_COLORS[type],
      fields: fields || [],
      timestamp: new Date().toISOString(),
      footer: {
        text: "NoidaStay Security Shield",
      },
    };

    await axios.post(DISCORD_WEBHOOK_URL, {
      embeds: [embed],
    });
  } catch (error) {
    console.error("Failed to send Discord alert:", error);
  }
}

function getEmoji(type: AlertType) {
  switch (type) {
    case "KYC": return "🚨";
    case "PAYMENT": return "💰";
    case "SECURITY": return "⚠️";
  }
}
