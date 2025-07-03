import { formidable } from 'formidable';
import fs from 'fs';
import FormData from 'form-data';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const form = formidable({});
    const [fields, files] = await form.parse(request);

    const imageFile = files.image?.[0];

    if (!imageFile) {
      return response.status(400).json({ error: 'Image file is required.' });
    }

    const rating = fields.interface_rating?.[0] || 'Chưa đánh giá';
    const sources = fields.source?.join(', ') || 'Không chọn';
    const feedback = fields.feedback?.[0].trim() || 'Không có góp ý';
    
    let caption = `🔔 *Kết quả khảo sát mới!*\n\n`;
    caption += `*1. Đánh giá:* ${rating}\n`;
    caption += `*2. Nguồn:* ${sources}\n`;
    caption += `*3. Góp ý:* ${feedback}`;

    const telegramFormData = new FormData();
    telegramFormData.append('chat_id', process.env.CHAT_ID);
    telegramFormData.append('caption', caption);
    telegramFormData.append('parse_mode', 'Markdown');
    telegramFormData.append('photo', fs.createReadStream(imageFile.filepath), {
        filename: imageFile.originalFilename,
        contentType: imageFile.mimetype,
    });
    
    const botToken = process.env.BOT_TOKEN;
    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendPhoto`;

    // === THAY ĐỔI QUAN TRỌNG Ở ĐÂY ===
    const telegramResponse = await fetch(telegramUrl, {
      method: 'POST',
      body: telegramFormData,
      // Lấy header trực tiếp từ thư viện form-data
      headers: telegramFormData.getHeaders(), 
    });
    // ===================================

    const result = await telegramResponse.json();
    if (!result.ok) {
        console.error('Telegram API Error:', result);
        throw new Error('Failed to send photo to Telegram.');
    }

    response.status(200).json({ success: true });

  } catch (error) {
    console.error(error);
    response.status(500).json({ error: 'Server error processing the request.' });
  }
}