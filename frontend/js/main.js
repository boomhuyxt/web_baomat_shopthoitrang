document.addEventListener('DOMContentLoaded', () => {
    const productsGrid = document.getElementById('products-grid');
    const serverUrl = 'http://localhost:3000';

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    // Cache all fetched products so we can filter client-side
    let allProducts = [];

    // Build final image URL from product.image_url (normalized)
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

    // Helper to decide if a product matches gender filter using its image path or category
    const matchesGender = (product, gender) => {
        if (!product) return false;
        const img = String(product.image_url || '').toLowerCase();
        const cat = String(product.name_Categories || product.id_Categories || '').toLowerCase();
        const re = new RegExp('(^|[\\/])' + gender + '([\\/]|$)', 'i');
        if (re.test(img)) return true;
        if (re.test(cat)) return true;
        return false;
    };

    // Render function for an array of products
    const renderProducts = (productsArray) => {
        if (!productsGrid) return;
        if (!Array.isArray(productsArray) || productsArray.length === 0) {
            productsGrid.innerHTML = '<p class="no-products">Không có sản phẩm nào</p>';
            return;
        }

        const productCards = productsArray.map(product => {
            const imageUrl = buildImageUrl(product);
            console.debug('Product', product.ID_Products, 'imageUrl ->', imageUrl);

            return `
                <div class="product" data-id="${product.ID_Products}">
                    <img src="${imageUrl}" 
                         alt="${product.ID_Products}"
                         class="product-image"
                         onerror="this.onerror=null; if(this.src.endsWith('.png')) {this.src=this.src.replace('.png', '.jpg')} else if(this.src.endsWith('.jpg')) {this.src='https://via.placeholder.com/400?text=No+Image'}"
                    >
                    <div class="info">
                        <h3>${product.ID_Products}</h3>
                        ${product.name_Categories ? `<span class="category">${product.name_Categories}</span>` : ''}
                        <div class="price">${formatPrice(product.price)}</div>
                    </div>
                </div>
            `;
        }).join('');

        productsGrid.innerHTML = productCards;

        // Attach click handlers so clicking a product opens product.html with details saved to localStorage
        const cards = productsGrid.querySelectorAll('.product');
        cards.forEach(card => {
            const id = card.getAttribute('data-id');
            if (!id) return;
            card.addEventListener('click', (e) => {
                e.preventDefault();
                try {
                    window.location.href = `product.html?id=${encodeURIComponent(id.trim())}`;
                } catch (error) {
                    console.error('Lỗi chuyển trang:', error);
                    alert('Không thể mở trang chi tiết sản phẩm');
                }
            });
        });
    };

    const fetchAndRenderAllProducts = async () => {
        if (!productsGrid) {
            console.error('Không tìm thấy container sản phẩm');
            return;
        }

        const token = localStorage.getItem('authToken');
        if (!token) {
            window.location.href = 'login.html';
            return;
        }

        try {
            const response = await fetch(`${serverUrl}/products`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    localStorage.removeItem('authToken');
                    window.location.href = 'login.html';
                    return;
                }
                throw new Error('Lỗi khi tải sản phẩm');
            }

            const products = await response.json();
            console.log('Dữ liệu nhận được:', products);

            if (!Array.isArray(products)) {
                console.error('Dữ liệu không phải là mảng:', products);
                throw new Error('Dữ liệu không hợp lệ');
            }

            // Cache and render
            allProducts = products.slice();
            renderProducts(allProducts);

        } catch (error) {
            console.error('Lỗi:', error);
            productsGrid.innerHTML = `
                <div class="error-message">
                    <p>Không thể tải sản phẩm</p>
                    <p>${error.message}</p>
                </div>
            `;
        }
    };

    fetchAndRenderAllProducts();

    // Xử lý các bộ lọc - Giới tính
    const genderButtons = document.querySelectorAll('.btn-gender');
    let activeGender = null; // 'nam' | 'nu' | null
    genderButtons.forEach(button => {
        button.addEventListener('click', () => {
            // toggle behavior: clicking same button twice clears filter
            const label = button.textContent.trim().toLowerCase();
            const genderKey = label === 'nam' ? 'men' : (label === 'nữ' || label === 'nu' ? 'women' : label);

            if (activeGender === genderKey) {
                // clear
                activeGender = null;
                genderButtons.forEach(btn => btn.classList.remove('active'));
                renderProducts(allProducts);
                return;
            }

            // set active
            activeGender = genderKey;
            genderButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // filter client-side
            const filtered = allProducts.filter(p => matchesGender(p, genderKey));
            renderProducts(filtered);
        });
    });

    // Xử lý dropdown giá
    const priceFilterBtn = document.getElementById('priceFilterBtn');
    const priceOptions = document.getElementById('priceOptions');
    
    if (priceFilterBtn && priceOptions) {
        priceFilterBtn.addEventListener('click', () => {
            priceOptions.style.display = 
                priceOptions.style.display === 'none' ? 'block' : 'none';
        });

        document.addEventListener('click', (e) => {
            if (!priceFilterBtn.contains(e.target) && !priceOptions.contains(e.target)) {
                priceOptions.style.display = 'none';
            }
        });
    }

    // --- User icon logout toggle ---
    try {
        const userBtn = document.getElementById('user-btn');
        const logoutBtn = document.getElementById('logout-btn');
        if (userBtn && logoutBtn) {
            userBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                logoutBtn.style.display = logoutBtn.style.display === 'block' ? 'none' : 'block';
            });

            // Clicking logout clears token and redirects using auth.js logout()
            logoutBtn.addEventListener('click', () => {
                // call global logout function if present
                if (typeof logout === 'function') {
                    logout();
                } else {
                    localStorage.removeItem('authToken');
                    window.location.href = 'login.html';
                }
            });

            // Hide when clicking elsewhere
            document.addEventListener('click', (e) => {
                if (!userBtn.contains(e.target) && !logoutBtn.contains(e.target)) {
                    logoutBtn.style.display = 'none';
                }
            });
        }
    } catch (err) {
        console.error('User logout toggle error', err);
    }
});