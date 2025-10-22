

// Constants
const serverUrl = 'http://localhost:3000';
const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price);
};

// Build URL for product images
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
async function loadProductDetails(productId) {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      window.location.href = 'login.html';
      return;
    }

    const response = await fetch(`${serverUrl}/products/${productId}`, {
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
      throw new Error('Lỗi khi tải chi tiết sản phẩm');
    }

    const product = await response.json();
    
    // Update DOM elements with product details
    document.getElementById("productImage").src = buildImageUrl(product);
    document.getElementById("productImage").alt = product.ID_Products;
    
    // Basic Info
    document.getElementById("productName").textContent = product.ID_Products;
    document.getElementById("productId").textContent = product.ID_Products;
    document.getElementById("productCategory").textContent = product.name_Categories;
    document.getElementById("productPrice").textContent = formatPrice(product.price);
    
    // Detailed Info
    document.getElementById("productStock").querySelector('span').textContent = product.stock_quantity;
    document.getElementById("productSize").textContent = product.size || 'Không có thông tin';
    document.getElementById("productColor").textContent = product.color || 'Không có thông tin';
    document.getElementById("productCategoryDetail").textContent = product.name_Categories || 'Không có thông tin';
    
    // Update quantity input constraints
    const quantityInput = document.getElementById("quantityInput");
    quantityInput.max = product.stock_quantity;
    quantityInput.value = 1; // Reset to 1 when loading new product
    
    // Disable buttons if out of stock
    const addToCartBtn = document.querySelector('.add-cart');
    const buyNowBtn = document.querySelector('.buy-now');
    
    if (product.stock_quantity <= 0) {
        quantityInput.disabled = true;
        addToCartBtn.disabled = true;
        buyNowBtn.disabled = true;
        addToCartBtn.textContent = 'Hết hàng';
        buyNowBtn.textContent = 'Hết hàng';
    } else {
        quantityInput.disabled = false;
        addToCartBtn.disabled = false;
        buyNowBtn.disabled = false;
        addToCartBtn.innerHTML = '<i class="fas fa-shopping-cart"></i> THÊM VÀO GIỎ HÀNG';
        buyNowBtn.textContent = 'MUA NGAY';
    }
  } catch (error) {
    console.error('Lỗi:', error);
    alert('Không thể tải thông tin sản phẩm');
  }
}

// When on product detail page, get product ID from URL and load details
if (window.location.pathname.includes("product.html")) {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');
  
  if (productId) {
    loadProductDetails(productId);
  } else {
    alert('Không tìm thấy mã sản phẩm');
    window.location.href = 'index.html';
  }
}
// Hàm tăng/giảm số lượng
function increaseQty() {
  const input = document.getElementById("quantityInput");
  input.value = parseInt(input.value) + 1;
}

function decreaseQty() {
  const input = document.getElementById("quantityInput");
  if (parseInt(input.value) > 1) input.value = parseInt(input.value) - 1;
}

function updateDressVisibility() {
  const femaleCheckbox = document.getElementById("gender-female");
  const maleCheckbox = document.getElementById("gender-male");
  const dressLabel = document.getElementById("category-dress");
  if (!dressLabel) return;

  const femaleSelected = !!(femaleCheckbox && femaleCheckbox.checked);
  const maleSelected = !!(maleCheckbox && maleCheckbox.checked);
}

// Attach listeners to gender checkboxes
(function attachGenderListeners() {
  const genderCheckboxes = document.querySelectorAll(".gender-checkbox");
  if (!genderCheckboxes) return;
  genderCheckboxes.forEach((cb) =>
    cb.addEventListener("change", updateDressVisibility)
  );

  // Run once on load to set initial state
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", updateDressVisibility);
  } else {
    updateDressVisibility();
  }
})();

// --- Price filter: show options and filter products by selected range ---
function parsePriceText(text) {
  // Remove non-digit characters and parse as integer (assume VND)
  const digits = text.replace(/[^0-9]/g, "");
  return digits ? parseInt(digits, 10) : 0;
}

function filterProductsByPrice(min, max) {
  const productCards = document.querySelectorAll(".product-list .product");
  productCards.forEach((card) => {
    const priceEl = card.querySelector(".price");
    if (!priceEl) return;
    const priceVal = parsePriceText(priceEl.textContent || "0");
    if (priceVal >= min && priceVal <= max) {
      card.style.display = "";
    } else {
      card.style.display = "none";
    }
  });
}

(function attachPriceFilter() {
  const btn = document.getElementById("priceFilterBtn");
  const options = document.getElementById("priceOptions");
  if (!btn || !options) return;

  // toggle dropdown
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    options.style.display = options.style.display === "none" ? "block" : "none";
  });

  // click outside to close
  document.addEventListener("click", () => {
    options.style.display = "none";
  });

  // option clicks
  options.querySelectorAll("li[data-min]").forEach((li) => {
    li.addEventListener("click", (e) => {
      e.stopPropagation();
      const min = parseInt(li.getAttribute("data-min"), 10) || 0;
      const max = parseInt(li.getAttribute("data-max"), 10) || 99999999;
      filterProductsByPrice(min, max);
      options.style.display = "none";
    });
  });

  // clear filter
  const clear = document.getElementById("priceClear");
  if (clear) {
    clear.addEventListener("click", (e) => {
      e.stopPropagation();
      // show all products
      document
        .querySelectorAll(".product-list .product")
        .forEach((p) => (p.style.display = ""));
      options.style.display = "none";
    });
  }
})();

// Dropdown menu logic
document.querySelectorAll(".dropbtn").forEach((btn) => {
  btn.addEventListener("click", function (e) {
    e.stopPropagation();
    const dropdown = this.parentElement;
    const menu = dropdown.querySelector(".dropdown-content");

    // Đóng các dropdown khác
    document.querySelectorAll(".dropdown").forEach((d) => {
      if (d !== dropdown) d.classList.remove("show");
      d.querySelector(".dropdown-content")?.classList.remove("up");
    });

    dropdown.classList.toggle("show");

    if (dropdown.classList.contains("show")) {
      const rect = menu.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.top - rect.height;
      if (spaceBelow < 20) {
        menu.classList.add("up"); // Không đủ chỗ bên dưới => xổ lên
      }
    }
  });
});

// Bấm ra ngoài để đóng menu
document.addEventListener("click", () => {
  document
    .querySelectorAll(".dropdown")
    .forEach((d) => d.classList.remove("show"));
  document
    .querySelectorAll(".dropdown-content")
    .forEach((m) => m.classList.remove("up"));
});
