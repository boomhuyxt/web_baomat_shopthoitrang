// Chờ cho toàn bộ nội dung trang được tải xong
document.addEventListener('DOMContentLoaded', () => {
    
    // Lấy form đăng ký bằng ID
    const registerForm = document.getElementById('register-form');

    // Nếu không tìm thấy form, dừng lại để tránh lỗi
    if (!registerForm) {
        console.error('Không tìm thấy form với ID "register-form"');
        return;
    }

    // Thêm một trình nghe sự kiện 'submit' cho form
    registerForm.addEventListener('submit', async (event) => {
        // Ngăn form gửi theo cách truyền thống (tải lại trang)
        event.preventDefault();

        // Lấy giá trị từ các ô input
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirm_password = document.getElementById('confirm-password').value;
        const terms = document.getElementById('terms').checked;

        // Kiểm tra điều khoản (client-side)
        if (!terms) {
            alert('Bạn phải đồng ý với Điều khoản dịch vụ và Chính sách bảo mật.');
            return;
        }
        
        // Kiểm tra mật khẩu khớp (client-side)
        if (password !== confirm_password) {
            alert('Mật khẩu xác nhận không khớp. Vui lòng nhập lại.');
            return;
        }
        
        // Kiểm tra độ dài mật khẩu (client-side)
        if (password.length < 8) {
            alert('Mật khẩu phải có ít nhất 8 ký tự.');
            return;
        }

        // Chuẩn bị dữ liệu để gửi lên server
        const formData = {
            username,
            email,
            password,
            confirm_password
        };

        try {
            // Gửi yêu cầu POST đến API backend
            // server.js của bạn chạy ở port 3000
            const response = await fetch('http://localhost:3000/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            // Chuyển đổi phản hồi của server thành JSON
            const data = await response.json();

            if (response.ok) {
                // Nếu server trả về trạng thái OK (vd: 201)
                alert(data.message); // "Đăng ký tài khoản thành công!"
                
                // Đây là điều bạn muốn: chuyển về trang login.html
                window.location.href = 'login.html';
                
            } else {
                // Nếu server trả về lỗi (vd: 400, 409, 500)
                alert('Lỗi: ' + data.message);
            }

        } catch (error) {
            // Xử lý lỗi mạng hoặc nếu server không chạy
            console.error('Lỗi khi gửi yêu cầu:', error);
            alert('Không thể kết nối đến máy chủ. Vui lòng thử lại sau.');
        }
    });
});