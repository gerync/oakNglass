-- Maria DB
CREATE DATABASE IF NOT EXISTS oaknglass
COLLATE utf8
CHARACTER SET utf8_hungarian_ci;
USE oaknglass;
CREATE TABLE IF NOT EXISTS users (
    UUID INT PRIMARY KEY,
    FullName VARCHAR(255) NOT NULL,
    HashedFullName TEXT NOT NULL,
    Email VARCHAR(255) NOT NULL UNIQUE,
    HashedEmail TEXT NOT NULL,
    MobileNumber VARCHAR(15) NOT NULL UNIQUE,
    HashedMobileNumber TEXT NOT NULL,
    HashedPassword TEXT NOT NULL,
    Role ENUM('admin', 'user') DEFAULT 'user',
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    BirthDay DATE NOT NULL,
    Address TEXT NOT NULL,
    EmailSubscribed BOOLEAN DEFAULT TRUE
    INDEX idx_hashedemail (HashedEmail),
    INDEX idx_hashedmobilenumber (HashedMobileNumber)
);
CREATE TABLE IF NOT EXISTS products (
    ProdID INT PRIMARY KEY,
    Name VARCHAR(255) NOT NULL,
    AlcoholPercent FLOAT NOT NULL,
    ContentML INT NOT NULL,
    PriceHUF INT NOT NULL,
    Stock INT NOT NULL,
    CreatedBy INT NOT NULL,
    INDEX idx_ProdID (ProdID),
    FORIGN KEY (CreatedBy) REFERENCES users(UUID)
);
CREATE TABLE IF NOT EXISTS productImages (
    ImageID INT PRIMARY KEY,
    ProdID INT NOT NULL,
    FileName VARCHAR(255) NOT NULL,
    INDEX idx_ImageID (ImageID),
    FORIGN KEY (ProdID) REFERENCES products(ProdID)
);
CREATE TABLE IF NOT EXISTS orders (
    OrderID INT PRIMARY KEY,
    UserID INT NOT NULL,
    TotalPriceHUF INT NOT NULL,
    ShipmentAddress TEXT NOT NULL,
    Status ENUM('pending', 'shipped', 'delivered', 'canceled') DEFAULT 'pending',
    OrderTimeStamp TIMESTAMP NOT NULL,
    INDEX idx_OrderID (OrderID),
    FORIGN KEY (UserID) REFERENCES users(UUID)
);
CREATE TABLE IF NOT EXISTS orderItems (
    OrderItemID INT PRIMARY KEY,
    OrderID INT NOT NULL,
    ProdID INT NOT NULL,
    Quantity INT NOT NULL,
    INDEX idx_OrderItemID (OrderItemID),
    FORIGN KEY (OrderID) REFERENCES orders(OrderID),
    FORIGN KEY (ProdID) REFERENCES products(ProdID)
);
CREATE TABLE IF NOT EXISTS sessions (
    SessionID INT PRIMARY KEY,
    UserID INT NOT NULL,
    RefreshToken TEXT NOT NULL UNIQUE,
    ExpiresAt TIMESTAMP NOT NULL,
    INDEX idx_SessionID (SessionID),
    FORIGN KEY (UserID) REFERENCES users(UUID)
);
CREATE TABLE IF NOT EXISTS emailCodes (
    UserID INT NOT NULL,
    HashedCode TEXT NOT NULL,
    ExpiresAt TIMESTAMP NOT NULL,
    Type ENUM('verification', 'reset', 'cancel-order', 'delete-account') NOT NULL,
    INDEX idx_UID (UserID),
    INDEX idx_hashedCode (HashedCode),
    FORIGN KEY (UserID) REFERENCES users(UUID)
);
CREATE TABLE IF NOT EXITS reviews (
    ReviewID INT PRIMARY KEY,
    ProdID INT NOT NULL,
    UserID INT NOT NULL,
    Rating INT NOT NULL,
    Comment TEXT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_ReviewID (ReviewID),
    FORIGN KEY (ProdID) REFERENCES products(ProdID),
    FORIGN KEY (UserID) REFERENCES users(UUID)
);