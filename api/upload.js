const TelegramBot = require('node-telegram-bot-api');
const formidable = require('formidable');

// Lấy thông tin từ Vercel Environment Variables
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN);

// Tắt chế độ polling vì chúng ta chỉ dùng bot để gửi tin nhắn
// bot.stopPolling();

export const config = {
    api: {
        bodyParser: false, // Tắt bodyParser mặc định của Next.js/Vercel
    },
};

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const form = formidable({});
        const [fields, files] = await form.parse(req);

        const photo = files.photo;

        if (!photo || photo.length === 0) {
            return res.status(400).json({ message: 'Không tìm thấy file ảnh.' });
        }

        const filePath = photo[0].filepath;
        const caption = `Ảnh mới được gửi lên lúc: ${new Date().toLocaleString('vi-VN')}`;

        // Gửi ảnh đến Telegram
        await bot.sendPhoto(TELEGRAM_CHAT_ID, filePath, { caption: caption });

        res.status(200).json({ message: 'Gửi ảnh thành công!' });
    } catch (error) {
        console.error('Lỗi khi gửi ảnh:', error);
        res.status(500).json({ message: 'Đã xảy ra lỗi phía server.' });
    }
}