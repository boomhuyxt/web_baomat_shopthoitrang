// Chạy code khi toàn bộ nội dung HTML đã được tải xong
document.addEventListener("DOMContentLoaded", () => {
  // Lấy các element quan trọng từ DOM
  const orderTableBody = document.querySelector("table tbody");
  const statusFilter = document.getElementById("statusFilter");
  const searchForm = document.querySelector(".search-box");
  const searchInput = document.querySelector(".search-input");

  /**
   * Hàm định dạng tiền tệ sang VND
   * @param {number} amount - Số tiền
   * @returns {string} - Số tiền đã định dạng (ví dụ: 100.000 ₫)
   */
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  /**
   * Hàm định dạng ngày giờ
   * @param {string} dateString - Chuỗi ngày giờ từ ISO (CSDL)
   * @returns {string} - Ngày giờ đã định dạng (ví dụ: 01/10/2025, 14:30)
   */
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleString("vi-VN", options);
  };

  /**
   * Hàm hiển thị danh sách đơn hàng lên bảng (table)
   * @param {Array} orders - Mảng các đối tượng đơn hàng
   */
  const renderOrders = (orders) => {
    // Xóa nội dung cũ (dòng "Đang tải..." hoặc "Chưa có đơn hàng")
    orderTableBody.innerHTML = "";

    // Nếu không có đơn hàng
    if (!orders || orders.length === 0) {
      orderTableBody.innerHTML = `
        <tr class="empty-row">
          <td colspan="6">Không tìm thấy đơn hàng nào.</td> 
        </tr>
      `;
      return;
    }

    // Lặp qua từng đơn hàng và tạo hàng (row) mới
    orders.forEach((order) => {
      const tr = document.createElement("tr");

      // Dùng giá trị dự phòng 'N/A' nếu dữ liệu null
      const orderStatus = order.order_status || "pending";
      const orderStatusTextMap = {
        pending: "Chờ xác nhận",
        shipping: "Đang giao",
        done: "Hoàn thành",
      };

      // --- SỬA LỖI Ở ĐÂY ---
      // Xóa 2 cột payment_method và payment_status
      tr.innerHTML = `
        <td>#${order.order_id || "N/A"}</td>
        <td>${formatDate(order.order_date)}</td>
        <td>${order.customer_name || "N/A"}</td>
        <td class="product-list">${order.products_list || "N/A"}</td>
        <td>${
          order.total_amount ? formatCurrency(order.total_amount) : "N/A"
        }</td>
        <td>
          <span class="status ${orderStatus}">
            ${orderStatusTextMap[orderStatus] || "Không xác định"}
          </span>
        </td>
      `;
      // --- KẾT THÚC SỬA LỖI ---
      orderTableBody.appendChild(tr);
    });
  };

  /**
   * Hàm gọi API để lấy danh sách đơn hàng từ server
   * @param {string} status - Trạng thái cần lọc (lấy từ dropdown)
   * @param {string} searchTerm - Từ khóa tìm kiếm (chưa dùng)
   */
  const fetchOrders = async (status = "", searchTerm = "") => {
    // --- SỬA LỖI TẠI ĐÂY ---
    // 1. Lấy đúng tên token là "authToken" (giống auth.js)
    const token = localStorage.getItem("authToken");

    // 2. Lấy trạng thái admin (giống auth.js)
    const isAdmin = localStorage.getItem("isAdmin");

    // 3. Kiểm tra xem có token HOẶC có phải là admin không
    if (!token || isAdmin !== "true") {
      alert("Bạn chưa đăng nhập hoặc không có quyền Admin!");

      // Chuyển hướng về trang đăng nhập cho chắc chắn
      window.location.href = "login.html";
      return;
    }
    // --- KẾT THÚC SỬA LỖI ---

    // Hiển thị trạng thái đang tải...
    orderTableBody.innerHTML = `
      <tr class="empty-row">
        <td colspan="6">Đang tải dữ liệu...</td>
      </tr>
    `;

    try {
      // Xây dựng URL API với query param
      const apiUrl = `http://localhost:3000/api/admin/orders?status=${status}`;

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Gửi token xác thực
        },
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          alert("Phiên đăng nhập hết hạn hoặc bạn không có quyền.");
          window.location.href = "login.html";
        }
        throw new Error(`Lỗi HTTP: ${response.status}`);
      }

      const orders = await response.json();
      renderOrders(orders); // Gọi hàm render để hiển thị
    } catch (error) {
      console.error("Lỗi khi tải đơn hàng:", error);
      orderTableBody.innerHTML = `
        <tr class="empty-row">
          <td colspan="6">Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại.</td>
        </tr>
      `;
    }
  };

  // --- GẮN KẾT SỰ KIỆN ---

  // 1. Lắng nghe sự kiện thay đổi của bộ lọc trạng thái
  statusFilter.addEventListener("change", () => {
    const selectedStatus = statusFilter.value;
    const currentSearch = searchInput.value;
    fetchOrders(selectedStatus, currentSearch);
  });

  // 2. Lắng nghe sự kiện submit của form tìm kiếm
  searchForm.addEventListener("submit", (e) => {
    e.preventDefault(); // Ngăn form tải lại trang
    const selectedStatus = statusFilter.value;
    const currentSearch = searchInput.value;
    console.log(
      `Tìm kiếm cho: "${currentSearch}", Trạng thái: "${selectedStatus}"`
    );
    // TODO: Hiện tại API server (từ câu trước) chưa hỗ trợ tìm kiếm.
    // Khi hỗ trợ, bạn chỉ cần gọi lại fetchOrders(selectedStatus, currentSearch)
    alert("Chức năng tìm kiếm chưa được kết nối với API!");
  });

  // --- KHỞI CHẠY ---
  // Tải danh sách tất cả đơn hàng (status = "") ngay khi trang được mở
  fetchOrders();
});