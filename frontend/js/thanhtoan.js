// thanhtoan.js - Load selected product into checkout page
const serverUrl = 'http://localhost:3000';

const formatPrice = (price) => {
    try {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    } catch (e) {
        return price + ' VND';
    }
};

function buildImageUrl(product) {
    if (!product || !product.image_url) return 'https://via.placeholder.com/200?text=No+Image';
    let p = String(product.image_url).trim();
    if (p.startsWith('http')) return p;
    p = p.replace(/^\/+/, '');
    p = p.replace(/^images?\//i, '');
    p = p.replace(/\\/g, '/');
    return `${serverUrl}/images/${p}`;
}

async function loadCheckout() {
    const errorBox = document.getElementById('checkout-error');
    const content = document.getElementById('checkout-content');

    // === CODE HIỂN THỊ USERNAME ĐƯỢC THÊM LẠI VÀO ĐÂY ===
    try {
        const loggedInUsername = localStorage.getItem('username');
        if (loggedInUsername) {
            // Cập nhật tên người dùng trên giao diện
            const namePhoneEl = document.querySelector('.address-name-phone');
            if (namePhoneEl) {
                // Giả sử định dạng là "Tên | Số điện thoại"
                const parts = namePhoneEl.textContent.split(' | ');
                const phone = parts[1] || 'Cập nhật SĐT'; // Giữ lại SĐT nếu có
                namePhoneEl.textContent = `${loggedInUsername} | ${phone}`;
            }
        }
    } catch (e) {
        console.warn('Không thể đọc username từ localStorage', e);
    }
    // === KẾT THÚC CODE USERNAME ===

    // Get query params
    const params = new URLSearchParams(window.location.search);
    let id = params.get('id');
    let qty = parseInt(params.get('qty') || '1', 10);

    // If not in URL, try sessionStorage
    if (!id) {
        try {
            const stored = sessionStorage.getItem('checkoutSelection');
            if (stored) {
                const sel = JSON.parse(stored);
                id = sel.id;
                qty = sel.qty || qty;
            }
        } catch (e) {
            console.warn('Không thể đọc sessionStorage', e);
        }
    }

    if (!id) {
        errorBox.style.display = 'block';
        errorBox.textContent = 'Không tìm thấy sản phẩm để thanh toán.';
        return;
    }

    // Fetch product details from backend
    try {
        const token = localStorage.getItem('authToken');
        const res = await fetch(`${serverUrl}/products/${encodeURIComponent(id)}`, {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });

        if (!res.ok) {
            const contentType = res.headers.get('content-type') || '';
            let errorText = `Lỗi HTTP ${res.status}: ${res.statusText}`;

            // If the server sends a JSON error, use its message
            if (contentType.includes('application/json')) {
                const errorData = await res.json();
                errorText = errorData.details || errorData.message || errorData.error || 'Lỗi không xác định từ server.';
            } else {
                // If the server sends HTML or plain text, use that as the error
                errorText = await res.text();
                // Check if it's a full HTML page to avoid showing raw HTML in alerts
                if (errorText.trim().toLowerCase().startsWith('<!doctype')) {
                    errorText = `Lỗi server: Phản hồi không hợp lệ (HTML được trả về).`;
                }
            }
            throw new Error(errorText);
        }

        const product = await res.json();

        // Populate UI
        document.getElementById('checkout-image').src = buildImageUrl(product);
        document.getElementById('checkout-name').textContent = product.name || product.ID_Products;
        document.getElementById('checkout-id').textContent = product.ID_Products;
        document.getElementById('checkout-category').textContent = product.name_Categories || '';
        document.getElementById('checkout-description').textContent = product.description || '';
        document.getElementById('checkout-size').textContent = product.size || '';
        document.getElementById('checkout-color').textContent = product.color || '';
        document.getElementById('checkout-price').textContent = formatPrice(product.price || 0);
        const qtyInput = document.getElementById('checkout-qty');
        qtyInput.value = qty;
        qtyInput.max = product.stock_quantity || 9999;

        // Hiển thị số lượng tồn kho
        if (product.stock_quantity) {
            const stockEl = document.createElement('p');
            stockEl.className = 'product-variant';
            stockEl.innerHTML = `<strong>Còn lại:</strong> <span>${product.stock_quantity} sản phẩm</span>`;
            document.querySelector('.product-details').appendChild(stockEl);
        }

        const totalEl = document.getElementById('checkout-total');
        const insuranceCheckbox = document.getElementById('insurance-checkbox');
        const insuranceFee = 10000; // VND
        const shippingFee = 25000; // VND

    let lastComputed = { subtotal: 0, insuranceAmt: 0, shippingFee: shippingFee, totalPayment: 0 };

    function computeAndRenderTotals(qtyValue) {
            const unit = parseFloat(product.price || 0);
            const qtyVal = parseInt(qtyValue || 1, 10);
            const subtotal = unit * qtyVal;

            // product row subtotal
            totalEl.textContent = formatPrice(subtotal);

            const insuranceAmt = insuranceCheckbox.checked ? insuranceFee : 0;
            const totalPayment = subtotal + insuranceAmt + shippingFee;

            // Update summary values
            document.getElementById('summary-subtotal-value').textContent = formatPrice(subtotal);
            document.getElementById('shipping-fee').textContent = formatPrice(shippingFee);
            document.getElementById('insurance-fee').textContent = formatPrice(insuranceAmt);
            document.getElementById('final-total-payment').textContent = formatPrice(totalPayment);

            lastComputed = { subtotal, insuranceAmt, shippingFee, totalPayment };
        }

        // initial render
        computeAndRenderTotals(qty);

        // Show content
        errorBox.style.display = 'none';
        content.style.display = 'block';

        // Update total when qty changes
        qtyInput.addEventListener('change', (e) => {
            let v = parseInt(e.target.value || '1', 10);
            if (v < 1) v = 1;
            if (v > (product.stock_quantity || 9999)) v = product.stock_quantity || 9999;
            e.target.value = v;
            computeAndRenderTotals(v);
        });

        if (insuranceCheckbox) {
            insuranceCheckbox.addEventListener('change', () => {
                computeAndRenderTotals(parseInt(qtyInput.value || '1', 10));
            });
        }

        // Confirm and pay
        const btnPay = document.querySelector('.btn-place-order');
        if (btnPay) {
            btnPay.addEventListener('click', async () => {
                btnPay.disabled = true;
                btnPay.textContent = 'ĐANG XỬ LÝ...';

                // 1. Get customer info (assuming it's filled in the form)
                // Lưu ý: Tên sẽ được server ghi đè bằng username trong token
                const customerInfo = {
                    name: document.querySelector('.address-name-phone')?.textContent.split(' | ')[0] || 'Khách Hàng Mặc Định',
                    phone: document.querySelector('.address-name-phone')?.textContent.split(' | ')[1] || '0123456789',
                    address: document.querySelector('.address-detail')?.textContent || '123 Đường ABC, Quận 1, TP. HCM'
                };

                // 2. Prepare order data
                const orderData = {
                    items: [{
                        id: product.ID_Products,
                        quantity: parseInt(qtyInput.value, 10),
                        price: product.price
                    }],
                    totalAmount: lastComputed.totalPayment,
                    customerInfo: customerInfo
                };

                // 3. Send to backend
                try {
                    const token = localStorage.getItem('authToken');
                    const response = await fetch(`${serverUrl}/api/orders`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify(orderData)
                    });

                    const result = await response.json();

                    if (!response.ok) {
                        throw new Error(result.details || result.message || 'Đặt hàng thất bại');
                    }

                    // 4. Handle success: Show modal
                    const successModal = document.getElementById('success-modal');
                    const modalOrderId = document.getElementById('modal-order-id');
                    const modalOkBtn = document.getElementById('modal-ok-btn');

                    if (successModal && modalOrderId && modalOkBtn) {
                        modalOrderId.textContent = result.orderId;
                        successModal.style.display = 'flex';
                        setTimeout(() => {
                            successModal.classList.add('visible');
                        }, 10);

                        modalOkBtn.onclick = () => {
                            sessionStorage.removeItem('checkoutSelection');
                            window.location.href = 'index.html';
                        };
                    } else {
                        // Fallback if modal elements are not found
                        alert(`Đặt hàng thành công! Mã đơn hàng của bạn là: ${result.orderId}`);
                        sessionStorage.removeItem('checkoutSelection');
                        window.location.href = 'index.html';
                    }

                } catch (error) {
                    console.error('Lỗi khi đặt hàng:', error);
                    alert(`Lỗi: ${error.message}`);
                    btnPay.disabled = false;
                    btnPay.textContent = 'ĐẶT HÀNG';
                }
            });
        }

    } catch (err) {
        console.error('Lỗi khi nạp checkout:', err);
        errorBox.style.display = 'block';
        errorBox.textContent = err.message || 'Lỗi khi tải dữ liệu thanh toán.';
    }
}

// Init
document.addEventListener('DOMContentLoaded', loadCheckout);