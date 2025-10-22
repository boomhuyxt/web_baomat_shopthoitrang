// Constants
const serverUrl = 'http://localhost:3000';

// Format price to VND
const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(price);
};

// Build image URL
const buildImageUrl = (product) => {
    if (!product) return 'https://via.placeholder.com/400?text=No+Image';
    if (product.image_url) {
        let p = String(product.image_url).trim();
        if (p.startsWith('http')) return p;
        p = p.replace(/^\/+/, '');
        p = p.replace(/^images?\//i, '');
        p = p.replace(/\\/g, '/');
        return `${serverUrl}/images/${p}`;
    }
    return 'https://via.placeholder.com/400?text=No+Image';
};

// Load and display product details
async function loadProductDetails() {
    try {
        // Check authentication
        const token = localStorage.getItem('authToken');
        if (!token) {
            window.location.href = 'login.html';
            return;
        }

        // Get product ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        let productId = urlParams.get('id');
        
        if (!productId) {
            alert('Không tìm thấy mã sản phẩm');
            window.location.href = 'index.html';
            return;
        }

        // Clean up product ID and convert to uppercase
        productId = productId.split(':')[0].trim().toUpperCase();
        if (!productId) {
            alert('Mã sản phẩm không hợp lệ');
            window.location.href = 'index.html';
            return;
        }

        console.log('Đang tải sản phẩm:', productId); // Debug log
            // Fetch product details from API
            const response = await fetch(`${serverUrl}/products/${productId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            console.log('Server response status:', response.status); // Debug log

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    console.log('Authentication error'); // Debug log
                    localStorage.removeItem('authToken');
                    window.location.href = 'login.html';
                    return;
                }

                const contentType = response.headers.get("content-type");
                if (contentType && contentType.indexOf("application/json") !== -1) {
                    const errorData = await response.json();
                    throw new Error(errorData.details || 'Lỗi khi tải chi tiết sản phẩm');
                } else {
                    throw new Error(`Lỗi máy chủ: ${response.status}`);
                }
            }

        const product = await response.json();
        console.log('Đã nhận dữ liệu sản phẩm:', product); // Debug log
        
        // Update page title
        document.title = `${product.name || product.ID_Products} - Your Style`;
        
        // Update product image
        const productImage = document.getElementById("productImage");
        productImage.src = buildImageUrl(product);
        productImage.alt = product.name || product.ID_Products;
        
        // Update product details container
        const productDetailsContainer = document.querySelector('.product-details');
        
        // Create HTML for all product information
        const detailsHTML = `
            <h1 class="product-title">${product.name || product.ID_Products}</h1>
            <div class="product-meta">
                <p class="product-id"><strong>Mã sản phẩm:</strong> ${product.ID_Products}</p>
                <p class="product-category"><strong>Danh mục:</strong> ${product.name_Categories || 'Không có thông tin'}</p>
                <p class="product-price"><strong>Giá:</strong> ${formatPrice(product.price)}</p>
                <p class="product-stock"><strong>Tình trạng:</strong> ${product.stock_quantity > 0 ? `Còn hàng (${product.stock_quantity})` : 'Hết hàng'}</p>
                <p class="product-size"><strong>Kích thước:</strong> ${product.size || 'Không có thông tin'}</p>
                <p class="product-color"><strong>Màu sắc:</strong> ${product.color || 'Không có thông tin'}</p>
                ${product.description ? `<div class="product-description"><strong>Mô tả:</strong><br>${product.description}</div>` : ''}
            </div>`;
            
        // Update the product details container
        productDetailsContainer.innerHTML = detailsHTML;
        
        // Update quantity input constraints
        const quantityInput = document.getElementById("quantityInput");
        quantityInput.max = product.stock_quantity;
        quantityInput.value = 1;
        
        // Update buttons state
        const addToCartBtn = document.querySelector('.add-cart');
        const buyNowBtn = document.querySelector('.buy-now');
        const tryOnBtn = document.querySelector('.try-on');
        
        if (product.stock_quantity <= 0) {
            quantityInput.disabled = true;
            addToCartBtn.disabled = true;
            buyNowBtn.disabled = true;
            tryOnBtn.disabled = true;
            
            addToCartBtn.innerHTML = '<i class="fas fa-times"></i> Hết hàng';
            buyNowBtn.innerHTML = '<i class="fas fa-times"></i> Hết hàng';
        } else {
            quantityInput.disabled = false;
            addToCartBtn.disabled = false;
            buyNowBtn.disabled = false;
            tryOnBtn.disabled = false;
            
            addToCartBtn.innerHTML = '<i class="fas fa-shopping-cart"></i> THÊM VÀO GIỎ HÀNG';
            buyNowBtn.innerHTML = '<i class="fas fa-bolt"></i> MUA NGAY';

            // Add to cart button behavior
            addToCartBtn.addEventListener('click', () => {
                const quantity = parseInt(quantityInput.value, 10);
                const selectedSizeButton = document.querySelector('.size-btn.selected');
                const size = selectedSizeButton ? selectedSizeButton.dataset.size : product.size;
                
                // Call the global addToCart function from cart.js
                if (typeof addToCart === 'function') {
                    addToCart(product.ID_Products, product.name, product.price, buildImageUrl(product), quantity, size);
                } else {
                    console.error('Hàm addToCart không tồn tại. Hãy chắc chắn cart.js đã được thêm vào.');
                }
            });
        }

        // Buy Now button behavior
        if (buyNowBtn) {
            buyNowBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const qty = parseInt(document.getElementById('quantityInput')?.value || '1', 10);
                
                // Store selection in sessionStorage for the checkout page
                const selection = {
                    id: product.ID_Products,
                    qty: qty
                };
                try {
                    sessionStorage.setItem('checkoutSelection', JSON.stringify(selection));
                } catch (err) {
                    console.warn('Không thể lưu selection vào sessionStorage', err);
                }
                
                // Redirect to checkout page
                window.location.href = `thanhtoan.html`;
            });
        }

    } catch (error) {
        console.error('Lỗi:', error);
        alert('Không thể tải thông tin sản phẩm');
    }
}

// Quantity adjustment functions
function increaseQty() {
    const input = document.getElementById("quantityInput");
    const max = parseInt(input.max);
    const currentVal = parseInt(input.value);
    if (currentVal < max) {
        input.value = currentVal + 1;
    }
}

function decreaseQty() {
    const input = document.getElementById("quantityInput");
    if (parseInt(input.value) > 1) {
        input.value = parseInt(input.value) - 1;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    loadProductDetails();

    // Add quantity input validation
    const quantityInput = document.getElementById("quantityInput");
    if (quantityInput) {
        quantityInput.addEventListener('change', (e) => {
            const val = parseInt(e.target.value);
            const max = parseInt(e.target.max);
            if (val > max) {
                e.target.value = max;
            } else if (val < 1) {
                e.target.value = 1;
            }
        });
    }
});