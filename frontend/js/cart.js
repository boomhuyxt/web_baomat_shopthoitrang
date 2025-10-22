// js/cart.js
const serverUrl = 'http://localhost:3000';

/**
 * Lấy giỏ hàng từ localStorage.
 * @returns {Array} Mảng các sản phẩm trong giỏ hàng.
 */
function getCart() {
    const cartJson = localStorage.getItem('cart');
    return cartJson ? JSON.parse(cartJson) : [];
}

/**
 * Lưu giỏ hàng vào localStorage và cập nhật huy hiệu số lượng.
 * @param {Array} cart Mảng giỏ hàng cần lưu.
 */
function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartBadge();
}

/**
 * Thêm một sản phẩm vào giỏ hàng.
 * @param {string} productId ID sản phẩm.
 * @param {string} name Tên sản phẩm.
 * @param {number} price Giá sản phẩm.
 * @param {string} image URL hình ảnh.
 * @param {number} quantity Số lượng.
 * @param {string} size Kích thước.
 */
function addToCart(productId, name, price, image, quantity = 1, size = 'M') {
    const cart = getCart();
    // Tạo một ID duy nhất cho mỗi mục trong giỏ hàng, kết hợp ID sản phẩm và size
    const cartItemId = `${productId}-${size}`;
    const existingItemIndex = cart.findIndex(item => item.cartItemId === cartItemId);

    if (existingItemIndex > -1) {
        // Nếu sản phẩm với size đã tồn tại, chỉ tăng số lượng
        cart[existingItemIndex].quantity += quantity;
    } else {
        // Nếu chưa có, thêm mới vào giỏ hàng
        cart.push({ 
            cartItemId, 
            id: productId, 
            name, 
            price, 
            image, 
            quantity, 
            size,
            selected: true // Mặc định chọn sản phẩm khi thêm vào
        });
    }

    saveCart(cart);
    alert('Đã thêm sản phẩm vào giỏ hàng!');
}

/**
 * Cập nhật số lượng hiển thị trên biểu tượng giỏ hàng.
 */
function updateCartBadge() {
    const cart = getCart();
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    // Áp dụng cho tất cả các trang có huy hiệu giỏ hàng
    const cartBadges = document.querySelectorAll('.cart-badge');
    cartBadges.forEach(badge => {
        if (badge) {
            badge.textContent = itemCount;
            badge.style.display = itemCount > 0 ? 'inline-block' : 'none';
        }
    });
}

/**
 * Hiển thị các sản phẩm trong giỏ hàng trên trang giohang.html.
 */
function renderCartItems() {
    const cart = getCart();
    const cartPageContainer = document.querySelector('.cart-page-container');
    const footer = document.querySelector('.cart-footer-summary');

    if (!cartPageContainer) return; // Chỉ chạy trên trang giỏ hàng

    // Xóa nội dung cũ
    cartPageContainer.innerHTML = '';
    
    if (cart.length === 0) {
        // Hiển thị thông báo giỏ hàng trống
        cartPageContainer.innerHTML = `
            <div style="text-align: center; padding: 80px 20px;">
                <i class="fas fa-shopping-bag" style="font-size: 5rem; color: #ccc;"></i>
                <p style="margin-top: 20px; font-size: 1.2rem;">Giỏ hàng của bạn đang trống</p>
                <a href="index.html" style="display: inline-block; margin-top: 20px; padding: 12px 25px; background-color: var(--primary-color); color: white; text-decoration: none; border-radius: 4px;">TIẾP TỤC MUA SẮM</a>
            </div>
        `;
        if(footer) footer.style.display = 'none'; // Ẩn thanh tổng kết
        return;
    }
    
    if(footer) footer.style.display = 'flex'; // Hiện thanh tổng kết

    // Tạo lại tiêu đề cho bảng giỏ hàng
    const headerRow = document.createElement('div');
    headerRow.className = 'cart-header-row';
    headerRow.innerHTML = `
        <div class="col-product"><input type="checkbox" id="select-all-main"> <label for="select-all-main">Sản Phẩm</label></div>
        <div class="col-price">Đơn giá</div>
        <div class="col-quantity">Số lượng</div>
        <div class="col-total">Thành tiền</div>
        <div class="col-action">Thao tác</div>
    `;
    cartPageContainer.appendChild(headerRow);

    // Tạo HTML cho từng sản phẩm
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.dataset.index = index; // Lưu chỉ số để dễ dàng cập nhật/xóa
        cartItem.innerHTML = `
            <div class="col-product">
                <input type="checkbox" class="item-select" ${item.selected ? 'checked' : ''}>
                <img src="${item.image || 'https://placehold.co/80x80'}" alt="${item.name}">
                <div class="product-info">
                    <p class="product-name">${item.name}</p>
                    <p class="product-variant">Phân loại: ${item.size}</p>
                </div>
            </div>
            <div class="col-price" data-label="Đơn giá:"><span class="new-price">${formatPrice(item.price)}</span></div>
            <div class="col-quantity" data-label="Số lượng:">
                <div class="quantity-control">
                    <button class="qty-change" data-change="-1">-</button>
                    <input type="text" value="${item.quantity}" readonly>
                    <button class="qty-change" data-change="1">+</button>
                </div>
            </div>
            <div class="col-total" data-label="Thành tiền:">${formatPrice(itemTotal)}</div>
            <div class="col-action"><button class="btn-delete">Xóa</button></div>
        `;
        cartPageContainer.appendChild(cartItem);
    });
    
    updateSummaryAndFooter();
    addCartEventListeners();
}

/**
 * Cập nhật tổng tiền và thông tin ở footer.
 */
function updateSummaryAndFooter() {
    const cart = getCart();
    const selectedItems = cart.filter(item => item.selected);
    const totalItems = selectedItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const totalInfoP = document.querySelector('.total-info p');
    if (totalInfoP) totalInfoP.textContent = `Tổng thanh toán (${totalItems} Sản phẩm):`;

    const totalAmountSpan = document.querySelector('.total-amount');
    if (totalAmountSpan) totalAmountSpan.textContent = formatPrice(totalAmount);
    
    const allItemsSelected = cart.length > 0 && cart.every(item => item.selected);
    const selectAllMain = document.getElementById('select-all-main');
    if(selectAllMain) selectAllMain.checked = allItemsSelected;
    
    const selectAllFooter = document.getElementById('select-all-footer');
    if(selectAllFooter) selectAllFooter.checked = allItemsSelected;
}

/**
 * Gắn các sự kiện cho các nút trong giỏ hàng.
 */
function addCartEventListeners() {
    const cart = getCart();

    // Sự kiện chọn từng sản phẩm
    document.querySelectorAll('.item-select').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const index = e.target.closest('.cart-item').dataset.index;
            cart[index].selected = e.target.checked;
            saveCart(cart);
            updateSummaryAndFooter();
        });
    });

    // Sự kiện tăng/giảm số lượng
    document.querySelectorAll('.qty-change').forEach(button => {
        button.addEventListener('click', (e) => {
            const index = e.target.closest('.cart-item').dataset.index;
            const change = parseInt(e.target.dataset.change, 10);
            cart[index].quantity += change;
            if (cart[index].quantity < 1) cart[index].quantity = 1; // Số lượng không được nhỏ hơn 1
            saveCart(cart);
            renderCartItems(); // Vẽ lại toàn bộ giỏ hàng để cập nhật tổng tiền
        });
    });

    // Sự kiện xóa sản phẩm
    document.querySelectorAll('.btn-delete').forEach(button => {
        button.addEventListener('click', (e) => {
            if (confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
                const index = e.target.closest('.cart-item').dataset.index;
                cart.splice(index, 1);
                saveCart(cart);
                renderCartItems();
            }
        });
    });

    // Sự kiện chọn/bỏ chọn tất cả
    ['select-all-main', 'select-all-footer'].forEach(id => {
        const checkbox = document.getElementById(id);
        if(checkbox) {
            checkbox.addEventListener('change', (e) => {
                const isChecked = e.target.checked;
                cart.forEach(item => item.selected = isChecked);
                saveCart(cart);
                renderCartItems();
            });
        }
    });

    // Sự kiện nút thanh toán
    const checkoutBtn = document.querySelector('.btn-checkout');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            const selectedItems = cart.filter(item => item.selected);
            if (selectedItems.length === 0) {
                alert('Vui lòng chọn ít nhất một sản phẩm để thanh toán.');
                return;
            }
            // Lưu các sản phẩm đã chọn vào sessionStorage để trang thanh toán sử dụng
            sessionStorage.setItem('checkoutSelection', JSON.stringify(selectedItems));
            window.location.href = 'thanhtoan.html';
        });
    }
}

const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

// Chạy các hàm cần thiết khi trang được tải
document.addEventListener('DOMContentLoaded', () => {
    updateCartBadge(); // Cập nhật huy hiệu ở mọi trang
    // Chỉ chạy renderCartItems trên trang giỏ hàng
    if (document.querySelector('.cart-page-container')) {
        renderCartItems();
    }
});
