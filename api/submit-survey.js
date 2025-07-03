// file: api/submit-survey.js

export default async function handler(request, response) {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    const { surveyMessage } = request.body;

    if (!surveyMessage) {
        return response.status(400).json({ error: 'Survey message is required' });
    }

    const botToken = process.env.BOT_TOKEN;
    const chatId = process.env.CHAT_ID;

    if (!botToken || !chatId) {
        return response.status(500).json({ error: 'Bot configuration is missing on the server' });
    }

    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

    try {
        await fetch(telegramUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: surveyMessage,
                parse_mode: 'Markdown', // Dùng Markdown để tin nhắn đẹp hơn (chữ đậm, nghiêng)
            }),
        });

        response.status(200).json({ success: true });
    } catch (error) {
        response.status(500).json({ error: 'Failed to send message to Telegram' });
    }
}