// Thực hiện kiểm tra khi tải trang
document.addEventListener('DOMContentLoaded', () => {

    // Lấy tất cả thông tin cần thiết từ localStorage và DOM
    const token = localStorage.getItem('authToken');
    const userBtn = document.getElementById('user-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const adminBtn = document.getElementById('admin-link-btn');
    const isAdmin = localStorage.getItem('isAdmin');

    const isAuthPage = window.location.pathname.includes('login.html') || window.location.pathname.includes('GDDK.html');

    if (token && isAuthPage) {
        window.location.href = 'index.html';
        return; // Dừng script
    }
    if (!token && !isAuthPage && !window.location.pathname.includes('admin.html')) {
        window.location.href = 'login.html';
        return; // Dừng script
    }

    // --- 2. TÍNH NĂNG MỚI: XỬ LÝ NÚT ĐĂNG XUẤT ---
    if (userBtn && logoutBtn) {
        // Bấm vào hình người để hiện/ẩn nút đăng xuất
        function checkLoginPage() {
            if (window.location.pathname.includes('login.html')) {
                const token = localStorage.getItem('authToken');
                if (token) {
                    window.location.href = 'index.html';
                }
            }
        }

        // Hàm đăng xuất
        function logout() {
            localStorage.removeItem('authToken');
            window.location.href = 'login.html';
        }
      
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('authToken');
            localStorage.removeItem('username');
            localStorage.removeItem('isAdmin'); // Xóa cả quyền admin
            window.location.href = 'login.html';
        });
    }

    // Bấm ra ngoài để ẩn nút đăng xuất
    document.addEventListener('click', (e) => {
        // Kiểm tra xem nút logout có tồn tại không và người dùng có bấm ra ngoài không
        if (logoutBtn && userBtn && !userBtn.contains(e.target) && !logoutBtn.contains(e.target)) {
            logoutBtn.style.display = 'none';
        }
    });

    if (isAdmin === 'true' && adminBtn) {
        adminBtn.style.display = 'inline-block'; // Hiện nút admin lên
    }
});