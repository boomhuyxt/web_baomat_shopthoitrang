CREATE DATABASE BMTT;
USE BMTT;

/*
Created		09/10/2025
Modified	13/10/2025
Project		E-commerce Schema
Model		
Company		
Author		
Version		2.1
Database	MS SQL Server
*/

-- Bảng lưu các danh mục sản phẩm
Create table Categories (
	id_Categories Char(10) NOT NULL,
	name_Categories Nvarchar(50) NULL,
	Primary Key (id_Categories)
);


-- Bảng lưu thông tin sản phẩm
Create table Products (
	ID_Products Varchar(20) NOT NULL,
	price Float NULL,
	stock_quantity Int NULL,
	size Float NULL,
	color Char(20) NULL,
	image_url Varchar(255) NULL,
	id_Categories Char(10) NOT NULL,
	Primary Key (ID_Products)
);


-- Bảng lưu thông tin khách hàng
Create table Customers (
	ID_Customers Varchar(20) NOT NULL,
	full_name Nvarchar(50) NULL,
	email Nvarchar(50) NULL,
	phone Varchar(15) NULL,
	address Nvarchar(100) NULL,
	password Varchar(255) NULL,
	created_at Datetime NULL,
	Primary Key (ID_Customers)
);


-- Bảng giỏ hàng của khách hàng
Create table Cart (
	ID_Cart Char(10) NOT NULL,
	ID_Customers Varchar(20) NOT NULL,
	Primary Key (ID_Cart)
);


-- Bảng chứa các mục trong giỏ hàng
Create table Cart_Items (
	ID_Cart_Items Varchar(10) NOT NULL,
	ID_Cart Char(10) NOT NULL,
	ID_Products Varchar(20) NOT NULL,
	quantity Int NULL,
	Primary Key (ID_Cart_Items)
);


-- Bảng lưu thông tin phương thức thanh toán
Create table Payments (
	ID_Payments Char(10) NOT NULL,
	payment_date Datetime NULL,
	amount Float NULL,
	method Nvarchar(50) NULL,
	status Varchar(20) NULL,
	Primary Key (ID_Payments)
);


-- Bảng đơn hàng
Create table Orders (
	ID_Orders Varchar(10) NOT NULL,
	order_date Datetime NULL,
	status Nvarchar(50) NULL,
	total_amount Decimal(18, 2) NULL,
	ID_Customers Varchar(20) NOT NULL,
	ID_Payments Char(10) NOT NULL,
	Primary Key (ID_Orders)
);


-- Bảng chi tiết đơn hàng
Create table Order_Details (
	ID_Order_Details Char(20) NOT NULL,
	ID_Orders Varchar(10) NOT NULL,
	ID_Products Varchar(20) NOT NULL,
	quantity Int NULL,
	price Float NULL,
	Primary Key (ID_Order_Details)
);


-- Bảng thông tin vận chuyển
Create table Shipping (
	ID_Shipping Char(10) NOT NULL,
	shipping_address Nvarchar(100) NULL,
	shipping_date Datetime NULL,
	delivery_date Datetime NULL,
	carrier Varchar(50) NULL,
	status Varchar(50) NULL,
	ID_Orders Varchar(10) NOT NULL,
	Primary Key (ID_Shipping)
);


-- Bảng mã giảm giá
Create table Discounts (
	ID_Discounts Varchar(10) NOT NULL,
	code Varchar(20) NULL,
	description Nvarchar(100) NULL,
	discount_percent Decimal(5, 2) NULL,
	valid_from Datetime NULL,
	valid_to Datetime NULL,
	Primary Key (ID_Discounts)
);

ALTER TABLE products MODIFY COLUMN size VARCHAR(10);
-- Bảng đánh giá sản phẩm của khách hàng
CREATE TABLE Reviews (
    ID_Review INT NOT NULL AUTO_INCREMENT,
    ID_Customers VARCHAR(20) NOT NULL,
    ID_Products VARCHAR(20) NOT NULL,
    rating INT NULL,
    comment NVARCHAR(1000) NULL,
    review_date DATETIME NULL,
    PRIMARY KEY (ID_Review)
);


-------------------------------------------------
-- THÊM CÁC RÀNG BUỘC KHÓA NGOẠI (FOREIGN KEYS) --
-------------------------------------------------

Alter table Products add constraint fk_Products_Categories foreign key (id_Categories) references Categories (id_Categories)

Alter table Cart add constraint fk_Cart_Customers foreign key (ID_Customers) references Customers (ID_Customers)

Alter table Cart_Items add constraint fk_Cart_Items_Cart foreign key (ID_Cart) references Cart (ID_Cart)

Alter table Cart_Items add constraint fk_Cart_Items_Products foreign key (ID_Products) references Products (ID_Products)

Alter table Orders add constraint fk_Orders_Customers foreign key (ID_Customers) references Customers (ID_Customers)
go
Alter table Orders add constraint fk_Orders_Payments foreign key (ID_Payments) references Payments (ID_Payments)
go
Alter table Order_Details add constraint fk_Order_Details_Orders foreign key (ID_Orders) references Orders (ID_Orders)
go
Alter table Order_Details add constraint fk_Order_Details_Products foreign key (ID_Products) references Products (ID_Products)
go
Alter table Shipping add constraint fk_Shipping_Orders foreign key (ID_Orders) references Orders (ID_Orders)
go
Alter table Reviews add constraint fk_Reviews_Customers foreign key (ID_Customers) references Customers (ID_Customers)
go
Alter table Reviews add constraint fk_Reviews_Products foreign key (ID_Products) references Products (ID_Products)
go