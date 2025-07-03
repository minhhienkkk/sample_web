import { formidable } from 'formidable';
import { put } from '@vercel/blob';

// Tắt body parser mặc định của Vercel
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

    // Lấy thông tin từ các trường text
    const rating = fields.interface_rating?.[0] || 'Chưa đánh giá';
    const sources = fields.source?.join(', ') || 'Không chọn';
    const feedback = fields.feedback?.[0].trim() || 'Không có góp ý';
    
    let imageUrl = '';
    const imageFile = files.image?.[0];

    // Nếu có file ảnh, upload nó lên Vercel Blob
    if (imageFile) {
        const blob = await put(imageFile.originalFilename, imageFile, {
            access: 'public',
        });
        imageUrl = blob.url; // Lấy URL công khai của ảnh
    }

    // Định dạng lại tin nhắn
    let message = `🔔 *Có kết quả khảo sát mới!*\n\n`;
    message += `*1. Đánh giá giao diện:*\n    - ${rating}\n\n`;
    message += `*2. Nguồn biết đến web:*\n    - ${sources}\n\n`;
    message += `*3. Hình ảnh đính kèm:*\n    - ${imageUrl ? `[Xem ảnh](${imageUrl})` : 'Không có'}\n\n`;
    message += `*4. Góp ý thêm:*\n    - ${feedback}`;
    
    // Gửi tin nhắn về Telegram
    const botToken = process.env.BOT_TOKEN;
    const chatId = process.env.CHAT_ID;

    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown',
      }),
    });

    response.status(200).json({ success: true });

  } catch (error) {
    console.error(error);
    response.status(500).json({ error: 'Server error processing the form.' });
  }
}