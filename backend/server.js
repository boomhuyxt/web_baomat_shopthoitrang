const express = require('express');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); // Đảm bảo bạn đã import bcrypt
const db = require('./db');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Middleware để ghi log tất cả các yêu cầu đến
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] Nhận yêu cầu: ${req.method} ${req.originalUrl}`);
    next(); // Chuyển yêu cầu đến middleware hoặc route tiếp theo
});

// ROUTE THỬ NGHIỆM ĐỂ GỬ LỖI
app.post('/api/test', (req, res) => {
    console.log('Đã nhận yêu cầu tại /api/test thành công!');
    res.status(200).json({ message: 'Route /api/test hoạt động!' });
});

// Phục vụ các file ảnh từ thư mục 'image'
const imageFolderPath = path.join(__dirname, '../image');
app.use('/images', express.static(imageFolderPath));

// Middleware xác thực JWT
const authenticateToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Không có token xác thực' });
    }

    jwt.verify(token, 'your-secret-key', (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
        }
        req.user = user;
        next();
    });
};

// *** BẮT ĐẦU CODE THÊM MỚI (1/2) ***
// Middleware xác thực ADMIN (BỊ THIẾU)
const authenticateAdmin = (req, res, next) => {
    // req.user được gán từ authenticateToken
    if (!req.user || !req.user.isAdmin) {
        return res.status(403).json({ message: 'Truy cập bị từ chối. Yêu cầu quyền Admin.' });
    }
    next();
};
// *** KẾT THÚC CODE THÊM MỚI (1/2) ***


// API đăng nhập (ĐÃ SỬA ĐỂ DÙNG BCRYPT)
// API đăng nhập (ĐÃ SỬA ĐỂ THÊM QUYỀN ADMIN)
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email và mật khẩu là bắt buộc' });
        }

        const query = 'SELECT * FROM users WHERE email = ?';

        const [results] = await db.promise().execute(query, [email]);

        if (results.length === 0) {
            return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
        }

        const user = results[0];

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
        }

        // --- BẮT ĐẦU THAY ĐỔI ---
        // 1. Kiểm tra xem có phải admin không
        const isAdmin = (user.email === 'test@gmail.com');
        // --- KẾT THÚC THAY ĐỔI ---


        // Nếu khớp, tạo token
        const token = jwt.sign(
            {
                userId: user.id,
                email: user.email,
                username: user.username,
                isAdmin: isAdmin // 2. Thêm quyền admin vào token
            },
            'your-secret-key',
            { expiresIn: '24h' }
        );

        // 3. Trả về thông tin admin cho frontend
        res.json({
            token,
            username: user.username,
            isAdmin: isAdmin
        });

    } catch (error) {
        console.error('Lỗi đăng nhập:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// *** CODE MỚI ĐƯỢC THÊM VÀO ***
// API ĐĂNG KÝ TÀI KHOẢN MỚI
app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password, confirm_password } = req.body;

        // 1. Kiểm tra dữ liệu đầu vào
        if (!username || !email || !password || !confirm_password) {
            return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin.' });
        }

        // 2. Kiểm tra mật khẩu khớp
        if (password !== confirm_password) {
            return res.status(400).json({ message: 'Mật khẩu xác nhận không khớp.' });
        }

        // 3. Kiểm tra độ dài mật khẩu
        if (password.length < 8) {
            return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 8 ký tự.' });
        }

        // 4. Kiểm tra xem username hoặc email đã tồn tại chưa
        const checkQuery = 'SELECT id FROM users WHERE username = ? OR email = ?';
        const [existingUsers] = await db.promise().execute(checkQuery, [username, email]);

        if (existingUsers.length > 0) {
            return res.status(409).json({ message: 'Tên người dùng hoặc Email đã tồn tại.' });
        }

        // 5. Mã hóa mật khẩu
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // 6. Thêm người dùng mới vào CSDL
        const insertQuery = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
        await db.promise().execute(insertQuery, [username, email, hashedPassword]);

        // 7. Gửi thông báo thành công
        res.status(201).json({ message: 'Đăng ký tài khoản thành công!' });

    } catch (error) {
        console.error('Lỗi khi đăng ký:', error);
        res.status(500).json({ message: 'Đã xảy ra lỗi máy chủ.' });
    }
});
// *** KẾT THÚC CODE MỚI ***


// API để lấy TẤT CẢ sản phẩm (yêu cầu xác thực)
app.get('/products', authenticateToken, async (req, res) => {
    try {
        const query = `
            SELECT p.*, c.name_Categories 
            FROM Products p 
            LEFT JOIN Categories c ON p.id_Categories = c.id_Categories
        `;

        const [products] = await db.promise().execute(query);
        res.json(products);
    } catch (error) {
        console.error("Lỗi khi lấy sản phẩm:", error);
        return res.status(500).json({ error: 'Lỗi truy vấn cơ sở dữ liệu.' });
    }
});

// API chi tiết sản phẩm
app.get('/products/:id', authenticateToken, async (req, res) => {
    try {
        // Get the raw product ID and clean it up
        let productId = req.params.id;
        productId = productId.split(':')[0].trim(); // Remove anything after :
        productId = productId.toUpperCase(); // Convert to uppercase for consistency

        if (!productId) {
            return res.status(400).json({ error: 'Mã sản phẩm không hợp lệ.' });
        }

        console.log('Đang tìm sản phẩm với ID:', productId); // Debug log

        const query = `
            SELECT p.*, c.name_Categories 
            FROM Products p 
            LEFT JOIN Categories c ON p.id_Categories = c.id_Categories
            WHERE UPPER(p.ID_Products) = ?
        `;

        const [results] = await db.promise().execute(query, [productId]);

        if (!results || results.length === 0) {
            console.log('Không tìm thấy sản phẩm với ID:', productId); // Debug log
            return res.status(404).json({
                error: 'Không tìm thấy sản phẩm.',
                details: `Sản phẩm với mã '${productId}' không tồn tại.`
            });
        }

        console.log('Đã tìm thấy sản phẩm:', results[0].ID_Products); // Debug log
        res.json(results[0]);
    } catch (error) {
        console.error("Lỗi khi lấy chi tiết sản phẩm:", error);
        res.status(500).json({ error: 'Lỗi truy vấn cơ sở dữ liệu.' });
    }
});

// ... (Dòng 219)
// API để tạo đơn hàng
app.post('/api/orders', authenticateToken, async (req, res) => { // (Dòng 221)
    // ...
    // <-- THAY ĐỔI 2: Lấy cả 'userId' và 'username' từ token
    const { userId, username } = req.user;
    const { items, totalAmount, customerInfo } = req.body;

    if (!items || items.length === 0 || !totalAmount || !customerInfo) {
        return res.status(400).json({ message: 'Dữ liệu đơn hàng không hợp lệ.' });
    }

    const connection = await db.promise().getConnection();

    try {
        await connection.beginTransaction();

        // 1. Insert into 'orders' table
        const orderQuery = 'INSERT INTO orders (user_id, total_amount, customer_name, customer_address, customer_phone) VALUES (?, ?, ?, ?, ?)';
        const [orderResult] = await connection.execute(orderQuery, [
            userId,
            totalAmount,
            username, // <-- THAY ĐỔI 2: Sử dụng 'username' từ token, an toàn hơn
            customerInfo.address,
            customerInfo.phone
        ]);

        const orderId = orderResult.insertId;

        // 2. Insert into 'order_items' table
        const orderItemsQuery = 'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ?';
        const orderItemsValues = items.map(item => [
            orderId,
            item.id,
            item.quantity,
            item.price
        ]);

        await connection.query(orderItemsQuery, [orderItemsValues]);

        // 3. Update product stock
        for (const item of items) {
            const updateStockQuery = 'UPDATE Products SET stock_quantity = stock_quantity - ? WHERE ID_Products = ? AND stock_quantity >= ?';
            const [updateResult] = await connection.execute(updateStockQuery, [item.quantity, item.id, item.quantity]);

            if (updateResult.affectedRows === 0) {
                throw new Error(`Không đủ hàng cho sản phẩm ${item.id}.`);
            }
        }

        await connection.commit();
        res.status(201).json({ message: 'Đơn hàng đã được tạo thành công!', orderId: orderId });

    } catch (error) {
        await connection.rollback();
        console.error('Lỗi khi tạo đơn hàng:', error);
        res.status(500).json({ message: 'Tạo đơn hàng thất bại.', details: error.message });
    } finally {
        connection.release();
    }
});



// API LẤY TẤT CẢ ĐƠN HÀNG (CHỈ ADMIN)
app.get('/api/admin/orders', authenticateToken, authenticateAdmin, async (req, res) => {
    try {
        const { status } = req.query;

        // *** BẮT ĐẦU SỬA LỖI SQL ***
        let sql = `
            SELECT 
                o.order_id AS order_id,
                o.order_date AS order_date, -- SỬA LỖI 1: Dùng 'order_date' (theo CSDL)
               o.customer_name,
                
                -- SỬA LỖI 2: Dùng tạm 'ID_Products' vì CSDL không có cột tên sản phẩm
                GROUP_CONCAT(p.ID_Products SEPARATOR ', ') AS products_list,
                
                o.total_amount,
                
                -- (Đã xóa payment_method và payment_status vì không có trong CSDL)

                -- SỬA LỖI 3: Dùng cột 'status' (theo CSDL)
                o.status AS order_status 
            FROM orders o
            LEFT JOIN order_items oi ON o.order_id = oi.order_id
            LEFT JOIN Products p ON oi.product_id = p.ID_Products
        `;

        const params = [];

        if (status && status !== '') {
            // SỬA LỖI 4: Dùng cột 'status'
            sql += ' WHERE o.status = ?';
            params.push(status);
        }

        // Hoàn thành câu truy vấn
        sql += ' GROUP BY o.order_id ORDER BY o.order_date DESC'; // SỬA LỖI 5: Dùng 'order_date'
        // *** KẾT THÚC SỬA LỖI SQL ***

        const [orders] = await db.promise().execute(sql, params);

        res.json(orders);

    } catch (error) {
        console.error('Lỗi khi lấy danh sách đơn hàng:', error);
        res.status(500).json({ message: 'Lỗi server khi lấy đơn hàng.' });
    }
});

// ... (code app.listen)


app.listen(port, () => {
    console.log(`🚀 Server đang chạy tại http://localhost:${port}`);
});