document.getElementById('surveyForm').addEventListener('submit', async function (event) {
    // Ngăn form gửi đi theo cách truyền thống
    event.preventDefault();

    const submitButton = document.getElementById('submitButton');
    const status = document.getElementById('status');

    // Vô hiệu hóa nút gửi để tránh spam
    submitButton.disabled = true;
    status.textContent = 'Đang xử lý...';

    // === Thu thập dữ liệu ===
    const formData = new FormData(event.target);
    
    // 1. Lấy câu trả lời cho câu hỏi radio
    const rating = formData.get('interface_rating');

    // 2. Lấy các câu trả lời cho câu hỏi checkbox
    const sources = formData.getAll('source').join(', ') || 'Không chọn';

    // 3. Lấy góp ý
    const feedback = formData.get('feedback').trim() || 'Không có góp ý';

    // === Định dạng tin nhắn gửi về Telegram ===
    let message = `🔔 *Có kết quả khảo sát mới!*\n\n`;
    message += `*1. Đánh giá giao diện:*\n    - ${rating}\n\n`;
    message += `*2. Nguồn biết đến web:*\n    - ${sources}\n\n`;
    message += `*3. Góp ý thêm:*\n    - ${feedback}`;

    // === Gửi dữ liệu đến backend ===
    try {
        const response = await fetch('/api/submit-survey', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ surveyMessage: message }),
        });

        if (response.ok) {
            status.style.color = 'green';
            status.textContent = 'Gửi thành công! Cảm ơn bạn đã tham gia.';
            // Xóa form sau khi gửi thành công
            event.target.reset();
        } else {
            const result = await response.json();
            throw new Error(result.error || 'Lỗi không xác định.');
        }

    } catch (error) {
        status.style.color = 'red';
        status.textContent = `Lỗi: ${error.message}`;
    } finally {
        // Kích hoạt lại nút gửi sau khi xử lý xong
        submitButton.disabled = false;
    }
});