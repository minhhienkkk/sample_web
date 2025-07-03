// file: api/send-message.js

export default async function handler(request, response) {
  // Chỉ cho phép phương thức POST
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  const { message } = request.body; // Lấy tin nhắn từ yêu cầu gửi đến

  if (!message) {
    return response.status(400).json({ error: 'Message is required' });
  }

  const botToken = process.env.BOT_TOKEN;
  const chatId = process.env.CHAT_ID;

  if (!botToken || !chatId) {
    return response.status(500).json({ error: 'Bot configuration is missing' });
  }

  const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

  try {
    const telegramResponse = await fetch(telegramUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML', // Cho phép dùng thẻ HTML trong tin nhắn
      }),
    });

    const data = await telegramResponse.json();

    if (!data.ok) {
      // Nếu Telegram báo lỗi, trả về lỗi đó
      return response.status(500).json({ error: 'Failed to send message', details: data });
    }

    // Gửi phản hồi thành công về cho frontend
    response.status(200).json({ success: true, message: 'Message sent!' });
  } catch (error) {
    response.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}