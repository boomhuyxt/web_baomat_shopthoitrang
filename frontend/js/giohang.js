// js/cart.js
const serverUrl = 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', () => {
    updateCartBadge();
    if (document.body.contains(document.getElementById('cart-items-container'))) {
        renderCartItems();
    }

    const goToCheckoutBtn = document.getElementById('go-to-checkout');
    if(goToCheckoutBtn) {
        goToCheckoutBtn.addEventListener('click', () => {
            const cart = getCart();
            const selectedItems = cart.filter(item => item.selected);
            if (selectedItems.length === 0) {
                alert('Vui lòng chọn ít nhất một sản phẩm để thanh toán.');
                return;
            }
            // Store only selected items for checkout
            sessionStorage.setItem('checkoutItems', JSON.stringify(selectedItems));
            window.location.href = 'thanhtoan.html';
        });
    }
});

function getCart() {
    const cartJson = localStorage.getItem('cart');
    return cartJson ? JSON.parse(cartJson) : [];
}

function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartBadge();
}

function addToCart(productId, name, price, image, quantity = 1, size = 'M') {
    const cart = getCart();
    // A unique ID for each item, combining product ID and size
    const cartItemId = `${productId}-${size}`;
    const existingItemIndex = cart.findIndex(item => item.cartItemId === cartItemId);

    if (existingItemIndex > -1) {
        cart[existingItemIndex].quantity += quantity;
    } else {
        cart.push({ 
            cartItemId, 
            id: productId, 
            name, 
            price, 
            image, 
            quantity, 
            size,
            selected: true // Default to selected when added
        });
    }

    saveCart(cart);
    alert('Đã thêm sản phẩm vào giỏ hàng!');
}

function updateCartBadge() {
    const cart = getCart();
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartBadge = document.getElementById('cart-item-count');
    if (cartBadge) {
        cartBadge.textContent = itemCount;
        cartBadge.style.display = itemCount > 0 ? 'inline-block' : 'none';
    }
}

function renderCartItems() {
    const cart = getCart();
    const cartPageContainer = document.querySelector('.cart-page-container');
    const emptyCartMessage = createEmptyCartMessage(); // Helper to create this element
    const footer = document.querySelector('.cart-footer-summary');

    if (!cartPageContainer) return;

    // Clear previous content
    cartPageContainer.innerHTML = '';
    
    if (cart.length === 0) {
        cartPageContainer.appendChild(emptyCartMessage);
        if(footer) footer.style.display = 'none';
        return;
    }
    
    if(footer) footer.style.display = 'flex';

    // Re-create the header row
    cartPageContainer.appendChild(createCartHeader());

    const shopBlocks = {}; // Group items by shop (if applicable, otherwise one block)

    cart.forEach((item, index) => {
        const shopName = item.shop || 'Shop Quần Áo Đẹp'; // Default shop name
        if (!shopBlocks[shopName]) {
            shopBlocks[shopName] = [];
        }
        shopBlocks[shopName].push({item, index});
    });

    for (const shopName in shopBlocks) {
        const shopBlock = document.createElement('div');
        shopBlock.className = 'shop-block';
        
        const shopHeader = document.createElement('div');
        shopHeader.className = 'shop-header';
        shopHeader.innerHTML = `
            <input type="checkbox" class="shop-select-all" data-shop="${shopName}">
            <span><i class="fas fa-store"></i> ${shopName}</span>
        `;
        shopBlock.appendChild(shopHeader);

        shopBlocks[shopName].forEach(({item, index}) => {
            const cartItemEl = createCartItemElement(item, index);
            shopBlock.appendChild(cartItemEl);
        });
        cartPageContainer.appendChild(shopBlock);
    }
    
    updateSummaryAndFooter();
    addEventListeners();
}

function createCartHeader() {
    const headerRow = document.createElement('div');
    headerRow.className = 'cart-header-row';
    headerRow.innerHTML = `
        <div class="col-product">
            <input type="checkbox" id="select-all-main">
            <label for="select-all-main">Sản Phẩm</label>
        </div>
        <div class="col-price">Đơn giá</div>
        <div class="col-quantity">Số lượng</div>
        <div class="col-total">Thành tiền</div>
        <div class="col-action">Thao tác</div>
    `;
    return headerRow;
}

function createCartItemElement(item, index) {
    const itemTotal = item.price * item.quantity;
    const cartItem = document.createElement('div');
    cartItem.className = 'cart-item';
    cartItem.dataset.index = index;
    cartItem.innerHTML = `
        <div class="col-product">
            <input type="checkbox" class="item-select" ${item.selected ? 'checked' : ''}>
            <img src="${item.image || 'https://placehold.co/80x80'}" alt="${item.name}">
            <div class="product-info">
                <p class="product-name">${item.name}</p>
                <p class="product-variant">Phân loại: ${item.size}</p>
            </div>
        </div>
        <div class="col-price" data-label="Đơn giá:">
            <span class="new-price">${formatPrice(item.price)}</span>
        </div>
        <div class="col-quantity" data-label="Số lượng:">
            <div class="quantity-control">
                <button class="qty-change" data-change="-1">-</button>
                <input type="text" value="${item.quantity}" readonly>
                <button class="qty-change" data-change="1">+</button>
            </div>
        </div>
        <div class="col-total" data-label="Thành tiền:">${formatPrice(itemTotal)}</div>
        <div class="col-action">
            <button class="btn-delete">Xóa</button>
        </div>
    `;
    return cartItem;
}

function createEmptyCartMessage() {
    const div = document.createElement('div');
    div.style.textAlign = 'center';
    div.style.padding = '50px 0';
    div.innerHTML = `
        <i class="fas fa-shopping-bag" style="font-size: 5rem; color: #ccc;"></i>
        <p style="margin-top: 20px; font-size: 1.2rem;">Giỏ hàng của bạn đang trống</p>
        <a href="index.html" style="display: inline-block; margin-top: 20px; padding: 12px 25px; background-color: var(--primary-color); color: white; text-decoration: none; border-radius: 4px;">TIẾP TỤC MUA SẮM</a>
    `;
    return div;
}


function updateSummaryAndFooter() {
    const cart = getCart();
    const selectedItems = cart.filter(item => item.selected);
    const totalItems = selectedItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const totalInfoP = document.querySelector('.total-info p');
    if (totalInfoP) {
        totalInfoP.textContent = `Tổng thanh toán (${totalItems} Sản phẩm):`;
    }

    const totalAmountSpan = document.querySelector('.total-amount');
    if (totalAmountSpan) {
        totalAmountSpan.textContent = formatPrice(totalAmount);
    }
    
    // Update main and footer select-all checkboxes
    const allItemsSelected = cart.length > 0 && cart.every(item => item.selected);
    document.getElementById('select-all-main').checked = allItemsSelected;
    document.getElementById('select-all-footer').checked = allItemsSelected;

    // Update shop-level select-all checkboxes
    document.querySelectorAll('.shop-select-all').forEach(shopCheckbox => {
        const shopName = shopCheckbox.dataset.shop;
        const shopItems = cart.filter(item => (item.shop || 'Shop Quần Áo Đẹp') === shopName);
        shopCheckbox.checked = shopItems.length > 0 && shopItems.every(item => item.selected);
    });
}

function addEventListeners() {
    const cart = getCart();

    // Item selection
    document.querySelectorAll('.item-select').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const index = e.target.closest('.cart-item').dataset.index;
            cart[index].selected = e.target.checked;
            saveCart(cart);
            updateSummaryAndFooter();
        });
    });

    // Quantity change
    document.querySelectorAll('.qty-change').forEach(button => {
        button.addEventListener('click', (e) => {
            const index = e.target.closest('.cart-item').dataset.index;
            const change = parseInt(e.target.dataset.change, 10);
            cart[index].quantity += change;
            if (cart[index].quantity < 1) cart[index].quantity = 1;
            saveCart(cart);
            renderCartItems(); // Re-render to update totals
        });
    });

    // Delete item
    document.querySelectorAll('.btn-delete').forEach(button => {
        button.addEventListener('click', (e) => {
            const index = e.target.closest('.cart-item').dataset.index;
            cart.splice(index, 1);
            saveCart(cart);
            renderCartItems();
        });
    });

    // Select All (Main and Footer)
    ['select-all-main', 'select-all-footer'].forEach(id => {
        document.getElementById(id).addEventListener('change', (e) => {
            const isChecked = e.target.checked;
            cart.forEach(item => item.selected = isChecked);
            saveCart(cart);
            renderCartItems();
        });
    });
    
    // Shop-level Select All
    document.querySelectorAll('.shop-select-all').forEach(shopCheckbox => {
        shopCheckbox.addEventListener('change', (e) => {
            const isChecked = e.target.checked;
            const shopName = e.target.dataset.shop;
            cart.forEach(item => {
                if ((item.shop || 'Shop Quần Áo Đẹp') === shopName) {
                    item.selected = isChecked;
                }
            });
            saveCart(cart);
            renderCartItems();
        });
    });

    // Checkout button
    const checkoutBtn = document.querySelector('.btn-checkout');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            const selectedItems = cart.filter(item => item.selected);
            if (selectedItems.length === 0) {
                alert('Vui lòng chọn sản phẩm để thanh toán.');
                return;
            }
            // Store selected items in sessionStorage for the checkout page
            sessionStorage.setItem('checkoutSelection', JSON.stringify(selectedItems));
            window.location.href = 'thanhtoan.html';
        });
    }
}

const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};
