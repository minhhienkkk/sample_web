const form = document.getElementById('surveyForm');
const fileInput = document.getElementById('imageUpload');
const fileNameDisplay = document.getElementById('fileName');
const submitButton = document.getElementById('submitButton');
const status = document.getElementById('status');

// Hiển thị tên file khi được chọn
fileInput.addEventListener('change', () => {
    fileNameDisplay.textContent = fileInput.files.length > 0 ? fileInput.files[0].name : '';
});


form.addEventListener('submit', async function (event) {
    event.preventDefault();

    submitButton.disabled = true;
    status.textContent = 'Đang xử lý, vui lòng chờ...';

    // Sử dụng FormData để gửi cả file và text
    const formData = new FormData(form);

    try {
        status.textContent = 'Đang tải ảnh lên...';
        
        const response = await fetch('/api/submit-survey', {
            method: 'POST',
            body: formData, // Gửi thẳng FormData, không cần set header Content-Type
        });

        const result = await response.json();

        if (response.ok) {
            status.style.color = 'green';
            status.textContent = 'Gửi thành công! Cảm ơn bạn đã tham gia.';
            form.reset();
            fileNameDisplay.textContent = '';
        } else {
            throw new Error(result.error || 'Lỗi không xác định.');
        }

    } catch (error) {
        status.style.color = 'red';
        status.textContent = `Lỗi: ${error.message}`;
    } finally {
        submitButton.disabled = false;
    }
});