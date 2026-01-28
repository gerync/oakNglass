-- MariaDB
CREATE DATABASE IF NOT EXISTS oaknglass
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_hungarian_ci;
USE oaknglass;
CREATE TABLE IF NOT EXISTS users (
    UUID INT PRIMARY KEY AUTO_INCREMENT,
    FullName VARCHAR(255) NOT NULL,
    HashedFullName VARCHAR(255) NOT NULL,
    Email VARCHAR(255) NOT NULL UNIQUE,
    HashedEmail VARCHAR(255) NOT NULL,
    MobileNumber VARCHAR(15) NOT NULL UNIQUE,
    HashedMobileNumber VARCHAR(255) NOT NULL,
    HashedPassword VARCHAR(255) NOT NULL,
    Role ENUM('admin', 'user') DEFAULT 'user',
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    BirthDay DATE NOT NULL,
    Address TEXT NOT NULL,
    EmailSubscribed BOOLEAN DEFAULT TRUE,
    INDEX idx_hashedemail (HashedEmail),
    INDEX idx_hashedmobilenumber (HashedMobileNumber)
);
CREATE TABLE IF NOT EXISTS products (
    ProdID INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(255) NOT NULL,
    AlcoholPercent FLOAT NOT NULL,
    ContentML INT NOT NULL,
    PriceHUF INT NOT NULL,
    Stock INT NOT NULL,
    CreatedBy INT NOT NULL,
    INDEX idx_ProdID (ProdID),
    FOREIGN KEY (CreatedBy) REFERENCES users(UUID) ON DELETE SET NULL
);
CREATE TABLE IF NOT EXISTS productImages (
    ImageID INT PRIMARY KEY AUTO_INCREMENT,
    ProdID INT NOT NULL,
    FileName VARCHAR(255) NOT NULL,
    INDEX idx_ImageID (ImageID),
    FOREIGN KEY (ProdID) REFERENCES products(ProdID) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS orders (
    OrderID INT PRIMARY KEY AUTO_INCREMENT,
    UserID INT NOT NULL,
    TotalPriceHUF INT NOT NULL,
    ShipmentAddress TEXT NOT NULL,
    Status ENUM('pending', 'shipped', 'delivered', 'canceled') DEFAULT 'pending',
    OrderTimeStamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_OrderID (OrderID),
    FOREIGN KEY (UserID) REFERENCES users(UUID) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS orderItems (
    OrderItemID INT PRIMARY KEY AUTO_INCREMENT,
    OrderID INT NOT NULL,
    ProdID INT NOT NULL,
    Quantity INT NOT NULL,
    INDEX idx_OrderItemID (OrderItemID),
    FOREIGN KEY (OrderID) REFERENCES orders(OrderID) ON DELETE CASCADE,
    FOREIGN KEY (ProdID) REFERENCES products(ProdID) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS sessions (
    SessionID INT PRIMARY KEY AUTO_INCREMENT,
    UserID INT NOT NULL,
    RefreshToken VARCHAR(255) NOT NULL UNIQUE,
    ExpiresAt TIMESTAMP NOT NULL,
    INDEX idx_SessionID (SessionID),
    FOREIGN KEY (UserID) REFERENCES users(UUID) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS emailCodes (
    UserID INT NOT NULL,
    HashedCode VARCHAR(255) NOT NULL,
    ExpiresAt TIMESTAMP NOT NULL,
    Type ENUM('verification', 'reset', 'cancel-order', 'delete-account') NOT NULL,
    INDEX idx_UID (UserID),
    INDEX idx_hashedCode (HashedCode),
    FOREIGN KEY (UserID) REFERENCES users(UUID) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS reviews (
    ReviewID INT PRIMARY KEY AUTO_INCREMENT,
    ProdID INT NOT NULL,
    UserID INT NOT NULL,
    Rating INT NOT NULL CHECK (Rating BETWEEN 1 AND 5),
    Comment TEXT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_ReviewID (ReviewID),
    FOREIGN KEY (ProdID) REFERENCES products(ProdID) ON DELETE CASCADE,
    FOREIGN KEY (UserID) REFERENCES users(UUID) ON DELETE CASCADE
);