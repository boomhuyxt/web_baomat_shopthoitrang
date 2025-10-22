-- SỬ DỤNG DATABASE MÀ BẠN VỪA TẠO
-- Ví dụ: USE yourstyle;

-- --- TẠO CẤU TRÚC BẢNG ---
CREATE DATABASE yourstyle;
USE yourstyle;
CREATE TABLE Categories (
    id_Categories CHAR(10) NOT NULL,
    name_Categories VARCHAR(50) CHARACTER SET utf8mb4,
    PRIMARY KEY (id_Categories)
);

CREATE TABLE Products (
    ID_Products VARCHAR(20) NOT NULL,
    price FLOAT NULL,
    stock_quantity INT NULL,
    size VARCHAR(10) NULL, -- Sửa thành VARCHAR để chứa 'S', 'M', 'L'
    color VARCHAR(30) CHARACTER SET utf8mb4,
    image_url VARCHAR(255) NULL,
    id_Categories CHAR(10) NOT NULL,
    PRIMARY KEY (ID_Products)
);

CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

Create table Orders (
	ID_Orders Varchar(10) NOT NULL,
	order_date Datetime NULL,
	status Nvarchar(50) NULL,
	total_amount Decimal(18, 2) NULL,
	ID_Customers Varchar(20) NOT NULL,
	ID_Payments Char(10) NOT NULL,
	Primary Key (ID_Orders)
);

ALTER TABLE orders
ADD COLUMN user_id INT NULL;

ALTER TABLE orders
ADD COLUMN customer_name VARCHAR(255) NULL;

-- Insert a test user (password: test123)
INSERT INTO users (email, password) VALUES ('test@gmail.com', '123456');

-- --- CHÈN TOÀN BỘ DỮ LIỆU SẢN PHẨM (ĐÃ SỬA LỖI ĐƯỜNG DẪN) ---

INSERT INTO Categories (id_Categories, name_Categories) VALUES
('A', 'Áo Nam'),
('Q', 'Quần Nam'),
('HD', 'Áo Khoác'),
('QN', 'Quần Nữ'),
('AN', 'Áo Nữ (Shirt)'),
('D', 'Váy (Dress)');

INSERT INTO Products (ID_Products, price, stock_quantity, size, color, image_url, id_Categories) VALUES
('QN01', '250000', 20, 'M', 'Xanh đậm', 'images/women/trousers/QN01.jpg', 'QN'),
('QN02', '270000', 15, 'M', 'Xanh nhạt', 'images/women/trousers/QN02.png', 'QN'),
('QN03', '290000', 18, 'L', 'Trắng', 'images/women/trousers/QN03.png', 'QN'),
('QN04', '310000', 10, 'L', 'Trắng đen', 'images/women/trousers/QN04.png', 'QN'),
('QN05', '260000', 12, 'S', 'Hồng', 'images/women/trousers/QN05.png', 'QN'),
('QN06', '255000', 20, 'M', 'Xanh nhạt', 'images/women/trousers/QN06.png', 'QN'),
('QN07', '300000', 14, 'L', 'Xanh navy', 'images/women/trousers/QN07.png', 'QN'),
('QN08', '330000', 10, 'L', 'Trắng', 'images/women/trousers/QN08.png', 'QN'),
('QN09', '270000', 22, 'M', 'Trắng kem', 'images/women/trousers/QN09.jpg', 'QN'),
('QN010', '285000', 16, 'M', 'Trắng ngà', 'images/women/trousers/QN010.jpg', 'QN'),
('QN011', '320000', 11, 'L', 'Xám nhạt', 'images/women/trousers/QN011.jpg', 'QN'),
('QN012', '250000', 25, 'S', 'Xanh pastel', 'images/women/trousers/QN012.jpg', 'QN'),
('QN013', '295000', 13, 'M', 'Xanh lam', 'images/women/trousers/QN013.jpg', 'QN'),
('QN014', '280000', 17, 'M', 'Xanh họa tiết', 'images/women/trousers/QN014.jpg', 'QN'),
('QN015', '300000', 10, 'M', 'Xanh jean', 'images/women/trousers/QN015.png', 'QN'),
('QN016', '310000', 9, 'L', 'Đen họa tiết', 'images/women/trousers/QN016.jpg', 'QN'),
('QN017', '320000', 8, 'M', 'Trắng họa tiết', 'images/women/trousers/QN017.jpg', 'QN'),
('AN01', '220000', 20, 'M', 'Trắng', 'images/women/shirt/AN01.png', 'AN'),
('AN02', '230000', 18, 'M', 'Be', 'images/women/shirt/AN02.png', 'AN'),
('AN03', '250000', 15, 'S', 'Trắng ren', 'images/women/shirt/AN03.png', 'AN'),
('AN04', '260000', 10, 'M', 'Nâu caro', 'images/women/shirt/AN04.png', 'AN'),
('AN05', '270000', 12, 'M', 'Xanh nhạt', 'images/women/shirt/AN05.png', 'AN'),
('AN06', '270000', 12, 'L', 'Xanh bạc hà', 'images/women/shirt/AN06.png', 'AN'),
('AN07', '200000', 20, 'S', 'Trắng in họa tiết', 'images/women/shirt/AN07.png', 'AN'),
('AN08', '200000', 22, 'M', 'Trắng in chữ', 'images/women/shirt/AN08.png', 'AN'),
('AN09', '210000', 18, 'M', 'Trắng họa tiết đỏ', 'images/women/shirt/AN09.png', 'AN'),
('AN010', '220000', 16, 'M', 'Hồng nhạt', 'images/women/shirt/AN010.png', 'AN'),
('AN011', '190000', 25, 'S', 'Trắng croptop', 'images/women/shirt/AN011.png', 'AN'),
('AN012', '190000', 25, 'S', 'Trắng pastel', 'images/women/shirt/AN012.png', 'AN'),
('AN013', '230000', 14, 'M', 'Trắng tay phồng', 'images/women/shirt/AN013.png', 'AN'),
('AN014', '240000', 13, 'M', 'Xanh pastel', 'images/women/shirt/AN014.png', 'AN'),
('AN015', '250000', 10, 'S', 'Hồng', 'images/women/shirt/AN015.png', 'AN'),
('AN016', '260000', 9, 'M', 'Hồng tay dài', 'images/women/shirt/AN016.png', 'AN'),
('AN017', '250000', 10, 'M', 'Hồng tay phồng', 'images/women/shirt/AN017.png', 'AN'),
('AN018', '280000', 8, 'M', 'Đỏ', 'images/women/shirt/AN018.jpg', 'AN'),
('AN019', '280000', 8, 'S', 'Hồng kẻ caro', 'images/women/shirt/AN019.jpg', 'AN'),
('AN020', '270000', 9, 'M', 'Trắng basic', 'images/women/shirt/AN20.png', 'AN'),
('AN021', '270000', 9, 'M', 'Trắng nơ đen', 'images/women/shirt/AN21.png', 'AN'),
('D01', '350000', 10, 'M', 'Trắng', 'images/women/dress/D01.png', 'D'),
('D02', '340000', 12, 'S', 'Hồng nhạt', 'images/women/dress/D02.png', 'D'),
('D03', '360000', 8, 'M', 'Xanh baby', 'images/women/dress/D03.png', 'D'),
('D04', '370000', 10, 'M', 'Xanh đậm', 'images/women/dress/D04.png', 'D'),
('D05', '380000', 9, 'L', 'Trắng đen', 'images/women/dress/D05.png', 'D'),
('D06', '340000', 11, 'S', 'Be hồng', 'images/women/dress/D06.png', 'D'),
('D07', '390000', 7, 'M', 'Đen', 'images/women/dress/D07.png', 'D'),
('D08', '400000', 8, 'M', 'Kem', 'images/women/dress/D08.png', 'D'),
('D09', '380000', 9, 'M', 'Xanh lá nhạt', 'images/women/dress/D09.png', 'D'),
('D010', '370000', 10, 'M', 'Xanh pastel', 'images/women/dress/D010.png', 'D'),
('D011', '360000', 8, 'M', 'Trắng xanh', 'images/women/dress/D011.png', 'D'),
('D012', '350000', 10, 'S', 'Hồng', 'images/women/dress/D012.png', 'D'),
('D013', '320000', 12, 'M', 'Trắng họa tiết', 'images/women/dress/D013.png', 'D'),
('D014', '310000', 13, 'M', 'Đen', 'images/women/dress/D014.png', 'D'),
('D015', '330000', 11, 'S', 'Trắng', 'images/women/dress/D015.png', 'D'),
('D016', '340000', 10, 'M', 'Xanh nhạt', 'images/women/dress/D016.png', 'D'),
('D017', '350000', 9, 'S', 'Hồng', 'images/women/dress/D017.png', 'D'),
('D018', '360000', 8, 'M', 'Xanh jean', 'images/women/dress/D018.png', 'D'),
('D019', '370000', 7, 'L', 'Xanh đậm', 'images/women/dress/D019.png', 'D'),
('D020', '380000', 6, 'M', 'Xanh nhạt', 'images/women/dress/D020.png', 'D'),
('Q01', '300000', 15, 'M', 'Trắng', 'images/men/trousers/Q01.png', 'Q'),
('Q02', '310000', 14, 'L', 'Xanh navy', 'images/men/trousers/Q02.png', 'Q'),
('Q03', '320000', 12, 'L', 'Xanh đậm', 'images/men/trousers/Q03.png', 'Q'),
('Q04', '330000', 10, 'L', 'Xanh jean', 'images/men/trousers/Q04.png', 'Q'),
('Q05', '290000', 16, 'M', 'Be', 'images/men/trousers/Q05.png', 'Q'),
('Q06', '270000', 18, 'M', 'Xanh lá', 'images/men/trousers/Q06.png', 'Q'),
('Q07', '280000', 14, 'M', 'Đen trắng', 'images/men/trousers/Q07.png', 'Q'),
('Q08', '260000', 20, 'S', 'Xanh jean nhạt', 'images/men/trousers/Q08.png', 'Q'),
('Q09', '250000', 20, 'M', 'Xanh họa tiết', 'images/men/trousers/Q09.jpg', 'Q'),
('Q010', '255000', 18, 'M', 'Xanh sáng', 'images/men/trousers/Q010.jpg', 'Q'),
('Q011', '265000', 18, 'M', 'Xanh đậm họa tiết', 'images/men/trousers/Q011.jpg', 'Q'),
('Q012', '275000', 17, 'M', 'Xanh đậm', 'images/men/trousers/Q012.jpg', 'Q'),
('Q013', '250000', 22, 'S', 'Xanh vintage', 'images/men/trousers/Q013.jpg', 'Q'),
('Q014', '250000', 22, 'M', 'Xanh nhạt', 'images/men/trousers/Q014.jpg', 'Q'),
('Q015', '260000', 18, 'L', 'Xanh nhạt', 'images/men/trousers/Q015.jpg', 'Q'),
('Q016', '270000', 15, 'M', 'Nâu', 'images/men/trousers/Q016.jpg', 'Q'),
('Q017', '270000', 15, 'M', 'Nâu đất', 'images/men/trousers/Q017.jpg', 'Q'),
('Q018', '280000', 13, 'L', 'Xanh đen', 'images/men/trousers/Q018.jpg', 'Q'),
('Q019', '290000', 12, 'L', 'Xanh rêu', 'images/men/trousers/Q019.jpg', 'Q'),
('Q020', '300000', 11, 'L', 'Nâu sáng', 'images/men/trousers/Q020.jpg', 'Q'),
('Q021', '310000', 10, 'M', 'Đen', 'images/men/trousers/Q021.jpg', 'Q'),
('Q022', '270000', 13, 'M', 'Đen', 'images/men/trousers/Q022.jpg', 'Q'),
('Q023', '260000', 16, 'M', 'Trắng loang', 'images/men/trousers/Q023.jpg', 'Q'),
('Q024', '280000', 14, 'M', 'Xanh đậm tua rua', 'images/men/trousers/Q024.jpg', 'Q'),
('Q025', '290000', 12, 'L', 'Đen họa tiết', 'images/men/trousers/Q025.jpg', 'Q'),
('Q026', '310000', 10, 'L', 'Xám loang', 'images/men/trousers/Q026.jpg', 'Q'),
('Q027', '300000', 11, 'L', 'Xanh bạc', 'images/men/trousers/Q027.jpg', 'Q'),
('Q028', '270000', 14, 'M', 'Đen in chữ', 'images/men/trousers/Q028.jpg', 'Q'),
('Q029', '280000', 12, 'M', 'Đen họa tiết', 'images/men/trousers/Q029.jpg', 'Q'),
('Q030', '280000', 12, 'M', 'Đen in đỏ', 'images/men/trousers/Q030.jpg', 'Q'),
('Q031', '290000', 11, 'L', 'Đen trắng', 'images/men/trousers/Q031.jpg', 'Q'),
('Q032', '295000', 10, 'M', 'Xám đậm', 'images/men/trousers/Q032.jpg', 'Q'),
('Q033', '295000', 9, 'M', 'Đen xám', 'images/men/trousers/Q033.jpg', 'Q'),
('Q034', '300000', 8, 'L', 'Xanh sáng', 'images/men/trousers/Q034.jpg', 'Q'),
('A01', '320000', 12, 'L', 'Xanh rêu', 'images/men/shirt/A01.jpg', 'A'),
('A02', '330000', 10, 'L', 'Trắng', 'images/men/shirt/A02.jpg', 'A'),
('A03', '340000', 9, 'M', 'Sọc xanh trắng', 'images/men/shirt/A03.png', 'A'),
('A04', '310000', 13, 'M', 'Đỏ đô', 'images/men/shirt/A04.png', 'A'),
('A05', '300000', 14, 'M', 'Trắng basic', 'images/men/shirt/A05.png', 'A'),
('A06', '315000', 12, 'L', 'Xanh đậm', 'images/men/shirt/A06.png', 'A'),
('A07', '320000', 11, 'L', 'Xanh olive', 'images/men/shirt/A07.png', 'A'),
('A08', '330000', 9, 'M', 'Trắng viền đỏ', 'images/men/shirt/A08.png', 'A'),
('A09', '340000', 8, 'M', 'Trắng cổ navy', 'images/men/shirt/A09.png', 'A'),
('A010', '310000', 13, 'L', 'Trắng sọc xanh', 'images/men/shirt/A010.png', 'A'),
('A011', '350000', 8, 'M', 'Vàng hoa văn', 'images/men/shirt/A011.png', 'A'),
('A012', '340000', 9, 'L', 'Trắng họa tiết tím', 'images/men/shirt/A012.png', 'A'),
('A013', '300000', 12, 'L', 'Be', 'images/men/shirt/A013.png', 'A'),
('A014', '310000', 11, 'M', 'Hồng nhạt', 'images/men/shirt/A014.png', 'A'),
('A015', '320000', 10, 'L', 'Xanh sọc', 'images/men/shirt/A015.png', 'A'),
('A016', '330000', 9, 'L', 'Xanh lá đậm', 'images/men/shirt/A016.png', 'A'),
('A017', '310000', 13, 'L', 'Nâu nhạt', 'images/men/shirt/A017.png', 'A'),
('A018', '300000', 15, 'M', 'Xanh nhạt', 'images/men/shirt/A018.jpg', 'A'),
('A019', '320000', 10, 'M', 'Trắng họa tiết nhỏ', 'images/men/shirt/A019.jpg', 'A'),
('A020', '330000', 10, 'M', 'Trắng hoa đỏ', 'images/men/shirt/A020.jpg', 'A'),
('A021', '340000', 9, 'L', 'Đen họa tiết trắng', 'images/men/shirt/A021.jpg', 'A'),
('A022', '350000', 8, 'L', 'Trắng phối xám', 'images/men/shirt/A022.jpg', 'A'),
('A023', '340000', 8, 'M', 'Trắng viền đen', 'images/men/shirt/A023.jpg', 'A'),
('A024', '330000', 9, 'M', 'Đen', 'images/men/shirt/A024.jpg', 'A'),
('A025', '320000', 11, 'M', 'Đen thêu', 'images/men/shirt/A025.jpg', 'A'),
('A026', '310000', 12, 'L', 'Xanh cổ vàng', 'images/men/shirt/A026.jpg', 'A'),
('A027', '330000', 9, 'M', 'Đen cổ trắng', 'images/men/shirt/A027.jpg', 'A'),
('A028', '340000', 8, 'L', 'Đen họa tiết', 'images/men/shirt/A028.jpg', 'A'),
('A029', '330000', 10, 'L', 'Xanh navy', 'images/men/shirt/A029.jpg', 'A'),
('A030', '320000', 11, 'M', 'Trắng xanh nhạt', 'images/men/shirt/A030.jpg', 'A'),
('A031', '330000', 10, 'M', 'Xanh biển', 'images/men/shirt/A031.jpg', 'A'),
('A032', '340000', 9, 'L', 'Xanh nhạt sọc', 'images/men/shirt/A032.jpg', 'A'),
('A033', '350000', 8, 'L', 'Xanh pastel', 'images/men/shirt/A033.jpg', 'A'),
('A034', '330000', 10, 'M', 'Xanh sọc mây', 'images/men/shirt/A034.jpg', 'A'),
('HD01', '450000', 10, 'L', 'Kem họa tiết', 'images/jacket/HD01.png', 'HD'),
('HD02', '460000', 9, 'M', 'Hồng nhạt', 'images/jacket/HD02.jpg', 'HD'),
('HD03', '480000', 8, 'L', 'Trắng in xanh', 'images/jacket/HD03.jpg', 'HD'),
('HD04', '470000', 10, 'L', 'Be sáng', 'images/jacket/HD04.jpg', 'HD'),
('HD05', '460000', 11, 'M', 'Hồng phấn', 'images/jacket/HD05.jpg', 'HD'),
('HD06', '500000', 8, 'L', 'Đen bóng', 'images/jacket/HD06.jpg', 'HD'),
('HD07', '490000', 9, 'M', 'Đen cổ trắng', 'images/jacket/HD07.jpg', 'HD'),
('HD08', '520000', 7, 'L', 'Đen trơn', 'images/jacket/HD08.jpg', 'HD'),
('HD09', '470000', 10, 'M', 'Trắng', 'images/jacket/HD09.jpg', 'HD');