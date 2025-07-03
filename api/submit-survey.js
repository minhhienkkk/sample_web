import { formidable } from 'formidable';
import fs from 'fs'; // Import thư viện 'fs' để đọc file
import FormData from 'form-data'; // Import thư viện 'form-data'

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

    const imageFile = files.image?.[0];

    // Bắt buộc phải có ảnh trong chế độ này
    if (!imageFile) {
      return response.status(400).json({ error: 'Image file is required.' });
    }

    // Lấy thông tin từ các trường text
    const rating = fields.interface_rating?.[0] || 'Chưa đánh giá';
    const sources = fields.source?.join(', ') || 'Không chọn';
    const feedback = fields.feedback?.[0].trim() || 'Không có góp ý';
    
    // Định dạng nội dung tin nhắn để làm chú thích (caption) cho ảnh
    let caption = `🔔 *Kết quả khảo sát mới!*\n\n`;
    caption += `*1. Đánh giá:* ${rating}\n`;
    caption += `*2. Nguồn:* ${sources}\n`;
    caption += `*3. Góp ý:* ${feedback}`;

    // Tạo một FormData mới để gửi đến Telegram
    const telegramFormData = new FormData();
    telegramFormData.append('chat_id', process.env.CHAT_ID);
    telegramFormData.append('caption', caption);
    telegramFormData.append('parse_mode', 'Markdown');
    
    // Thêm file ảnh vào FormData
    // fs.createReadStream() hiệu quả hơn cho file lớn
    telegramFormData.append('photo', fs.createReadStream(imageFile.filepath), {
        filename: imageFile.originalFilename,
        contentType: imageFile.mimetype,
    });
    
    // Gửi yêu cầu đến API sendPhoto của Telegram
    const botToken = process.env.BOT_TOKEN;
    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendPhoto`;

    const telegramResponse = await fetch(telegramUrl, {
      method: 'POST',
      body: telegramFormData,
      // KHÔNG set header 'Content-Type', fetch sẽ tự động làm điều đó
    });

    const result = await telegramResponse.json();
    if (!result.ok) {
        // Ghi lại lỗi từ Telegram để debug
        console.error('Telegram API Error:', result);
        throw new Error('Failed to send photo to Telegram.');
    }

    response.status(200).json({ success: true });

  } catch (error) {
    console.error(error);
    response.status(500).json({ error: 'Server error processing the request.' });
  }
}